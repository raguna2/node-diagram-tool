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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockDiagrams.map((diagram) => (
          <Link key={diagram.id} href={`/editor/${diagram.id}`}>
            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="font-medium mb-2">{diagram.title}</h3>
              <p className="text-sm text-muted-foreground">
                最終更新: {diagram.updatedAt}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
