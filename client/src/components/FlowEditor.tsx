import { useState, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Node,
  Edge,
  Connection,
  NodeMouseHandler,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { DatabaseNode } from '@/components/nodes/DatabaseNode';
import DescriptionPanel from '@/components/DescriptionPanel';
import Header from '@/components/Header';

const nodeTypes = {
  database: DatabaseNode,
};

interface NodeData {
  label: string;
  description: string;
}

const initialNodes: Node<NodeData>[] = [
  {
    id: '1',
    type: 'database',
    position: { x: 250, y: 100 },
    data: { label: 'テーブル1', description: '' },
  },
  {
    id: '2',
    type: 'database',
    position: { x: 250, y: 300 },
    data: { label: 'テーブル2', description: '' },
  },
];

export default function FlowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) =>
      eds.concat({
        ...params,
        id: `e${eds.length + 1}`,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#47FFDE' },
      } as Edge)
    );
  }, []);

  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    setSelectedNode(node);
  }, []);

  const onDescriptionChange = useCallback((description: string) => {
    if (!selectedNode) return;
    
    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode.id
          ? { ...node, data: { ...node.data, description } }
          : node
      )
    );
  }, [selectedNode, setNodes]);

  return (
    <div className="flex flex-col h-screen bg-[#2C2C2C]">
      <Header />
      <div className="flex flex-1">
        <div className="flex-1 h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[15, 15]}
          >
            <Background color="#BBBBBB" />
            <Controls />
          </ReactFlow>
        </div>
        <DescriptionPanel node={selectedNode} onDescriptionChange={onDescriptionChange} />
      </div>
    </div>
  );
}
