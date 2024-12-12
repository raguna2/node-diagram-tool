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
    <div className="overflow-auto max-h-[calc(30vh-2rem)] w-full">
      <Table className="min-w-[800px]">
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column}
                className="bg-gradient-to-b from-[#2C2C2C]/90 to-[#1C1C1C]/90 text-[#47FFDE] whitespace-nowrap backdrop-blur-sm border-b border-white/5"
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
              className={`transition-all cursor-pointer backdrop-blur-sm ${
                selectedRowData?.id === row.id 
                  ? 'bg-gradient-to-r from-[#47FFDE]/10 to-transparent border border-[#47FFDE]/20 shadow-[inset_0_0_20px_rgba(71,255,222,0.05)]' 
                  : 'hover:bg-white/5 hover:shadow-lg'
              }`}
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
