import React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import * as z from 'zod';
import { Upload, X, Hash, Video, Lock } from 'lucide-react';
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
  videoFile: z.instanceof(File)
    .refine(file => file.type.startsWith('video/'), 'File must be a video'),
  description: z.string(),
  isPrivate: z.boolean()
});

interface ModelVideoFormProps {
  onSubmit: (data: { videoFile: File; description: string; isPrivate: boolean }) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ModelVideoForm({ onSubmit, onCancel, isSubmitting = false }: ModelVideoFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      isPrivate: false
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        form.setError('videoFile', { message: 'File must be a video' });
        return;
      }
      
      setSelectedFile(file);
      form.setValue('videoFile', file);
      setPreviewUrl(URL.createObjectURL(file));
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
    const file = e.dataTransfer.files?.[0];
    
    if (file) {
      if (!file.type.startsWith('video/')) {
        form.setError('videoFile', { message: 'File must be a video' });
        return;
      }

      setSelectedFile(file);
      form.setValue('videoFile', file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    if (!selectedFile) {
      form.setError('videoFile', { message: 'Please select a video' });
      return;
    }
    onSubmit({
      videoFile: selectedFile,
      description: values.description,
      isPrivate: values.isPrivate
    });
  };

  const removeVideo = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto" autoFocus={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column - Video preview */}
          <div>
            <div
              className="relative flex flex-col items-center justify-center w-full rounded-lg transition-all"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleUploadClick}
            >
              {previewUrl ? ( 
                <div className="relative aspect-[9/16] w-[200px] mx-auto rounded-lg overflow-hidden bg-muted/50">
                  <video
                    src={previewUrl}
                    className="w-full h-full object-cover"
                    controls
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeVideo();
                    }}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <div className={cn(
                  "w-[200px] mx-auto aspect-[9/16] flex flex-col items-center justify-center",
                  "border-2 border-dashed rounded-lg transition-all",
                  isDragging
                    ? "border-primary/50 bg-primary/5 cursor-grab"
                    : "border-muted hover:border-primary/50 bg-muted/5 hover:bg-muted/10 cursor-pointer"
                )}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Upload className="h-6 w-6 mb-1.5 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground text-center px-4 max-w-[280px]">
                    Click or drag and drop to upload video
                  </p>
                </div>
              )}
            </div>
            {form.formState.errors.videoFile && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.videoFile.message}
              </p>
            )}
          </div>
          
          {/* Right column - Settings */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-normal">Private Video</Label>
              </div>
              <FormField
                control={form.control}
                name="isPrivate"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Hash className="h-4 w-4 text-primary" />
                <Label className="text-sm font-normal">Keywords</Label>
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Add search keywords separated by commas (e.g., beach, sunset, casual, summer)"
                        className="h-[200px] text-sm resize-none bg-muted/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-6">
          <Button 
            type="submit" 
            size="default" 
            className="flex-1"
            disabled={!selectedFile || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                Uploading...
              </>
            ) : (
              'Upload Video'
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