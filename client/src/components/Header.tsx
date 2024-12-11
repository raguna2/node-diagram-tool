import { Search, Share } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="h-12 border-b border-border flex items-center px-4 bg-background">
      <div className="flex-1 flex items-center">
        <Search className="h-4 w-4 text-muted-foreground mr-2" />
        <Input
          type="text"
          placeholder="Search table, columns, and descriptions"
          className="flex-1 h-8 bg-transparent border-none text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
      <div className="flex items-center gap-2">
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
