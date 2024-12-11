import { Link } from "wouter";
import AppSidebar from "@/components/AppSidebar";
import Header from "@/components/Header";

export default function Catalog() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />
        <main className="flex-1 bg-background overflow-y-auto">
          <div className="p-4 min-h-full">
            <div className="text-sm text-muted-foreground mb-4">
              <Link href="/">Home</Link>
              <span className="mx-2">/</span>
              <span>Catalog</span>
            </div>
            <h1 className="text-2xl font-semibold mb-8">カタログ</h1>
            {/* カタログコンテンツはここに追加 */}
          </div>
        </main>
      </div>
    </div>
  );
}
