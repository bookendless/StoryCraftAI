import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { History, Sparkles, Save } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Plot } from "@shared/schema";

interface PlotProps {
  projectId: string;
}

export default function Plot({ projectId }: PlotProps) {
  const { toast } = useToast();
  const [plotData, setPlotData] = useState<Partial<Plot>>({
    structure: "kishotenketsu",
    theme: "",
    setting: "",
    hook: "",
    opening: "",
    development: "",
    climax: "",
    conclusion: ""
  });

  const { data: plot, isLoading } = useQuery<Plot>({
    queryKey: ["/api/projects", projectId, "plot"],
  });

  // Update plot data when query data changes
  if (plot && plot.id !== plotData.id) {
    setPlotData(plot);
  }

  const savePlotMutation = useMutation({
    mutationFn: async (data: Partial<Plot>) => {
      if (plot && plot.id) {
        const response = await apiRequest("PATCH", `/api/plots/${plot.id}`, data);
        return response.json();
      } else {
        const response = await apiRequest("POST", `/api/projects/${projectId}/plot`, {
          ...data,
          projectId
        });
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "plot"] });
      toast({
        title: "保存完了",
        description: "プロット情報を保存しました。",
      });
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "プロットの保存に失敗しました。",
        variant: "destructive",
      });
    },
  });

  const generatePlotMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/plot/generate`);
      return response.json();
    },
    onSuccess: (suggestion) => {
      setPlotData(prev => ({ ...prev, ...suggestion }));
      toast({
        title: "AI提案完了",
        description: "プロット構成を生成しました。",
      });
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "AI提案の生成に失敗しました。",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    savePlotMutation.mutate(plotData);
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
            <h2 className="text-xl font-medium text-on-surface">プロット構成</h2>
            <Badge variant="secondary">ステップ 2/6</Badge>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => generatePlotMutation.mutate()}
              disabled={generatePlotMutation.isPending}
              data-testid="button-ai-generate-plot"
              className="bg-primary-500 hover:bg-primary-600 text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {generatePlotMutation.isPending ? "AI生成中..." : "AI補完"}
            </Button>
            <Button
              onClick={handleSave}
              disabled={savePlotMutation.isPending}
              data-testid="button-save-plot"
              variant="outline"
            >
              <Save className="w-4 h-4 mr-2" />
              {savePlotMutation.isPending ? "保存中..." : "保存"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Plot Overview */}
          <Card className="elevation-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="w-5 h-5 icon-default" />
                <span>基本設定</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="structure">構成スタイル</Label>
                  <Select 
                    value={plotData.structure} 
                    onValueChange={(value) => setPlotData({ ...plotData, structure: value })}
                  >
                    <SelectTrigger data-testid="select-plot-structure">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kishotenketsu">起承転結</SelectItem>
                      <SelectItem value="three-act">三幕構成</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="theme">メインテーマ</Label>
                  <Textarea
                    id="theme"
                    data-testid="textarea-plot-theme"
                    placeholder="物語の中核となるテーマ..."
                    value={plotData.theme || ""}
                    onChange={(e) => setPlotData({ ...plotData, theme: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="setting">舞台設定</Label>
                <Textarea
                  id="setting"
                  data-testid="textarea-plot-setting"
                  placeholder="物語の舞台、世界観、時代設定など..."
                  value={plotData.setting || ""}
                  onChange={(e) => setPlotData({ ...plotData, setting: e.target.value })}
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hook">フック（読者を引き込む要素）</Label>
                <Textarea
                  id="hook"
                  data-testid="textarea-plot-hook"
                  placeholder="読者の興味を引く要素、謎、対立など..."
                  value={plotData.hook || ""}
                  onChange={(e) => setPlotData({ ...plotData, hook: e.target.value })}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Structure Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Opening */}
            <Card className="elevation-1 border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-blue-700">起 - 導入</CardTitle>
                <p className="text-sm icon-muted">物語の始まり</p>
              </CardHeader>
              <CardContent>
                <Textarea
                  data-testid="textarea-plot-opening"
                  placeholder="登場人物の紹介、日常の描写、事件の発端..."
                  value={plotData.opening || ""}
                  onChange={(e) => setPlotData({ ...plotData, opening: e.target.value })}
                  rows={6}
                  className="resize-none"
                />
              </CardContent>
            </Card>

            {/* Development */}
            <Card className="elevation-1 border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-green-700">承 - 展開</CardTitle>
                <p className="text-sm icon-muted">事件の発展</p>
              </CardHeader>
              <CardContent>
                <Textarea
                  data-testid="textarea-plot-development"
                  placeholder="問題の詳細化、新たな登場人物、状況の発展..."
                  value={plotData.development || ""}
                  onChange={(e) => setPlotData({ ...plotData, development: e.target.value })}
                  rows={6}
                  className="resize-none"
                />
              </CardContent>
            </Card>

            {/* Climax */}
            <Card className="elevation-1 border-l-4 border-l-orange-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-orange-700">転 - 転換</CardTitle>
                <p className="text-sm text-secondary-500">大きな変化</p>
              </CardHeader>
              <CardContent>
                <Textarea
                  data-testid="textarea-plot-climax"
                  placeholder="予想外の展開、大きな転換点、クライマックス..."
                  value={plotData.climax || ""}
                  onChange={(e) => setPlotData({ ...plotData, climax: e.target.value })}
                  rows={6}
                  className="resize-none"
                />
              </CardContent>
            </Card>

            {/* Conclusion */}
            <Card className="elevation-1 border-l-4 border-l-purple-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-purple-700">結 - 結末</CardTitle>
                <p className="text-sm text-secondary-500">物語の終結</p>
              </CardHeader>
              <CardContent>
                <Textarea
                  data-testid="textarea-plot-conclusion"
                  placeholder="問題の解決、キャラクターの成長、新たな始まり..."
                  value={plotData.conclusion || ""}
                  onChange={(e) => setPlotData({ ...plotData, conclusion: e.target.value })}
                  rows={6}
                  className="resize-none"
                />
              </CardContent>
            </Card>
          </div>

          {/* AI Suggestions */}
          <Card className="bg-primary-50 border-primary-200 elevation-1">
            <CardHeader>
              <CardTitle className="text-primary-700">AI提案</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary-600 mb-4">
                AIがあなたのキャラクター設定を基に、魅力的なプロット構成を提案します。
              </p>
              <Button
                onClick={() => generatePlotMutation.mutate()}
                disabled={generatePlotMutation.isPending}
                data-testid="button-ai-suggest-plot"
                className="bg-primary-500 hover:bg-primary-600 text-white"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                プロット構成を生成
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
