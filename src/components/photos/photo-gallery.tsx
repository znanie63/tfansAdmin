import { useState } from 'react';
import { Image, Upload } from 'lucide-react';
import { ModelPhoto } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface PhotoGalleryProps {
  photos: ModelPhoto[];
  loading?: boolean;
  onSelectPhoto: (photo: ModelPhoto) => void;
}

export function PhotoGallery({ photos, loading = false, onSelectPhoto }: PhotoGalleryProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!photos.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Image className="h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium">No photos available</h3>
        <p className="mt-2 text-sm text-muted-foreground text-center">
          This model doesn't have any photos in their gallery yet.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="group relative aspect-[3/4] rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
            onClick={() => onSelectPhoto(photo)}
          >
            <img
              src={photo.image}
              alt="Model photo"
              className="w-full h-full object-cover transition-all duration-200 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center">
              <Upload className="h-6 w-6 text-white" />
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}