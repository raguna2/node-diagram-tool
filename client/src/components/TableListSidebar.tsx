import { Database } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sampleData } from "@/lib/sampleData";
import { useState } from 'react';

interface TableListSidebarProps {
  onTableSelect?: (tableId: string) => void;
  selectedNode?: string | null;
}

export default function TableListSidebar({ onTableSelect, selectedNode }: TableListSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const tables = sampleData.nodes.filter(node => 
    node.table.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-64 h-full bg-[#2C2C2C] border-r border-[#47FFDE] flex flex-col">
      <div className="p-4 border-b border-[#47FFDE]">
        <h2 className="text-[#BBBBBB] text-lg font-semibold mb-4">テーブル</h2>
        <Input
          type="search"
          placeholder="テーブルを検索..."
          className="bg-[#49484D] border-[#47FFDE] text-[#BBBBBB] placeholder:text-[#BBBBBB]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4">
          {tables.map((table) => (
            <button
              key={table.id}
              onClick={() => onTableSelect?.(table.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                selectedNode === table.id
                  ? 'bg-[#47FFDE] text-[#2C2C2C]'
                  : 'text-[#BBBBBB] hover:bg-[#3C3C3C]'
              }`}
            >
              <Database className="h-4 w-4" />
              <span className="text-sm font-medium">{table.table}</span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
