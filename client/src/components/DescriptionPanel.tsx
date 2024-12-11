import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Node } from 'reactflow';

interface NodeData {
  label: string;
  description: string;
}

interface DescriptionPanelProps {
  node: Node<NodeData> | null;
  onDescriptionChange: (description: string) => void;
}

export default function DescriptionPanel({ 
  node,
  onDescriptionChange 
}: DescriptionPanelProps) {
  if (!node) return null;

  return (
    <Card className="w-64 p-4 m-4 bg-[#2C2C2C] border-[#47FFDE]">
      <div className="space-y-4">
        <div>
          <Label className="text-[#BBBBBB]">ノード名</Label>
          <div className="text-sm font-medium text-[#BBBBBB]">{node.data.label}</div>
        </div>
        <div>
          <Label htmlFor="description" className="text-[#BBBBBB]">説明</Label>
          <Textarea
            id="description"
            value={node.data.description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            className="mt-1 bg-[#49484D] border-[#47FFDE] text-[#BBBBBB] placeholder:text-[#BBBBBB]"
            placeholder="ノードの説明を入力..."
          />
        </div>
      </div>
    </Card>
  );
}
