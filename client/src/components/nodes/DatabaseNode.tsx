import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Database } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NodeData {
  label: string;
  description: string;
}

export const DatabaseNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  return (
    <div
      className={cn(
        "w-[48px] h-[48px] relative",
        "flex items-center justify-center",
        selected ? "ring-2 ring-blue-400" : ""
      )}
    >
      <div className="absolute inset-0 rounded-full border-2 border-blue-600 bg-white" />
      <Database className="h-6 w-6 text-blue-500" />
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap">
        {data.label}
      </div>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 border-2 bg-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 border-2 bg-white"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 border-2 bg-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 border-2 bg-white"
      />
    </div>
  );
});

DatabaseNode.displayName = 'DatabaseNode';
