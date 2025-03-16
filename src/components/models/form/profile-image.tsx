import { useRef } from 'react';
import { Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProfileImageProps {
  previewImage: string;
  onImageChange: (file: File) => void;
}

export function ProfileImage({ previewImage, onImageChange }: ProfileImageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('File must be an image');
        return;
      }

      onImageChange(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div 
        className="relative w-32 h-32 sm:w-40 sm:h-40 group cursor-pointer" 
        onClick={handleUploadClick}
      >
        {previewImage ? (
          <img
            key={previewImage}
            src={previewImage}
            alt="Preview"
            className="w-full h-full object-cover rounded-full ring-2 ring-muted transition-all group-hover:ring-primary"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center border-2 border-dashed rounded-full bg-muted/5 transition-all group-hover:border-primary/50 group-hover:bg-muted/10">
            <Upload className="h-8 w-8 text-muted-foreground transition-all group-hover:text-primary" />
          </div>
        )}
        <Input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Upload className="h-6 w-6 text-white" />
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Click to upload profile photo (max 5MB)
      </p>
    </div>
  );
}