import { Book, Menu } from 'lucide-react';
import { Link } from 'wouter';

export default function AppSidebar() {
  return (
    <aside className="w-16 h-screen bg-muted border-r border-border flex flex-col items-center py-4">
      <div className="mb-8">
        <Menu className="h-6 w-6 text-muted-foreground" />
      </div>
      <Link href="/">
        <a className="p-2 rounded-lg hover:bg-accent">
          <Book className="h-6 w-6 text-muted-foreground" />
        </a>
      </Link>
    </aside>
  );
}
