import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { sampleData } from "@/lib/sampleData";
import * as d3 from "d3-force";
import Header from "@/components/Header";
import TableSchema from "@/components/TableSchema";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import DataPreview from "@/components/DataPreview";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

interface ForceGraphProps {
  charge?: number;
  linkDistance?: number;
  isAutoRotate?: boolean;
}

interface NodeObject {
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
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
      fg.zoom(8, 400);
    }, 50);
  }, []);

  const handleNodeClick = useCallback((node: NodeObject) => {
    setSelectedNode(node);
    setSelectedRowData(null); // Reset selected row data when changing nodes
    zoomToNode(node);
  }, [zoomToNode]);

  // 選択されたデータに基づいてノードの位置を調整
  const adjustNodePosition = useCallback((node: NodeObject) => {
    if (!fgRef.current) return;
    const fg = fgRef.current;
    
    // 現在のビューポートの中心からやや上に配置
    const currentZoom = fg.zoom();
    const viewportWidth = fg.width() / currentZoom;
    const viewportHeight = fg.height() / currentZoom;
    
    node.fx = viewportWidth / 2;
    node.fy = (viewportHeight / 2) - 100; // ツールチップのスペースを確保するため上に配置
    
    fg.centerAt(node.fx, node.fy, 1000);
  }, []);

  // データ行選択時の処理を拡張
  const handleRowSelect = useCallback((data: Record<string, any>) => {
    setSelectedRowData(data);
    if (selectedNode) {
      adjustNodePosition(selectedNode);
    }
  }, [selectedNode, adjustNodePosition]);

  const paintNode = useCallback((node: NodeObject, ctx: CanvasRenderingContext2D) => {
    if (typeof node.x === 'undefined' || typeof node.y === 'undefined') return;
    
    // 選択されたノードがある場合、そのノード以外は描画しない
    if (selectedNode && node.id !== selectedNode.id) return;

    // Draw glow effect
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
    
    // Draw tooltip if we have selected row data
    if (selectedRowData && node.table === selectedNode?.table) {
      const tooltipText = `ID: ${selectedRowData.id}`;
      const tooltipWidth = ctx.measureText(tooltipText).width + 10;
      const tooltipHeight = 20;
      const tooltipX = node.x - tooltipWidth / 2;
      const tooltipY = node.y - nodeRadius * 5;

      // Draw tooltip background
      ctx.fillStyle = '#2C2C2C';
      ctx.beginPath();
      ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 4);
      
      // Draw arrow
      ctx.beginPath();
      ctx.moveTo(node.x, tooltipY + tooltipHeight);
      ctx.lineTo(node.x - 8, tooltipY + tooltipHeight);
      ctx.lineTo(node.x, tooltipY + tooltipHeight + 8);
      ctx.lineTo(node.x + 8, tooltipY + tooltipHeight);
      ctx.closePath();
      
      ctx.fill();
      ctx.strokeStyle = '#47FFDE';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw tooltip text
      ctx.fillStyle = '#BBBBBB';
      ctx.textAlign = 'center';
      ctx.fillText(tooltipText, node.x, tooltipY + 14);
    }
    
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }, [selectedNode, selectedRowData, nodeRadius]);

  const paintLink = useCallback((link: LinkObject, ctx: CanvasRenderingContext2D) => {
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
  }, [selectedNode, graphData.nodes]);

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1">
        <div className="flex flex-col flex-1">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={75} minSize={30}>
              <div className="h-full bg-white relative">
                <div className="absolute top-4 left-4 z-10">
                  <Button
                    onClick={() => setSelectedNode(null)}
                    variant="ghost"
                    className="text-sm bg-[#2C2C2C] text-[#BBBBBB] hover:bg-[#3C3C3C] transition-colors"
                  >
                    ← Back
                  </Button>
                </div>
                <ForceGraph2D
                  ref={fgRef}
                  graphData={graphData}
                  nodeLabel="id"
                  backgroundColor="#ffffff"
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
                  onNodeClick={handleNodeClick}
                  onNodeDragEnd={(node: NodeObject) => {
                    node.fx = node.x;
                    node.fy = node.y;
                  }}
                  autoPauseRedraw={false}
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
                />
              </div>
            </ResizablePanel>
            {selectedNode && (
              <>
                <ResizableHandle />
                <ResizablePanel defaultSize={25} minSize={20}>
                  <TableSchema node={selectedNode} selectedRowData={selectedRowData} />
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
          {selectedNode && (
            <ResizablePanelGroup direction="vertical">
              <ResizableHandle />
              <ResizablePanel defaultSize={30} minSize={20}>
                <div className="h-full border-t border-[#47FFDE] bg-[#2C2C2C] overflow-hidden">
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-[#BBBBBB] mb-4">
                      データプレビュー: {selectedNode?.table}
                    </h3>
                    <DataPreview 
                      tableName={selectedNode?.table} 
                      onRowSelect={handleRowSelect}
                      selectedRowData={selectedRowData}
                    />
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          )}
        </div>
      </div>
    </div>
  );
}