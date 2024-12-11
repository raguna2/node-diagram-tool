import { useState } from 'react';
import { Group } from '@visx/group';
import { hierarchy, Tree } from '@visx/hierarchy';
import { LinkHorizontal } from '@visx/shape';
import { Database } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import DescriptionPanel from '@/components/DescriptionPanel';

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

  const width = 1200;
  const height = 800;
  const yMax = height - defaultMargin.top - defaultMargin.bottom;
  const xMax = width - defaultMargin.left - defaultMargin.right;

  const root = hierarchy(data);
  const tree = Tree<TreeNode>({
    root,
    nodeSize: [yMax / (root.height + 1), xMax / (root.height + 1)],
  });
  const links = tree.links();
  const nodes = tree.descendants();

  const onNodeClick = (node: TreeNode) => {
    setSelectedNode(node);
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
                top={node.x}
                left={node.y}
                onClick={() => onNodeClick(node.data)}
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
