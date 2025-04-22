import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Category } from '@/types';
import { FolderX, Users } from 'lucide-react';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategories: string[];
  showUncategorized: boolean;
  counts: Record<string, number>;
  totalModels: number;
  onCategoryChange: (categoryId: string) => void;
  onUncategorizedChange: () => void;
}

export function CategoryFilter({ 
  categories, 
  selectedCategories, 
  showUncategorized,
  onCategoryChange,
  onUncategorizedChange 
}
)
export function CategoryFilter({ 
  categories, 
  selectedCategories, 
  showUncategorized, 
  counts,
  totalModels,
  onCategoryChange, 
  onUncategorizedChange 
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 pb-1">
      <Button
        variant={showUncategorized ? 'default' : 'outline'}
        size="sm"
        onClick={onUncategorizedChange}
        className={cn(
          "transition-colors",
          showUncategorized && "bg-primary/10 text-primary hover:bg-primary/20",
          !showUncategorized && "hover:bg-muted"
        )}
      >
        <FolderX className="h-4 w-4 mr-2" />
        <span className="flex items-center gap-2">
          Uncategorized
          <span className="px-1.5 py-0.5 text-xs rounded-md bg-muted/50">
            {counts['uncategorized'] || 0}
          </span>
        </span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="hover:bg-muted"
      >
        <Users className="h-4 w-4 mr-2" />
        <span className="flex items-center gap-2">
          All Models
          <span className="px-1.5 py-0.5 text-xs rounded-md bg-muted/50">
            {totalModels}
          </span>
        </span>
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategories.includes(category.id) ? 'default' : 'outline'}
          size="sm"
          onClick={() => onCategoryChange(category.id)}
          className={cn(
            "transition-colors",
            selectedCategories.includes(category.id) && "bg-primary/10 text-primary hover:bg-primary/20",
            !selectedCategories.includes(category.id) && "hover:bg-muted"
          )}
        >
          <span className="flex items-center gap-2">
            {category.name}
            <span className="px-1.5 py-0.5 text-xs rounded-md bg-muted/50">
              {counts[category.id] || 0}
            </span>
          </span>
        </Button>
      ))}
    </div>
  );
}