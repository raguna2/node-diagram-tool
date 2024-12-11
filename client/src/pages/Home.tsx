import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import AppSidebar from "@/components/AppSidebar";
import Header from "@/components/Header";

interface DiagramCard {
  id: string;
  title: string;
}

const mockDiagrams: DiagramCard[] = [
  {
    id: "1",
    title: "データモデル1",
  },
  {
    id: "2",
    title: "データモデル1",
  },
  {
    id: "3",
    title: "データモデル1",
  },
  {
    id: "4",
    title: "データモデル1",
  },
  {
    id: "5",
    title: "データモデル1",
  },
];

export default function Home() {
  return (
    <div className="flex">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 bg-background">
          <div className="p-4">
            <div className="text-sm text-muted-foreground mb-4">
              <Link href="/">Home</Link>
              <span className="mx-2">/</span>
              <span>Nodes</span>
            </div>
            <h1 className="text-2xl font-semibold mb-8">Nodes</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockDiagrams.map((diagram) => (
                <Link key={diagram.id} href={`/editor/${diagram.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <div className="aspect-[4/3] bg-muted flex items-center justify-center">
                      {/* サムネイル画像のプレースホルダー */}
                      <div className="text-muted-foreground">Preview</div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium">{diagram.title}</h3>
                    </div>
                  </Card>
                </Link>
              ))}
              <Link href="/editor">
                <Card className="aspect-[4/3] flex items-center justify-center hover:shadow-lg transition-all duration-300 cursor-pointer border-dashed">
                  <div className="text-center">
                    <Plus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <span className="text-muted-foreground">Create New</span>
                  </div>
                </Card>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
