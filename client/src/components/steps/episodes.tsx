import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Film, Sparkles, Edit, Trash2, Save, GripVertical, ArrowLeft } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Episode, Chapter } from "@shared/schema";

interface EpisodesProps {
  projectId: string;
}

export default function Episodes({ projectId }: EpisodesProps) {
  const { toast } = useToast();
  const [selectedChapter, setSelectedChapter] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [newEpisode, setNewEpisode] = useState({
    title: "",
    description: "",
    perspective: "",
    mood: "",
    events: [] as string[],
    dialogue: "",
    setting: "",
    order: 0
  });

  const { data: chapters = [] } = useQuery<Chapter[]>({
    queryKey: ["/api/projects", projectId, "chapters"],
  });

  const { data: episodes = [], isLoading: episodesLoading } = useQuery<Episode[]>({
    queryKey: ["/api/chapters", selectedChapter, "episodes"],
    enabled: !!selectedChapter,
  });

  const createEpisodeMutation = useMutation({
    mutationFn: async (episode: typeof newEpisode) => {
      const response = await apiRequest("POST", `/api/chapters/${selectedChapter}/episodes`, episode);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chapters", selectedChapter, "episodes"] });
      toast({
        title: "エピソード作成完了",
        description: "新しいエピソードを追加しました。",
      });
      setDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "エピソードの作成に失敗しました。",
        variant: "destructive",
      });
    },
  });

  const updateEpisodeMutation = useMutation({
    mutationFn: async ({ id, ...episode }: Partial<Episode> & { id: string }) => {
      const response = await apiRequest("PATCH", `/api/episodes/${id}`, episode);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chapters", selectedChapter, "episodes"] });
      toast({
        title: "更新完了",
        description: "エピソード情報を更新しました。",
      });
      setEditingEpisode(null);
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "エピソードの更新に失敗しました。",
        variant: "destructive",
      });
    },
  });

  const deleteEpisodeMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/episodes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chapters", selectedChapter, "episodes"] });
      toast({
        title: "削除完了",
        description: "エピソードを削除しました。",
      });
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "エピソードの削除に失敗しました。",
        variant: "destructive",
      });
    },
  });

  const generateEpisodesMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/chapters/${selectedChapter}/episodes/generate`);
      return response.json();
    },
    onSuccess: (suggestions) => {
      toast({
        title: "AI提案完了",
        description: `${suggestions.length}個のエピソード案を生成しました。`,
      });
      // Auto-create suggested episodes
      suggestions.forEach((suggestion: any, index: number) => {
        const episodeData = {
          ...suggestion,
          order: episodes.length + index,
          events: suggestion.events || []
        };
        createEpisodeMutation.mutate(episodeData);
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

  const resetForm = () => {
    setNewEpisode({
      title: "",
      description: "",
      perspective: "",
      mood: "",
      events: [],
      dialogue: "",
      setting: "",
      order: episodes.length
    });
  };

  const handleCreateEpisode = () => {
    if (!newEpisode.title.trim()) {
      toast({
        title: "入力エラー",
        description: "エピソードタイトルは必須です。",
        variant: "destructive",
      });
      return;
    }
    createEpisodeMutation.mutate({ ...newEpisode, order: episodes.length });
  };

  const handleUpdateEpisode = (episode: Episode) => {
    updateEpisodeMutation.mutate(episode);
  };

  const selectedChapterData = chapters.find(ch => ch.id === selectedChapter);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <header className="bg-surface-50 border-b border-outline/10 px-6 py-4 elevation-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-medium text-on-surface">エピソード設計</h2>
            <Badge variant="secondary">ステップ 5/6</Badge>
          </div>
          <div className="flex items-center space-x-3">
            {selectedChapter && (
              <Button
                onClick={() => generateEpisodesMutation.mutate()}
                disabled={generateEpisodesMutation.isPending}
                data-testid="button-ai-generate-episodes"
                className="bg-primary-500 hover:bg-primary-600 text-white"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {generateEpisodesMutation.isPending ? "AI生成中..." : "AI補完"}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto min-h-0">
        {!selectedChapter ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-surface-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Film className="w-12 h-12 icon-default" />
            </div>
            <h3 className="text-xl font-semibold text-on-surface mb-4">章を選択してください</h3>
            <p className="icon-muted mb-8 max-w-md mx-auto">
              エピソードを設計する章を選択してから開始しましょう。
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
        ) : (
          <div className="max-w-6xl mx-auto">
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
                      この章のエピソードを設計
                    </p>
                  </div>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      data-testid="button-add-episode"
                      className="bg-primary-500 hover:bg-primary-600 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      エピソード追加
                    </Button>
                  </DialogTrigger>
                  <EpisodeDialog
                    episode={newEpisode}
                    onChange={setNewEpisode}
                    onSave={handleCreateEpisode}
                    isLoading={createEpisodeMutation.isPending}
                    title="新しいエピソードを作成"
                  />
                </Dialog>
              </div>
              {selectedChapterData?.summary && (
                <p className="text-secondary-600 mt-4" data-testid="text-selected-chapter-summary">
                  {selectedChapterData.summary}
                </p>
              )}
            </div>

            {episodes.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-surface-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Film className="w-10 h-10 icon-default" />
                </div>
                <h4 className="text-lg font-semibold text-on-surface mb-4">エピソードを作成しましょう</h4>
                <p className="icon-muted mb-8 max-w-md mx-auto">
                  この章の具体的な場面やエピソードを設計して、詳細なストーリーを構築しましょう。
                </p>
                <div className="flex items-center justify-center space-x-3">
                  <Button 
                    onClick={() => setDialogOpen(true)}
                    data-testid="button-create-first-episode"
                    className="bg-primary-500 hover:bg-primary-600 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    エピソード作成
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => generateEpisodesMutation.mutate()}
                    disabled={generateEpisodesMutation.isPending}
                    data-testid="button-ai-suggest-episodes"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI提案
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-on-surface">
                    エピソード一覧 ({episodes.length}個)
                  </h4>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {episodes.map((episode, index) => (
                    <Card 
                      key={episode.id} 
                      className="elevation-1 card-hover material-transition"
                      data-testid={`card-episode-${episode.id}`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-sm">{index + 1}</span>
                            </div>
                            <div>
                              <CardTitle className="text-base" data-testid={`text-episode-title-${episode.id}`}>
                                {episode.title}
                              </CardTitle>
                              {episode.perspective && (
                                <Badge variant="outline" className="mt-1">
                                  {episode.perspective}視点
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingEpisode(episode)}
                              data-testid={`button-edit-episode-${episode.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              data-testid={`button-drag-episode-${episode.id}`}
                            >
                              <GripVertical className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteEpisodeMutation.mutate(episode.id)}
                              data-testid={`button-delete-episode-${episode.id}`}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-3">
                        {episode.description && (
                          <div>
                            <h5 className="text-sm font-medium text-secondary-600 mb-1">概要</h5>
                            <p className="text-sm text-secondary-700" data-testid={`text-episode-description-${episode.id}`}>
                              {episode.description}
                            </p>
                          </div>
                        )}
                        
                        {episode.setting && (
                          <div>
                            <h5 className="text-sm font-medium text-secondary-600 mb-1">場面設定</h5>
                            <p className="text-sm text-secondary-700" data-testid={`text-episode-setting-${episode.id}`}>
                              {episode.setting}
                            </p>
                          </div>
                        )}
                        
                        {episode.events && Array.isArray(episode.events) && episode.events.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-secondary-600 mb-1">主な出来事</h5>
                            <ul className="text-sm text-secondary-700 space-y-1" data-testid={`list-episode-events-${episode.id}`}>
                              {(episode.events as string[]).map((event: string, idx: number) => (
                                <li key={idx} className="flex items-start space-x-2">
                                  <span className="text-primary-500 mt-1">•</span>
                                  <span>{event}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {episode.mood && (
                          <div className="pt-2 border-t border-surface-300">
                            <Badge variant="secondary" className="mr-2">
                              雰囲気: {episode.mood}
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Add Episode Placeholder */}
                <div className="border-2 border-dashed border-surface-300 rounded-xl p-6 text-center">
                  <h5 className="font-medium text-secondary-500 mb-2">新しいエピソードを追加</h5>
                  <p className="text-sm text-secondary-500 mb-4">AIが場面設計を提案したり、手動でエピソードを作成できます</p>
                  <div className="flex items-center justify-center space-x-3">
                    <Button
                      onClick={() => generateEpisodesMutation.mutate()}
                      disabled={generateEpisodesMutation.isPending}
                      data-testid="button-ai-suggest-new-episodes"
                      className="bg-primary-500 hover:bg-primary-600 text-white"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI提案
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setDialogOpen(true)}
                      data-testid="button-manual-create-episode"
                    >
                      手動作成
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Episode Dialog */}
      {editingEpisode && (
        <Dialog open={!!editingEpisode} onOpenChange={() => setEditingEpisode(null)}>
          <EpisodeDialog
            episode={editingEpisode}
            onChange={setEditingEpisode}
            onSave={handleUpdateEpisode}
            isLoading={updateEpisodeMutation.isPending}
            title="エピソードを編集"
          />
        </Dialog>
      )}
    </div>
  );
}

interface EpisodeDialogProps {
  episode: any;
  onChange: (episode: any) => void;
  onSave: (episode: any) => void;
  isLoading: boolean;
  title: string;
}

function EpisodeDialog({ episode, onChange, onSave, isLoading, title }: EpisodeDialogProps) {
  const [newEvent, setNewEvent] = useState("");

  const addEvent = () => {
    if (newEvent.trim() && episode) {
      const events = Array.isArray(episode.events) ? episode.events : [];
      onChange({ 
        ...episode, 
        events: [...events, newEvent.trim()] 
      });
      setNewEvent("");
    }
  };

  const removeEvent = (index: number) => {
    if (episode) {
      const events = Array.isArray(episode.events) ? episode.events : [];
      onChange({ 
        ...episode, 
        events: events.filter((_: any, i: number) => i !== index) 
      });
    }
  };

  return (
    <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">エピソードタイトル *</Label>
            <Input
              id="title"
              data-testid="input-episode-title"
              placeholder="例: 運命的な出会い"
              value={episode?.title || ""}
              onChange={(e) => episode && onChange({ ...episode, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="perspective">視点キャラクター</Label>
            <Input
              id="perspective"
              data-testid="input-episode-perspective"
              placeholder="例: アリス"
              value={episode?.perspective || ""}
              onChange={(e) => episode && onChange({ ...episode, perspective: e.target.value })}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">エピソード概要</Label>
          <Textarea
            id="description"
            data-testid="textarea-episode-description"
            placeholder="このエピソードで何が起こるかを記述..."
            value={episode?.description || ""}
            onChange={(e) => episode && onChange({ ...episode, description: e.target.value })}
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="setting">場面設定</Label>
          <Textarea
            id="setting"
            data-testid="textarea-episode-setting"
            placeholder="場所、時間、環境の描写..."
            value={episode?.setting || ""}
            onChange={(e) => episode && onChange({ ...episode, setting: e.target.value })}
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="mood">雰囲気・トーン</Label>
            <Select 
              value={episode?.mood || ""} 
              onValueChange={(value) => episode && onChange({ ...episode, mood: value })}
            >
              <SelectTrigger data-testid="select-episode-mood">
                <SelectValue placeholder="雰囲気を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="明るい">明るい</SelectItem>
                <SelectItem value="緊張感">緊張感</SelectItem>
                <SelectItem value="神秘的">神秘的</SelectItem>
                <SelectItem value="感動的">感動的</SelectItem>
                <SelectItem value="コミカル">コミカル</SelectItem>
                <SelectItem value="シリアス">シリアス</SelectItem>
                <SelectItem value="ロマンチック">ロマンチック</SelectItem>
                <SelectItem value="アクション">アクション</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dialogue">重要な会話</Label>
            <Textarea
              id="dialogue"
              data-testid="textarea-episode-dialogue"
              placeholder="キーとなる会話やセリフ..."
              value={episode?.dialogue || ""}
              onChange={(e) => episode && onChange({ ...episode, dialogue: e.target.value })}
              rows={2}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>主な出来事</Label>
          <div className="space-y-2">
            <div className="flex space-x-2">
              <Input
                placeholder="新しい出来事を追加..."
                value={newEvent}
                onChange={(e) => setNewEvent(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addEvent()}
                data-testid="input-new-event"
              />
              <Button 
                type="button" 
                onClick={addEvent}
                data-testid="button-add-event"
                variant="outline"
              >
                追加
              </Button>
            </div>
            {episode?.events && episode.events.length > 0 && (
              <div className="border rounded-lg p-3 max-h-32 overflow-y-auto">
                {episode?.events?.map((event: string, index: number) => (
                  <div key={index} className="flex items-center justify-between py-1">
                    <span className="text-sm" data-testid={`text-event-${index}`}>{event}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEvent(index)}
                      data-testid={`button-remove-event-${index}`}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            variant="outline" 
            onClick={() => {
              onChange(null);
            }}
            data-testid="button-cancel-episode"
          >
            キャンセル
          </Button>
          <Button 
            onClick={() => onSave(episode)}
            disabled={isLoading}
            data-testid="button-save-episode"
            className="bg-primary-500 hover:bg-primary-600"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "保存中..." : "保存"}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}
