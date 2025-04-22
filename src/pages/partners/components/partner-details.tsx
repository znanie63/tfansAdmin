import { Partner } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserPlus, Mail, Hash, Clock, Users } from 'lucide-react';

interface PartnerDetailsProps {
  partner: Partner | null;
  onClose: () => void;
}

export function PartnerDetails({ partner, onClose }: PartnerDetailsProps) {
  if (!partner) return null;

  return (
    <Dialog open={!!partner} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Partner Details
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(80vh-100px)]">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <Mail className="h-4 w-4" />
                <Label>Email</Label>
              </div>
              <p className="text-sm">{partner.email}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <UserPlus className="h-4 w-4" />
                <Label>Name</Label>
              </div>
              <p className="text-sm">{partner.firstName}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <Hash className="h-4 w-4" />
                <Label>Referral Code</Label>
              </div>
              <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                {partner.referralCode}
              </code>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <Users className="h-4 w-4" />
                <Label>Total Referrals</Label>
              </div>
              <p className="text-sm">{partner.referralCount || 0} users</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <Clock className="h-4 w-4" />
                <Label>Joined</Label>
              </div>
              <p className="text-sm">
                {new Date(partner.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            {partner.notes && (
              <div className="space-y-2">
                <Label className="text-primary">Notes</Label>
                <div className="rounded-lg border bg-muted/50 p-3">
                  <p className="text-sm whitespace-pre-wrap">{partner.notes}</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}