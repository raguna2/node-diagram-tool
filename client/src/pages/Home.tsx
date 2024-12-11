import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface DiagramCard {
  id: string;
  title: string;
  updatedAt: string;
}

const mockDiagrams: DiagramCard[] = [
  {
    id: "1",
    title: "データモデル1",
    updatedAt: "2024-12-11",
  },
  {
    id: "2",
    title: "ユーザー関連図",
    updatedAt: "2024-12-11",
  },
];

export default function Home() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">ダイアグラム一覧</h1>
        <Link href="/editor">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            新規作成
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockDiagrams.map((diagram) => (
          <Link key={diagram.id} href={`/editor/${diagram.id}`}>
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
              <div className="aspect-[4/3] bg-muted flex items-center justify-center">
                {/* サムネイル画像のプレースホルダー */}
                <div className="text-muted-foreground">プレビュー</div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-lg mb-1">{diagram.title}</h3>
                <p className="text-sm text-muted-foreground">
                  最終更新: {diagram.updatedAt}
                </p>
              </div>
            </Card>
          </Link>
        ))}
        <Link href="/editor">
          <Card className="aspect-[4/3] flex items-center justify-center hover:shadow-lg transition-all duration-300 cursor-pointer border-dashed">
            <div className="text-center">
              <Plus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <span className="text-muted-foreground">新規作成</span>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
