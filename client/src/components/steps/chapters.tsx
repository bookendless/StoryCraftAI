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
import { Plus, List, Sparkles, Edit, Trash2, Save, GripVertical, BookOpen, Clock } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Chapter, Character } from "@shared/schema";

interface ChaptersProps {
  projectId: string;
}

export default function Chapters({ projectId }: ChaptersProps) {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [newChapter, setNewChapter] = useState({
    title: "",
    summary: "",
    structure: "ki",
    estimatedWords: 3000,
    estimatedReadingTime: 8,
    characterIds: [] as string[],
    order: 0
  });

  const { data: chapters = [], isLoading: chaptersLoading } = useQuery<Chapter[]>({
    queryKey: ["/api/projects", projectId, "chapters"],
  });

  const { data: characters = [] } = useQuery<Character[]>({
    queryKey: ["/api/projects", projectId, "characters"],
  });

  const createChapterMutation = useMutation({
    mutationFn: async (chapter: typeof newChapter) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/chapters`, chapter);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "chapters"] });
      toast({
        title: "章作成完了",
        description: "新しい章を追加しました。",
      });
      setDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "章の作成に失敗しました。",
        variant: "destructive",
      });
    },
  });

  const updateChapterMutation = useMutation({
    mutationFn: async ({ id, ...chapter }: Partial<Chapter> & { id: string }) => {
      const response = await apiRequest("PATCH", `/api/chapters/${id}`, chapter);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "chapters"] });
      toast({
        title: "更新完了",
        description: "章情報を更新しました。",
      });
      setEditingChapter(null);
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "章の更新に失敗しました。",
        variant: "destructive",
      });
    },
  });

  const deleteChapterMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/chapters/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "chapters"] });
      toast({
        title: "削除完了",
        description: "章を削除しました。",
      });
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "章の削除に失敗しました。",
        variant: "destructive",
      });
    },
  });

  const generateChaptersMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/chapters/generate`);
      return response.json();
    },
    onSuccess: (suggestions) => {
      toast({
        title: "AI提案完了",
        description: `${suggestions.length}個の章構成案を生成しました。`,
      });
      // Auto-create suggested chapters
      suggestions.forEach((suggestion: any, index: number) => {
        const chapterData = {
          ...suggestion,
          order: chapters.length + index,
          characterIds: suggestion.characterIds || []
        };
        createChapterMutation.mutate(chapterData);
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
    setNewChapter({
      title: "",
      summary: "",
      structure: "ki",
      estimatedWords: 3000,
      estimatedReadingTime: 8,
      characterIds: [],
      order: chapters.length
    });
  };

  const handleCreateChapter = () => {
    if (!newChapter.title.trim()) {
      toast({
        title: "入力エラー",
        description: "章タイトルは必須です。",
        variant: "destructive",
      });
      return;
    }
    createChapterMutation.mutate({ ...newChapter, order: chapters.length });
  };

  const handleUpdateChapter = (chapter: Chapter) => {
    updateChapterMutation.mutate(chapter);
  };

  const getStructureLabel = (structure: string) => {
    const labels = { ki: "起", sho: "承", ten: "転", ketsu: "結" };
    return labels[structure as keyof typeof labels] || structure;
  };

  const getStructureColor = (structure: string) => {
    const colors = {
      ki: "bg-blue-100 text-blue-700",
      sho: "bg-green-100 text-green-700", 
      ten: "bg-orange-100 text-orange-700",
      ketsu: "bg-purple-100 text-purple-700"
    };
    return colors[structure as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  const getTotalStats = () => {
    const totalWords = chapters.reduce((sum, ch) => sum + (ch.estimatedWords || 0), 0);
    const totalTime = chapters.reduce((sum, ch) => sum + (ch.estimatedReadingTime || 0), 0);
    const uniqueCharacters = new Set(chapters.flatMap(ch => ch.characterIds || [])).size;
    
    return {
      totalChapters: chapters.length,
      totalWords,
      totalTime,
      uniqueCharacters
    };
  };

  if (chaptersLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = getTotalStats();

  return (
    <div className="flex-1 flex">
      {/* Main Editor Section */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-surface-50 border-b border-outline/10 px-6 py-4 elevation-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-medium text-on-surface">章立て構成</h2>
              <Badge variant="secondary">ステップ 4/6</Badge>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => generateChaptersMutation.mutate()}
                disabled={generateChaptersMutation.isPending}
                data-testid="button-ai-generate-chapters"
                className="bg-primary-500 hover:bg-primary-600 text-white"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {generateChaptersMutation.isPending ? "AI生成中..." : "AI補完"}
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          {/* Chapter Overview */}
          <div className="bg-surface-50 rounded-xl p-6 mb-6 elevation-1">
            <h3 className="text-lg font-medium text-on-surface mb-4">全体構成概要</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-primary-50 rounded-lg p-4">
                <h4 className="font-medium text-primary-700 mb-2">起</h4>
                <p className="text-sm text-muted-foreground">主人公の日常と事件の発端</p>
                <div className="text-xs text-primary-600 mt-2">
                  {chapters.filter(ch => ch.structure === "ki").length}章
                </div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <h4 className="font-medium text-orange-700 mb-2">承・転</h4>
                <p className="text-sm text-muted-foreground">冒険の開始と試練</p>
                <div className="text-xs text-orange-600 mt-2">
                  {chapters.filter(ch => ["sho", "ten"].includes(ch.structure)).length}章
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium text-green-700 mb-2">結</h4>
                <p className="text-sm text-muted-foreground">クライマックスと解決</p>
                <div className="text-xs text-green-600 mt-2">
                  {chapters.filter(ch => ch.structure === "ketsu").length}章
                </div>
              </div>
            </div>
          </div>

          {chapters.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-surface-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <List className="w-12 h-12 icon-default" />
              </div>
              <h3 className="text-xl font-semibold text-on-surface mb-4">章構成を作成しましょう</h3>
              <p className="icon-muted mb-8 max-w-md mx-auto">
                物語の章立てを設計して、構造的な物語を作りましょう。
              </p>
              <div className="flex items-center justify-center space-x-3">
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      data-testid="button-create-first-chapter"
                      className="floating-button"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      章を作成
                    </Button>
                  </DialogTrigger>
                  <ChapterDialog
                    chapter={newChapter}
                    characters={characters}
                    onChange={setNewChapter}
                    onSave={handleCreateChapter}
                    onCancel={() => {
                      resetForm();
                      setDialogOpen(false);
                    }}
                    isLoading={createChapterMutation.isPending}
                    title="新しい章を作成"
                  />
                </Dialog>
                <Button
                  onClick={() => generateChaptersMutation.mutate()}
                  disabled={generateChaptersMutation.isPending}
                  data-testid="button-ai-suggest-chapters"
                  className="floating-button-outline"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI提案
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-on-surface">章構成リスト</h3>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      data-testid="button-add-chapter"
                      className="floating-button"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      章を追加
                    </Button>
                  </DialogTrigger>
                  <ChapterDialog
                    chapter={newChapter}
                    characters={characters}
                    onChange={setNewChapter}
                    onSave={handleCreateChapter}
                    onCancel={() => {
                      resetForm();
                      setDialogOpen(false);
                    }}
                    isLoading={createChapterMutation.isPending}
                    title="新しい章を作成"
                  />
                </Dialog>
              </div>

              {chapters.map((chapter, index) => (
                <Card 
                  key={chapter.id} 
                  className="elevation-1 card-hover material-transition"
                  data-testid={`card-chapter-${chapter.id}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold">{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-on-surface" data-testid={`text-chapter-title-${chapter.id}`}>
                            {chapter.title}
                          </h4>
                          <p className="text-sm text-secondary-500">
                            {getStructureLabel(chapter.structure)} - 章{index + 1}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingChapter(chapter)}
                          data-testid={`button-edit-chapter-${chapter.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          data-testid={`button-drag-chapter-${chapter.id}`}
                        >
                          <GripVertical className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteChapterMutation.mutate(chapter.id)}
                          data-testid={`button-delete-chapter-${chapter.id}`}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-secondary-500 mb-4" data-testid={`text-chapter-summary-${chapter.id}`}>
                      {chapter.summary || "要旨が設定されていません"}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-secondary-500">
                        <span data-testid={`text-chapter-words-${chapter.id}`}>
                          📖 推定文字数: {chapter.estimatedWords?.toLocaleString() || 0}字
                        </span>
                        <span data-testid={`text-chapter-time-${chapter.id}`}>
                          ⏱️ 想定読書時間: {chapter.estimatedReadingTime || 0}分
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStructureColor(chapter.structure)}>
                          {getStructureLabel(chapter.structure)}
                        </Badge>
                        {chapter.characterIds && Array.isArray(chapter.characterIds) && chapter.characterIds.length > 0 && (
                          <Badge variant="outline" data-testid={`badge-chapter-characters-${chapter.id}`}>
                            {chapter.characterIds.length}名登場
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Add Chapter Placeholder */}
              <div className="border-2 border-dashed border-surface-300 rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-surface-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-secondary-500" />
                </div>
                <h4 className="font-medium text-secondary-500 mb-2">新しい章を追加</h4>
                <p className="text-sm text-secondary-500 mb-4">AIが構成を提案したり、手動で章を作成できます</p>
                <div className="flex items-center justify-center space-x-3">
                  <Button
                    onClick={() => generateChaptersMutation.mutate()}
                    disabled={generateChaptersMutation.isPending}
                    data-testid="button-ai-suggest-new-chapters"
                    className="bg-primary-500 hover:bg-primary-600 text-white"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI提案
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(true)}
                    data-testid="button-manual-create-chapter"
                  >
                    手動作成
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Panel */}
      <div className="w-80 bg-surface-50 border-l border-outline/10 p-6 overflow-y-auto custom-scrollbar">
        <h3 className="text-lg font-medium text-on-surface mb-4">構成プレビュー</h3>
        
        {/* Structure Overview */}
        <div className="bg-surface-100 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-on-surface mb-3">全体統計</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-secondary-500">総章数</span>
              <span className="font-medium" data-testid="text-total-chapters">{stats.totalChapters}章</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-500">推定文字数</span>
              <span className="font-medium" data-testid="text-total-words">{stats.totalWords.toLocaleString()}字</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-500">読書時間</span>
              <span className="font-medium" data-testid="text-total-time">
                {Math.floor(stats.totalTime / 60)}時間{stats.totalTime % 60}分
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-500">登場人物</span>
              <span className="font-medium" data-testid="text-total-characters">{stats.uniqueCharacters}名</span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        {chapters.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium text-on-surface mb-3">構成タイムライン</h4>
            <div className="space-y-3">
              {chapters.map((chapter, index) => (
                <div key={chapter.id} className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    chapter.structure === "ki" ? "bg-blue-500" :
                    chapter.structure === "sho" ? "bg-green-500" :
                    chapter.structure === "ten" ? "bg-orange-500" :
                    "bg-purple-500"
                  }`}></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium" data-testid={`timeline-chapter-${chapter.id}`}>
                      第{index + 1}章: {chapter.title}
                    </div>
                    <div className="text-xs text-secondary-500">
                      {getStructureLabel(chapter.structure)} - {chapter.estimatedWords || 0}字
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Suggestions */}
        <div className="bg-primary-50 rounded-lg p-4">
          <h4 className="font-medium text-primary-700 mb-3">AI提案</h4>
          <div className="space-y-3 text-sm">
            <div className="bg-white rounded-lg p-3">
              <p className="text-secondary-600 mb-2">💡 章構成のバランスを改善する提案を生成できます。</p>
              <Button 
                size="sm"
                onClick={() => generateChaptersMutation.mutate()}
                disabled={generateChaptersMutation.isPending}
                data-testid="button-ai-improve-structure"
                className="bg-primary-500 hover:bg-primary-600 text-white"
              >
                構成改善案を生成
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Chapter Dialog */}
      {editingChapter && (
        <Dialog open={!!editingChapter} onOpenChange={() => setEditingChapter(null)}>
          <ChapterDialog
            chapter={editingChapter}
            characters={characters}
            onChange={setEditingChapter}
            onSave={handleUpdateChapter}
            onCancel={() => setEditingChapter(null)}
            isLoading={updateChapterMutation.isPending}
            title="章を編集"
          />
        </Dialog>
      )}
    </div>
  );
}

interface ChapterDialogProps {
  chapter: any;
  characters: Character[];
  onChange: (chapter: any) => void;
  onSave: (chapter: any) => void;
  onCancel: () => void;
  isLoading: boolean;
  title: string;
}

function ChapterDialog({ chapter, characters, onChange, onSave, onCancel, isLoading, title }: ChapterDialogProps) {
  // nullチェックを追加
  if (!chapter) {
    return null;
  }

  return (
    <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">章タイトル *</Label>
            <Input
              id="title"
              data-testid="input-chapter-title"
              placeholder="例: 星の呼び声"
              value={chapter.title || ""}
              onChange={(e) => onChange({ ...chapter, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="structure">構成</Label>
            <Select 
              value={chapter.structure} 
              onValueChange={(value) => onChange({ ...chapter, structure: value })}
            >
              <SelectTrigger data-testid="select-chapter-structure">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ki">起 - 導入</SelectItem>
                <SelectItem value="sho">承 - 展開</SelectItem>
                <SelectItem value="ten">転 - 転換</SelectItem>
                <SelectItem value="ketsu">結 - 結末</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="summary">章の要旨</Label>
          <Textarea
            id="summary"
            data-testid="textarea-chapter-summary"
            placeholder="この章で起こる出来事や展開を記述..."
            value={chapter.summary || ""}
            onChange={(e) => onChange({ ...chapter, summary: e.target.value })}
            rows={4}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="estimatedWords">推定文字数</Label>
            <Input
              id="estimatedWords"
              type="number"
              data-testid="input-chapter-words"
              placeholder="3000"
              value={chapter.estimatedWords || ""}
              onChange={(e) => onChange({ ...chapter, estimatedWords: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="estimatedReadingTime">読書時間（分）</Label>
            <Input
              id="estimatedReadingTime"
              type="number"
              data-testid="input-chapter-time"
              placeholder="8"
              value={chapter.estimatedReadingTime || ""}
              onChange={(e) => onChange({ ...chapter, estimatedReadingTime: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>
        
        {characters.length > 0 && (
          <div className="space-y-2">
            <Label>登場キャラクター</Label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {characters.map((character) => (
                <label key={character.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={(chapter.characterIds || []).includes(character.id)}
                    onChange={(e) => {
                      const currentIds = chapter.characterIds || [];
                      const newIds = e.target.checked
                        ? [...currentIds, character.id]
                        : currentIds.filter((id: string) => id !== character.id);
                      onChange({ ...chapter, characterIds: newIds });
                    }}
                    data-testid={`checkbox-character-${character.id}`}
                  />
                  <span className="text-sm">{character.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            variant="outline" 
            onClick={onCancel}
            data-testid="button-cancel-chapter"
          >
            キャンセル
          </Button>
          <Button 
            onClick={() => onSave(chapter)}
            disabled={isLoading}
            data-testid="button-save-chapter"
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
