import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useAIGeneration() {
  const { toast } = useToast();

  const generateCharactersMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/characters/generate`);
      return response.json();
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "キャラクター生成に失敗しました。",
        variant: "destructive",
      });
    },
  });

  const generatePlotMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/plot/generate`);
      return response.json();
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "プロット生成に失敗しました。",
        variant: "destructive",
      });
    },
  });

  const generateSynopsisMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/synopsis/generate`);
      return response.json();
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "あらすじ生成に失敗しました。",
        variant: "destructive",
      });
    },
  });

  const generateChaptersMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/chapters/generate`);
      return response.json();
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "章立て生成に失敗しました。",
        variant: "destructive",
      });
    },
  });

  const generateEpisodesMutation = useMutation({
    mutationFn: async (chapterId: string) => {
      const response = await apiRequest("POST", `/api/chapters/${chapterId}/episodes/generate`);
      return response.json();
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "エピソード生成に失敗しました。",
        variant: "destructive",
      });
    },
  });

  const generateDraftMutation = useMutation({
    mutationFn: async ({ episodeId, tone }: { episodeId: string; tone: string }) => {
      const response = await apiRequest("POST", `/api/episodes/${episodeId}/drafts/generate`, { tone });
      return response.json();
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "草案生成に失敗しました。",
        variant: "destructive",
      });
    },
  });

  return {
    generateCharacters: generateCharactersMutation.mutate,
    generatePlot: generatePlotMutation.mutate,
    generateSynopsis: generateSynopsisMutation.mutate,
    generateChapters: generateChaptersMutation.mutate,
    generateEpisodes: generateEpisodesMutation.mutate,
    generateDraft: generateDraftMutation.mutate,
    isGeneratingCharacters: generateCharactersMutation.isPending,
    isGeneratingPlot: generatePlotMutation.isPending,
    isGeneratingSynopsis: generateSynopsisMutation.isPending,
    isGeneratingChapters: generateChaptersMutation.isPending,
    isGeneratingEpisodes: generateEpisodesMutation.isPending,
    isGeneratingDraft: generateDraftMutation.isPending,
  };
}

export function useAISuggestions() {
  const { toast } = useToast();

  const getCharacterSuggestionsMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/characters/generate`);
      return response.json();
    },
    onSuccess: (suggestions) => {
      toast({
        title: "AI提案完了",
        description: `${suggestions.length}個のキャラクター案を生成しました。`,
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

  const getPlotSuggestionMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/plot/generate`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "AI提案完了",
        description: "プロット構成案を生成しました。",
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

  return {
    getCharacterSuggestions: getCharacterSuggestionsMutation.mutate,
    getPlotSuggestion: getPlotSuggestionMutation.mutate,
    characterSuggestions: getCharacterSuggestionsMutation.data,
    plotSuggestion: getPlotSuggestionMutation.data,
    isLoadingCharacterSuggestions: getCharacterSuggestionsMutation.isPending,
    isLoadingPlotSuggestion: getPlotSuggestionMutation.isPending,
  };
}
