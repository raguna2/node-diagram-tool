export const sampleData = {
  nodes: [
    { id: 'contact_relation', group: 1, table: 'contact_relation' },
    { id: 'visit_card', group: 1, table: 'visit_card' },
    { id: 'contact', group: 1, table: 'contact' },
    { id: 'lbc_relation', group: 1, table: 'lbc_relation' },
    { id: 'lbc', group: 1, table: 'lbc' }
  ],
  links: [
    { source: 'contact_relation', target: 'visit_card', relationship: 'one-to-one', value: 1 },
    { source: 'contact_relation', target: 'contact', relationship: 'one-to-many', value: 1 },
    { source: 'contact', target: 'lbc_relation', relationship: 'one-to-many', value: 1 },
    { source: 'lbc_relation', target: 'lbc', relationship: 'one-to-one', value: 1 }
  ]
};
