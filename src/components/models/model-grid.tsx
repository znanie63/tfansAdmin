import { Model } from '@/types';
import { ModelCard } from './model-card';

interface ModelGridProps {
  models: Model[];
  onEdit: (model: Model) => void;
  onDelete: (model: Model) => void;
  onCreatePost: (model: Model) => void;
}

export function ModelGrid({ models, onEdit, onDelete, onCreatePost }: ModelGridProps) {
  if (!models?.length) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {models.map((model) => (
        <ModelCard
          key={model.id}
          model={model}
          onEdit={onEdit}
          onDelete={onDelete}
          onCreatePost={onCreatePost}
        />
      ))}
    </div>
  );
}