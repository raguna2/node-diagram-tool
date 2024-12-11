import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Node } from 'reactflow';

interface DescriptionPanelProps {
  node: Node | null;
  onDescriptionChange: (description: string) => void;
}

export default function DescriptionPanel({ 
  node,
  onDescriptionChange 
}: DescriptionPanelProps) {
  if (!node) return null;

  return (
    <Card className="w-64 p-4 m-4 bg-muted">
      <div className="space-y-4">
        <div>
          <Label>ノード名</Label>
          <div className="text-sm font-medium">{node.data.label}</div>
        </div>
        <div>
          <Label htmlFor="description">説明</Label>
          <Textarea
            id="description"
            value={node.data.description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            className="mt-1"
            placeholder="ノードの説明を入力..."
          />
        </div>
      </div>
    </Card>
  );
}
