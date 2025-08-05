import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PenTool, Sparkles, Save, ArrowLeft, FileText, Download } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Episode, Chapter, Draft } from "@shared/schema";

interface DraftProps {
  projectId: string;
}

export default function Draft({ projectId }: DraftProps) {
  const { toast } = useToast();
  const [selectedChapter, setSelectedChapter] = useState<string>("");
  const [selectedEpisode, setSelectedEpisode] = useState<string>("");
  const [draftContent, setDraftContent] = useState("");
  const [selectedTone, setSelectedTone] = useState("バランスの取れた");

  const { data: chapters = [] } = useQuery<Chapter[]>({
    queryKey: ["/api/projects", projectId, "chapters"],
  });

  const { data: episodes = [] } = useQuery<Episode[]>({
    queryKey: ["/api/chapters", selectedChapter, "episodes"],
    enabled: !!selectedChapter,
  });

  const { data: drafts = [] } = useQuery<Draft[]>({
    queryKey: ["/api/episodes", selectedEpisode, "drafts"],
    enabled: !!selectedEpisode,
  });

  const generateDraftMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/episodes/${selectedEpisode}/drafts/generate`, {
        tone: selectedTone
      });
      return response.json();
    },
    onSuccess: (result) => {
      setDraftContent(result.content);
      toast({
        title: "AI草案生成完了",
        description: "草案を生成しました。必要に応じて編集してください。",
      });
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "草案生成に失敗しました。",
        variant: "destructive",
      });
    },
  });

  const saveDraftMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/episodes/${selectedEpisode}/drafts`, {
        content: draftContent,
        tone: selectedTone,
        isGenerated: false,
        version: drafts.length + 1
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/episodes", selectedEpisode, "drafts"] });
      toast({
        title: "保存完了",
        description: "草案を保存しました。",
      });
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "草案の保存に失敗しました。",
        variant: "destructive",
      });
    },
  });

  const selectedChapterData = chapters.find(ch => ch.id === selectedChapter);
  const selectedEpisodeData = episodes.find(ep => ep.id === selectedEpisode);

  const exportDraft = () => {
    if (!draftContent.trim()) {
      toast({
        title: "エラー",
        description: "エクスポートする内容がありません。",
        variant: "destructive",
      });
      return;
    }

    const blob = new Blob([draftContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedEpisodeData?.title || 'draft'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "エクスポート完了",
      description: "草案をファイルとして保存しました。",
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <header className="bg-surface-50 border-b border-outline/10 px-6 py-4 elevation-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-medium text-on-surface">草案作成</h2>
            <Badge variant="secondary">ステップ 6/6</Badge>
          </div>
          <div className="flex items-center space-x-3">
            {selectedEpisode && (
              <>
                <Button
                  onClick={() => generateDraftMutation.mutate()}
                  disabled={generateDraftMutation.isPending}
                  data-testid="button-ai-generate-draft"
                  className="bg-primary-500 hover:bg-primary-600 text-white"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {generateDraftMutation.isPending ? "AI生成中..." : "AI生成"}
                </Button>
                <Button
                  onClick={() => saveDraftMutation.mutate()}
                  disabled={saveDraftMutation.isPending || !draftContent.trim()}
                  data-testid="button-save-draft"
                  variant="outline"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saveDraftMutation.isPending ? "保存中..." : "保存"}
                </Button>
                <Button
                  onClick={exportDraft}
                  disabled={!draftContent.trim()}
                  data-testid="button-export-draft"
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  エクスポート
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto min-h-0">
        {!selectedChapter ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-surface-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <PenTool className="w-12 h-12 icon-default" />
            </div>
            <h3 className="text-xl font-semibold text-on-surface mb-4">章を選択してください</h3>
            <p className="icon-muted mb-8 max-w-md mx-auto">
              草案を作成する章を選択してから開始しましょう。
            </p>
            
            {chapters.length === 0 ? (
              <div className="bg-surface-100 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-secondary-600 mb-4">まだ章が作成されていません。</p>
                <Button 
                  variant="outline"
                  onClick={() => window.history.back()}
                  data-testid="button-go-back-chapters"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  章立てに戻る
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {chapters.map((chapter, index) => (
                  <Card 
                    key={chapter.id}
                    className="cursor-pointer card-hover material-transition elevation-1"
                    onClick={() => setSelectedChapter(chapter.id)}
                    data-testid={`card-select-chapter-${chapter.id}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold">{index + 1}</span>
                        </div>
                        <CardTitle className="text-base">{chapter.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-secondary-500 line-clamp-2">
                        {chapter.summary || "要旨が設定されていません"}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : !selectedEpisode ? (
          <div className="max-w-4xl mx-auto">
            {/* Chapter Header */}
            <div className="bg-primary-50 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedChapter("")}
                    data-testid="button-back-chapter-selection"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    章選択に戻る
                  </Button>
                  <div>
                    <h3 className="text-lg font-medium text-on-surface" data-testid="text-selected-chapter-title">
                      {selectedChapterData?.title}
                    </h3>
                    <p className="text-sm text-secondary-500">
                      エピソードを選択して草案を作成
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {episodes.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-surface-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-10 h-10 text-secondary-500" />
                </div>
                <h4 className="text-lg font-semibold text-on-surface mb-4">エピソードがありません</h4>
                <p className="text-secondary-500 mb-8 max-w-md mx-auto">
                  この章にはまだエピソードが作成されていません。
                </p>
                <Button 
                  variant="outline"
                  onClick={() => setSelectedChapter("")}
                  data-testid="button-go-back-episodes"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  エピソード設計に戻る
                </Button>
              </div>
            ) : (
              <div>
                <h4 className="text-lg font-medium text-on-surface mb-4">エピソードを選択</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {episodes.map((episode, index) => (
                    <Card 
                      key={episode.id}
                      className="cursor-pointer card-hover material-transition elevation-1"
                      onClick={() => setSelectedEpisode(episode.id)}
                      data-testid={`card-select-episode-${episode.id}`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{index + 1}</span>
                          </div>
                          <CardTitle className="text-base">{episode.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-secondary-500 line-clamp-2">
                          {episode.description || "概要が設定されていません"}
                        </p>
                        {episode.mood && (
                          <Badge variant="outline" className="mt-2">
                            {episode.mood}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {/* Episode Header */}
            <div className="bg-orange-50 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedEpisode("")}
                    data-testid="button-back-episode-selection"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    エピソード選択に戻る
                  </Button>
                  <div>
                    <h3 className="text-lg font-medium text-on-surface" data-testid="text-selected-episode-title">
                      {selectedEpisodeData?.title}
                    </h3>
                    <p className="text-sm text-secondary-500">
                      このエピソードの草案を作成
                    </p>
                  </div>
                </div>
              </div>
              {selectedEpisodeData?.description && (
                <p className="text-secondary-600 mt-4" data-testid="text-selected-episode-description">
                  {selectedEpisodeData.description}
                </p>
              )}
            </div>

            <Tabs defaultValue="editor" className="space-y-4">
              <TabsList>
                <TabsTrigger value="editor" data-testid="tab-editor">エディター</TabsTrigger>
                <TabsTrigger value="preview" data-testid="tab-preview">プレビュー</TabsTrigger>
                <TabsTrigger value="versions" data-testid="tab-versions">バージョン履歴</TabsTrigger>
              </TabsList>

              <TabsContent value="editor" className="space-y-4">
                {/* AI Generation Controls */}
                <Card className="elevation-1">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5" />
                      <span>AI草案生成</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tone">文体・トーン</Label>
                        <Select 
                          value={selectedTone} 
                          onValueChange={setSelectedTone}
                        >
                          <SelectTrigger data-testid="select-draft-tone">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="バランスの取れた">バランスの取れた</SelectItem>
                            <SelectItem value="描写重視">描写重視</SelectItem>
                            <SelectItem value="会話重視">会話重視</SelectItem>
                            <SelectItem value="アクション重視">アクション重視</SelectItem>
                            <SelectItem value="感情重視">感情重視</SelectItem>
                            <SelectItem value="簡潔">簡潔</SelectItem>
                            <SelectItem value="詳細">詳細</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <Button
                          onClick={() => generateDraftMutation.mutate()}
                          disabled={generateDraftMutation.isPending}
                          data-testid="button-generate-draft"
                          className="bg-primary-500 hover:bg-primary-600 text-white"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          {generateDraftMutation.isPending ? "生成中..." : "草案を生成"}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="bg-primary-100 rounded-lg p-4">
                      <h5 className="font-medium text-primary-700 mb-2">生成のヒント</h5>
                      <ul className="text-sm text-primary-600 space-y-1">
                        <li>• エピソードの設定と出来事を基に自動生成されます</li>
                        <li>• 生成後は自由に編集・調整が可能です</li>
                        <li>• 文体を変更して再生成もできます</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Draft Editor */}
                <Card className="elevation-1">
                  <CardHeader>
                    <CardTitle>草案エディター</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="ここに草案を入力または生成してください..."
                        value={draftContent}
                        onChange={(e) => setDraftContent(e.target.value)}
                        rows={20}
                        className="resize-none font-mono"
                        data-testid="textarea-draft-content"
                      />
                      <div className="flex items-center justify-between text-sm text-secondary-500">
                        <span data-testid="text-draft-stats">
                          文字数: {draftContent.length}文字 | 
                          推定読書時間: {Math.ceil(draftContent.length / 400)}分
                        </span>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => saveDraftMutation.mutate()}
                            disabled={saveDraftMutation.isPending || !draftContent.trim()}
                            data-testid="button-save-draft-bottom"
                            variant="outline"
                            size="sm"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            保存
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preview">
                <Card className="elevation-1">
                  <CardHeader>
                    <CardTitle>プレビュー</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {draftContent ? (
                      <div className="bg-surface-100 rounded-lg p-6">
                        <div className="prose prose-sm max-w-none">
                          <p className="whitespace-pre-wrap leading-relaxed" data-testid="text-draft-preview">
                            {draftContent}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                        <p className="text-secondary-500">草案が作成されていません</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="versions">
                <Card className="elevation-1">
                  <CardHeader>
                    <CardTitle>バージョン履歴</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {drafts.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                        <p className="text-secondary-500">保存された草案がありません</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {drafts.map((draft, index) => (
                          <div key={draft.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">v{draft.version}</Badge>
                                {draft.isGenerated && (
                                  <Badge variant="secondary">AI生成</Badge>
                                )}
                                <span className="text-sm text-secondary-500">
                                  {draft.tone && `${draft.tone} | `}
                                  {draft.content.length}文字
                                </span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDraftContent(draft.content)}
                                data-testid={`button-load-draft-${draft.id}`}
                              >
                                読み込み
                              </Button>
                            </div>
                            <p className="text-sm text-secondary-600 line-clamp-3">
                              {draft.content.substring(0, 200)}...
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
