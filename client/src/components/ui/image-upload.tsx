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
      // プリサインURLを取得
      const uploadResponse = await fetch('/api/objects/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('アップロードURLの取得に失敗しました');
      }

      const { uploadURL } = await uploadResponse.json();

      // ファイルをアップロード
      const formData = new FormData();
      formData.append('file', file);

      const uploadFileResponse = await fetch(uploadURL, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadFileResponse.ok) {
        throw new Error('ファイルのアップロードに失敗しました');
      }

      // アップロードされた画像のパスを正しく設定
      console.log('Upload URL:', uploadURL);
      const url = new URL(uploadURL);
      const pathParts = url.pathname.split('/');
      console.log('Path parts:', pathParts);
      
      // パスから uploads/ を取得して、objects パスに変換
      const objectName = pathParts.slice(2).join('/'); // バケット名を除く
      console.log('Object name:', objectName);
      
      // オブジェクトストレージのパス形式に変換
      const objectPath = `/objects/${objectName}`;
      console.log('Final object path:', objectPath);
      
      onImageChange(objectPath);

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
            src={imageUrl.startsWith('/objects/') ? imageUrl : `/public-objects/${imageUrl}`}
            alt="アップロード画像"
            className="w-full h-48 object-cover rounded-lg border-2 border-border"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzk3YTNiNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuOBv+OBpOOBi+OCiuOBvuOBm+OCkzwvdGV4dD4KPC9zdmc+';
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