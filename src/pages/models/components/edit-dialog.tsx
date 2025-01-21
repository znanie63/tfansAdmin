import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ModelForm } from '@/components/models/model-form';
import { Model } from '@/types';

interface EditDialogProps {
  model: Model | null;
  onClose: () => void;
  onSubmit: (model: Model) => void;
}

export function EditDialog({ model, onClose, onSubmit }: EditDialogProps) {
  if (!model) return null;

  return (
    <Dialog open={!!model} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Model Profile</DialogTitle>
        </DialogHeader>
        <ModelForm
          key={model.id}
          initialData={model}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}