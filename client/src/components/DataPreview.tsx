import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { sampleTableData } from "@/lib/sampleTableData";

interface DataPreviewProps {
  tableName: string | undefined;
  onRowSelect?: (data: Record<string, any>) => void;
  selectedRowData?: Record<string, any> | null;
}

export default function DataPreview({ tableName, onRowSelect, selectedRowData }: DataPreviewProps) {
  if (!tableName || !sampleTableData[tableName]) return null;

  const data = sampleTableData[tableName];
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
              className={`hover:bg-[#3C3C3C] cursor-pointer ${row === selectedRowData ? 'bg-[#7B61FF]' : ''}`}
              onClick={() => onRowSelect?.(row)}
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
