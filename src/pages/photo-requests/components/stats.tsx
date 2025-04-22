import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Image, Video } from 'lucide-react'; 

interface RequestStats {
  found: number;
  not_found: number;
  cancel: number;
  completed: number;
  totalSpent: number;
}

interface PhotoVideoStats {
  photo: RequestStats;
  video: RequestStats;
}

interface StatsProps {
  stats: PhotoVideoStats;
  activeTab: 'photos' | 'videos';
}

export function Stats({ stats, activeTab }: StatsProps) {
  // Get the active stats based on the current tab
  const activeStats = activeTab === 'photos' ? stats.photo : stats.video;
  
  return (
    <div className="grid gap-4 sm:grid-cols-4">
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500">Found</Badge>
            </div>
            <p className="text-lg font-bold flex items-center">
              {activeStats.found || 0}
              <span className="ml-2">
                {activeTab === 'photos' ? (
                  <Image className="h-4 w-4 text-emerald-500/70" />
                ) : (
                  <Video className="h-4 w-4 text-emerald-500/70" />
                )}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-500">Not Found</Badge>
            </div>
            <p className="text-lg font-bold flex items-center">
              {activeStats.not_found || 0}
              <span className="ml-2">
                {activeTab === 'photos' ? (
                  <Image className="h-4 w-4 text-amber-500/70" />
                ) : (
                  <Video className="h-4 w-4 text-amber-500/70" />
                )}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary" className="bg-red-500/10 text-red-500">Cancelled</Badge>
            </div>
            <p className="text-lg font-bold flex items-center">
              {activeStats.cancel || 0}
              <span className="ml-2">
                {activeTab === 'photos' ? (
                  <Image className="h-4 w-4 text-red-500/70" />
                ) : (
                  <Video className="h-4 w-4 text-red-500/70" />
                )}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary" className="bg-green-500/10 text-green-500">Completed</Badge>
            </div>
            <p className="text-lg font-bold flex items-center">
              {activeStats.completed || 0}
              <span className="ml-2">
                {activeTab === 'photos' ? (
                  <Image className="h-4 w-4 text-green-500/70" />
                ) : (
                  <Video className="h-4 w-4 text-green-500/70" />
                )}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}