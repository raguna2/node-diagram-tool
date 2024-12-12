import { Card } from "@/components/ui/card";

interface NodeObject {
  id: string;
  table: string;
}

interface TableSchemaProps {
  node: NodeObject | null;
  selectedRowData?: Record<string, any> | null;
}

export default function TableSchema({ node, selectedRowData = null }: TableSchemaProps) {
  if (!node) return null;

  // テーブルごとのスキーマ定義
  const schemas: { [key: string]: Array<{ name: string; type: string; isPrimary?: boolean; isNullable?: boolean; isUnique?: boolean; defaultValue?: string }> } = {
    users: [
      { name: 'id', type: 'integer', isPrimary: true },
      { name: 'name', type: 'text', isNullable: false },
      { name: 'email', type: 'text', isNullable: false, isUnique: true },
      { name: 'created_at', type: 'timestamp', isNullable: false, defaultValue: 'now()' },
      { name: 'updated_at', type: 'timestamp', isNullable: false, defaultValue: 'now()' }
    ],
    projects: [
      { name: 'id', type: 'integer', isPrimary: true },
      { name: 'name', type: 'text', isNullable: false },
      { name: 'description', type: 'text', isNullable: true },
      { name: 'status', type: 'text', isNullable: false, defaultValue: "'active'" },
      { name: 'owner_id', type: 'integer', isNullable: false },
      { name: 'created_at', type: 'timestamp', isNullable: false, defaultValue: 'now()' },
      { name: 'updated_at', type: 'timestamp', isNullable: false, defaultValue: 'now()' }
    ],
    tasks: [
      { name: 'id', type: 'integer', isPrimary: true },
      { name: 'title', type: 'text', isNullable: false },
      { name: 'description', type: 'text', isNullable: true },
      { name: 'status', type: 'text', isNullable: false, defaultValue: "'todo'" },
      { name: 'priority', type: 'text', isNullable: false, defaultValue: "'medium'" },
      { name: 'project_id', type: 'integer', isNullable: false },
      { name: 'assignee_id', type: 'integer', isNullable: true },
      { name: 'created_at', type: 'timestamp', isNullable: false, defaultValue: 'now()' },
      { name: 'updated_at', type: 'timestamp', isNullable: false, defaultValue: 'now()' }
    ],
    comments: [
      { name: 'id', type: 'integer', isPrimary: true },
      { name: 'content', type: 'text', isNullable: false },
      { name: 'task_id', type: 'integer', isNullable: false },
      { name: 'user_id', type: 'integer', isNullable: false },
      { name: 'created_at', type: 'timestamp', isNullable: false, defaultValue: 'now()' },
      { name: 'updated_at', type: 'timestamp', isNullable: false, defaultValue: 'now()' }
    ],
    attachments: [
      { name: 'id', type: 'integer', isPrimary: true },
      { name: 'filename', type: 'text', isNullable: false },
      { name: 'file_path', type: 'text', isNullable: false },
      { name: 'file_size', type: 'integer', isNullable: false },
      { name: 'mime_type', type: 'text', isNullable: false },
      { name: 'task_id', type: 'integer', isNullable: false },
      { name: 'uploaded_by', type: 'integer', isNullable: false },
      { name: 'created_at', type: 'timestamp', isNullable: false, defaultValue: 'now()' }
    ]
  };

  return (
    <Card className="p-6 bg-[#2C2C2C] text-[#BBBBBB] h-full overflow-auto transition-opacity duration-300 ease-in-out">
      <h2 className="text-xl font-semibold mb-4 transition-transform duration-300 ease-in-out">
        テーブル: {node.table}
      </h2>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">スキーマ情報</h3>
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-[#47FFDE]">
                <th className="pb-2">カラム名</th>
                <th className="pb-2">データ型</th>
                <th className="pb-2">選択中の値</th>
              </tr>
            </thead>
            <tbody>
              {schemas[node.table]?.map((column) => (
                <tr key={column.name} className="border-b border-[#47FFDE]/20">
                  <td className="py-2">{column.name}</td>
                  <td className="py-2">{column.type}</td>
                  <td className="py-2">
                    {selectedRowData && (
                      typeof selectedRowData[column.name] === 'number'
                        ? selectedRowData[column.name].toLocaleString()
                        : String(selectedRowData[column.name] || '')
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}
