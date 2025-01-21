import { Search as SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function Search({ value, onChange, placeholder = "Search models by name..." }: SearchProps) {
  return (
    <div className="relative">
      <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 h-12 w-full bg-background"
      />
    </div>
  );
}