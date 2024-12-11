import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import AppSidebar from "@/components/AppSidebar";
import Header from "@/components/Header";

interface DiagramCard {
  id: string;
  title: string;
  description: string;
}

const mockDiagrams: DiagramCard[] = [
  {
    id: "1",
    title: "データモデル1",
    description: "ユーザー管理システムのERD図です。",
  },
  {
    id: "2",
    title: "データモデル2",
    description: "商品管理システムのデータベース設計図です。",
  },
  {
    id: "3",
    title: "データモデル3",
    description: "注文管理システムのテーブル設計です。",
  },
  {
    id: "4",
    title: "データモデル4",
    description: "在庫管理システムのERD図です。",
  },
  {
    id: "5",
    title: "データモデル5",
    description: "会員管理システムのデータベース設計図です。",
  },
];

export default function Home() {
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
              <span>Nodes</span>
            </div>
            <h1 className="text-2xl font-semibold mb-8">Nodes</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockDiagrams.map((diagram) => (
                <Link key={diagram.id} href={`/editor/${diagram.id}`}>
                  <Card className="w-[400px] overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <div className="p-4">
                      <h3 className="text-lg font-medium mb-4">{diagram.title}</h3>
                      <div className="aspect-[4/3] bg-muted flex items-center justify-center mb-4">
                        {/* サムネイル画像のプレースホルダー */}
                        <div className="text-muted-foreground">Preview</div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        このダイアグラムの説明文がここに入ります。
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
              <Link href="/editor">
                <Card className="w-[400px] h-[400px] flex items-center justify-center hover:shadow-lg transition-all duration-300 cursor-pointer border-dashed">
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
