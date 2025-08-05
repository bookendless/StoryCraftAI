import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, FileText, Clock, RotateCcw } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SynopsisVersion {
  id: string;
  content: string;
  version: number;
  createdAt: string;
  isActive: boolean;
}

interface SynopsisHistoryProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onRestore: (content: string) => void;
}

export function SynopsisHistory({ projectId, isOpen, onClose, onRestore }: SynopsisHistoryProps) {
  const { toast } = useToast();
  
  const { data: versions = [], isLoading } = useQuery<SynopsisVersion[]>({
    queryKey: ["/api/projects", projectId, "synopsis", "versions"],
    enabled: isOpen,
  });

  const restoreMutation = useMutation({
    mutationFn: async (versionId: string) => {
      const version = versions.find(v => v.id === versionId);
      if (!version) throw new Error("バージョンが見つかりません");
      return version.content;
    },
    onSuccess: (content) => {
      onRestore(content);
      toast({
        title: "復元完了",
        description: "選択したバージョンを復元しました。",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "バージョンの復元に失敗しました。",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <History className="w-5 h-5 text-primary-500" />
            <DialogTitle>あらすじバージョン履歴</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
              <p className="text-secondary-500">まだバージョン履歴がありません</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {versions.map((version, index) => (
                  <div
                    key={version.id}
                    className={`border rounded-lg p-4 ${version.isActive ? 'bg-primary-50 border-primary-200' : 'bg-white border-gray-200'}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-secondary-800">
                            バージョン {version.version}
                          </span>
                          {version.isActive && (
                            <Badge variant="default" className="bg-primary-500">
                              現在
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1 text-xs text-secondary-500">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(version.createdAt)}</span>
                        </div>
                        {!version.isActive && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => restoreMutation.mutate(version.id)}
                            disabled={restoreMutation.isPending}
                            data-testid={`button-restore-version-${version.id}`}
                          >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            復元
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-white rounded border p-3">
                      <p className="text-sm text-secondary-700 leading-relaxed">
                        {version.content.length > 200 
                          ? `${version.content.substring(0, 200)}...` 
                          : version.content}
                      </p>
                      {version.content.length > 200 && (
                        <button className="text-xs text-primary-500 mt-2 hover:underline">
                          全文を表示
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}