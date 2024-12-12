import { Card } from "@/components/ui/card";

interface NodeObject {
  id: string;
  table: string;
}

interface TableSchemaProps {
  node: NodeObject | null;
  selectedRowData?: Record<string, any> | null;
}

export function getSchemaContent(tableName: string, selectedRowData?: Record<string, any> | null) {
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

  const schema = schemas[tableName];
  if (!schema) return null;

  return (
    <div className="p-2 rounded-md">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#47FFDE] mb-4">スキーマ情報</h3>
        <div className="space-y-2">
          {schema.map((column) => (
            <div key={column.name} className="text-sm text-[#FFFFFF] flex justify-between items-center py-1 border-b border-[#47FFDE]/10">
              <span className="font-medium">{column.name}</span>
              <span className="text-[#47FFDE] opacity-80 font-mono text-xs bg-[#47FFDE]/10 px-2 py-0.5 rounded">{column.type}</span>
            </div>
          ))}
        </div>
      </div>
      {selectedRowData && (
        <div>
          <h3 className="text-lg font-semibold text-[#47FFDE] mb-4">選択された行データ</h3>
          <div className="space-y-2">
            {Object.entries(selectedRowData).map(([key, value]) => (
              <div key={key} className="text-sm text-[#FFFFFF] flex justify-between items-center py-1 border-b border-[#47FFDE]/10">
                <span className="font-medium">{key}</span>
                <span className="text-[#BBBBBB] font-mono text-xs">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TableSchema({ node, selectedRowData }: TableSchemaProps) {
  return getSchemaContent(node.table, selectedRowData);
}
