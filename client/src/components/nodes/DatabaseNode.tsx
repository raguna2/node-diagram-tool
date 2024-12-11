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
        "w-[80px] h-[80px] relative",
        "flex items-center justify-center",
        selected ? "ring-2 ring-[#47FFDE]" : ""
      )}
    >
      <div className="absolute inset-0 rounded-full border-2 border-[#000066] bg-white" />
      <Database className="h-10 w-10 text-[#000066] z-10" />
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-[#000066] whitespace-nowrap font-medium">
        {data.label}
      </div>
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 border-2 border-[#000066] bg-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 border-2 border-[#000066] bg-white"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 border-2 border-[#000066] bg-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 border-2 border-[#000066] bg-white"
      />
    </div>
  );
});

DatabaseNode.displayName = 'DatabaseNode';
