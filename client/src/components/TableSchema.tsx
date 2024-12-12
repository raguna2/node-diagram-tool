import { Card } from "@/components/ui/card";

interface NodeObject {
  id: string;
  table: string;
}

interface TableSchemaProps {
  node: NodeObject | null;
}

export default function TableSchema({ node }: TableSchemaProps) {
  if (!node) return null;

  // ここではサンプルのスキーマ情報を表示します
  // 実際のアプリケーションでは、データベースからスキーマ情報を取得します
  const sampleSchema = [
    { name: 'id', type: 'uuid', isPrimary: true },
    { name: 'name', type: 'varchar(255)', isNullable: false },
    { name: 'email', type: 'varchar(255)', isUnique: true },
    { name: 'created_at', type: 'timestamp', defaultValue: 'now()' },
  ];

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
                <th className="pb-2">制約</th>
              </tr>
            </thead>
            <tbody>
              {sampleSchema.map((column) => (
                <tr key={column.name} className="border-b border-[#47FFDE]/20">
                  <td className="py-2">{column.name}</td>
                  <td className="py-2">{column.type}</td>
                  <td className="py-2">
                    {column.isPrimary && 'PRIMARY KEY '}
                    {column.isUnique && 'UNIQUE '}
                    {column.isNullable === false && 'NOT NULL '}
                    {column.defaultValue && `DEFAULT ${column.defaultValue}`}
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
