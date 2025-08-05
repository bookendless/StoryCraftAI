import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Sparkles, Edit, Trash2, Save, ImageIcon } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Character } from "@shared/schema";

interface CharactersProps {
  projectId: string;
}

export default function Characters({ projectId }: CharactersProps) {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [newCharacter, setNewCharacter] = useState({
    name: "",
    description: "",
    personality: "",
    background: "",
    role: "",
    affiliation: "",
    imageUrl: "",
    order: 0
  });

  const { data: characters = [], isLoading } = useQuery<Character[]>({
    queryKey: ["/api/projects", projectId, "characters"],
  });

  const createCharacterMutation = useMutation({
    mutationFn: async (character: typeof newCharacter) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/characters`, character);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "characters"] });
      toast({
        title: "キャラクター作成完了",
        description: "新しいキャラクターを追加しました。",
      });
      setDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "キャラクターの作成に失敗しました。",
        variant: "destructive",
      });
    },
  });

  const updateCharacterMutation = useMutation({
    mutationFn: async ({ id, ...character }: Partial<Character> & { id: string }) => {
      const response = await apiRequest("PATCH", `/api/characters/${id}`, character);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "characters"] });
      toast({
        title: "更新完了",
        description: "キャラクター情報を更新しました。",
      });
      setEditingCharacter(null);
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "キャラクターの更新に失敗しました。",
        variant: "destructive",
      });
    },
  });

  const deleteCharacterMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/characters/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "characters"] });
      toast({
        title: "削除完了",
        description: "キャラクターを削除しました。",
      });
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "キャラクターの削除に失敗しました。",
        variant: "destructive",
      });
    },
  });

  const generateCharactersMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/characters/generate`);
      return response.json();
    },
    onSuccess: (suggestions) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "characters"] });
      const toastResult = toast({
        title: "AI生成完了",
        description: `${suggestions.length}個のキャラクターを生成しました。`,
      });
      setTimeout(() => {
        toastResult.dismiss?.();
      }, 1000);
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "AI生成に失敗しました。",
        variant: "destructive",
      });
    },
  });

  // キャラクター空欄補完機能
  const completeCharacterMutation = useMutation({
    mutationFn: async (characterId: string) => {
      const response = await apiRequest("POST", `/api/characters/${characterId}/complete`);
      return response.json();
    },
    onSuccess: (completedCharacter) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "characters"] });
      const toastResult = toast({
        title: "AI補完完了",
        description: "キャラクター情報を補完しました。",
      });
      setTimeout(() => {
        toastResult.dismiss?.();
      }, 1000);
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "AI補完に失敗しました。",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setNewCharacter({
      name: "",
      description: "",
      personality: "",
      background: "",
      role: "",
      affiliation: "",
      imageUrl: "",
      order: characters.length
    });
  };

  const handleCreateCharacter = () => {
    if (!newCharacter.name.trim()) {
      toast({
        title: "入力エラー",
        description: "キャラクター名は必須です。",
        variant: "destructive",
      });
      return;
    }
    createCharacterMutation.mutate({ ...newCharacter, order: characters.length });
  };

  const handleUpdateCharacter = (character: Character) => {
    updateCharacterMutation.mutate(character);
  };

  if (isLoading) {
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
            <h2 className="text-xl font-medium text-on-surface">キャラクター設定</h2>
            <Badge variant="secondary">ステップ 1/6</Badge>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => generateCharactersMutation.mutate()}
              disabled={generateCharactersMutation.isPending}
              data-testid="button-ai-generate-characters"
              className="floating-button-outline"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {generateCharactersMutation.isPending ? "AI生成中..." : "AI補完"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto min-h-0">
        {characters.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-surface-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-12 h-12 icon-default" />
            </div>
            <h3 className="text-xl font-semibold text-on-surface mb-4">キャラクターを作成しましょう</h3>
            <p className="icon-muted mb-8 max-w-md mx-auto">
              物語の登場人物を設定して、魅力的なストーリーの基盤を作りましょう。
            </p>
            <div className="flex items-center justify-center space-x-3">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    data-testid="button-create-first-character"
                    className="floating-button"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    キャラクターを作成
                  </Button>
                </DialogTrigger>
                <CharacterDialog
                  character={newCharacter}
                  onChange={setNewCharacter}
                  onSave={handleCreateCharacter}
                  onCancel={() => {
                    resetForm();
                    setDialogOpen(false);
                  }}
                  isLoading={createCharacterMutation.isPending}
                  title="新しいキャラクターを作成"
                />
              </Dialog>
              <Button
                onClick={() => generateCharactersMutation.mutate()}
                disabled={generateCharactersMutation.isPending}
                data-testid="button-ai-suggest-characters"
                className="floating-button-outline"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI提案
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-on-surface">登場人物一覧</h3>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    data-testid="button-add-character"
                    className="floating-button"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    キャラクター追加
                  </Button>
                </DialogTrigger>
                <CharacterDialog
                  character={newCharacter}
                  onChange={setNewCharacter}
                  onSave={handleCreateCharacter}
                  onCancel={() => {
                    resetForm();
                    setDialogOpen(false);
                  }}
                  isLoading={createCharacterMutation.isPending}
                  title="新しいキャラクターを作成"
                />
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {characters.map((character) => (
                <Card 
                  key={character.id} 
                  className="card-hover material-transition elevation-1"
                  data-testid={`card-character-${character.id}`}
                >
                  {/* Character Image */}
                  {character.imageUrl && (
                    <div className="w-full h-32 overflow-hidden rounded-t-lg">
                      <img
                        src={character.imageUrl.startsWith('/objects/') ? character.imageUrl : `/public-objects/${character.imageUrl}`}
                        alt={character.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg" data-testid={`text-character-name-${character.id}`}>
                          {character.name}
                        </CardTitle>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {character.role && (
                            <Badge variant="outline">
                              {character.role}
                            </Badge>
                          )}
                          {character.affiliation && (
                            <Badge variant="secondary">
                              {character.affiliation}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => completeCharacterMutation.mutate(character.id)}
                          disabled={completeCharacterMutation.isPending}
                          data-testid={`button-complete-character-${character.id}`}
                          className="bg-primary-500 hover:bg-primary-600 text-white"
                          title="AI補完"
                        >
                          <Sparkles className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCharacter(character)}
                          data-testid={`button-edit-character-${character.id}`}
                          className="hover:bg-surface-200"
                        >
                          <Edit className="w-4 h-4 icon-default" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCharacterMutation.mutate(character.id)}
                          data-testid={`button-delete-character-${character.id}`}
                          className="text-destructive hover:text-destructive hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {character.description && (
                      <div>
                        <h4 className="text-sm font-medium icon-secondary mb-1">外見・特徴</h4>
                        <p className="text-sm icon-default" data-testid={`text-character-description-${character.id}`}>
                          {character.description}
                        </p>
                      </div>
                    )}
                    
                    {character.personality && (
                      <div>
                        <h4 className="text-sm font-medium icon-secondary mb-1">性格</h4>
                        <p className="text-sm icon-default" data-testid={`text-character-personality-${character.id}`}>
                          {character.personality}
                        </p>
                      </div>
                    )}
                    
                    {character.background && (
                      <div>
                        <h4 className="text-sm font-medium icon-secondary mb-1">背景</h4>
                        <p className="text-sm icon-default" data-testid={`text-character-background-${character.id}`}>
                          {character.background}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Character Dialog */}
      {editingCharacter && (
        <Dialog open={!!editingCharacter} onOpenChange={() => setEditingCharacter(null)}>
          <CharacterDialog
            character={editingCharacter}
            onChange={setEditingCharacter}
            onSave={handleUpdateCharacter}
            onCancel={() => setEditingCharacter(null)}
            isLoading={updateCharacterMutation.isPending}
            title="キャラクターを編集"
          />
        </Dialog>
      )}
    </div>
  );
}

interface CharacterDialogProps {
  character: any;
  onChange: (character: any) => void;
  onSave: (character: any) => void;
  onCancel: () => void;
  isLoading: boolean;
  title: string;
}

function CharacterDialog({ character, onChange, onSave, onCancel, isLoading, title }: CharacterDialogProps) {
  // nullチェックを追加
  if (!character) {
    return null;
  }

  return (
    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label>参考画像（任意）</Label>
          <ImageUpload
            imageUrl={character.imageUrl || ""}
            onImageChange={(url) => onChange({ ...character, imageUrl: url || "" })}
            placeholder="キャラクターの参考画像をアップロード"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">キャラクター名 *</Label>
            <Input
              id="name"
              data-testid="input-character-name"
              placeholder="例: アリス"
              value={character.name || ""}
              onChange={(e) => onChange({ ...character, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">役割</Label>
            <Input
              id="role"
              data-testid="input-character-role"
              placeholder="例: 主人公、ヒロイン、敵役"
              value={character.role || ""}
              onChange={(e) => onChange({ ...character, role: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="affiliation">所属・組織（任意）</Label>
          <Input
            id="affiliation"
            data-testid="input-character-affiliation"
            placeholder="例: 魔法学院、騎士団、商会"
            value={character.affiliation || ""}
            onChange={(e) => onChange({ ...character, affiliation: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">外見・特徴</Label>
          <Textarea
            id="description"
            data-testid="textarea-character-description"
            placeholder="キャラクターの外見や身体的特徴を記述..."
            value={character.description || ""}
            onChange={(e) => onChange({ ...character, description: e.target.value })}
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="personality">性格</Label>
          <Textarea
            id="personality"
            data-testid="textarea-character-personality"
            placeholder="性格の特徴、価値観、行動パターンなど..."
            value={character.personality || ""}
            onChange={(e) => onChange({ ...character, personality: e.target.value })}
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="background">背景・過去</Label>
          <Textarea
            id="background"
            data-testid="textarea-character-background"
            placeholder="生い立ち、経歴、重要な出来事など..."
            value={character.background || ""}
            onChange={(e) => onChange({ ...character, background: e.target.value })}
            rows={3}
          />
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            variant="outline" 
            onClick={onCancel}
            data-testid="button-cancel-character"
          >
            キャンセル
          </Button>
          <Button 
            onClick={() => onSave(character)}
            disabled={isLoading}
            data-testid="button-save-character"
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
