import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, BookOpen, Clock, Users } from "lucide-react";
import { SettingsDialog } from "@/components/settings/settings-dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    genre: "",
    description: ""
  });

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const createProjectMutation = useMutation({
    mutationFn: async (project: { title: string; genre: string; description?: string }) => {
      const response = await apiRequest("POST", "/api/projects", project);
      return response.json();
    },
    onSuccess: (project: Project) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "プロジェクト作成完了",
        description: `「${project.title}」を作成しました。`,
      });
      setDialogOpen(false);
      setNewProject({ title: "", genre: "", description: "" });
      setLocation(`/project/${project.id}`);
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: "プロジェクトの作成に失敗しました。",
        variant: "destructive",
      });
    },
  });

  const handleCreateProject = () => {
    if (!newProject.title.trim() || !newProject.genre.trim()) {
      toast({
        title: "入力エラー",
        description: "タイトルとジャンルは必須です。",
        variant: "destructive",
      });
      return;
    }
    createProjectMutation.mutate(newProject);
  };

  const getStepName = (step: number) => {
    const steps = ["キャラクター", "プロット", "あらすじ", "章立て", "エピソード", "草案"];
    return steps[step - 1] || "完了";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary-500">プロジェクトを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-100">
      {/* Header */}
      <header className="bg-surface-50 border-b border-outline/20 elevation-1">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center elevation-2">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-on-surface dark:text-foreground">AIと共創するストーリービルダー</h1>
                <p className="text-secondary-500 dark:text-muted-foreground">あなたの創造性を最大限に活かす執筆支援環境</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <SettingsDialog />
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    data-testid="button-create-project"
                    className="bg-primary-500 hover:bg-primary-600 text-white elevation-2"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    新しいプロジェクト
                  </Button>
                </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>新しいプロジェクトを作成</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">プロジェクトタイトル</Label>
                    <Input
                      id="title"
                      data-testid="input-project-title"
                      placeholder="例: 星の守護者"
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="genre">ジャンル</Label>
                    <Select 
                      value={newProject.genre} 
                      onValueChange={(value) => setNewProject({ ...newProject, genre: value })}
                    >
                      <SelectTrigger data-testid="select-project-genre">
                        <SelectValue placeholder="ジャンルを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fantasy">ファンタジー</SelectItem>
                        <SelectItem value="scifi">SF</SelectItem>
                        <SelectItem value="mystery">ミステリー</SelectItem>
                        <SelectItem value="romance">ロマンス</SelectItem>
                        <SelectItem value="thriller">スリラー</SelectItem>
                        <SelectItem value="drama">ドラマ</SelectItem>
                        <SelectItem value="comedy">コメディ</SelectItem>
                        <SelectItem value="other">その他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">概要（任意）</Label>
                    <Textarea
                      id="description"
                      data-testid="textarea-project-description"
                      placeholder="プロジェクトの簡単な説明..."
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setDialogOpen(false)}
                      data-testid="button-cancel-project"
                    >
                      キャンセル
                    </Button>
                    <Button 
                      onClick={handleCreateProject}
                      disabled={createProjectMutation.isPending}
                      data-testid="button-confirm-create-project"
                      className="bg-primary-500 hover:bg-primary-600"
                    >
                      {createProjectMutation.isPending ? "作成中..." : "作成"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-surface-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-12 h-12 text-secondary-500" />
            </div>
            <h2 className="text-2xl font-semibold text-on-surface mb-4">まだプロジェクトがありません</h2>
            <p className="text-secondary-500 mb-8 max-w-md mx-auto">
              最初のストーリープロジェクトを作成して、AIと一緒に創作を始めましょう。
            </p>
            <Button 
              onClick={() => setDialogOpen(true)}
              data-testid="button-create-first-project"
              className="bg-primary-500 hover:bg-primary-600 text-white elevation-2"
            >
              <Plus className="w-4 h-4 mr-2" />
              最初のプロジェクトを作成
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-semibold text-on-surface">あなたのプロジェクト</h2>
              <p className="text-secondary-500">{projects.length}個のプロジェクト</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card 
                  key={project.id} 
                  className="card-hover material-transition cursor-pointer elevation-1 bg-surface-50"
                  onClick={() => setLocation(`/project/${project.id}`)}
                  data-testid={`card-project-${project.id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg font-medium text-on-surface truncate" data-testid={`text-project-title-${project.id}`}>
                            {project.title}
                          </CardTitle>
                          <p className="text-sm text-secondary-500" data-testid={`text-project-genre-${project.id}`}>
                            {project.genre}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {project.description && (
                      <p className="text-sm text-secondary-600 line-clamp-2" data-testid={`text-project-description-${project.id}`}>
                        {project.description}
                      </p>
                    )}
                    
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-secondary-500">進捗</span>
                        <span className="text-primary-600 font-medium" data-testid={`text-project-progress-${project.id}`}>
                          {project.currentStep}/6 {getStepName(project.currentStep)}
                        </span>
                      </div>
                      <div className="w-full bg-surface-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full material-transition" 
                          style={{ width: `${(project.currentStep / 6) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-xs text-secondary-500 pt-2 border-t border-surface-300">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span data-testid={`text-project-updated-${project.id}`}>
                          {new Date(project.updatedAt).toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>AI支援</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
