import { Group } from '@visx/group';
import { LinePath } from '@visx/shape';
import { curveBundle } from '@visx/curve';
import Header from '@/components/Header';
import { useState } from 'react';
import { Database } from 'lucide-react';

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

// 初期ノードの定義
const nodes: Node[] = [
  { id: '1', x: 150, y: 50, label: 'contact_relation', description: '' },
  { id: '2', x: 400, y: 50, label: 'visit_card', description: '' },
  { id: '3', x: 150, y: 200, label: 'contact', description: '' },
  { id: '4', x: 400, y: 200, label: 'lbc_relation', description: '' },
  { id: '5', x: 400, y: 350, label: 'lbc', description: '' },
];

// 初期エッジの定義
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
              {/* エッジの描画 */}
              {edges.map((edge, i) => (
                <LinePath
                  key={`edge-${i}`}
                  data={[
                    { x: edge.source.x, y: edge.source.y },
                    { x: edge.target.x, y: edge.target.y }
                  ]}
                  x={d => d.x}
                  y={d => d.y}
                  stroke="#000066"
                  strokeWidth={2}
                  strokeDasharray="5,5"
                  curve={curveBundle}
                />
              ))}
              {/* ノードの描画 */}
              {nodes.map((node) => (
                <Group key={node.id} top={node.y} left={node.x}>
                  {/* 円の背景 */}
                  <circle
                    r={40}
                    fill="white"
                    stroke="#000066"
                    strokeWidth={2}
                    onClick={() => handleNodeClick(node)}
                    style={{ cursor: 'pointer' }}
                  />
                  {/* データベースアイコン */}
                  <g transform="translate(-15,-15)">
                    <rect
                      width={30}
                      height={30}
                      fill="#000066"
                      rx={2}
                    />
                    <rect
                      x={3}
                      y={3}
                      width={24}
                      height={6}
                      fill="white"
                      rx={1}
                    />
                  </g>
                  {/* ラベル */}
                  <text
                    y={50}
                    textAnchor="middle"
                    className="text-xs text-[#000066] font-medium"
                  >
                    {node.label}
                  </text>
                </Group>
              ))}
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
