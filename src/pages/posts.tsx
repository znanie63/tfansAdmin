import { MessageSquareText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function Posts() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Posts</h1>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-center justify-center p-8">
            <MessageSquareText className="h-16 w-16 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}