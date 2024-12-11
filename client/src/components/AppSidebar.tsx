import { BookOpen, Database } from 'lucide-react';
import { Link, useLocation } from 'wouter';

export default function AppSidebar() {
  const [location] = useLocation();
  const isNodesPage = location === '/' || location.startsWith('/nodes');

  return (
    <aside className="w-16 h-screen bg-muted border-r border-border flex flex-col items-center py-4">
      <Link href="/">
        <div className={`relative flex flex-col items-center mb-8 cursor-pointer group ${isNodesPage ? 'before:absolute before:left-0 before:top-0 before:h-full before:w-0.5 before:bg-[#47FFDE]' : ''}`}>
          <Database className={`h-5 w-5 ${isNodesPage ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'} transition-colors`} />
          <span className="text-xs mt-1 text-muted-foreground group-hover:text-foreground">nodes</span>
        </div>
      </Link>
      <nav>
        <Link href="/catalog">
          <div className="flex flex-col items-center w-10 group cursor-pointer">
            <BookOpen className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="text-xs mt-1 text-muted-foreground group-hover:text-foreground">カタログ</span>
          </div>
        </Link>
      </nav>
    </aside>
  );
}
