import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layout/app-layout";
import Characters from "@/components/steps/characters";
import Plot from "@/components/steps/plot.tsx";
import Synopsis from "@/components/steps/synopsis.tsx";
import Chapters from "@/components/steps/chapters.tsx";
import Episodes from "@/components/steps/episodes.tsx";
import Draft from "@/components/steps/draft.tsx";
import type { Project } from "@shared/schema";

const stepComponents = {
  1: Characters,
  2: Plot,
  3: Synopsis,
  4: Chapters,
  5: Episodes,
  6: Draft,
};

export default function ProjectPage() {
  const { id } = useParams();
  
  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ["/api/projects", id],
  });

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

  if (!project) {
    return (
      <div className="min-h-screen bg-surface-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">プロジェクトが見つかりません</h1>
          <p className="text-secondary-500">指定されたプロジェクトは存在しないか、削除された可能性があります。</p>
        </div>
      </div>
    );
  }

  const StepComponent = stepComponents[project.currentStep as keyof typeof stepComponents] || Characters;

  return (
    <AppLayout project={project}>
      <StepComponent projectId={project.id} />
    </AppLayout>
  );
}
