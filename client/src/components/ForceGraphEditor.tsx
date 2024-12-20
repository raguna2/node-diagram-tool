import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { sampleData } from "@/lib/sampleData";
import { sampleTableData } from "@/lib/sampleTableData";
import * as d3 from "d3-force";
import Header from "@/components/Header";
import { getSchemaContent } from "@/components/TableSchema";
import TableListSidebar from "@/components/TableListSidebar";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import DataPreview from "@/components/DataPreview";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";

// Utility function for debouncing
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

interface ForceGraphProps {
  charge?: number;
  linkDistance?: number;
  isAutoRotate?: boolean;
}

interface CustomNodeObject {
  id: string;
  group: number;
  table: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
  tooltip?: {
    content: React.ReactNode;
  };
}

interface CustomLinkObject {
  source: CustomNodeObject | string;
  target: CustomNodeObject | string;
  relationship: string;
  value: number;
}

interface ForceGraphData {
  nodes: Array<CustomNodeObject & {
    __indexColor?: string;
    __threeObj?: THREE.Mesh;
  }>;
  links: Array<CustomLinkObject & {
    __lineObj?: THREE.Line;
    __arrowObj?: THREE.Mesh;
  }>;
}

export default function ForceGraphEditor({
  charge = -100,
  linkDistance = 100,
  isAutoRotate = false,
}: ForceGraphProps) {
  const fgRef = useRef<any>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth * 0.25,
    height: window.innerHeight - 64
  });

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const newDimensions = {
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        };
        setDimensions(newDimensions);
        // Force graph update
        if (fgRef.current) {
          fgRef.current.d3ReheatSimulation();
        }
      }
    };

    window.addEventListener('resize', handleResize);
    // Initial size
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const getNodeRadius = (node: CustomNodeObject) => {
    // スキーマ情報からカラム数を取得
    const schemaContent = getSchemaContent(node.table, null);
    const columnCount = schemaContent?.props?.children[1]?.props?.children?.length || 0;
    
    // サンプルデータから行数を取得
    const tableData = node.table;
    const rowData = sampleTableData[tableData] || [];
    const rowCount = rowData.length;
    
    // 基本サイズとスケール係数
    const baseRadius = 12;
    const maxRadius = 35;
    const minRadius = 15;
    
    // データ量の重要度係数
    const dataImportance = 0.6;
    const schemaImportance = 0.4;
    
    // カラム数とデータ量を正規化（対数スケール）
    const normalizedColumns = Math.log2(columnCount + 2) / Math.log2(10); // 最大10カラムを想定
    const normalizedRows = Math.log2(rowCount + 2) / Math.log2(100);     // 最大100行を想定
    
    // 重み付けされたスコアを計算
    const score = (normalizedColumns * schemaImportance + normalizedRows * dataImportance);
    
    // スコアを半径に変換（エクスポネンシャルスケーリング）
    const radius = minRadius + (maxRadius - minRadius) * Math.pow(score, 1.5);
    
    // アニメーションのための微細な変動を追加
    const time = performance.now() / 1000;
    const pulseFactor = 1 + Math.sin(time * 2) * 0.03;
    
    return Math.max(minRadius, Math.min(maxRadius, radius * pulseFactor));
  };
  const [selectedNode, setSelectedNode] = useState<CustomNodeObject | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [selectedRowDataMap, setSelectedRowDataMap] = useState<Map<string, Record<string, any>>>(new Map());
  const [graphData, setGraphData] = useState<ForceGraphData>(sampleData);
  const [hoveredNode, setHoveredNode] = useState<CustomNodeObject | null>(null);
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);

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
  // ズームレベルの変更を監視するためのstate
  const [currentZoom, setCurrentZoom] = useState(1);

  // ズーム終了時にstateを更新
  const handleZoomEnd = useCallback((transform: { k: number; x: number; y: number }) => {
    setCurrentZoom(transform.k);
  }, []);

  
  const handleNodeHover = useCallback((node: CustomNodeObject | null) => {
    if (node?.tooltip) {
      setHoveredNode(node);
    } else {
      setHoveredNode(null);
    }
  }, []);

  const paintNode = useCallback((node: CustomNodeObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
    if (!node || typeof node.x === 'undefined' || typeof node.y === 'undefined') return null;
    
    const isCurrentSelected = selectedNode && node.id === selectedNode.id;
    const isEverSelected = selectedNodes.has(node.id);
    const currentZoom = fgRef.current?.zoom() || 1;
    const isZoomedIn = currentZoom > 2;

    // ズームイン時のみ、選択されていないノードを非表示に
    if (isZoomedIn && !isCurrentSelected && selectedNode) return null;

    // Draw enhanced glow effect
    const time = performance.now() / 1000;
    const pulseSize = 1 + Math.sin(time * 2) * 0.1; // Pulsating effect
    const currentNodeRadius = getNodeRadius(node);
    
    // Outer glow for selected state
    if (isCurrentSelected || isEverSelected) {
      const outerGlow = ctx.createRadialGradient(
        node.x, node.y, currentNodeRadius * 1.5,
        node.x, node.y, currentNodeRadius * 3 * pulseSize
      );
      outerGlow.addColorStop(0, 'rgba(123, 97, 255, 0.2)');
      outerGlow.addColorStop(1, 'rgba(123, 97, 255, 0)');
      ctx.beginPath();
      ctx.arc(node.x, node.y, currentNodeRadius * 3 * pulseSize, 0, 2 * Math.PI);
      ctx.fillStyle = outerGlow;
      ctx.fill();

      // Draw data indicator if row is selected
      const nodeData = selectedRowDataMap.get(node.id);
      if (nodeData) {
        // Animated ring
        const ringSize = 1 + Math.sin(time * 3) * 0.05;
        ctx.beginPath();
        ctx.arc(node.x, node.y, currentNodeRadius * 1.8 * ringSize, 0, 2 * Math.PI);
        ctx.strokeStyle = '#7B61FF';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw ID label
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = '#2C2C2C';
        ctx.textAlign = 'center';
        ctx.fillText(`ID: ${nodeData.id}`, node.x, node.y - currentNodeRadius * 2.5);
      }
    }

    // Base glow
    const gradient = ctx.createRadialGradient(
      node.x, node.y, currentNodeRadius * 0.5,
      node.x, node.y, currentNodeRadius * 2
    );
    gradient.addColorStop(0, 'rgba(3, 31, 104, 0.15)');
    gradient.addColorStop(1, 'rgba(3, 31, 104, 0)');
    ctx.beginPath();
    const radius = getNodeRadius(node);
    ctx.arc(node.x, node.y, radius * 2, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw circle with gradient
    const circleGradient = ctx.createRadialGradient(
      node.x - currentNodeRadius * 0.3, node.y - currentNodeRadius * 0.3, currentNodeRadius * 0.1,
      node.x, node.y, currentNodeRadius * 1.2
    );
    circleGradient.addColorStop(0, '#ffffff');
    circleGradient.addColorStop(1, '#f8fafc');
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = circleGradient;
    ctx.fill();
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 0.75;
    ctx.stroke();

    // Draw database icon
    const iconSize = radius * 1.4;
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
    ctx.fillText(node.table || '', node.x, node.y + radius * 3);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Create tooltip content without modifying state
    if (globalScale >= 2.5 && node.table) {
      // Get selected row data for this node
      const rowData = selectedRowDataMap.get(node.id);
      const schemaContent = getSchemaContent(node.table, rowData);
      if (schemaContent) {
        return {
          node,
          tooltip: {
            content: schemaContent
          }
        };
      }
    }
    return null;
  }, [selectedNode, selectedNodes, selectedRowDataMap, getNodeRadius]);

  const paintLink = (link: CustomLinkObject, ctx: CanvasRenderingContext2D) => {
      const sourceNode = typeof link.source === 'string' ? graphData.nodes.find(n => n.id === link.source) : link.source;
      const targetNode = typeof link.target === 'string' ? graphData.nodes.find(n => n.id === link.target) : link.target;
      
      if (!sourceNode?.x || !sourceNode?.y || !targetNode?.x || !targetNode?.y) return;
    
    const currentZoom = fgRef.current?.zoom() || 1;
    const isZoomedIn = currentZoom > 2;

    // ズームイン時は選択されたノードに関連するエッジのみ表示
    if (isZoomedIn && selectedNode && sourceNode.id !== selectedNode.id && targetNode.id !== selectedNode.id) {
      return;
    }
    
    // Get current time for animation
    const time = performance.now() / 1000;
    const dashOffset = time * 15; // Speed of animation
    
    // Calculate angle and distance for curved paths
    const dx = targetNode.x - sourceNode.x;
    const dy = targetNode.y - sourceNode.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Create control points for curved path
    const midX = (sourceNode.x + targetNode.x) / 2;
    const midY = (sourceNode.y + targetNode.y) / 2;
    const curvature = 0.3;
    const cpX = midX - dy * curvature;
    const cpY = midY + dx * curvature;
    
    // Create gradient with relationship-specific colors
    const gradient = ctx.createLinearGradient(sourceNode.x, sourceNode.y, targetNode.x, targetNode.y);
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
    ctx.moveTo(sourceNode.x, sourceNode.y);
    ctx.quadraticCurveTo(cpX, cpY, targetNode.x, targetNode.y);
    
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
        const arrowX = targetNode.x - Math.cos(angle) * 20;
        const arrowY = targetNode.y - Math.sin(angle) * 20;
        
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
          sourceNode.x + Math.cos(angle) * 15,
          sourceNode.y + Math.sin(angle) * 15,
          3, 0, 2 * Math.PI
        );
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(
          targetNode.x - Math.cos(angle) * 15,
          targetNode.y - Math.sin(angle) * 15,
          3, 0, 2 * Math.PI
        );
        ctx.fill();
      }
    }
  };


  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2C2C2C] to-[#1a1a1a]">
      <Header />
      
      {/* Schema tooltip */}
      {hoveredNode?.tooltip && (
        <div
          className="fixed z-50 p-6 rounded-xl transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: '50%',
            top: '50%',
            backgroundColor: 'rgba(28, 28, 28, 0.85)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(71, 255, 222, 0.1), inset 0 0 32px rgba(71, 255, 222, 0.05)',
            minWidth: '700px',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {hoveredNode.tooltip.content}
        </div>
      )}

      {/* Fullscreen preview modal */}
      {isPreviewFullscreen && selectedNode && (
        <div className="fixed inset-0 z-50 bg-[#2C2C2C] bg-opacity-95 backdrop-blur-sm flex items-center justify-center">
          <div className="w-11/12 h-5/6 bg-[#2C2C2C] rounded-lg border border-[#47FFDE] p-6 relative">
            <Button
              onClick={() => setIsPreviewFullscreen(false)}
              variant="ghost"
              className="absolute top-4 right-4 text-[#BBBBBB] hover:bg-[#3C3C3C]"
            >
              ✕
            </Button>
            <h2 className="text-xl font-medium text-[#47FFDE] mb-6">
              {selectedNode.table} - データプレビュー
            </h2>
            <div className="h-[calc(100%-4rem)] overflow-auto">
              <DataPreview
                tableName={selectedNode.table}
                onRowSelect={(data) => {
                  setSelectedRowDataMap(prev => {
                    const newMap = new Map(prev);
                    newMap.set(selectedNode.id, data);
                    return newMap;
                  });
                }}
                selectedRowData={selectedRowDataMap.get(selectedNode.id)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Table list sidebar */}
        <TableListSidebar
          onTableSelect={(tableId) => {
            const node = graphData.nodes.find(n => n.id === tableId);
            if (node) handleNodeClick(node);
          }}
          selectedNode={selectedNode?.id}
        />

        {/* Main content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Force graph area */}
          <div ref={containerRef} className={`relative overflow-hidden ${currentZoom > 2 ? 'w-1/3' : 'w-full'}`}>
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
              onNodeClick={handleNodeClick}
              onBackgroundClick={() => {
                setSelectedRowDataMap(new Map());
              }}
              nodeCanvasObject={paintNode}
              onNodeHover={handleNodeHover}
              nodePointerAreaPaint={(node, color, ctx) => {
                if (!node || typeof node.x === 'undefined' || typeof node.y === 'undefined') return;
                const radius = getNodeRadius(node);
                ctx.beginPath();
                ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
                ctx.fillStyle = color;
                ctx.fill();
              }}
              linkCanvasObject={paintLink}
              linkColor={() => "transparent"}
              linkDirectionalArrowLength={0}
              width={dimensions.width}
              height={dimensions.height}
              d3Force={(engine: any) => {
                const minDistance = 250;  // 最小距離をさらに増加
                const maxDistance = 600;  // 最大距離を増加
                const optimalDistance = 400;  // 最適な距離を調整

                // 反発力を強化
                const charge = d3.forceManyBody()
                  .strength(-300)  // 反発力をさらに強く
                  .distanceMin(minDistance)
                  .distanceMax(maxDistance);

                // リンクの力を強化
                const link = d3.forceLink()
                  .distance(d => {
                    // リンクごとに距離を動的に調整
                    const sourceLinks = engine.nodes().filter((n: any) => 
                      engine.links().some((l: any) => l.source === d.source || l.target === d.source)
                    ).length;
                    const targetLinks = engine.nodes().filter((n: any) => 
                      engine.links().some((l: any) => l.source === d.target || l.target === d.target)
                    ).length;
                    // リンク数に応じて距離を調整
                    return optimalDistance * (1 + Math.min(sourceLinks, targetLinks) * 0.2);
                  })
                  .strength(2);  // リンクの力を強く

                // 衝突検出を強化
                const collide = d3.forceCollide()
                  .radius(getNodeRadius(node) * 5)  // 衝突半径をさらに増加
                  .strength(1)    // 衝突の力を最大に
                  .iterations(4);  // 反復回数を増加

                // カスタム力を追加
                const customForce = (alpha: number) => {
                  const nodes = engine.nodes();
                  for (let i = 0; i < nodes.length; i++) {
                    for (let j = i + 1; j < nodes.length; j++) {
                      const node1 = nodes[i];
                      const node2 = nodes[j];
                      const dx = node2.x - node1.x;
                      const dy = node2.y - node1.y;
                      const distance = Math.sqrt(dx * dx + dy * dy);
                      
                      if (distance === 0) continue;
                      
                      // 力の強さを計算
                      let strength = 0;
                      if (distance < minDistance) {
                        // 近すぎる場合は強い反発力
                        strength = (minDistance - distance) / distance * alpha * 2;
                      } else if (distance > maxDistance) {
                        // 遠すぎる場合は引力
                        strength = (maxDistance - distance) / distance * alpha;
                      }
                      
                      // 力を適用
                      const fx = dx * strength;
                      const fy = dy * strength;
                      
                      node1.vx -= fx;
                      node1.vy -= fy;
                      node2.vx += fx;
                      node2.vy += fy;
                    }
                  }
                };

                engine
                  .force('charge', charge)
                  .force('link', link)
                  .force('collide', collide)
                  .force('center', d3.forceCenter())
                  .force('custom', customForce)
                  .velocityDecay(0.4)  // 移動の減衰を調整
                  .alphaMin(0.001)  // シミュレーションの終了条件を調整
                  .alphaDecay(0.02);  // シミュレーションの収束速度を調整
              }}
              d3VelocityDecay={0.3}
              enableNodeDrag={true}
              enableZoomPanInteraction={true}
              onNodeDragEnd={(node) => {
                if (node) {
                  node.fx = node.x;
                  node.fy = node.y;
                }
              }}
              autoPauseRedraw={false}
              onZoomEnd={handleZoomEnd}
            />
          </div>

          {/* Data preview area */}
          <AnimatePresence>
            {currentZoom > 2 && (
              <motion.div
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0, transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={`flex-1 border-l border-white/10 overflow-x-auto ${currentZoom > 2 ? 'bg-[#2C2C2C]/80 backdrop-blur-xl' : 'bg-transparent'}`}
              >
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium bg-gradient-to-r from-[#47FFDE] to-[#7B61FF] bg-clip-text text-transparent">
                      データプレビュー: {selectedNode?.table || ''}
                    </h3>
                    <Button
                      onClick={() => setIsPreviewFullscreen(true)}
                      variant="ghost"
                      className="text-[#BBBBBB] hover:bg-[#3C3C3C]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                      </svg>
                    </Button>
                  </div>
                  {selectedNode && (
                    <DataPreview 
                      tableName={selectedNode.table} 
                      onRowSelect={(data) => {
                        setSelectedRowDataMap(prev => {
                          const newMap = new Map(prev);
                          newMap.set(selectedNode.id, data);
                          return newMap;
                        });
                      }}
                      selectedRowData={selectedRowDataMap.get(selectedNode.id)}
                    />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}