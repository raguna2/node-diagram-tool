import { Group } from '@visx/group';
import { Graph } from '@visx/network';
import { curveBasis } from '@visx/curve';
import { LinkHorizontal } from '@visx/shape';
import Header from '@/components/Header';
import { useState } from 'react';

interface Node {
  x: number;
  y: number;
  id: string;
  label: string;
  description: string;
}

interface Edge {
  source: Node;
  target: Node;
}

// initialNodesから初期ノードを生成
const nodes: Node[] = [
  { id: '1', x: 150, y: 50, label: 'contact_relation', description: '' },
  { id: '2', x: 400, y: 50, label: 'visit_card', description: '' },
  { id: '3', x: 150, y: 200, label: 'contact', description: '' },
  { id: '4', x: 400, y: 200, label: 'lbc_relation', description: '' },
  { id: '5', x: 400, y: 350, label: 'lbc', description: '' },
];

// 初期エッジを定義
const edges: Edge[] = [
  { source: nodes[0], target: nodes[1] },  // contact_relation -> visit_card
  { source: nodes[0], target: nodes[2] },  // contact_relation -> contact
  { source: nodes[3], target: nodes[4] },  // lbc_relation -> lbc
  { source: nodes[2], target: nodes[3] },  // contact -> lbc_relation
];

export default function VisxFlowEditor() {
  const width = 1200;
  const height = 800;
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const handleNodeClick = (node: Node) => {
    setSelectedNode(node);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <Header />
      <div className="flex flex-1">
        <div className="flex-1 h-full relative">
          <svg width={width} height={height}>
            <Group>
              <Graph
                nodes={nodes}
                links={edges}
                linkComponent={({ link }) => (
                  <LinkHorizontal
                    data={link}
                    stroke="#000066"
                    strokeWidth={2}
                    fill="none"
                    strokeDasharray="5,5"
                    curve={curveBasis}
                  />
                )}
                nodeComponent={({ node }) => (
                  <g
                    transform={`translate(${node.x},${node.y})`}
                    onClick={() => handleNodeClick(node)}
                    cursor="pointer"
                  >
                    <circle
                      r={40}
                      fill="white"
                      stroke="#000066"
                      strokeWidth={2}
                    />
                    <rect
                      x={-15}
                      y={-15}
                      width={30}
                      height={30}
                      fill="#000066"
                      rx={2}
                    />
                    <rect
                      x={-12}
                      y={-12}
                      width={24}
                      height={6}
                      fill="white"
                      rx={1}
                    />
                    <text
                      y={50}
                      textAnchor="middle"
                      className="text-xs text-[#000066] font-medium"
                    >
                      {node.label}
                    </text>
                  </g>
                )}
              />
            </Group>
          </svg>
        </div>
        {selectedNode && (
          <div className="w-64 p-4 bg-[#2C2C2C] border-l border-[#47FFDE]">
            <h3 className="text-[#BBBBBB] font-medium mb-2">ノード情報</h3>
            <p className="text-[#BBBBBB]">{selectedNode.label}</p>
          </div>
        )}
      </div>
    </div>
  );
}
