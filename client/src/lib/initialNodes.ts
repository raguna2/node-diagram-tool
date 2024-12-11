import { Node } from 'reactflow';

export const initialNodes: Node[] = [
  {
    id: '1',
    type: 'database',
    position: { x: 250, y: 100 },
    data: { label: 'テーブル', description: '' },
  },
  {
    id: '2',
    type: 'database',
    position: { x: 250, y: 200 },
    data: { label: 'リレーション', description: '' },
  },
];
