import { PanelLeft, PanelLeftClose } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ToggleButtonProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function ToggleButton({ collapsed, onToggle }: ToggleButtonProps) {
  return (
    <Button
      variant="ghost"
      className={cn(
        "absolute -right-4 top-6 h-8 w-8 rounded-full p-0 z-50",
        "border shadow-sm bg-background hover:bg-secondary/80",
        "hover:scale-105 active:scale-95",
        "transition-all duration-200"
      )}
      onClick={onToggle}
    >
      {collapsed ? (
        <PanelLeft className="h-4 w-4 text-foreground/70 hover:text-foreground transition-colors" />
      ) : (
        <PanelLeftClose className="h-4 w-4 text-foreground/70 hover:text-foreground transition-colors" />
      )}
    </Button>
  );
}