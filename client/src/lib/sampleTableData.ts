interface TableData {
  [key: string]: Array<Record<string, any>>;
}

export const sampleTableData: TableData = {
  contact_relation: Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    uuid: `cr-${crypto.randomUUID().slice(0, 8)}`,
    tel: `090-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
    fax: `03-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
    created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    created_by: `user${Math.floor(Math.random() * 5) + 1}`,
    created_by_id: Math.floor(Math.random() * 5) + 1,
    updated_at: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
    updated_by: `user${Math.floor(Math.random() * 5) + 1}`,
    updated_by_id: Math.floor(Math.random() * 5) + 1,
  })),
  
  visit_card: Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    company_name: `株式会社サンプル${i + 1}`,
    department: `営業部${Math.floor(Math.random() * 3) + 1}課`,
    position: ['部長', '課長', '主任', '担当'][Math.floor(Math.random() * 4)],
    person_name: `山田太郎${i + 1}`,
    email: `sample${i + 1}@example.com`,
    created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    updated_at: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
  })),

  contact: Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    contact_date: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    contact_type: ['電話', 'メール', '訪問', 'Web会議'][Math.floor(Math.random() * 4)],
    summary: `打ち合わせ${i + 1}回目：プロジェクトの進捗確認`,
    details: `詳細な議事録や重要なポイントがここに記録されます。（サンプル${i + 1}）`,
    next_action: ['フォローアップメール送信', '資料作成', '見積書送付', '再訪問'][Math.floor(Math.random() * 4)],
    created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    updated_at: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
  })),

  lbc_relation: Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    relation_type: ['主担当', '副担当', '協力', '情報共有'][Math.floor(Math.random() * 4)],
    start_date: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    end_date: new Date(Date.now() + Math.random() * 10000000000).toISOString(),
    status: ['active', 'inactive', 'pending'][Math.floor(Math.random() * 3)],
    created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    updated_at: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
  })),

  lbc: Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: `取引先${i + 1}`,
    category: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
    priority: Math.floor(Math.random() * 5) + 1,
    annual_revenue: Math.floor(Math.random() * 1000000000),
    employee_count: Math.floor(Math.random() * 1000),
    created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    updated_at: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
  })),
};
