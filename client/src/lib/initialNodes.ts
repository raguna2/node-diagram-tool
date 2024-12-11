import { Node } from 'reactflow';

export const initialNodes: Node[] = [
  {
    id: '1',
    type: 'database',
    position: { x: 150, y: 50 },
    data: { label: 'contact_relation', description: '' },
  },
  {
    id: '2',
    type: 'database',
    position: { x: 400, y: 50 },
    data: { label: 'visit_card', description: '' },
  },
  {
    id: '3',
    type: 'database',
    position: { x: 150, y: 200 },
    data: { label: 'contact', description: '' },
  },
  {
    id: '4',
    type: 'database',
    position: { x: 400, y: 200 },
    data: { label: 'lbc_relation', description: '' },
  },
  {
    id: '5',
    type: 'database',
    position: { x: 400, y: 350 },
    data: { label: 'lbc', description: '' },
  },
];
