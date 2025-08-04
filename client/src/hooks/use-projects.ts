import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project, InsertProject } from "@shared/schema";

export function useProjects() {
  const { toast } = useToast();

  const projectsQuery = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const createProjectMutation = useMutation({
    mutationFn: async (project: InsertProject) => {
      const response = await apiRequest("POST", "/api/projects", project);
      return response.json();
    },
    onSuccess: (project: Project) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "プロジェクト作成完了",
        description: `「${project.title}」を作成しました。`,
      });
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "プロジェクトの作成に失敗しました。",
        variant: "destructive",
      });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Project>) => {
      const response = await apiRequest("PATCH", `/api/projects/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "更新完了",
        description: "プロジェクト情報を更新しました。",
      });
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "プロジェクトの更新に失敗しました。",
        variant: "destructive",
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "削除完了",
        description: "プロジェクトを削除しました。",
      });
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "プロジェクトの削除に失敗しました。",
        variant: "destructive",
      });
    },
  });

  return {
    projects: projectsQuery.data || [],
    isLoading: projectsQuery.isLoading,
    error: projectsQuery.error,
    createProject: createProjectMutation.mutate,
    updateProject: updateProjectMutation.mutate,
    deleteProject: deleteProjectMutation.mutate,
    isCreating: createProjectMutation.isPending,
    isUpdating: updateProjectMutation.isPending,
    isDeleting: deleteProjectMutation.isPending,
  };
}

export function useProject(id: string) {
  const { toast } = useToast();

  const projectQuery = useQuery<Project>({
    queryKey: ["/api/projects", id],
    enabled: !!id,
  });

  const updateProjectMutation = useMutation({
    mutationFn: async (updates: Partial<Project>) => {
      const response = await apiRequest("PATCH", `/api/projects/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "プロジェクトの更新に失敗しました。",
        variant: "destructive",
      });
    },
  });

  return {
    project: projectQuery.data,
    isLoading: projectQuery.isLoading,
    error: projectQuery.error,
    updateProject: updateProjectMutation.mutate,
    isUpdating: updateProjectMutation.isPending,
  };
}
