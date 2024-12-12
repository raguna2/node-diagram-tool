import { Card } from "@/components/ui/card";

interface NodeObject {
  id: string;
  table: string;
}

interface TableSchemaProps {
  node: NodeObject | null;
  selectedRowData?: Record<string, any> | null;
}

export default function TableSchema({ node, selectedRowData }: TableSchemaProps) {
  if (!node) return null;

  // テーブルごとのスキーマ定義
  const schemas: { [key: string]: Array<{ name: string; type: string; isPrimary?: boolean; isNullable?: boolean; isUnique?: boolean; defaultValue?: string }> } = {
    contact_relation: [
      { name: 'id', type: 'int', isPrimary: true },
      { name: 'uuid', type: 'uuid', isUnique: true },
      { name: 'tel', type: 'char' },
      { name: 'fax', type: 'char' },
      { name: 'created_at', type: 'datetime' },
      { name: 'created_by', type: 'char' },
      { name: 'created_by_id', type: 'int' },
      { name: 'updated_at', type: 'datetime' },
      { name: 'updated_by', type: 'char' },
      { name: 'updated_by_id', type: 'int' }
    ],
    visit_card: [
      { name: 'id', type: 'int', isPrimary: true },
      { name: 'company_name', type: 'varchar(255)' },
      { name: 'department', type: 'varchar(255)' },
      { name: 'position', type: 'varchar(100)' },
      { name: 'person_name', type: 'varchar(255)' },
      { name: 'email', type: 'varchar(255)', isUnique: true },
      { name: 'created_at', type: 'datetime' },
      { name: 'updated_at', type: 'datetime' }
    ],
    contact: [
      { name: 'id', type: 'int', isPrimary: true },
      { name: 'contact_date', type: 'datetime' },
      { name: 'contact_type', type: 'varchar(50)' },
      { name: 'summary', type: 'text' },
      { name: 'details', type: 'text' },
      { name: 'next_action', type: 'varchar(255)' },
      { name: 'created_at', type: 'datetime' },
      { name: 'updated_at', type: 'datetime' }
    ],
    lbc_relation: [
      { name: 'id', type: 'int', isPrimary: true },
      { name: 'relation_type', type: 'varchar(50)' },
      { name: 'start_date', type: 'datetime' },
      { name: 'end_date', type: 'datetime' },
      { name: 'status', type: 'varchar(20)' },
      { name: 'created_at', type: 'datetime' },
      { name: 'updated_at', type: 'datetime' }
    ],
    lbc: [
      { name: 'id', type: 'int', isPrimary: true },
      { name: 'name', type: 'varchar(255)' },
      { name: 'category', type: 'char(1)' },
      { name: 'priority', type: 'int' },
      { name: 'annual_revenue', type: 'bigint' },
      { name: 'employee_count', type: 'int' },
      { name: 'created_at', type: 'datetime' },
      { name: 'updated_at', type: 'datetime' }
    ]
  };

  return (
    <Card className="flex flex-col bg-[#2C2C2C] text-[#BBBBBB] h-full transition-opacity duration-300 ease-in-out">
      <div className="p-4 xl:p-6">
        <h2 className="text-xl font-semibold mb-4 transition-transform duration-300 ease-in-out">
          テーブル: {node.table}
        </h2>
      </div>
      <div className="flex-1 overflow-auto px-4 xl:px-6">
        <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">スキーマ情報</h3>
          <table className="w-full min-w-[300px]">
            <thead>
              <tr className="text-left border-b border-[#47FFDE]">
                <th className="pb-2 pr-4 whitespace-nowrap">カラム名</th>
                <th className="pb-2 pr-4 whitespace-nowrap">データ型</th>
                <th className="pb-2 whitespace-nowrap">選択中の値</th>
              </tr>
            </thead>
            <tbody>
              {schemas[node.table]?.map((column) => (
                <tr key={column.name} className="border-b border-[#47FFDE]/20">
                  <td className="py-2 pr-4 whitespace-nowrap">{column.name}</td>
                  <td className="py-2 pr-4 whitespace-nowrap">{column.type}</td>
                  <td className="py-2 break-all">
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
      </div>
    </Card>
  );
}
