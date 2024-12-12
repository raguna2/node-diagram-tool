import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { sampleData } from "@/lib/sampleData";
import * as d3 from "d3-force";
import { Tooltip } from 'react-tooltip';
import Header from "@/components/Header";
import TableSchema from "@/components/TableSchema";
import TableListSidebar from "@/components/TableListSidebar";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import DataPreview from "@/components/DataPreview";


interface ForceGraphProps {
  charge?: number;
  linkDistance?: number;
  isAutoRotate?: boolean;
}

import { GraphData, NodeObject as BaseNodeObject } from 'react-force-graph-2d';

interface CustomNodeObject extends BaseNodeObject {
  id: string;
  group: number;
  table: string;
}

interface CustomLinkObject {
  source: string | CustomNodeObject;
  target: string | CustomNodeObject;
  relationship: string;
  value: number;
}

type ForceGraphData = {
  nodes: CustomNodeObject[];
  links: CustomLinkObject[];
};

type D3Node = CustomNodeObject & {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

type D3Link = CustomLinkObject & {
  source: D3Node;
  target: D3Node;
};

type NodeCanvasObject = (node: D3Node, ctx: CanvasRenderingContext2D, globalScale?: number) => void;
type LinkCanvasObject = (link: D3Link, ctx: CanvasRenderingContext2D, globalScale?: number) => void;

export default function ForceGraphEditor({
  charge = -100,
  linkDistance = 100,
  isAutoRotate = false,
}: ForceGraphProps) {
  const fgRef = useRef<any>();
  const nodeRadius = 12;
  const [selectedNode, setSelectedNode] = useState<CustomNodeObject | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [selectedRowDataMap, setSelectedRowDataMap] = useState<Map<string, Record<string, any>>>(new Map());
  const [graphData, setGraphData] = useState<ForceGraphData>(sampleData);

  const zoomToNode = useCallback((node: CustomNodeObject) => {
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

  const handleNodeClick = useCallback((node: CustomNodeObject) => {
    // 同じノードをクリックした場合は何もしない
    if (selectedNode?.id === node.id) return;
    
    // 新しいノードを選択状態に追加
    setSelectedNodes(prev => {
      const newSet = new Set(prev);
      newSet.add(node.id);
      return newSet;
    });
    
    setSelectedNode(node);
    // selectedRowDataMapは維持されます（リセットしない）
    
    // ズームトゥアニメーション
    zoomToNode(node);
    
    // ノードの位置を固定
    const graphNode = graphData.nodes.find(n => n.id === node.id);
    if (graphNode) {
      graphNode.fx = graphNode.x;
      graphNode.fy = graphNode.y;
    }
  }, [selectedNode, zoomToNode, graphData.nodes]);

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
    }).filter((node): node is CustomNodeObject => node !== undefined);
  }, [selectedNode, graphData]);

  // 現在のノードのインデックスを取得
  const currentNodeIndex = useMemo(() => {
    if (!selectedNode || !connectedNodes || connectedNodes.length === 0) return -1;
    return connectedNodes.findIndex(node => node.id === selectedNode.id);
  }, [selectedNode, connectedNodes]);

  const navigateToNode = useCallback((targetNode: CustomNodeObject) => {
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
  
  const paintNode = (node: D3Node, ctx: CanvasRenderingContext2D) => {
    if (!node || typeof node.x === 'undefined' || typeof node.y === 'undefined') return;
    
    const isCurrentSelected = selectedNode && node.id === selectedNode.id;
    const isEverSelected = selectedNodes.has(node.id);
    const currentZoom = fgRef.current?.zoom() || 1;
    const isZoomedIn = currentZoom > 2;

    // ズームイン時のみ、選択されていないノードを非表示に
    if (isZoomedIn && !isCurrentSelected && selectedNode) return;

    // Draw enhanced glow effect
    const time = performance.now() / 1000;
    const pulseSize = 1 + Math.sin(time * 2) * 0.1; // Pulsating effect
    
    // Outer glow for selected state
    if (isCurrentSelected || isEverSelected) {
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
      const nodeData = selectedRowDataMap.get(node.id);
      if (nodeData) {
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
        ctx.fillText(`ID: ${nodeData.id}`, node.x, node.y - nodeRadius * 2.5);
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

  const paintLink = (link: D3Link, ctx: CanvasRenderingContext2D) => {
    const { source, target } = link;
    if (!source || !target || typeof source.x === 'undefined' || typeof source.y === 'undefined' ||
        typeof target.x === 'undefined' || typeof target.y === 'undefined') {
      return;
    }
    
    const currentZoom = fgRef.current?.zoom() || 1;
    const isZoomedIn = currentZoom > 2;

    // ズームイン時は選択されたノードに関連するエッジのみ表示
    if (isZoomedIn && selectedNode && source.id !== selectedNode.id && target.id !== selectedNode.id) {
      return;
    }
    
    // Get current time for animation
    const time = performance.now() / 1000;
    const dashOffset = time * 15; // Speed of animation
    
    // Calculate angle and distance for curved paths
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Create control points for curved path
    const midX = (source.x + target.x) / 2;
    const midY = (source.y + target.y) / 2;
    const curvature = 0.3;
    const cpX = midX - dy * curvature;
    const cpY = midY + dx * curvature;
    
    // Create gradient with relationship-specific colors
    const gradient = ctx.createLinearGradient(source.x, source.y, target.x, target.y);
    let startColor, endColor;
    
    switch (link.relationship) {
      case "one-to-one":
        startColor = 'rgba(71, 255, 222, 0.6)';
        endColor = 'rgba(71, 255, 222, 0.2)';
        break;
      case "one-to-many":
        startColor = 'rgba(123, 97, 255, 0.6)';
        endColor = 'rgba(123, 97, 255, 0.2)';
        break;
      case "many-to-many":
        startColor = 'rgba(255, 71, 71, 0.6)';
        endColor = 'rgba(255, 71, 71, 0.2)';
        break;
      default:
        startColor = 'rgba(100, 116, 139, 0.4)';
        endColor = 'rgba(100, 116, 139, 0.1)';
    }
    
    gradient.addColorStop(0, startColor);
    gradient.addColorStop(1, endColor);
    
    // Draw curved path
    ctx.beginPath();
    ctx.moveTo(source.x, source.y);
    ctx.quadraticCurveTo(cpX, cpY, target.x, target.y);
    
    // Set line style based on relationship
    switch (link.relationship) {
      case "one-to-one":
        ctx.setLineDash([4, 4]);
        ctx.lineDashOffset = dashOffset;
        ctx.lineWidth = 1.5;
        break;
      case "one-to-many":
        ctx.setLineDash([8, 4]);
        ctx.lineDashOffset = -dashOffset * 2;
        ctx.lineWidth = 2;
        break;
      case "many-to-many":
        ctx.setLineDash([3, 3]);
        ctx.lineDashOffset = Math.sin(time * 3) * 15;
        ctx.lineWidth = 2.5;
        break;
    }
    
    // Draw the path with gradient and glow effect
    ctx.strokeStyle = gradient;
    ctx.stroke();
    
    // Add enhanced glow effect
    ctx.shadowColor = startColor;
    ctx.shadowBlur = 8;
    ctx.globalAlpha = 0.4;
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    
    // Draw relationship indicators
    if (distance > 60) { // Only draw if nodes are far enough apart
      const angle = Math.atan2(dy, dx);
      const arrowSize = 6;
      
      // Draw arrow or circle based on relationship type
      ctx.fillStyle = startColor;
      ctx.strokeStyle = startColor;
      
      if (link.relationship === "one-to-many") {
        // Draw arrow at target
        const arrowX = target.x - Math.cos(angle) * 20;
        const arrowY = target.y - Math.sin(angle) * 20;
        
        ctx.beginPath();
        ctx.moveTo(
          arrowX - Math.cos(angle - Math.PI / 6) * arrowSize,
          arrowY - Math.sin(angle - Math.PI / 6) * arrowSize
        );
        ctx.lineTo(arrowX, arrowY);
        ctx.lineTo(
          arrowX - Math.cos(angle + Math.PI / 6) * arrowSize,
          arrowY - Math.sin(angle + Math.PI / 6) * arrowSize
        );
        ctx.fill();
      } else if (link.relationship === "many-to-many") {
        // Draw circles at both ends
        ctx.beginPath();
        ctx.arc(
          source.x + Math.cos(angle) * 15,
          source.y + Math.sin(angle) * 15,
          3, 0, 2 * Math.PI
        );
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(
          target.x - Math.cos(angle) * 15,
          target.y - Math.sin(angle) * 15,
          3, 0, 2 * Math.PI
        );
        ctx.fill();
      }
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1">
        <TableListSidebar
          onTableSelect={(tableId) => {
            const node = graphData.nodes.find(n => n.id === tableId);
            if (node) handleNodeClick(node);
          }}
          selectedNode={selectedNode?.id}
        />
        <div className="flex flex-col flex-1">
          <div className="flex flex-1">
            <div className="flex-1 bg-white relative">
              
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
                onNodeClick={(node: CustomNodeObject) => {
                  handleNodeClick(node);
                }}
                onBackgroundClick={() => {
                  setSelectedRowDataMap(new Map());
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
                width={window.innerWidth - (selectedNode ? window.innerWidth / 3 : 0)}
                height={(window.innerHeight - 64) * 0.7}
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
                onNodeDragEnd={(node: CustomNodeObject) => {
                  node.fx = node.x;
                  node.fy = node.y;
                }}
                autoPauseRedraw={false}
              />
              
            </div>
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                selectedNode ? 'w-1/3 border-l border-[#47FFDE]' : 'w-0'
              }`}
            >
              <TableSchema 
                node={selectedNode} 
                selectedRowData={selectedNode ? selectedRowDataMap.get(selectedNode.id) : null} 
              />
            </div>
          </div>
          <div 
            className={`transition-all duration-300 ease-in-out ${
              selectedNode ? 'h-[30vh]' : 'h-0'
            } border-t border-[#47FFDE] bg-[#2C2C2C] overflow-hidden`}
          >
            <div className="p-4">
              <h3 className="text-lg font-medium text-[#BBBBBB] mb-4">
                データプレビュー: {selectedNode?.table}
              </h3>
              <DataPreview 
                tableName={selectedNode?.table} 
                onRowSelect={(data) => {
                  if (selectedNode) {
                    setSelectedRowDataMap(prev => {
                      const newMap = new Map(prev);
                      newMap.set(selectedNode.id, data);
                      return newMap;
                    });
                  }
                }}
                selectedRowData={selectedNode ? selectedRowDataMap.get(selectedNode.id) : null}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}