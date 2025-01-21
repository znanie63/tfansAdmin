import { useState } from 'react';
import { cn } from '@/lib/utils';
import { MobileHeader } from './mobile-header';
import { SidebarContent } from './sidebar-content';
import { ToggleButton } from './toggle-button';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <MobileHeader />

      <aside className={cn(
        "pb-12 min-h-screen border-r transition-all duration-300 sticky top-0 flex-shrink-0",
        "bg-background",
        collapsed ? "w-[70px]" : "w-64"
      )}>
        <div className="hidden md:block">
          <SidebarContent collapsed={collapsed} />
          <ToggleButton
            collapsed={collapsed}
            onToggle={() => setCollapsed(!collapsed)}
          />
        </div>
      </aside>
    </>
  );
}