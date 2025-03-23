import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Category } from '@/types';
import { FolderX } from 'lucide-react';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategories: string[];
  showUncategorized: boolean;
  onCategoryChange: (categoryId: string) => void;
  onUncategorizedChange: () => void;
}

export function CategoryFilter({ 
  categories, 
  selectedCategories, 
  showUncategorized,
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
        Uncategorized
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
          {category.name}
        </Button>
      ))}
    </div>
  );
}