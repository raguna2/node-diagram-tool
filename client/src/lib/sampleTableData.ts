interface TableData {
  [key: string]: Array<Record<string, any>>;
}

export const sampleTableData: TableData = {
  users: [
    { id: 1, name: '山田太郎', email: 'yamada@example.com', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 2, name: '佐藤花子', email: 'sato@example.com', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 3, name: '鈴木一郎', email: 'suzuki@example.com', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ],
  
  projects: [
    { id: 1, name: 'プロジェクトA', description: 'Webアプリケーションの開発', status: 'active', owner_id: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 2, name: 'プロジェクトB', description: 'モバイルアプリの開発', status: 'active', owner_id: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 3, name: 'プロジェクトC', description: 'データ分析プロジェクト', status: 'pending', owner_id: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ],

  tasks: [
    { id: 1, title: '要件定義', description: 'クライアントとの要件確認', status: 'in_progress', priority: 'high', project_id: 1, assignee_id: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 2, title: 'デザイン作成', description: 'UIデザインの作成', status: 'todo', priority: 'medium', project_id: 1, assignee_id: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 3, title: 'バックエンド開発', description: 'APIの実装', status: 'todo', priority: 'high', project_id: 2, assignee_id: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ],

  comments: [
    { id: 1, content: '要件の詳細について確認が必要です', task_id: 1, user_id: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 2, content: 'デザインのラフ案を作成しました', task_id: 2, user_id: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 3, content: 'API仕様書を更新しました', task_id: 3, user_id: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ],

  attachments: [
    { id: 1, filename: '要件定義書.pdf', file_path: '/files/requirements.pdf', file_size: 1024, mime_type: 'application/pdf', task_id: 1, uploaded_by: 1, created_at: new Date().toISOString() },
    { id: 2, filename: 'デザイン案.png', file_path: '/files/design.png', file_size: 2048, mime_type: 'image/png', task_id: 2, uploaded_by: 2, created_at: new Date().toISOString() },
    { id: 3, filename: 'API仕様書.doc', file_path: '/files/api-spec.doc', file_size: 1536, mime_type: 'application/msword', task_id: 3, uploaded_by: 3, created_at: new Date().toISOString() }
  ]
};
