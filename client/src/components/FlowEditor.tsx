import { useCallback, useState } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  Connection,
  Edge,
  Node,
  useEdgesState,
  useNodesState,
  ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { DatabaseNode } from './nodes/DatabaseNode';
import Sidebar from '@/components/Sidebar';
import DescriptionPanel from '@/components/DescriptionPanel';
import { initialNodes } from '@/lib/initialNodes';

const nodeTypes = {
  database: DatabaseNode,
};

export default function FlowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onDescriptionChange = useCallback((description: string) => {
    if (!selectedNode) return;
    
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              description,
            },
          };
        }
        return node;
      })
    );
  }, [selectedNode, setNodes]);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 h-full bg-slate-50">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          defaultEdgeOptions={{
            type: 'smoothstep',
            style: { stroke: '#94a3b8', strokeWidth: 2 }
          }}
          fitView
        >
          <Background color="#94a3b8" gap={16} size={1} />
          <Controls />
        </ReactFlow>
      </div>
      <DescriptionPanel 
        node={selectedNode}
        onDescriptionChange={onDescriptionChange}
      />
    </div>
  );
}
