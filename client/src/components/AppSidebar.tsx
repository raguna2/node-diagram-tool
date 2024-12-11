import { BookOpen, Database } from 'lucide-react';
import { Link, useLocation } from 'wouter';

export default function AppSidebar() {
  const [location] = useLocation();
  const isNodesPage = location === '/' || location.startsWith('/nodes');
  const isCatalogPage = location === '/catalog' || location.startsWith('/catalog');

  return (
    <aside className="w-16 h-screen bg-muted border-r border-border flex flex-col items-center py-4">
      <div className="space-y-2">
        <Link href="/">
          <div className={`w-16 h-14 relative flex justify-center group ${isNodesPage ? 'before:absolute before:left-0 before:top-0 before:h-full before:w-0.5 before:bg-[#47FFDE]' : ''}`}>
            <div className="flex flex-col items-center justify-center cursor-pointer">
              <Database className={`h-5 w-5 ${isNodesPage ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'} transition-colors`} />
              <span className="text-[10px] mt-1 text-muted-foreground group-hover:text-foreground whitespace-nowrap">nodes</span>
            </div>
          </div>
        </Link>
        <nav>
          <Link href="/catalog">
            <div className={`w-16 h-14 relative flex justify-center group ${isCatalogPage ? 'before:absolute before:left-0 before:top-0 before:h-full before:w-0.5 before:bg-[#47FFDE]' : ''}`}>
              <div className="flex flex-col items-center justify-center cursor-pointer">
                <BookOpen className={`h-5 w-5 ${isCatalogPage ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'} transition-colors`} />
                <span className="text-[10px] mt-1 text-muted-foreground group-hover:text-foreground whitespace-nowrap">カタログ</span>
              </div>
            </div>
          </Link>
        </nav>
      </div>
    </aside>
  );
}
