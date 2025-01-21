import {
  Users,
  LayoutDashboard,
  UserCircle,
  Target,
  MessageSquare,
} from 'lucide-react';

export const menuItems = [
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
    href: '/chats',
    badge: (chats: any[]) => chats.filter(chat => chat.type === 'photo_request').length
  },
  {
    title: 'Reviews',
    icon: MessageSquare,
    href: '/reviews'
  },
  {
    title: 'Users',
    icon: Users,
    href: '/users'
  },
];