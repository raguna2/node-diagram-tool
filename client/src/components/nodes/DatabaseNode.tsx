import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Database } from 'lucide-react';
import { cn } from '@/lib/utils';

export const DatabaseNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div
      className={cn(
        "min-w-[150px] px-4 py-3 shadow-md rounded-lg",
        "bg-white border-2 border-blue-600",
        selected ? "ring-2 ring-blue-400" : ""
      )}
    >
      <div className="flex items-center justify-center">
        <Database className="h-5 w-5 text-blue-500 mr-2" />
        <div className="text-sm font-medium text-gray-700">{data.label}</div>
      </div>
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#3b82f6', width: '8px', height: '8px' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#3b82f6', width: '8px', height: '8px' }}
      />
    </div>
  );
});

DatabaseNode.displayName = 'DatabaseNode';
