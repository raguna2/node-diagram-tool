import { useState, useCallback } from 'react';
import { Group } from '@visx/group';
import { hierarchy } from '@visx/hierarchy';
import { LinkHorizontal } from '@visx/shape';
import { tree as d3tree } from 'd3-hierarchy';
import { Database } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import DescriptionPanel from '@/components/DescriptionPanel';

interface NodePosition {
  x: number;
  y: number;
}

interface DraggedNode {
  id: string;
  position: NodePosition;
}

interface TreeNode {
  name: string;
  description?: string;
  children?: TreeNode[];
}

const initialData: TreeNode = {
  name: 'データベース設計',
  children: [
    {
      name: 'ユーザー管理',
      children: [
        { name: 'ユーザー', description: 'ユーザー情報を管理するテーブル' },
        { name: '権限', description: 'ユーザーの権限を管理するテーブル' },
      ],
    },
    {
      name: 'コンテンツ管理',
      children: [
        { name: '記事', description: '記事データを管理するテーブル' },
        { name: 'カテゴリ', description: '記事のカテゴリを管理するテーブル' },
      ],
    },
  ],
};

const defaultMargin = { top: 40, left: 40, right: 40, bottom: 40 };

export default function FlowEditor() {
  const [data] = useState<TreeNode>(initialData);
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [draggedNodes, setDraggedNodes] = useState<{ [key: string]: NodePosition }>({});
  const [isDragging, setIsDragging] = useState(false);

  const width = 1200;
  const height = 800;

  const handleDragStart = useCallback((event: React.MouseEvent, nodeId: string) => {
    setIsDragging(true);
    event.stopPropagation();
  }, []);

  const handleDrag = useCallback((event: React.MouseEvent, nodeId: string, originalX: number, originalY: number) => {
    if (!isDragging) return;
    
    const newX = originalX + event.movementX;
    const newY = originalY + event.movementY;
    
    setDraggedNodes(prev => ({
      ...prev,
      [nodeId]: { x: newX, y: newY }
    }));
    
    event.stopPropagation();
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);
  const yMax = height - defaultMargin.top - defaultMargin.bottom;
  const xMax = width - defaultMargin.left - defaultMargin.right;

  // 階層構造を作成
  const root = hierarchy(data);
  
  // treeレイアウトを作成
  const treeLayout = d3tree<TreeNode>()
    .size([yMax, xMax]);
  
  // レイアウトを計算
  const treeData = treeLayout(root);
  
  // リンクとノードを取得
  const links = treeData.links();
  const nodes = treeData.descendants();

  const onNodeClick = (node: any) => {
    setSelectedNode(node.data);
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 h-full bg-slate-50">
        <svg width={width} height={height}>
          <Group top={defaultMargin.top} left={defaultMargin.left}>
            {links.map((link, i) => (
              <LinkHorizontal
                key={i}
                data={link}
                stroke="#94a3b8"
                strokeWidth={2}
                fill="none"
              />
            ))}
            {nodes.map((node, i) => (
              <Group
                key={i}
                top={draggedNodes[node.data.name]?.y ?? node.x}
                left={draggedNodes[node.data.name]?.x ?? node.y}
                onClick={() => onNodeClick(node)}
                onMouseDown={(e) => handleDragStart(e, node.data.name)}
                onMouseMove={(e) => handleDrag(e, node.data.name, node.y, node.x)}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
              >
                <circle
                  r={20}
                  fill="white"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  className="cursor-pointer hover:stroke-blue-400"
                />
                <Database
                  className="h-5 w-5 text-blue-500 cursor-pointer"
                  style={{
                    transform: 'translate(-10px, -10px)',
                  }}
                />
                <text
                  dy=".33em"
                  fontSize={12}
                  fontFamily="Arial"
                  textAnchor="middle"
                  style={{ pointerEvents: 'none' }}
                  y={40}
                >
                  {node.data.name}
                </text>
              </Group>
            ))}
          </Group>
        </svg>
      </div>
      <DescriptionPanel
        node={selectedNode ? { id: '1', data: { label: selectedNode.name, description: selectedNode.description || '' } } : null}
        onDescriptionChange={() => {}}
      />
    </div>
  );
}
