import { Plus, UserCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ModelForm } from '@/components/models/model-form';
import { useState } from 'react';

interface HeaderProps {
  onCreateModel: (model: any) => Promise<void>;
}

export function Header({ onCreateModel }: HeaderProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      await onCreateModel(data);
      setIsDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <UserCircle2 className="h-8 w-8 text-primary/80" />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Models</h1>
        </div>
        <p className="text-muted-foreground text-sm sm:text-base">
          Manage models profiles and content
        </p>
      </div>
      <Button 
        size="lg" 
        className="w-full sm:w-auto"
        onClick={() => setIsDialogOpen(true)}
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Model
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={(open) => !isSubmitting && setIsDialogOpen(open)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Model Profile</DialogTitle>
          </DialogHeader>
          <ModelForm 
            key={isDialogOpen ? 'create-model-form' : undefined}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}