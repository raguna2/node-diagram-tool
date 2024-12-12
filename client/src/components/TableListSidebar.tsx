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
    <div className="w-64 h-full bg-[#2C2C2C]/80 backdrop-blur-xl border-r border-white/10 flex flex-col shadow-2xl">
      <div className="p-4 border-b border-white/5 bg-gradient-to-b from-[#47FFDE]/5 to-transparent">
        <h2 className="text-[#47FFDE] font-medium text-sm uppercase tracking-wider mb-3 text-shadow">テーブル一覧</h2>
        <div className="relative">
          <Input
            type="search"
            placeholder="テーブルを検索..."
            className="bg-[#1C1C1C]/60 border-white/5 text-white placeholder:text-white/40 h-8 pl-8 text-sm focus:border-[#47FFDE] hover:border-[#47FFDE]/30 transition-all rounded-lg shadow-inner backdrop-blur-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#47FFDE]/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4">
          {tables.map((table) => (
            <button
              key={table.id}
              onClick={() => onTableSelect?.(table.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all ${
                selectedNode === table.id
                  ? 'bg-gradient-to-r from-[#47FFDE]/20 to-[#47FFDE]/5 text-[#47FFDE] shadow-[inset_0_0_10px_rgba(71,255,222,0.1)] backdrop-blur-sm'
                  : 'text-white/70 hover:bg-white/5 hover:backdrop-blur-sm hover:shadow-lg'
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
