import {
  Users,
  LayoutDashboard,
  UserCircle,
  Target,
  MessageSquare,
  Image,
  Settings,
  Star
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
    icon: Star,
    href: '/reviews'
  },
  {
    title: 'Photo Requests',
    icon: Image,
    href: '/photo-requests'
  },
  {
    title: 'Users',
    icon: Users,
    href: '/users'
  },
  {
    title: 'Settings',
    icon: Settings,
    href: '/settings'
  },
];