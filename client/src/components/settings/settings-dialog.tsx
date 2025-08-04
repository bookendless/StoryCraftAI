import { useState } from "react";
import { useTheme } from "@/contexts/theme-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Moon, Sun, Monitor } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function SettingsDialog() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [apiProvider, setApiProvider] = useState(() => localStorage.getItem("api-provider") || "openai");
  const [apiModel, setApiModel] = useState(() => localStorage.getItem("api-model") || "gpt-4o");
  const [apiKey, setApiKey] = useState("");
  const [apiEndpoint, setApiEndpoint] = useState(() => localStorage.getItem("api-endpoint") || "");

  const handleSaveApiSettings = () => {
    if (apiKey) {
      localStorage.setItem(`${apiProvider}-api-key`, apiKey);
    }
    if (apiEndpoint) {
      localStorage.setItem("api-endpoint", apiEndpoint);
    }
    localStorage.setItem("api-provider", apiProvider);
    localStorage.setItem("api-model", apiModel);
    
    toast({
      title: "設定を保存しました",
      description: "API設定が正常に保存されました。",
    });
    setApiKey("");
  };

  const getModelOptions = (provider: string) => {
    switch (provider) {
      case "openai":
        return [
          { value: "gpt-4o", label: "GPT-4o" },
          { value: "gpt-4o-mini", label: "GPT-4o Mini" },
          { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
          { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" }
        ];
      case "google":
        return [
          { value: "gemini-2.0-flash-exp", label: "Gemini 2.0 Flash" },
          { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
          { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" }
        ];
      case "anthropic":
        return [
          { value: "claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
          { value: "claude-3-haiku", label: "Claude 3 Haiku" }
        ];
      default:
        return [];
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case "light": return <Sun className="w-4 h-4" />;
      case "dark": return <Moon className="w-4 h-4" />;
      case "system": return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          data-testid="button-settings"
        >
          <Settings className="w-4 h-4" />
          <span className="sr-only">設定</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md" data-testid="dialog-settings">
        <DialogHeader>
          <DialogTitle>設定</DialogTitle>
          <DialogDescription>
            アプリケーションの設定を変更できます。
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* テーマ設定 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                {getThemeIcon()}
                テーマ
              </CardTitle>
              <CardDescription>
                表示テーマを選択してください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger data-testid="select-theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">ライト</SelectItem>
                  <SelectItem value="dark">ダーク</SelectItem>
                  <SelectItem value="system">システム</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* API設定 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">AI API設定</CardTitle>
              <CardDescription>
                使用するAI APIプロバイダーを選択してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-provider">プロバイダー</Label>
                <Select value={apiProvider} onValueChange={setApiProvider}>
                  <SelectTrigger data-testid="select-api-provider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                    <SelectItem value="google">Google (Gemini)</SelectItem>
                    <SelectItem value="cohere">Cohere</SelectItem>
                    <SelectItem value="custom">カスタム</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-key">APIキー</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="APIキーを入力"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  data-testid="input-api-key"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-model">AIモデル</Label>
                <Select value={apiModel} onValueChange={setApiModel}>
                  <SelectTrigger data-testid="select-api-model">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getModelOptions(apiProvider).map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(apiProvider === "custom" || apiEndpoint) && (
                <div className="space-y-2">
                  <Label htmlFor="api-endpoint">カスタムエンドポイント</Label>
                  <Input
                    id="api-endpoint"
                    placeholder="https://api.example.com/v1"
                    value={apiEndpoint}
                    onChange={(e) => setApiEndpoint(e.target.value)}
                    data-testid="input-api-endpoint"
                  />
                </div>
              )}

              <Button 
                onClick={handleSaveApiSettings} 
                className="w-full"
                data-testid="button-save-api-settings"
              >
                API設定を保存
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}