import { Link } from 'react-router-dom';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { mockChats } from '@/pages/chats/data/mock-chats';

interface NavItemProps {
  href: string;
  icon: LucideIcon;
  title: string;
  isActive: boolean;
  collapsed?: boolean;
  badge?: (data: any[]) => number;
}

export function NavItem({ href, icon: Icon, title, isActive, collapsed, badge }: NavItemProps) {
  const badgeCount = badge?.(mockChats);

  return (
    <Button
      variant={isActive ? 'secondary' : 'ghost'}
      className={cn(
        'w-full transition-all duration-200 hover:scale-[0.98]',
        collapsed ? 'h-12 justify-center px-2' : 'h-11 justify-start px-3',
        isActive && 'bg-secondary font-medium shadow-sm'
      )}
      asChild
    >
      <Link to={href}>
        <Icon className={cn(
          "h-5 w-5 transition-all shrink-0 text-foreground/70",
          collapsed ? "" : "mr-3"
        )} />
        {!collapsed && (
          <div className="flex items-center justify-between flex-1">
            <span className="text-sm font-medium text-foreground/70">{title}</span>
            {badgeCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {badgeCount}
              </Badge>
            )}
          </div>
        )}
      </Link>
    </Button>
  );
}