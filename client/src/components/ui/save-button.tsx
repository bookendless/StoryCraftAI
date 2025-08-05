import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save, Download, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SaveButtonProps {
  projectId?: string;
  variant?: "save" | "export";
  className?: string;
}

export function SaveButton({ projectId, variant = "save", className }: SaveButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/save");
      const result = await response.json();
      
      if (result.success) {
        setIsSaved(true);
        toast({
          title: "保存完了",
          description: "プロジェクトデータが正常に保存されました。",
        });
        
        // 3秒後にアイコンをリセット
        setTimeout(() => setIsSaved(false), 3000);
      }
    } catch (error) {
      toast({
        title: "保存エラー",
        description: "データの保存に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    try {
      const response = await apiRequest("GET", `/api/projects/${projectId}/export`);
      const exportData = await response.json();
      
      // JSON形式でダウンロード
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json"
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${exportData.project.title}_full_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "エクスポート完了",
        description: "プロジェクトの完全データをダウンロードしました。",
      });
    } catch (error) {
      toast({
        title: "エクスポートエラー",
        description: "データのエクスポートに失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "export") {
    return (
      <Button
        onClick={handleExport}
        disabled={isLoading || !projectId}
        className={className}
        data-testid="button-export"
      >
        <Download className="h-4 w-4 mr-2" />
        {isLoading ? "エクスポート中..." : "詳細エクスポート"}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleSave}
      disabled={isLoading}
      className={className}
      data-testid="button-save"
    >
      {isSaved ? (
        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
      ) : (
        <Save className="h-4 w-4 mr-2" />
      )}
      {isLoading ? "保存中..." : isSaved ? "保存済み" : "手動保存"}
    </Button>
  );
}