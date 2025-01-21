import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { SidebarContent } from './sidebar-content';

export function MobileHeader() {
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 px-4 py-3 bg-background border-b z-50">
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            className="h-9 w-9 p-0 hover:bg-secondary/80 transition-colors"
          >
            <Menu className="h-5 w-5 text-foreground/70" />
          </Button>
        </SheetTrigger>
        <SheetContent 
          side="left" 
          className="w-80 p-0 pt-14 bg-background"
        >
          <SidebarContent />
        </SheetContent>
      </Sheet>
      <div className="text-center font-semibold">TFans Admin</div>
    </div>
  );
}