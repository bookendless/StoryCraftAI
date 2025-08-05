import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Film, Sparkles, Edit, Trash2, Save, GripVertical } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Episode, Chapter } from "@shared/schema";

interface EpisodesProps {
  projectId: string;
}

export default function Episodes({ projectId }: EpisodesProps) {
  const { toast } = useToast();
  const [selectedChapter, setSelectedChapter] = useState<string>("");
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
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
    queryKey: [`/api/projects/${projectId}/chapters`],
  });

  const { data: episodes = [], isLoading: episodesLoading } = useQuery<Episode[]>({
    queryKey: [`/api/chapters/${selectedChapter}/episodes`],
    enabled: !!selectedChapter,
  });

  const createEpisodeMutation = useMutation({
    mutationFn: async (episode: typeof newEpisode) => {
      const response = await apiRequest("POST", `/api/chapters/${selectedChapter}/episodes`, episode);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/chapters/${selectedChapter}/episodes`] });
      toast({
        title: "エピソード作成完了",
        description: "新しいエピソードを追加しました。",
      });
      setShowCreateForm(false);
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
      queryClient.invalidateQueries({ queryKey: [`/api/chapters/${selectedChapter}/episodes`] });
      toast({
        title: "エピソード更新完了",
        description: "エピソードを更新しました。",
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
    mutationFn: async (episodeId: string) => {
      await apiRequest("DELETE", `/api/episodes/${episodeId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/chapters/${selectedChapter}/episodes`] });
      toast({
        title: "エピソード削除完了",
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

  const generateEpisodeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/chapters/${selectedChapter}/episodes/generate`);
      return response.json();
    },
    onSuccess: (suggestions) => {
      toast({
        title: "AI生成完了",
        description: `${suggestions.length}個のエピソード案を生成しました。`,
      });
      // Auto-create suggested episodes
      suggestions.forEach((suggestion: any, index: number) => {
        const episodeData = {
          ...suggestion,
          order: episodes.length + index,
        };
        createEpisodeMutation.mutate(episodeData);
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

  // Handle clicking outside form to cancel
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowCreateForm(false);
      resetForm();
    }
  };

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
                onClick={() => generateEpisodeMutation.mutate()}
                disabled={generateEpisodeMutation.isPending}
                data-testid="button-ai-generate-episodes"
                className="bg-primary-500 hover:bg-primary-600"
                style={{ color: "#1b6e98" }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {generateEpisodeMutation.isPending ? "AI生成中..." : "AI生成"}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto min-h-0">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Chapter Selection */}
          <Card className="elevation-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Film className="w-5 h-5 icon-default" />
                <span>章選択</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="chapterSelect">エピソードを作成する章を選択</Label>
                  <Select value={selectedChapter} onValueChange={setSelectedChapter}>
                    <SelectTrigger data-testid="select-chapter">
                      <SelectValue placeholder="章を選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      {chapters.map((chapter) => (
                        <SelectItem key={chapter.id} value={chapter.id}>
                          {chapter.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedChapter && (
                  <div className="bg-primary-50 rounded-lg p-4">
                    <p className="text-sm text-primary-700">
                      選択された章: <strong>{chapters.find(c => c.id === selectedChapter)?.title}</strong>
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {selectedChapter && (
            <Card className="elevation-1">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>エピソード一覧</span>
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    data-testid="button-add-episode"
                    className="bg-primary-500 hover:bg-primary-600"
                    style={{ color: "#1b6e98" }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    エピソードを追加
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {episodesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : episodes.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-surface-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Film className="w-8 h-8 icon-default" />
                    </div>
                    <h3 className="text-lg font-semibold text-on-surface mb-2">エピソードがありません</h3>
                    <p className="text-secondary-600 mb-6">
                      この章にはまだエピソードが作成されていません。
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {episodes.map((episode, index) => (
                      <div key={episode.id} className="border rounded-lg p-4 space-y-3" data-testid={`episode-card-${episode.id}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-secondary-700">{index + 1}</span>
                            </div>
                            <div>
                              <h4 className="font-medium text-on-surface" data-testid={`text-episode-title-${episode.id}`}>
                                {episode.title}
                              </h4>
                              <p className="text-sm text-secondary-600">{episode.mood || "ムード未設定"}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
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
                              onClick={() => deleteEpisodeMutation.mutate(episode.id)}
                              data-testid={`button-delete-episode-${episode.id}`}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {episode.description && (
                          <p className="text-sm text-secondary-700 pl-11">{episode.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create Episode Form Overlay */}
      {showCreateForm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleBackgroundClick}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl m-6 max-h-[90vh] overflow-y-auto">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">新しいエピソードを作成</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">タイトル *</Label>
                  <Input
                    id="title"
                    value={newEpisode.title}
                    onChange={(e) => setNewEpisode({ ...newEpisode, title: e.target.value })}
                    data-testid="input-episode-title"
                    placeholder="エピソードのタイトルを入力"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">概要</Label>
                  <Textarea
                    id="description"
                    value={newEpisode.description}
                    onChange={(e) => setNewEpisode({ ...newEpisode, description: e.target.value })}
                    data-testid="textarea-episode-description"
                    rows={3}
                    placeholder="エピソードの概要を入力"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="perspective">視点</Label>
                    <Select
                      value={newEpisode.perspective}
                      onValueChange={(value) => setNewEpisode({ ...newEpisode, perspective: value })}
                    >
                      <SelectTrigger data-testid="select-episode-perspective">
                        <SelectValue placeholder="視点を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="first-person">一人称</SelectItem>
                        <SelectItem value="third-person-limited">三人称限定</SelectItem>
                        <SelectItem value="third-person-omniscient">三人称全知</SelectItem>
                        <SelectItem value="multiple">多視点</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="mood">ムード・雰囲気</Label>
                    <Select
                      value={newEpisode.mood}
                      onValueChange={(value) => setNewEpisode({ ...newEpisode, mood: value })}
                    >
                      <SelectTrigger data-testid="select-episode-mood">
                        <SelectValue placeholder="ムードを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tension">緊張感</SelectItem>
                        <SelectItem value="calm">平穏</SelectItem>
                        <SelectItem value="dramatic">劇的</SelectItem>
                        <SelectItem value="mysterious">神秘的</SelectItem>
                        <SelectItem value="humorous">ユーモラス</SelectItem>
                        <SelectItem value="romantic">ロマンチック</SelectItem>
                        <SelectItem value="action">アクション</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="setting">舞台・設定</Label>
                  <Input
                    id="setting"
                    value={newEpisode.setting}
                    onChange={(e) => setNewEpisode({ ...newEpisode, setting: e.target.value })}
                    data-testid="input-episode-setting"
                    placeholder="場所や時間設定"
                  />
                </div>
                
                <div>
                  <Label htmlFor="dialogue">重要な台詞・会話</Label>
                  <Textarea
                    id="dialogue"
                    value={newEpisode.dialogue}
                    onChange={(e) => setNewEpisode({ ...newEpisode, dialogue: e.target.value })}
                    data-testid="textarea-episode-dialogue"
                    rows={3}
                    placeholder="印象的な台詞や会話のアイデア"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  onClick={handleCreateEpisode}
                  disabled={createEpisodeMutation.isPending || !newEpisode.title.trim()}
                  data-testid="button-save-episode"
                  className="bg-primary-500 hover:bg-primary-600"
                  style={{ color: "#1b6e98" }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {createEpisodeMutation.isPending ? "保存中..." : "保存"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Episode Form */}
      {editingEpisode && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setEditingEpisode(null);
            }
          }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl m-6 max-h-[90vh] overflow-y-auto">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">エピソードを編集</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-title">タイトル *</Label>
                  <Input
                    id="edit-title"
                    value={editingEpisode.title}
                    onChange={(e) => setEditingEpisode({ ...editingEpisode, title: e.target.value })}
                    data-testid="input-edit-episode-title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-description">概要</Label>
                  <Textarea
                    id="edit-description"
                    value={editingEpisode.description || ""}
                    onChange={(e) => setEditingEpisode({ ...editingEpisode, description: e.target.value })}
                    data-testid="textarea-edit-episode-description"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-perspective">視点</Label>
                    <Select
                      value={editingEpisode.perspective || ""}
                      onValueChange={(value) => setEditingEpisode({ ...editingEpisode, perspective: value })}
                    >
                      <SelectTrigger data-testid="select-edit-episode-perspective">
                        <SelectValue placeholder="視点を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="first-person">一人称</SelectItem>
                        <SelectItem value="third-person-limited">三人称限定</SelectItem>
                        <SelectItem value="third-person-omniscient">三人称全知</SelectItem>
                        <SelectItem value="multiple">多視点</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-mood">ムード・雰囲気</Label>
                    <Select
                      value={editingEpisode.mood || ""}
                      onValueChange={(value) => setEditingEpisode({ ...editingEpisode, mood: value })}
                    >
                      <SelectTrigger data-testid="select-edit-episode-mood">
                        <SelectValue placeholder="ムードを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tension">緊張感</SelectItem>
                        <SelectItem value="calm">平穏</SelectItem>
                        <SelectItem value="dramatic">劇的</SelectItem>
                        <SelectItem value="mysterious">神秘的</SelectItem>
                        <SelectItem value="humorous">ユーモラス</SelectItem>
                        <SelectItem value="romantic">ロマンチック</SelectItem>
                        <SelectItem value="action">アクション</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="edit-setting">舞台・設定</Label>
                  <Input
                    id="edit-setting"
                    value={editingEpisode.setting || ""}
                    onChange={(e) => setEditingEpisode({ ...editingEpisode, setting: e.target.value })}
                    data-testid="input-edit-episode-setting"
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-dialogue">重要な台詞・会話</Label>
                  <Textarea
                    id="edit-dialogue"
                    value={editingEpisode.dialogue || ""}
                    onChange={(e) => setEditingEpisode({ ...editingEpisode, dialogue: e.target.value })}
                    data-testid="textarea-edit-episode-dialogue"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditingEpisode(null)}
                  data-testid="button-cancel-edit-episode"
                >
                  キャンセル
                </Button>
                <Button
                  onClick={() => handleUpdateEpisode(editingEpisode)}
                  disabled={updateEpisodeMutation.isPending || !editingEpisode.title?.trim()}
                  data-testid="button-update-episode"
                  className="bg-primary-500 hover:bg-primary-600"
                  style={{ color: "#1b6e98" }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateEpisodeMutation.isPending ? "更新中..." : "更新"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}