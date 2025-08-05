import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, List, Plus, Trash2, Sparkles, Edit, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Chapter, Character } from "@shared/schema";

export default function Chapters() {
  const params = useParams();
  const projectId = params.projectId;
  const { toast } = useToast();
  
  const [totalChapters, setTotalChapters] = useState(8);
  const [structure, setStructure] = useState("kishotenketsu");
  const [estimatedLength, setEstimatedLength] = useState(50000);

  // Fetch data
  const { data: chapters = [], isLoading: chaptersLoading } = useQuery<Chapter[]>({
    queryKey: [`/api/projects/${projectId}/chapters`],
    enabled: !!projectId,
  });

  const { data: characters = [] } = useQuery<Character[]>({
    queryKey: [`/api/projects/${projectId}/characters`],
    enabled: !!projectId,
  });

  // Mutations
  const generateChaptersMutation = useMutation({
    mutationFn: async () => {
      if (!projectId) {
        throw new Error("プロジェクトIDが見つかりません");
      }
      const response = await apiRequest("POST", `/api/projects/${projectId}/chapters/generate`);
      return response.json();
    },
    onSuccess: () => {
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/chapters`] });
      }
      toast({
        title: "AI生成完了",
        description: "章構成を生成しました。",
      });
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: "AI生成に失敗しました。",
        variant: "destructive",
      });
    },
  });

  // Helper functions
  const getStructurePreview = () => {
    if (structure === "kishotenketsu") {
      const chapterDistribution = Math.ceil(totalChapters / 4);
      return [
        { 
          name: "起", 
          description: "物語の始まり、状況設定", 
          chapters: Array.from({length: chapterDistribution}, (_, i) => i + 1)
        },
        { 
          name: "承", 
          description: "展開、発展", 
          chapters: Array.from({length: chapterDistribution}, (_, i) => i + chapterDistribution + 1)
        },
        { 
          name: "転", 
          description: "転換点、クライマックス", 
          chapters: Array.from({length: chapterDistribution}, (_, i) => i + chapterDistribution * 2 + 1)
        },
        { 
          name: "結", 
          description: "結末、解決", 
          chapters: Array.from({length: totalChapters - chapterDistribution * 3}, (_, i) => i + chapterDistribution * 3 + 1)
        }
      ];
    } else {
      // Three-act structure
      const act1 = Math.ceil(totalChapters * 0.25);
      const act2 = Math.ceil(totalChapters * 0.5);
      const act3 = totalChapters - act1 - act2;
      
      return [
        { 
          name: "第一幕", 
          description: "設定、導入", 
          chapters: Array.from({length: act1}, (_, i) => i + 1)
        },
        { 
          name: "第二幕", 
          description: "対立、発展", 
          chapters: Array.from({length: act2}, (_, i) => i + act1 + 1)
        },
        { 
          name: "第三幕", 
          description: "解決、結末", 
          chapters: Array.from({length: act3}, (_, i) => i + act1 + act2 + 1)
        }
      ];
    }
  };

  const getStructurePhase = (chapterNumber: number) => {
    const preview = getStructurePreview();
    for (const phase of preview) {
      if (phase.chapters.includes(chapterNumber)) {
        return phase.name;
      }
    }
    return "未分類";
  };

  const createChapterMutation = useMutation({
    mutationFn: async (chapterData: any) => {
      if (!projectId) {
        throw new Error("プロジェクトIDが見つかりません");
      }
      const response = await apiRequest("POST", `/api/projects/${projectId}/chapters`, chapterData);
      return response.json();
    },
    onSuccess: () => {
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/chapters`] });
      }
      toast({
        title: "章作成完了",
        description: "新しい章を追加しました。",
      });
    },
    onError: (error) => {
      console.error("Chapter creation error:", error);
      toast({
        title: "エラー",
        description: "章の作成に失敗しました。",
        variant: "destructive",
      });
    },
  });

  const updateChapterMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & any) => {
      const response = await apiRequest("PATCH", `/api/chapters/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/chapters`] });
      }
      toast({
        title: "章更新完了",
        description: "章を更新しました。",
      });
    },
    onError: (error) => {
      console.error("Chapter update error:", error);
      toast({
        title: "エラー",
        description: "章の更新に失敗しました。",
        variant: "destructive",
      });
    },
  });

  const deleteChapterMutation = useMutation({
    mutationFn: async (chapterId: string) => {
      await apiRequest("DELETE", `/api/chapters/${chapterId}`);
    },
    onSuccess: () => {
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/chapters`] });
      }
      toast({
        title: "章削除完了",
        description: "章を削除しました。",
      });
    },
  });

  const addChapter = () => {
    if (!projectId) {
      toast({
        title: "エラー",
        description: "プロジェクトIDが見つかりません。",
        variant: "destructive",
      });
      return;
    }

    const chapterArray = Array.isArray(chapters) ? chapters : [];
    const newChapter = {
      title: `第${chapterArray.length + 1}章`,
      summary: "",
      structure: getStructureForChapter(chapterArray.length + 1),
      order: chapterArray.length,
      estimatedWords: Math.ceil(estimatedLength / totalChapters),
      estimatedReadingTime: Math.ceil(estimatedLength / totalChapters / 250), // 250文字/分の読書速度
      characterIds: [],
      projectId
    };
    
    createChapterMutation.mutate(newChapter);
  };

  const updateChapter = (chapterIndex: number, updates: any) => {
    const chapterArray = Array.isArray(chapters) ? chapters : [];
    const chapter = chapterArray[chapterIndex];
    if (chapter) {
      updateChapterMutation.mutate({ id: chapter.id, ...updates });
    }
  };

  const removeChapter = (chapterIndex: number) => {
    const chapterArray = Array.isArray(chapters) ? chapters : [];
    const chapter = chapterArray[chapterIndex];
    if (chapter) {
      deleteChapterMutation.mutate(chapter.id);
    }
  };

  const getStructureForChapter = (chapterNumber: number) => {
    if (structure === "kishotenketsu") {
      const chapterDistribution = Math.ceil(totalChapters / 4);
      if (chapterNumber <= chapterDistribution) return "ki";
      if (chapterNumber <= chapterDistribution * 2) return "sho";
      if (chapterNumber <= chapterDistribution * 3) return "ten";
      return "ketsu";
    } else {
      const act1 = Math.ceil(totalChapters * 0.25);
      const act2 = Math.ceil(totalChapters * 0.5);
      if (chapterNumber <= act1) return "act1";
      if (chapterNumber <= act1 + act2) return "act2";
      return "act3";
    }
  };

  const generateChapters = () => {
    generateChaptersMutation.mutate();
  };

  if (chaptersLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <header className="bg-surface-50 border-b border-outline/10 px-6 py-4 elevation-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-medium text-on-surface">章立て構成</h2>
            <Badge variant="secondary">ステップ 4/6</Badge>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={generateChapters}
              disabled={generateChaptersMutation.isPending}
              data-testid="button-ai-generate-chapters"
              className="bg-primary-500 hover:bg-primary-600"
              style={{ color: "#1b6e98" }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {generateChaptersMutation.isPending ? "AI生成中..." : "AI生成"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Three Column Layout */}
      <div className="flex-1 flex min-h-0">
        {/* Left Column - Overview */}
        <div className="w-80 p-4 border-r border-surface-200 flex-shrink-0">
          <Card className="elevation-1 h-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <FileText className="w-5 h-5 icon-default" />
                <span>全体構成概要</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="totalChapters">総章数</Label>
                  <Input
                    id="totalChapters"
                    type="number"
                    min="1"
                    max="50"
                    value={totalChapters}
                    onChange={(e) => setTotalChapters(parseInt(e.target.value) || 1)}
                    data-testid="input-total-chapters"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="structure">物語構造</Label>
                  <Select value={structure} onValueChange={setStructure}>
                    <SelectTrigger data-testid="select-story-structure">
                      <SelectValue placeholder="構造を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kishotenketsu">起承転結</SelectItem>
                      <SelectItem value="three-act">三幕構成</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="estimatedLength">推定文字数</Label>
                  <Input
                    id="estimatedLength"
                    type="number"
                    min="1000"
                    max="1000000"
                    value={estimatedLength}
                    onChange={(e) => setEstimatedLength(parseInt(e.target.value) || 50000)}
                    data-testid="input-estimated-length"
                  />
                  <p className="text-xs text-secondary-600">
                    約{Math.ceil(estimatedLength / totalChapters)}文字/章
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center Column - Structure Preview */}
        <div className="w-96 p-4 border-r border-surface-200 flex-shrink-0">
          <Card className="bg-primary-50 border-primary-200 elevation-1 h-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-primary-700">構成プレビュー</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getStructurePreview().map((phase, index) => (
                  <div key={index} className="bg-white rounded-lg p-3">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <h4 className="font-medium text-on-surface">{phase.name}</h4>
                    </div>
                    <p className="text-xs text-secondary-600 mb-2">{phase.description}</p>
                    <p className="text-xs text-primary-600 font-medium">
                      第{phase.chapters.join("・")}章
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Chapters List */}
        <div className="flex-1 p-4 min-w-0">
          <Card className="elevation-1 h-full flex flex-col">
            <CardHeader className="pb-4 flex-shrink-0">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <List className="w-5 h-5 icon-default" />
                  <span>章構成リスト</span>
                </div>
                <Button
                  onClick={addChapter}
                  data-testid="button-add-chapter"
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  章を追加
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto min-h-0">
              <div className="space-y-4">
                {Array.isArray(chapters) && chapters.map((chapter: Chapter, index: number) => (
                  <div key={chapter.id} className="border rounded-lg p-4 space-y-3" data-testid={`chapter-card-${chapter.id}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-secondary-700">{index + 1}</span>
                        </div>
                        <Input
                          placeholder={`第${index + 1}章のタイトル`}
                          value={chapter.title}
                          onChange={(e) => updateChapter(index, { title: e.target.value })}
                          data-testid={`input-chapter-title-${chapter.id}`}
                          className="font-medium flex-1"
                        />
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <Badge variant="outline" className="text-xs">
                          {getStructurePhase(index + 1)}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeChapter(index)}
                          data-testid={`button-remove-chapter-${chapter.id}`}
                          disabled={deleteChapterMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Textarea
                        placeholder="章の概要・あらすじ"
                        value={chapter.summary || ""}
                        onChange={(e) => updateChapter(index, { summary: e.target.value })}
                        data-testid={`textarea-chapter-summary-${chapter.id}`}
                        rows={3}
                        className="resize-none"
                      />
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">推定文字数</Label>
                          <Input
                            type="number"
                            placeholder="5000"
                            value={chapter.estimatedWords || ""}
                            onChange={(e) => updateChapter(index, { estimatedWords: parseInt(e.target.value) || 0 })}
                            data-testid={`input-chapter-words-${chapter.id}`}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">読了時間(分)</Label>
                          <Input
                            type="number"
                            placeholder="20"
                            value={chapter.estimatedReadingTime || ""}
                            onChange={(e) => updateChapter(index, { estimatedReadingTime: parseInt(e.target.value) || 0 })}
                            data-testid={`input-chapter-time-${chapter.id}`}
                            className="text-sm"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-xs">登場キャラクター</Label>
                        <Select
                          value=""
                          onValueChange={(characterId) => {
                            const currentIds = chapter.characterIds || [];
                            if (!currentIds.includes(characterId)) {
                              updateChapter(index, { 
                                characterIds: [...currentIds, characterId] 
                              });
                            }
                          }}
                        >
                          <SelectTrigger className="text-sm" data-testid={`select-chapter-characters-${chapter.id}`}>
                            <SelectValue placeholder="キャラクターを追加" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.isArray(characters) && characters
                              .filter((char: Character) => !chapter.characterIds?.includes(char.id))
                              .map((character: Character) => (
                                <SelectItem key={character.id} value={character.id}>
                                  {character.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        
                        {chapter.characterIds && chapter.characterIds.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {chapter.characterIds.map(characterId => {
                              const character = Array.isArray(characters) ? characters.find((c: Character) => c.id === characterId) : undefined;
                              return character ? (
                                <Badge 
                                  key={characterId} 
                                  variant="secondary" 
                                  className="text-xs cursor-pointer"
                                  onClick={() => updateChapter(index, {
                                    characterIds: chapter.characterIds?.filter(id => id !== characterId)
                                  })}
                                >
                                  {character.name} ×
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!Array.isArray(chapters) || chapters.length === 0) && (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-surface-200 rounded-full flex items-center justify-center mx-auto mb-6">
                      <List className="w-12 h-12 icon-default" />
                    </div>
                    <h3 className="text-xl font-semibold text-on-surface mb-4">章構成を作成しましょう</h3>
                    <p className="icon-muted mb-8 max-w-md mx-auto">
                      物語の章立てを設計して、構造的な物語を作りましょう。
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}