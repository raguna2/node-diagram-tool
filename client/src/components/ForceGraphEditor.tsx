import { useEffect, useRef, useState, useCallback } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { sampleData } from "@/lib/sampleData";
import * as d3 from "d3-force";
import Header from "@/components/Header";
import TableSchema from "@/components/TableSchema";

interface ForceGraphProps {
  charge?: number;
  linkDistance?: number;
  isAutoRotate?: boolean;
}

export default function ForceGraphEditor({
  charge = -100,
  linkDistance = 100,
  isAutoRotate = false,
}: ForceGraphProps) {
  const fgRef = useRef<any>();
  const nodeRadius = 12;
  const [selectedNode, setSelectedNode] = useState<NodeObject | null>(null);
  const [graphData, setGraphData] = useState(sampleData);

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

  const handleNodeClick = useCallback((node: NodeObject) => {
    setSelectedNode(node);
    if (fgRef.current) {
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
    }
  }, []);

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

  interface NodeObject {
    x?: number;
    y?: number;
    id: string;
    group: number;
    table: string;
  }

  interface LinkObject {
    source: NodeObject;
    target: NodeObject;
    relationship: string;
    value: number;
  }
  
  const paintNode = (node: NodeObject, ctx: CanvasRenderingContext2D) => {
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
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  };

  const paintLink = (link: LinkObject, ctx: CanvasRenderingContext2D) => {
    const start = link.source;
    const end = link.target;
    
    if (typeof start.x === 'undefined' || typeof start.y === 'undefined' ||
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
        <div className="flex flex-col flex-1">
          <div className="flex flex-1">
            <div className="w-2/3 bg-white relative">
              <button
                onClick={handleBack}
                className="absolute top-4 left-4 px-3 py-1 text-sm bg-[#2C2C2C] text-[#BBBBBB] rounded-md hover:bg-[#3C3C3C] transition-colors z-10"
              >
                ← Back
              </button>
              <ForceGraph2D
                ref={fgRef}
                graphData={sampleData}
                nodeLabel="id"
                backgroundColor="#ffffff"
                width={window.innerWidth * 0.66}
                height={(window.innerHeight - 64) * 0.7}
                d3Force={(engine) => {
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
                onNodeDragEnd={(node) => {
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
            <div 
              className={`w-1/3 border-l border-[#47FFDE] transition-all duration-300 ease-in-out ${
                selectedNode ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
              <TableSchema node={selectedNode} />
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
              <div className="overflow-auto">
                {/* データテーブルの実装はここに追加予定 */}
                <p className="text-[#BBBBBB]">データベースからのデータをここに表示します</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
