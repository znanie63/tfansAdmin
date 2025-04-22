import {
  Users,
  LayoutDashboard,
  UserCircle,
  UserPlus,
  Target,
  MessageSquare,
  Image,
  CreditCard,
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
    title: 'Media Requests',
    icon: Image,
    href: '/photo-requests'
  },
  {
    title: 'Payments',
    icon: CreditCard,
    href: '/payments'
  },
  {
    title: 'Users',
    icon: Users,
    href: '/users'
  },
  {
    title: 'Partners',
    icon: UserPlus,
    href: '/partners'
  },
  {
    title: 'Settings',
    icon: Settings,
    href: '/settings'
  },
];