import { Book, Menu } from 'lucide-react';
import { Link } from 'wouter';

export default function AppSidebar() {
  return (
    <aside className="w-16 h-screen bg-muted border-r border-border flex flex-col items-center py-4">
      <div className="mb-8">
        <Menu className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
      </div>
      <nav>
        <div className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-accent transition-colors">
          <Link href="/">
            <Book className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
          </Link>
        </div>
      </nav>
    </aside>
  );
}
