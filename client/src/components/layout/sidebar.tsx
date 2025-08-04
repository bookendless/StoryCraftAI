import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Menu, BookOpen, Users, History, FileText, 
  List, Film, PenTool, Download, Check, Edit, 
  Home
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SettingsDialog } from "@/components/settings/settings-dialog";
import type { Project } from "@shared/schema";

interface SidebarProps {
  project: Project;
  collapsed: boolean;
  onToggle: () => void;
}

const steps = [
  { id: 1, name: "キャラクター", description: "登場人物の設定", icon: Users },
  { id: 2, name: "プロット", description: "物語の骨組み", icon: History },
  { id: 3, name: "あらすじ", description: "概要の作成", icon: FileText },
  { id: 4, name: "章立て", description: "構成の設計", icon: List },
  { id: 5, name: "エピソード", description: "場面設計", icon: Film },
  { id: 6, name: "草案", description: "ドラフト作成", icon: PenTool },
];

export default function Sidebar({ project, collapsed, onToggle }: SidebarProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const updateStepMutation = useMutation({
    mutationFn: async (stepId: number) => {
      const response = await apiRequest("PATCH", `/api/projects/${project.id}`, {
        currentStep: stepId
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", project.id] });
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "ステップの更新に失敗しました。",
        variant: "destructive",
      });
    },
  });

  const handleStepClick = (stepId: number) => {
    if (stepId <= project.currentStep || stepId === project.currentStep + 1) {
      updateStepMutation.mutate(stepId);
    }
  };

  const getStepStatus = (stepId: number) => {
    if (stepId < project.currentStep) return "completed";
    if (stepId === project.currentStep) return "active";
    return "pending";
  };

  const getStepIcon = (step: typeof steps[0], status: string) => {
    const IconComponent = step.icon;
    if (status === "completed") {
      return <Check className="w-4 h-4 text-white" />;
    }
    if (status === "active") {
      return <Edit className="w-4 h-4 text-white" />;
    }
    return <IconComponent className="w-4 h-4 icon-menu-colorful" />;
  };

  return (
    <div 
      className={`bg-surface-50 border-r border-outline/20 material-transition flex flex-col elevation-1 ${
        collapsed ? "sidebar-collapsed" : "sidebar-expanded"
      } sidebar-transition`}
    >
      {/* Sidebar Header */}
      <div className="p-6 border-b border-outline/10">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-medium text-on-surface">ストーリービルダー</h1>
                <p className="text-xs icon-muted">AIと共創する</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            data-testid="button-toggle-sidebar"
            className="p-1 rounded-lg material-transition"
          >
            <Menu className="w-5 h-5 icon-colorful" />
          </Button>
        </div>
      </div>

      {/* Project Info */}
      {!collapsed && (
        <div className="p-6 border-b border-outline/10">
          <div className="bg-primary-50 rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-on-surface" data-testid="text-project-title">
                  {project.title}
                </h3>
                <p className="text-sm icon-muted" data-testid="text-project-genre">
                  {project.genre}
                </p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-secondary-500">進捗</span>
                <span className="text-primary-600 font-medium" data-testid="text-project-progress">
                  {project.currentStep}/6完了
                </span>
              </div>
              <Progress 
                value={(project.currentStep / 6) * 100} 
                className="h-2"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step Navigation */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        {!collapsed && (
          <h4 className="text-sm font-medium text-secondary-500 mb-4 uppercase tracking-wider">
            ワークフロー
          </h4>
        )}
        <nav className="space-y-2">
          {steps.map((step) => {
            const status = getStepStatus(step.id);
            const isClickable = step.id <= project.currentStep || step.id === project.currentStep + 1;
            
            return (
              <button
                key={step.id}
                onClick={() => isClickable && handleStepClick(step.id)}
                disabled={!isClickable}
                data-testid={`button-step-${step.id}`}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg material-transition group text-left ${
                  status === "active" 
                    ? "bg-primary-100 border border-primary-500/20" 
                    : "hover:bg-surface-200"
                } ${!isClickable ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  status === "completed" 
                    ? "bg-green-500" 
                    : status === "active"
                    ? "step-indicator active"
                    : "bg-surface-300"
                }`}>
                  {getStepIcon(step, status)}
                </div>
                
                {!collapsed && (
                  <div className="flex-1">
                    <div className={`font-medium ${
                      status === "active" ? "text-primary-600" : "text-on-surface"
                    }`}>
                      {step.id}. {step.name}
                    </div>
                    <div className={`text-xs ${
                      status === "active" ? "text-primary-500" : "text-secondary-500"
                    }`}>
                      {step.description}
                    </div>
                  </div>
                )}
                
                {!collapsed && status === "completed" && (
                  <Check className="w-4 h-4 icon-action-colorful" />
                )}
                
                {!collapsed && status === "active" && (
                  <Edit className="w-4 h-4 icon-action-colorful" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Back to Home and Export Section */}
      <div className="p-6 border-t border-outline/10 space-y-3">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setLocation("/")}
            data-testid="button-back-home"
            className={`${collapsed ? "w-full" : "flex-1 mr-2"}`}
          >
            <Home className="w-4 h-4 icon-button-colorful" />
            {!collapsed && <span className="ml-2">ホームに戻る</span>}
          </Button>
          
          {!collapsed && (
            <SettingsDialog />
          )}
        </div>
        
        <Button 
          className={`w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 material-transition elevation-1 ${
            collapsed ? "px-3" : ""
          }`}
          data-testid="button-export"
        >
          <Download className="w-4 h-4 icon-button-colorful" />
          {!collapsed && <span className="ml-2">エクスポート</span>}
        </Button>
        
        {collapsed && (
          <div className="flex justify-center">
            <SettingsDialog />
          </div>
        )}
      </div>
    </div>
  );
}
