import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { menuItems } from './menu-items';
import { NavItem } from './nav-item';
import { UserNav } from '@/components/layout/user-nav';

interface SidebarContentProps {
  collapsed?: boolean;
}

export function SidebarContent({ collapsed }: SidebarContentProps) {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full py-6">
      <div className="px-3 flex-1">
        <h2 className={cn(
          "px-2 text-xl font-semibold tracking-tight transition-all duration-200",
          collapsed ? "opacity-0" : "opacity-100"
        )}>
          TFC Dashboard
        </h2>
        <nav className="space-y-1 mt-4">
          {menuItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              title={item.title}
              isActive={location.pathname === item.href}
              collapsed={collapsed}
            />
          ))}
        </nav>
      </div>
      <div className="px-3 mt-auto pt-4 border-t">
        <UserNav collapsed={collapsed} />
      </div>
    </div>
  );
}