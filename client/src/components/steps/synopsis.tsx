import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Sparkles, Save } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Synopsis } from "@shared/schema";

interface SynopsisProps {
  projectId: string;
}

export default function Synopsis({ projectId }: SynopsisProps) {
  const { toast } = useToast();
  const [synopsisData, setSynopsisData] = useState<Partial<Synopsis>>({
    content: "",
    tone: "",
    style: ""
  });

  const { data: synopsis, isLoading } = useQuery<Synopsis>({
    queryKey: ["/api/projects", projectId, "synopsis"],
  });

  // Update synopsis data when query data changes
  if (synopsis && synopsis.id !== synopsisData.id) {
    setSynopsisData(synopsis);
  }

  const saveSynopsisMutation = useMutation({
    mutationFn: async (data: Partial<Synopsis>) => {
      if (synopsis && synopsis.id) {
        const response = await apiRequest("PATCH", `/api/synopsis/${synopsis.id}`, data);
        return response.json();
      } else {
        const response = await apiRequest("POST", `/api/projects/${projectId}/synopsis`, {
          ...data,
          projectId
        });
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "synopsis"] });
      toast({
        title: "保存完了",
        description: "あらすじを保存しました。",
      });
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "あらすじの保存に失敗しました。",
        variant: "destructive",
      });
    },
  });

  const generateSynopsisMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/synopsis/generate`);
      return response.json();
    },
    onSuccess: (result) => {
      setSynopsisData(prev => ({ ...prev, content: result.content }));
      toast({
        title: "AI生成完了",
        description: "あらすじを生成しました。",
      });
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "AI生成に失敗しました。",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!synopsisData.content?.trim()) {
      toast({
        title: "入力エラー",
        description: "あらすじの内容を入力してください。",
        variant: "destructive",
      });
      return;
    }
    saveSynopsisMutation.mutate(synopsisData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="bg-surface-50 border-b border-outline/10 px-6 py-4 elevation-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-medium text-on-surface">あらすじ作成</h2>
            <Badge variant="secondary">ステップ 3/6</Badge>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => generateSynopsisMutation.mutate()}
              disabled={generateSynopsisMutation.isPending}
              data-testid="button-ai-generate-synopsis"
              className="bg-primary-500 hover:bg-primary-600 text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {generateSynopsisMutation.isPending ? "AI生成中..." : "AI生成"}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saveSynopsisMutation.isPending}
              data-testid="button-save-synopsis"
              variant="outline"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveSynopsisMutation.isPending ? "保存中..." : "保存"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Synopsis Editor */}
          <Card className="elevation-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 icon-default" />
                <span>あらすじ</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">あらすじ本文</Label>
                <Textarea
                  id="content"
                  data-testid="textarea-synopsis-content"
                  placeholder="物語の概要を簡潔に記述してください。読者が興味を持つような魅力的な内容にしましょう..."
                  value={synopsisData.content || ""}
                  onChange={(e) => setSynopsisData({ ...synopsisData, content: e.target.value })}
                  rows={12}
                  className="resize-none"
                />
                <p className="text-sm icon-muted">
                  文字数: {synopsisData.content?.length || 0}文字
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tone">文体・トーン</Label>
                  <Select 
                    value={synopsisData.tone || ""} 
                    onValueChange={(value) => setSynopsisData({ ...synopsisData, tone: value })}
                  >
                    <SelectTrigger data-testid="select-synopsis-tone">
                      <SelectValue placeholder="文体を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formal">丁寧・格式ばった</SelectItem>
                      <SelectItem value="casual">親しみやすい・カジュアル</SelectItem>
                      <SelectItem value="dramatic">劇的・感情的</SelectItem>
                      <SelectItem value="mysterious">神秘的・謎めいた</SelectItem>
                      <SelectItem value="humorous">ユーモラス・軽快</SelectItem>
                      <SelectItem value="serious">真剣・シリアス</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="style">文章スタイル</Label>
                  <Select 
                    value={synopsisData.style || ""} 
                    onValueChange={(value) => setSynopsisData({ ...synopsisData, style: value })}
                  >
                    <SelectTrigger data-testid="select-synopsis-style">
                      <SelectValue placeholder="スタイルを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="descriptive">描写的</SelectItem>
                      <SelectItem value="narrative">物語調</SelectItem>
                      <SelectItem value="promotional">宣伝的</SelectItem>
                      <SelectItem value="academic">学術的</SelectItem>
                      <SelectItem value="journalistic">ジャーナリスティック</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Assistance */}
          <Card className="bg-primary-50 border-primary-200 elevation-1">
            <CardHeader>
              <CardTitle className="text-primary-700">AI支援</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-secondary-600">
                  これまでに設定したキャラクターとプロットを基に、魅力的なあらすじを自動生成できます。
                </p>
                
                <div className="bg-white rounded-lg p-4 space-y-3">
                  <h4 className="font-medium text-on-surface">生成のヒント</h4>
                  <ul className="text-sm text-secondary-600 space-y-1">
                    <li>• 主人公の目標や動機を明確に</li>
                    <li>• 中心となる対立や問題を提示</li>
                    <li>• 物語の魅力的な要素をアピール</li>
                    <li>• 読者の興味を引く謎や疑問を含める</li>
                    <li>• 結末は暗示程度に留める</li>
                  </ul>
                </div>
                
                <Button
                  onClick={() => generateSynopsisMutation.mutate()}
                  disabled={generateSynopsisMutation.isPending}
                  data-testid="button-ai-create-synopsis"
                  className="bg-primary-500 hover:bg-primary-600 text-white"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  あらすじを生成
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {synopsisData.content && (
            <Card className="elevation-1">
              <CardHeader>
                <CardTitle>プレビュー</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-surface-100 rounded-lg p-4">
                  <p className="text-secondary-700 leading-relaxed whitespace-pre-wrap" data-testid="text-synopsis-preview">
                    {synopsisData.content}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-4 text-sm text-secondary-500">
                  <span>文字数: {synopsisData.content.length}文字</span>
                  <span>推定読書時間: {Math.ceil(synopsisData.content.length / 400)}分</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
