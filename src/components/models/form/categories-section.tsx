import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Category } from '@/types';
import { UseFormReturn } from 'react-hook-form';

interface CategoriesSectionProps {
  form: UseFormReturn<any>;
  categories: Category[];
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
}

export function CategoriesSection({ 
  form, 
  categories,
  selectedCategories,
  setSelectedCategories 
}: CategoriesSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <FormLabel>Categories</FormLabel>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCategories.map(id => {
            const category = categories.find(c => c.id === id);
            if (!category) return null;
            return (
              <Badge
                key={id}
                variant="secondary"
                className="pl-2 hover:bg-secondary/80 cursor-pointer"
                onClick={() => {
                  const newSelection = selectedCategories.filter(c => c !== id);
                  setSelectedCategories(newSelection);
                  form.setValue('categories', newSelection);
                }}
              >
                {category.name}
                <X className="ml-1 h-3 w-3" />
              </Badge>
            );
          })}
        </div>
      )}
      
      <div className="border rounded-lg">
        <ScrollArea className="max-h-[50vh]">
          <div className="p-4 space-y-2">
            <p className="text-sm text-muted-foreground mb-4 bg-muted/50 p-3 rounded-lg">
              Can't find a category? You can create new categories in{' '}
              <Link to="/settings" className="text-primary hover:underline font-medium">
                Settings → Categories
              </Link>
            </p>

            {categories
              .filter(category => 
                category.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((category) => {
                const isSelected = selectedCategories.includes(category.id);
                return (
                  <div
                    key={category.id}
                    className="flex items-center space-x-2 hover:bg-secondary/50 p-2 rounded-md cursor-pointer"
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        const updatedSelection = checked
                          ? [...selectedCategories, category.id]
                          : selectedCategories.filter(id => id !== category.id);
                        setSelectedCategories(updatedSelection);
                        form.setValue('categories', updatedSelection, { shouldValidate: true });
                      }}
                    />
                    <span className="text-sm">{category.name}</span>
                  </div>
                );
              })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}