import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCircle,
  Target,
  MessageSquare,
  Image,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const location = useLocation();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: '/'
    },
    {
      title: 'Models',
      icon: UserCircle,
      href: '/models'
    },
    {
      title: 'Tasks',
      icon: Target,
      href: '/tasks'
    },
    {
      title: 'Chats',
      icon: MessageSquare,
      href: '/chats'
    },
    {
      title: 'Photos',
      icon: Image,
      href: '/photo-requests'
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <nav className="flex justify-around items-center h-16 px-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              'flex flex-col items-center justify-center flex-1 h-full px-2',
              'transition-all duration-200 hover:scale-[0.97]',
              location.pathname === item.href
                ? 'text-primary font-medium -translate-y-[2px]'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <item.icon className={cn(
              "h-5 w-5 mb-1",
              location.pathname === item.href
                ? "text-primary"
                : "text-muted-foreground"
            )} />
            <span className="text-xs font-medium mt-1">{item.title}</span>
          </Link>
        ))}
      </nav>
    </nav>
  );
}