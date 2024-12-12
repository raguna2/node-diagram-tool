import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { sampleTableData } from "@/lib/sampleTableData";
import { findRelatedTable } from "@/lib/tableRelations";

interface DataPreviewProps {
  tableName: string | undefined;
  onRowSelect?: (data: Record<string, any>, tableName: string) => void;
  selectedRowData?: Record<string, any> | null;
  selectedNodeTable?: string | null;
}

export default function DataPreview({ tableName, onRowSelect, selectedRowData, selectedNodeTable }: DataPreviewProps) {
  if (!tableName || !sampleTableData[tableName]) return null;

  // リレーションに基づいてデータを絞り込む
  let data = sampleTableData[tableName];
  if (selectedRowData && selectedNodeTable === tableName) {
    const relation = findRelatedTable(tableName);
    if (relation) {
      // ズームイン時のみ関連テーブルのデータを絞り込む
      if (relation.sourceTable === tableName) {
        data = data.filter(row => row[relation.sourceKey] === selectedRowData.id);
      } else if (relation.targetTable === tableName) {
        data = data.filter(row => row[relation.targetKey] === selectedRowData.id);
      }
    }
  }
  const columns = Object.keys(data[0]);

  return (
    <div className="overflow-auto max-h-[calc(30vh-2rem)]">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column}
                className="bg-[#2C2C2C] text-[#BBBBBB] whitespace-nowrap"
              >
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => (
            <TableRow 
              key={i} 
              className={`hover:bg-[#3C3C3C] cursor-pointer ${
                selectedRowData?.id === row.id 
                  ? 'outline outline-2 outline-[#7B61FF]' 
                  : ''
              }`}
              onClick={() => onRowSelect?.(row, tableName)}
            >
              {columns.map((column) => (
                <TableCell
                  key={`${i}-${column}`}
                  className="text-[#BBBBBB] whitespace-nowrap"
                >
                  {typeof row[column] === 'number'
                    ? row[column].toLocaleString()
                    : String(row[column])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
