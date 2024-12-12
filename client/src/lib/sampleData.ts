interface GraphNode {
  id: string;
  group: number;
  table: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number;
  fy?: number;
}

interface GraphLink {
  source: GraphNode;
  target: GraphNode;
  relationship: string;
  value: number;
}

const createNode = (id: string, table: string): GraphNode => ({
  id,
  group: 1,
  table,
  x: Math.random() * 800 - 400,
  y: Math.random() * 600 - 300,
  vx: 0,
  vy: 0
});

const nodes: GraphNode[] = [
  createNode('users', 'users'),
  createNode('projects', 'projects'),
  createNode('tasks', 'tasks'),
  createNode('comments', 'comments'),
  createNode('attachments', 'attachments')
];

const createLinks = (): GraphLink[] => {
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  
  const linkData = [
    { source: 'users', target: 'projects', relationship: 'one-to-many' },
    { source: 'projects', target: 'tasks', relationship: 'one-to-many' },
    { source: 'users', target: 'tasks', relationship: 'one-to-many' },
    { source: 'tasks', target: 'comments', relationship: 'one-to-many' },
    { source: 'users', target: 'comments', relationship: 'one-to-many' },
    { source: 'tasks', target: 'attachments', relationship: 'one-to-many' },
    { source: 'users', target: 'attachments', relationship: 'one-to-many' }
  ];

  return linkData.map(({ source, target, relationship }) => ({
    source: nodeMap.get(source)!,
    target: nodeMap.get(target)!,
    relationship,
    value: 1
  }));
};

export const sampleData = {
  nodes,
  links: createLinks()
};
