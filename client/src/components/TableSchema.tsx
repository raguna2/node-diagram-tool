import { Card } from "@/components/ui/card";

interface NodeObject {
  id: string;
  table: string;
}

interface TableSchemaProps {
  node: NodeObject | null;
  selectedRowData?: Record<string, any> | null;
}

export function getSchemaContent(tableName: string) {
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
    <div className="p-2 max-w-sm bg-[#2C2C2C] rounded-md shadow-lg">
      <h3 className="text-sm font-medium text-[#BBBBBB] mb-2">スキーマ情報</h3>
      <div className="space-y-1">
        {schema.map((column) => (
          <div key={column.name} className="text-xs text-[#BBBBBB] flex justify-between">
            <span className="font-medium">{column.name}</span>
            <span className="text-[#47FFDE]">{column.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TableSchema({ node }: { node: { table: string } }) {
  return getSchemaContent(node.table);
}
