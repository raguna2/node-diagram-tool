import { Database, Menu } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { sampleData } from "@/lib/sampleData";
import { useState } from 'react';
import { useIsMobile } from "@/hooks/use-mobile";

interface TableListSidebarProps {
  onTableSelect?: (tableId: string) => void;
  selectedNode?: string | null;
}

export default function TableListSidebar({ onTableSelect, selectedNode }: TableListSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const tables = sampleData.nodes.filter(node => 
    node.table.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const TableList = () => (
    <div className="w-64 h-full bg-[#2C2C2C] border-r border-[#47FFDE] flex flex-col">
      <div className="p-4 border-b border-[#47FFDE]/20">
        <h2 className="text-[#BBBBBB] font-medium text-sm uppercase tracking-wider mb-3">テーブル一覧</h2>
        <div className="relative">
          <Input
            type="search"
            placeholder="テーブルを検索..."
            className="bg-[#1C1C1C] border-[#47FFDE]/20 text-[#BBBBBB] placeholder:text-[#666666] h-8 pl-8 text-sm focus:border-[#47FFDE] transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]"
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
              onClick={() => {
                onTableSelect?.(table.id);
                if (isMobile) setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-sm transition-all ${
                selectedNode === table.id
                  ? 'bg-[#47FFDE]/10 text-[#47FFDE] border-l-2 border-[#47FFDE]'
                  : 'text-[#BBBBBB] hover:bg-[#3C3C3C]/50 border-l-2 border-transparent'
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

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-16 top-4 z-50 md:hidden"
          >
            <Menu className="h-5 w-5 text-[#BBBBBB]" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-80 bg-[#2C2C2C]">
          <TableList />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="hidden md:block">
      <TableList />
    </div>
  );
}
