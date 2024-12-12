export const sampleData = {
  nodes: [
    { id: 'users', group: 1, table: 'users' },
    { id: 'projects', group: 1, table: 'projects' },
    { id: 'tasks', group: 1, table: 'tasks' },
    { id: 'comments', group: 1, table: 'comments' },
    { id: 'attachments', group: 1, table: 'attachments' }
  ],
  links: [
    { source: 'users', target: 'projects', relationship: 'one-to-many', value: 1 },
    { source: 'projects', target: 'tasks', relationship: 'one-to-many', value: 1 },
    { source: 'users', target: 'tasks', relationship: 'one-to-many', value: 1 },
    { source: 'tasks', target: 'comments', relationship: 'one-to-many', value: 1 },
    { source: 'users', target: 'comments', relationship: 'one-to-many', value: 1 },
    { source: 'tasks', target: 'attachments', relationship: 'one-to-many', value: 1 },
    { source: 'users', target: 'attachments', relationship: 'one-to-many', value: 1 }
  ]
};
