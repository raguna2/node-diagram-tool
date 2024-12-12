import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { sampleData } from "@/lib/sampleData";
import * as d3 from "d3-force";
import { Tooltip } from 'react-tooltip';
import Header from "@/components/Header";
import TableSchema from "@/components/TableSchema";
import TableListSidebar from "@/components/TableListSidebar";
import AppSidebar from "@/components/AppSidebar";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import DataPreview from "@/components/DataPreview";


interface ForceGraphProps {
  charge?: number;
  linkDistance?: number;
  isAutoRotate?: boolean;
}

interface NodeObject {
  x?: number;
  y?: number;
  id: string;
  group: number;
  table: string;
}

interface LinkObject {
  source: NodeObject | string;
  target: NodeObject | string;
  relationship: string;
  value: number;
}

export default function ForceGraphEditor({
  charge = -100,
  linkDistance = 100,
  isAutoRotate = false,
}: ForceGraphProps) {
  const fgRef = useRef<any>();
  const nodeRadius = 12;
  const [selectedNode, setSelectedNode] = useState<NodeObject | null>(null);
  const [selectedRowData, setSelectedRowData] = useState<Record<string, any> | null>(null);
  const [graphData, setGraphData] = useState(sampleData);

  const zoomToNode = useCallback((node: NodeObject) => {
    if (!fgRef.current) return;
    const fg = fgRef.current;
    const nodeX = node.x || 0;
    const nodeY = node.y || 0;
    
    // 即座に大きくズームアウトして、ダイナミックなズームイン効果を作成
    fg.zoom(0.3, 0);
    
    // 少し遅れて中央に移動しながらズームイン
    setTimeout(() => {
      fg.centerAt(nodeX, nodeY, 400);
      fg.zoom(6.4, 400);
    }, 50);
  }, []);

  const handleNodeClick = useCallback((node: NodeObject) => {
    setSelectedNode(node);
    setSelectedRowData(null); // ノードを切り替えた時は選択をリセット
    zoomToNode(node);
  }, [zoomToNode]);

  // 選択されたノードの接続先ノードを取得
  const connectedNodes = useMemo(() => {
    if (!selectedNode) return [];
    const connections = graphData.links.filter(link => {
      const source = typeof link.source === 'string' ? link.source : link.source.id;
      const target = typeof link.target === 'string' ? link.target : link.target.id;
      return source === selectedNode.id || target === selectedNode.id;
    });
    return connections.map(link => {
      const connectedId = (typeof link.source === 'string' ? link.source : link.source.id) === selectedNode.id 
        ? (typeof link.target === 'string' ? link.target : link.target.id) 
        : (typeof link.source === 'string' ? link.source : link.source.id);
      return graphData.nodes.find(node => node.id === connectedId);
    }).filter((node): node is NodeObject => node !== undefined);
  }, [selectedNode, graphData]);

  // 現在のノードのインデックスを取得
  const currentNodeIndex = useMemo(() => {
    if (!selectedNode || !connectedNodes || connectedNodes.length === 0) return -1;
    return connectedNodes.findIndex(node => node.id === selectedNode.id);
  }, [selectedNode, connectedNodes]);

  const navigateToNode = useCallback((targetNode: NodeObject) => {
    const graphNode = graphData.nodes.find(n => n.id === targetNode.id);
    if (graphNode) {
      handleNodeClick(graphNode);
    }
  }, [graphData.nodes, handleNodeClick]);

  const handleNext = useCallback(() => {
    if (!connectedNodes || connectedNodes.length === 0) return;
    const nextIndex = (currentNodeIndex + 1) % connectedNodes.length;
    const nextNode = connectedNodes[nextIndex];
    if (nextNode) {
      navigateToNode(nextNode);
    }
  }, [currentNodeIndex, connectedNodes, navigateToNode]);

  const handlePrev = useCallback(() => {
    if (!connectedNodes || connectedNodes.length === 0) return;
    
    let prevIndex;
    if (currentNodeIndex === -1) {
      prevIndex = connectedNodes.length - 1;
    } else {
      prevIndex = currentNodeIndex === 0 ? connectedNodes.length - 1 : currentNodeIndex - 1;
    }
    
    const prevNode = connectedNodes[prevIndex];
    if (prevNode) {
      navigateToNode(prevNode);
    }
  }, [currentNodeIndex, connectedNodes, navigateToNode]);

  const handleBack = useCallback(() => {
    setSelectedNode(null);
    if (fgRef.current) {
      const fg = fgRef.current;
      // 即座にズームアウトを開始
      fg.zoom(4, 0);
      
      // 中間のズームアウト
      setTimeout(() => {
        fg.zoom(0.3, 200);
      }, 0);
      
      // 最終的な位置とズームレベルに戻る
      setTimeout(() => {
        fg.centerAt(0, 0, 400);
        fg.zoom(1, 400);
      }, 200);
    }
  }, []);

  useEffect(() => {
    if (fgRef.current && isAutoRotate) {
      const distance = 400;
      let angle = 0;

      const interval = setInterval(() => {
        const fg = fgRef.current;
        if (fg) {
          fg.centerAt(
            distance * Math.sin(angle),
            distance * Math.cos(angle)
          );
        }
        angle += Math.PI / 300;
      }, 30);

      return () => clearInterval(interval);
    }
  }, [isAutoRotate]);
  
  const paintNode = (node: NodeObject, ctx: CanvasRenderingContext2D) => {
    if (typeof node.x === 'undefined' || typeof node.y === 'undefined') return;
    
    // 選択されたノードがある場合、そのノード以外は描画しない
    if (selectedNode && node.id !== selectedNode.id) return;

    // Draw enhanced glow effect
    const time = performance.now() / 1000;
    const pulseSize = 1 + Math.sin(time * 2) * 0.1; // Pulsating effect
    
    // Outer glow for selected state
    if (selectedNode && node.id === selectedNode.id) {
      const outerGlow = ctx.createRadialGradient(
        node.x, node.y, nodeRadius * 1.5,
        node.x, node.y, nodeRadius * 3 * pulseSize
      );
      outerGlow.addColorStop(0, 'rgba(123, 97, 255, 0.2)');
      outerGlow.addColorStop(1, 'rgba(123, 97, 255, 0)');
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeRadius * 3 * pulseSize, 0, 2 * Math.PI);
      ctx.fillStyle = outerGlow;
      ctx.fill();

      // Draw data indicator if row is selected
      if (selectedRowData) {
        // Animated ring
        const ringSize = 1 + Math.sin(time * 3) * 0.05;
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius * 1.8 * ringSize, 0, 2 * Math.PI);
        ctx.strokeStyle = '#7B61FF';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw ID label
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = '#2C2C2C';
        ctx.textAlign = 'center';
        ctx.fillText(`ID: ${selectedRowData.id}`, node.x, node.y - nodeRadius * 2.5);
      }
    }

    // Base glow
    const gradient = ctx.createRadialGradient(
      node.x, node.y, nodeRadius * 0.5,
      node.x, node.y, nodeRadius * 2
    );
    gradient.addColorStop(0, 'rgba(3, 31, 104, 0.15)');
    gradient.addColorStop(1, 'rgba(3, 31, 104, 0)');
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius * 2, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw circle with gradient
    const circleGradient = ctx.createRadialGradient(
      node.x - nodeRadius * 0.3, node.y - nodeRadius * 0.3, nodeRadius * 0.1,
      node.x, node.y, nodeRadius * 1.2
    );
    circleGradient.addColorStop(0, '#ffffff');
    circleGradient.addColorStop(1, '#f8fafc');
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);
    ctx.fillStyle = circleGradient;
    ctx.fill();
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 0.75;
    ctx.stroke();

    // Draw database icon
    const iconSize = nodeRadius * 1.4;
    const icon = new Image();
    icon.src = `data:image/svg+xml,${encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#031F68" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3" fill="#e2e8f0"></ellipse><path d="M3 5V19C3 20.7 7 22 12 22S21 20.7 21 19V5" fill="#e2e8f0"></path><path d="M3 12C3 13.7 7 15 12 15S21 13.7 21 12"></path></svg>'
    )}`;
    ctx.drawImage(
      icon,
      node.x - iconSize / 2,
      node.y - iconSize / 2,
      iconSize,
      iconSize
    );

    // Draw table name with shadow
    ctx.font = '10px Arial';
    ctx.fillStyle = "#031F68";
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 2;
    ctx.fillText(node.table || '', node.x, node.y + nodeRadius * 3);
    
    // We don't need to draw tooltip here as we'll use react-tooltip
    
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  };

  const paintLink = (link: LinkObject, ctx: CanvasRenderingContext2D) => {
    const start = typeof link.source === 'string' ? graphData.nodes.find(n => n.id === link.source) : link.source;
    const end = typeof link.target === 'string' ? graphData.nodes.find(n => n.id === link.target) : link.target;
    
    if (!start || !end || typeof start.x === 'undefined' || typeof start.y === 'undefined' ||
        typeof end.x === 'undefined' || typeof end.y === 'undefined') {
      return;
    }
    
    // 選択されたノードがある場合、そのノードに関連するエッジのみ描画
    if (selectedNode && start.id !== selectedNode.id && end.id !== selectedNode.id) {
      return;
    }
    
    // Get current time for animation
    const time = performance.now() / 1000;
    const dashOffset = time * 15; // Speed of animation
    
    // Calculate angle for gradient
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const angle = Math.atan2(dy, dx);
    
    // Create gradient
    const gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
    gradient.addColorStop(0, 'rgba(100, 116, 139, 0.4)');
    gradient.addColorStop(1, 'rgba(100, 116, 139, 0.1)');
    
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    
    // Different patterns based on relationship type
    switch (link.relationship) {
      case "one-to-one":
        ctx.setLineDash([4, 4]);
        ctx.lineDashOffset = 0;
        ctx.lineWidth = 1;
        break;
      case "one-to-many":
        ctx.setLineDash([6, 3]);
        ctx.lineDashOffset = -dashOffset;
        ctx.lineWidth = 1.2;
        break;
      case "many-to-many":
        ctx.setLineDash([3, 3]);
        ctx.lineDashOffset = Math.sin(time * 2) * 10;
        ctx.lineWidth = 1.5;
        break;
    }
    
    ctx.strokeStyle = gradient;
    ctx.stroke();
    
    // Add subtle glow effect
    ctx.shadowColor = 'rgba(100, 116, 139, 0.2)';
    ctx.shadowBlur = 3;
    ctx.stroke();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1">
        <AppSidebar />
        <TableListSidebar
          onTableSelect={(tableId) => {
            const node = graphData.nodes.find(n => n.id === tableId);
            if (node) handleNodeClick(node);
          }}
          selectedNode={selectedNode?.id}
        />
        <div className="flex flex-col flex-1">
          <div className="flex flex-1">
            <div className="flex-1 bg-white relative min-w-0">
              
              {selectedNode && (
                <div className="absolute top-4 left-4 z-10">
                  <Button
                    onClick={handleBack}
                    variant="ghost"
                    className="text-sm bg-[#2C2C2C] text-[#BBBBBB] hover:bg-[#3C3C3C] transition-colors"
                  >
                    ← Back
                  </Button>
                </div>
              )}
              {selectedNode && connectedNodes.length > 0 && (
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                  <Button
                    onClick={handlePrev}
                    variant="ghost"
                    className="bg-[#2C2C2C] text-[#BBBBBB] hover:bg-[#3C3C3C] transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={handleNext}
                    variant="ghost"
                    className="bg-[#2C2C2C] text-[#BBBBBB] hover:bg-[#3C3C3C] transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <ForceGraph2D
                ref={fgRef}
                graphData={graphData}
                nodeLabel="id"
                backgroundColor="#ffffff"
                onNodeClick={(node: NodeObject) => {
                  handleNodeClick(node);
                }}
                onBackgroundClick={() => {
                  setSelectedRowData(null);
                }}
                nodeCanvasObject={paintNode}
                nodePointerAreaPaint={(node: NodeObject, color: string, ctx: CanvasRenderingContext2D) => {
                  if (typeof node.x === 'undefined' || typeof node.y === 'undefined') return;
                  ctx.beginPath();
                  ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);
                  ctx.fillStyle = color;
                  ctx.fill();
                }}
                linkCanvasObject={paintLink}
                linkColor={() => "transparent"}
                linkDirectionalArrowLength={0}
                width={window.innerWidth - (selectedNode && window.innerWidth >= 1280 ? window.innerWidth / 4 : window.innerWidth >= 768 ? window.innerWidth / 3 : 0) - (window.innerWidth >= 768 ? 320 : 64)}
                height={window.innerWidth >= 1280 ? (window.innerHeight - 64) * 0.75 : window.innerWidth >= 768 ? (window.innerHeight - 64) * 0.7 : (window.innerHeight - 64) * 0.6}
                d3Force={(engine: any) => {
                  engine
                    .force('charge', d3.forceManyBody().strength(charge))
                    .force('collide', d3.forceCollide(nodeRadius * 1.5))
                    .force('link', d3.forceLink().distance(linkDistance))
                    .force('center', d3.forceCenter());
                }}
                d3VelocityDecay={0.3}
                enableNodeDrag={true}
                enableZoomPanInteraction={true}
                onNodeDragEnd={(node: NodeObject) => {
                  node.fx = node.x;
                  node.fy = node.y;
                }}
                autoPauseRedraw={false}
              />
              
            </div>
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                selectedNode ? 'xl:w-1/4 md:w-1/3 w-full border-l border-[#47FFDE]' : 'w-0'
              }`}
            >
              <TableSchema node={selectedNode} selectedRowData={selectedRowData} />
            </div>
          </div>
          <div 
            className={`transition-all duration-300 ease-in-out ${
              selectedNode ? 'xl:h-[25vh] md:h-[30vh] h-[40vh]' : 'h-0'
            } border-t border-[#47FFDE] bg-[#2C2C2C] overflow-hidden`}
          >
            <div className="p-4">
              <h3 className="text-lg font-medium text-[#BBBBBB] mb-4">
                データプレビュー: {selectedNode?.table}
              </h3>
              <DataPreview 
                tableName={selectedNode?.table} 
                onRowSelect={setSelectedRowData}
                selectedRowData={selectedRowData}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
