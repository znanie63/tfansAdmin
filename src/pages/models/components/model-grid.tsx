import { Model } from '@/types';
import { ModelCard } from '@/components/models/model-card';

interface ModelGridProps {
  models: Model[];
  onEdit: (model: Model) => void;
  onDelete: (model: Model) => void;
  onCreatePost: (model: Model) => void;
}

export function ModelGrid({ models, onEdit, onDelete, onCreatePost }: ModelGridProps) {
  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {models.map((model, index) => (
        <ModelCard
          key={`${model.id}-${index}`}
          model={model}
          onEdit={onEdit}
          onDelete={onDelete}
          onCreatePost={onCreatePost}
        />
      ))}
    </div>
  );
}