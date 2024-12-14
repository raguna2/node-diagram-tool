interface TableData {
  [key: string]: Array<Record<string, any>>;
}

export const sampleTableData: TableData = {
  users: [
    { id: 1, name: '山田太郎', email: 'yamada@example.com', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 2, name: '佐藤花子', email: 'sato@example.com', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 3, name: '鈴木一郎', email: 'suzuki@example.com', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ],
  
  projects: Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: `プロジェクト${String.fromCharCode(65 + i)}`,
    description: `プロジェクト${String.fromCharCode(65 + i)}の説明文`,
    status: i % 2 === 0 ? 'active' : 'pending',
    owner_id: (i % 3) + 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })),

  tasks: Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    title: `タスク${i + 1}`,
    description: `タスク${i + 1}の詳細な説明`,
    status: ['todo', 'in_progress', 'done'][i % 3],
    priority: ['low', 'medium', 'high'][i % 3],
    project_id: (i % 10) + 1,
    assignee_id: (i % 3) + 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })),

  comments: Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    content: `コメント${i + 1}の内容`,
    task_id: (i % 20) + 1,
    user_id: (i % 3) + 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })),

  attachments: Array.from({ length: 2 }, (_, i) => ({
    id: i + 1,
    filename: `添付ファイル${i + 1}.${['pdf', 'png'][i]}`,
    file_path: `/files/attachment${i + 1}.${['pdf', 'png'][i]}`,
    file_size: 1024 * (i + 1),
    mime_type: ['application/pdf', 'image/png'][i],
    task_id: (i % 20) + 1,
    uploaded_by: (i % 3) + 1,
    created_at: new Date().toISOString()
  }))
};
