import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  imageUrl?: string;
  onImageChange: (imageUrl: string | null) => void;
  placeholder?: string;
  className?: string;
}

export function ImageUpload({ imageUrl, onImageChange, placeholder = "画像をアップロード", className = "" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "エラー",
        description: "画像ファイルを選択してください。",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      toast({
        title: "エラー",
        description: "ファイルサイズは10MB以下にしてください。",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // ローカル開発用：ファイルをBase64で変換して直接使用
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        console.log('画像をBase64に変換完了:', base64String.substring(0, 50) + '...');
        onImageChange(base64String);
      };
      reader.readAsDataURL(file);

      toast({
        title: "成功",
        description: "画像がアップロードされました。",
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "エラー",
        description: "画像のアップロードに失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    onImageChange(null);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-image-file"
      />

      {imageUrl ? (
        <div className="relative group">
          <img
            src={imageUrl}
            alt="アップロード画像"
            className="w-full h-48 object-cover rounded-lg border-2 border-border"
            onError={(e) => {
              // Lorem Picsumが失敗した場合は別の画像を試す
              if (!e.currentTarget.src.includes('placeholder')) {
                e.currentTarget.src = 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=画像が見つかりません';
              }
            }}
            data-testid="img-uploaded"
          />
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity floating-icon-button"
            onClick={handleRemoveImage}
            data-testid="button-remove-image"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className="w-full h-48 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={handleButtonClick}
          data-testid="area-image-drop"
        >
          <Image className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground text-center">
            {placeholder}<br />
            クリックして画像を選択
          </p>
        </div>
      )}

      <Button
        variant="outline"
        onClick={handleButtonClick}
        disabled={isUploading}
        className="w-full floating-button-outline"
        data-testid="button-upload-image"
      >
        <Upload className="h-4 w-4 mr-2" />
        {isUploading ? "アップロード中..." : "画像を選択"}
      </Button>
    </div>
  );
}