import React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  imageFiles: z.array(z.instanceof(File)).min(1, 'Please select at least one image'),
});

interface ModelPhotoFormProps {
  onSubmit: (data: { imageFiles: File[] }) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ModelPhotoForm({ onSubmit, onCancel, isSubmitting = false }: ModelPhotoFormProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      imageFiles: [],
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      form.setValue('imageFiles', files);
      setSelectedFiles(files);
      
      // Create previews for all files
      const previews = files.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(file);
        });
      });
      
      Promise.all(previews).then(setPreviewImages);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || [])
      .filter(file => file.type.startsWith('image/'));
    
    if (files.length > 0) {
      form.setValue('imageFiles', files);
      setSelectedFiles(files);
      
      // Create previews for all files
      const previews = files.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(file);
        });
      });
      
      Promise.all(previews).then(setPreviewImages);
    }
  };

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit({
      imageFiles: selectedFiles,
    });
  };

  const removeImage = (index: number) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    form.setValue('imageFiles', selectedFiles.filter((_, i) => i !== index));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" autoFocus={false}>
        <div className="space-y-4">
          <div
            className="relative flex flex-col items-center justify-center w-full rounded-lg transition-all"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleUploadClick}
          >
            {previewImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
                {previewImages.map((preview, index) => (
                  <div key={index} className="relative aspect-[3/4]">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className={cn(
                "w-full aspect-[4/3] flex flex-col items-center justify-center",
                "border-2 border-dashed rounded-lg transition-all",
                isDragging
                  ? "border-primary bg-primary/5 cursor-grab"
                  : "border-muted-foreground/25 hover:border-primary/50 bg-muted/5 hover:bg-muted/10 cursor-pointer"
              )}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                <p className="text-xs text-muted-foreground text-center px-4">
                  Click or drag and drop to upload photos
                </p>
              </div>
            )}
          </div>
        </div>

        {form.formState.errors.root && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.root.message}
          </p>
        )}

        <div className="flex items-center gap-2">
          <Button type="submit" size="sm" className="flex-1">
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                Uploading...
              </>
            ) : (
              'Upload Photo'
            )}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}