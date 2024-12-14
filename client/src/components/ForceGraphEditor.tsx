'use client'

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
  source: CustomNodeObject;
  target: CustomNodeObject;
  relationship: string;
  value: number;
}

interface GraphData {
  nodes: CustomNodeObject[];
  links: CustomLinkObject[];
}

export default function ForceGraphEditor({
  charge = -100,
  linkDistance = 100,
  isAutoRotate = false,
}: ForceGraphProps) {
  const fgRef = useRef<any>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0
  });

  // サイズの監視と更新
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };

    // 初期サイズを設定
    updateDimensions();

    // リサイズイベントのリスナーを追加
    window.addEventListener('resize', updateDimensions);

    // クリーンアップ
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // ノードのサイズ計算を最適化
  const getNodeRadius = useCallback((node: CustomNodeObject) => {
    if (!node?.table) return 10;

    try {
      // 基本サイズの定義
      const baseRadius = 10;
      const maxRadius = 30;

      // スキーマ情報からカラム数を取得（静的な値を使用）
      const schemas: Record<string, number> = {
        users: 5,
        projects: 7,
        tasks: 9,
        comments: 5,
        attachments: 8
      };
      
      const columnCount = schemas[node.table] || 0;
      const rowCount = (sampleTableData[node.table] || []).length;

      // サイズの計算
      const size = baseRadius + 
        (Math.log(columnCount + 1) * 2) + 
        (Math.log(rowCount + 1) * 1.5);

      return Math.min(Math.max(size, baseRadius), maxRadius);
    } catch (error) {
      return 10;
    }
  }, []);

  const [selectedNode, setSelectedNode] = useState<CustomNodeObject | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [selectedRowDataMap, setSelectedRowDataMap] = useState<Map<string, Record<string, any>>>(new Map());
  const [graphData, setGraphData] = useState(sampleData);
  const [hoveredNode, setHoveredNode] = useState<CustomNodeObject | null>(null);
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(1);

  // ズーム処理の最適化
  const handleZoomEnd = useCallback((transform: { k: number }) => {
    setCurrentZoom(transform.k);
  }, []);

  // ノードのペイント処理
  const paintNode = useCallback((node: CustomNodeObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
    if (!node || typeof node.x === 'undefined' || typeof node.y === 'undefined') return;

    const radius = getNodeRadius(node);
    const isSelected = selectedNode?.id === node.id;
    const hasBeenSelected = selectedNodes.has(node.id);
    
    if (currentZoom > 2 && !isSelected && selectedNode) return;

    ctx.save();

    if (isSelected || hasBeenSelected) {
      const time = performance.now() / 1000;
      const pulseSize = 1 + Math.sin(time * 2) * 0.1;
      const glow = ctx.createRadialGradient(
        node.x, node.y, radius * 1.5,
        node.x, node.y, radius * 3 * pulseSize
      );
      glow.addColorStop(0, 'rgba(123, 97, 255, 0.2)');
      glow.addColorStop(1, 'rgba(123, 97, 255, 0)');
      
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius * 3 * pulseSize, 0, 2 * Math.PI);
      ctx.fillStyle = glow;
      ctx.fill();
    }

    const gradient = ctx.createRadialGradient(
      node.x - radius * 0.3,
      node.y - radius * 0.3,
      radius * 0.1,
      node.x,
      node.y,
      radius * 1.2
    );
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(1, '#f8fafc');

    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 0.75;
    ctx.stroke();

    const iconSize = radius * 1.4;
    ctx.drawImage(
      new Image(),
      node.x - iconSize / 2,
      node.y - iconSize / 2,
      iconSize,
      iconSize
    );

    ctx.font = '10px Arial';
    ctx.fillStyle = "#031F68";
    ctx.textAlign = 'center';
    ctx.fillText(node.table || '', node.x, node.y + radius * 2);

    ctx.restore();

    node.tooltip = globalScale >= 2.5 && node.table
      ? { content: getSchemaContent(node.table, selectedRowDataMap.get(node.id)) }
      : undefined;
  }, [selectedNode?.id, selectedNodes, selectedRowDataMap, currentZoom, getNodeRadius]);

  // リンクの描画処理
  const paintLink = useCallback((link: CustomLinkObject, ctx: CanvasRenderingContext2D) => {
    const source = typeof link.source === 'string' ? graphData.nodes.find(n => n.id === link.source) : link.source;
    const target = typeof link.target === 'string' ? graphData.nodes.find(n => n.id === link.target) : link.target;
    
    if (!source?.x || !source?.y || !target?.x || !target?.y) return;

    if (currentZoom > 2 && selectedNode && 
        source.id !== selectedNode.id && 
        target.id !== selectedNode.id) return;

    const time = performance.now() / 1000;
    const dashOffset = time * 15;

    // エッジの描画
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const midX = (source.x + target.x) / 2;
    const midY = (source.y + target.y) / 2;
    const curvature = 0.3;
    const cpX = midX - dy * curvature;
    const cpY = midY + dx * curvature;

    // グラデーションの設定
    const gradient = ctx.createLinearGradient(source.x, source.y, target.x, target.y);
    const [startColor, endColor] = {
      'one-to-one': ['rgba(71, 255, 222, 0.6)', 'rgba(71, 255, 222, 0.2)'],
      'one-to-many': ['rgba(123, 97, 255, 0.6)', 'rgba(123, 97, 255, 0.2)'],
      'many-to-many': ['rgba(255, 71, 71, 0.6)', 'rgba(255, 71, 71, 0.2)']
    }[link.relationship] || ['rgba(100, 116, 139, 0.4)', 'rgba(100, 116, 139, 0.1)'];

    gradient.addColorStop(0, startColor);
    gradient.addColorStop(1, endColor);

    // パスの描画
    ctx.beginPath();
    ctx.moveTo(source.x, source.y);
    ctx.quadraticCurveTo(cpX, cpY, target.x, target.y);
    ctx.strokeStyle = gradient;

    // リレーションシップタイプに応じたスタイル
    switch (link.relationship) {
      case 'one-to-one':
        ctx.setLineDash([4, 4]);
        ctx.lineDashOffset = dashOffset;
        ctx.lineWidth = 1.5;
        break;
      case 'one-to-many':
        ctx.setLineDash([8, 4]);
        ctx.lineDashOffset = -dashOffset * 2;
        ctx.lineWidth = 2;
        break;
      case 'many-to-many':
        ctx.setLineDash([3, 3]);
        ctx.lineDashOffset = Math.sin(time * 3) * 15;
        ctx.lineWidth = 2.5;
        break;
    }

    ctx.stroke();

    // 矢印やマーカーの描画
    if (distance > 60) {
      const angle = Math.atan2(dy, dx);
      const arrowSize = 6;

      if (link.relationship === 'one-to-many') {
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
        ctx.fillStyle = startColor;
        ctx.fill();
      }
    }
  }, [selectedNode, currentZoom, graphData.nodes]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2C2C2C] to-[#1a1a1a]">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <TableListSidebar
          onTableSelect={(tableId) => {
            const node = graphData.nodes.find(n => n.id === tableId);
            if (node) {
              setSelectedNode(node);
              setSelectedNodes(prev => new Set([...prev, node.id]));
            }
          }}
          selectedNode={selectedNode?.id}
        />

        <div className="flex flex-1 overflow-hidden">
          <div ref={containerRef} className="w-1/3 relative">
            <ForceGraph2D
              ref={fgRef}
              graphData={graphData}
              nodeLabel="id"
              backgroundColor="#ffffff"
              width={dimensions.width}
              height={dimensions.height}
              onNodeClick={(node: CustomNodeObject) => {
                setSelectedNode(node);
                setSelectedNodes(prev => new Set([...prev, node.id]));
              }}
              nodeCanvasObject={paintNode}
              onNodeHover={setHoveredNode}
              linkCanvasObject={paintLink}
              linkColor={() => "transparent"}
              onZoomEnd={handleZoomEnd}
              d3Force={(engine: any) => {
                engine
                  .force('charge', d3.forceManyBody().strength(-300))
                  .force('link', d3.forceLink().distance(linkDistance).strength(1))
                  .force('center', d3.forceCenter())
                  .force('collide', d3.forceCollide(30).strength(0.7));
              }}
            />
          </div>

          <div className="flex-1 border-l border-white/10 overflow-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-[#47FFDE]">
                  データプレビュー: {selectedNode?.table || ''}
                </h3>
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
          </div>
        </div>
      </div>
    </div>
  );
}