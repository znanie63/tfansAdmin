import { UserCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function EmptyState() {
  return (
    <Card className="w-full min-h-[400px]">
      <CardContent className="flex flex-col items-center justify-center py-24 px-4">
        <UserCircle2 className="h-16 w-16 text-muted-foreground/50" />
        <h3 className="mt-6 text-xl font-medium">No models found</h3>
        <p className="mt-2 text-sm text-center text-muted-foreground max-w-[420px]">
          We couldn't find any models matching your search.
        </p>
      </CardContent>
    </Card>
  );
}