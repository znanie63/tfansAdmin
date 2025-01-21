import { Model } from '@/types';
import {
  Languages,
  Ruler,
  CircleDotIcon,
  Weight,
  Link,
  Instagram,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ModelProfileProps {
  model: Model;
  onEdit: () => void;
  onDelete: () => void;
}

interface InfoItemProps {
  icon: any;
  label: string;
  value: string | number;
}

function InfoItem({ icon: Icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <span className="block text-muted-foreground mb-0.5">{label}</span>
        <span className="block font-medium break-all">{value}</span>
      </div>
    </div>
  );
}

export function ModelProfile({ model, onEdit, onDelete }: ModelProfileProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-[240px] w-full">
        <img
          src={model.profileImage}
          alt={model.nickname}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            {model.firstName} {model.lastName}
          </h2>
          <p className="text-sm text-white/70 mb-1">@{model.nickname}</p>
          <p className="text-sm text-white/90 line-clamp-2 max-w-[280px] mx-auto">
            "{model.quote}"
          </p>
        </div>
      </div>
      <Separator />
      <CardContent className="p-4 space-y-6 bg-card">
        <div className="space-y-4">
          <InfoItem
            icon={Languages} label="Languages" value={model.languages.join(', ')}
          />
          <InfoItem
            icon={Ruler} label="Height" value={`${model.height} cm`}
          />
          <InfoItem
            icon={Weight} label="Weight" value={`${model.weight} kg`}
          />
          {model.characteristics && Object.entries(model.characteristics).length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground mb-2">Characteristics</h3>
                {Object.entries(model.characteristics).map(([key, value]) => (
                  <InfoItem
                    key={key}
                    icon={CircleDotIcon}
                    label={key}
                    value={value}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        <Separator />
        {model.personality && (
          <>
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground mb-2">Personality</h3>
              <InfoItem
                icon={MessageSquare}
                label="Communication Style"
                value={model.personality.communicationStyle}
              />
              <div className="flex items-start gap-2 text-sm">
                <CircleDotIcon className="h-4 w-4 text-muted-foreground mt-1" />
                <div className="flex-1 min-w-0">
                  <span className="block text-muted-foreground mb-1.5">Personality Prompt</span>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {model.personality.prompt}
                  </p>
                </div>
              </div>
            </div>
            <Separator />
          </>
        )}
        <div className="space-y-4">
          <h3 className="font-medium text-sm text-muted-foreground mb-2">Social Links</h3>
          <InfoItem
            icon={Link} label="Chat" value={model.chatLink}
          />
          {model.instagramLink?.trim() && (
            <InfoItem
              icon={Instagram} label="Instagram" value={model.instagramLink}
            />
          )}
          {model.otherSocialLink?.trim() && (
            <InfoItem
              icon={Link} label="Other Social" value={model.otherSocialLink}
            />
          )}
        </div>
        <Separator />
        <div className="flex flex-col gap-2">
          <Button
            onClick={onEdit}
            variant="outline"
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Profile
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Profile</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this profile? This action cannot be undone and will permanently remove all associated data including posts and stories.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => document.querySelector('dialog')?.close()}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={onDelete}>
                  Delete Profile
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}