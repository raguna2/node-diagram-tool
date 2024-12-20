import { Search, Share } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="h-[64px] border-b border-border flex items-center px-4 bg-[#2C2C2C]">
      <div className="w-48 flex items-center">
        <span className="text-lg font-semibold text-[#BBBBBB]">Jigg</span>
      </div>
      <div className="flex-1 flex justify-center">
        <div className="w-[689px] h-[38px] flex items-center bg-[#49484D] rounded-md my-[13px]">
          <Search className="h-4 w-4 text-[#BBBBBB] mx-3" />
          <Input
            type="text"
            placeholder="Search table, columns, and descriptions"
            className="flex-1 h-[38px] bg-transparent border-none text-[#BBBBBB] placeholder:text-[#BBBBBB] text-sm focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
          />
        </div>
      </div>
      <div className="w-48 flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          <Share className="h-4 w-4" />
          <span className="ml-2">Share</span>
        </Button>
        <span className="text-sm text-muted-foreground">100%</span>
      </div>
    </header>
  );
}
