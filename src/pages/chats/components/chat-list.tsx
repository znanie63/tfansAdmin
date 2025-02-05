import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Chat } from '@/types';
import { useState, useMemo } from 'react';

interface ChatListProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
}

export function ChatList({ chats, selectedChatId, onSelectChat }: ChatListProps) {
  const [search, setSearch] = useState('');

  const filteredChats = useMemo(() => chats.filter(chat => (
    search ? (
      chat.user.username.toLowerCase().includes(search.toLowerCase()) ||
      chat.model.firstName.toLowerCase().includes(search.toLowerCase()) ||
      chat.model.lastName.toLowerCase().includes(search.toLowerCase())
    ) : true
  )), [chats, search]);

  return (
    <>
      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="divide-y">
          {filteredChats.map(chat => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={cn(
                "w-full px-3 sm:px-4 py-2.5 sm:py-3 flex items-start gap-3 hover:bg-muted/50 transition-colors",
                selectedChatId === chat.id && "bg-muted"
              )}
            >
              <Avatar className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0">
                <AvatarImage src={chat.user.avatar} />
              </Avatar>
              
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-medium truncate">
                    {chat.user.username}
                  </p>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(chat.lastMessageAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-baseline gap-2">
                  <p className="text-xs text-primary font-medium">
                    {chat.model.firstName} {chat.model.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {chat.lastMessage}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </>
  );
}