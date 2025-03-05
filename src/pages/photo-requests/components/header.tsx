import { Image } from 'lucide-react';

export function Header() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <Image className="h-8 w-8 text-primary/80" />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Photo Requests</h1>
        </div>
        <p className="text-muted-foreground text-sm sm:text-base">
          Manage and respond to user photo requests
        </p>
      </div>
    </div>
  );
}