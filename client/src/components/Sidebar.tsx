import { Button } from '@/components/ui/button';
import { Database, Table, Tag } from 'lucide-react';
import { useCallback } from 'react';
import { useReactFlow } from 'reactflow';

export default function Sidebar() {
  const { screenToFlowPosition, addNodes } = useReactFlow();

  const onDragStart = useCallback((event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `${type}-${Date.now()}`,
        type: 'database',
        position,
        data: { label: type, description: '' },
      };

      addNodes(newNode);
    },
    [screenToFlowPosition, addNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <aside className="w-64 bg-muted p-4 border-r border-border">
      <h2 className="text-lg font-semibold mb-4">ノード</h2>
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start"
          draggable
          onDragStart={(e) => onDragStart(e, 'テーブル')}
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <Table className="mr-2 h-4 w-4" />
          テーブル
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          draggable
          onDragStart={(e) => onDragStart(e, 'リレーション')}
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <Database className="mr-2 h-4 w-4" />
          リレーション
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          draggable
          onDragStart={(e) => onDragStart(e, 'タグ')}
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <Tag className="mr-2 h-4 w-4" />
          タグ
        </Button>
      </div>
    </aside>
  );
}
