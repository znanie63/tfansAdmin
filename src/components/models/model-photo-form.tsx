import React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import * as z from 'zod';
import { Upload, X, Hash, ImageIcon } from 'lucide-react';
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
  imageFiles: z.array(z.instanceof(File))
    .min(1, 'Please select at least one image')
    .max(10, 'Maximum 10 photos allowed')
    .transform(files => files.map(file => ({ file, description: '' }))),
  descriptions: z.array(z.string())
});

interface ModelPhotoFormProps {
  onSubmit: (data: { imageFiles: { file: File; description: string }[] }) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ModelPhotoForm({ onSubmit, onCancel, isSubmitting = false }: ModelPhotoFormProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [descriptions, setDescriptions] = useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      imageFiles: [],
      descriptions: [],
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      form.setValue('imageFiles', files);
      setSelectedFiles(files);
      setDescriptions(new Array(files.length).fill(''));
      
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
      setDescriptions(new Array(files.length).fill(''));
      
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
    if (!selectedFiles.length) {
      form.setError('root', {
        type: 'manual',
        message: 'Please upload an image',
      });
      return;
    }
    onSubmit({
      imageFiles: selectedFiles.map((file, index) => ({
        file,
        description: descriptions[index] || ''
      }))
    });
  };

  const removeImage = (index: number) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setDescriptions(prev => prev.filter((_, i) => i !== index));
    form.setValue('imageFiles', selectedFiles.filter((_, i) => i !== index));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto" autoFocus={false}>
        <div className="space-y-6">
          <div
            className="relative flex flex-col items-center justify-center w-full rounded-lg transition-all"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleUploadClick}
          >
            {previewImages.length > 0 ? (
              <div className="w-full rounded-lg border bg-card">
                <div className="p-4 space-y-6">
                  <div className="space-y-4">
                    {previewImages.map((preview, index) => ( 
                      <div 
                        key={index} 
                        className={cn(
                          "relative rounded-lg bg-background/50",
                          "transition-all hover:shadow-sm p-4"
                        )}
                      >
                        <div className="flex gap-4">
                          <div className="relative aspect-[3/4] w-[200px] rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              className="absolute top-2 right-2 h-7 w-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(index);
                              }}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Hash className="h-4 w-4 text-primary" />
                              <Label className="text-sm font-normal">Keywords</Label>
                            </div>
                            <Textarea
                              placeholder="Add search keywords separated by commas (e.g., beach, sunset, casual, summer)"
                              value={descriptions[index] || ''}
                              onChange={(e) => {
                                const newDescriptions = [...descriptions];
                                newDescriptions[index] = e.target.value;
                                setDescriptions(newDescriptions);
                              }}
                              className="h-24 text-sm resize-none bg-muted/50"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className={cn(
                "w-full aspect-[4/3] flex flex-col items-center justify-center",
                "border-2 border-dashed rounded-lg transition-all",
                isDragging
                  ? "border-primary/50 bg-primary/5 cursor-grab"
                  : "border-muted hover:border-primary/50 bg-muted/5 hover:bg-muted/10 cursor-pointer"
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
                <p className="text-sm text-muted-foreground text-center px-4 max-w-[280px]">
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
          <Button 
            type="submit" 
            size="default" 
            className="flex-1"
            disabled={selectedFiles.length === 0 || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                Uploading...
              </>
            ) : (
              `Upload ${selectedFiles.length} Photo${selectedFiles.length !== 1 ? 's' : ''}`
            )}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="default" 
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