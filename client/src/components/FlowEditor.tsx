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

const defaultEdgeOptions = {
  type: 'smoothstep',
  markerEnd: { type: MarkerType.ArrowClosed },
  style: { stroke: '#000066', strokeDasharray: '5 5' },
  animated: true,
};

interface NodeData {
  label: string;
  description: string;
}

import { initialNodes } from '@/lib/initialNodes';

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
        style: { stroke: '#1a365d', strokeDasharray: '5 5' },
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
    <div className="flex flex-col h-screen bg-white">
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
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
            snapToGrid
            snapGrid={[15, 15]}
            selectNodesOnDrag
            multiSelectionKeyCode="Shift"
            selectionOnDrag
            deleteKeyCode="Delete"
            minZoom={0.5}
            maxZoom={2}
            nodesDraggable
            nodeDragThreshold={1}
            proOptions={{ hideAttribution: true }}
            style={{ 
              transition: 'transform 150ms ease-out',
              touchAction: 'none',
              willChange: 'transform'
            }}
            panOnDrag={true}
            translateExtent={[[-1000, -1000], [1000, 1000]]}
            preventScrolling={true}
          >
            <Background color="#f0f0f0" gap={20} />
            <Controls />
          </ReactFlow>
        </div>
        <DescriptionPanel node={selectedNode} onDescriptionChange={onDescriptionChange} />
      </div>
    </div>
  );
}
