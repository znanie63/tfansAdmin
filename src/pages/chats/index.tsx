import { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { ChatList } from './components/chat-list';
import { ChatView } from './components/chat-view';
import { mockChats } from './data/mock-chats';
import { cn } from '@/lib/utils';

export function Chats() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  
  const selectedChat = mockChats.find(chat => chat.id === selectedChatId);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleBackToList = () => {
    setSelectedChatId(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="h-8 w-8 text-primary/80" />
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Chats</h1>
      </div>

      <div className="flex gap-6 flex-1 min-h-0 relative">
        <div className={cn(
          "w-full md:w-auto md:max-w-sm border rounded-lg overflow-hidden flex flex-col bg-card",
          "transition-[transform,opacity] duration-300",
          isMobileView && selectedChat && "absolute inset-0 transform -translate-x-full opacity-0 pointer-events-none"
        )}>
          <ChatList
            chats={mockChats}
            selectedChatId={selectedChatId}
            onSelectChat={setSelectedChatId}
          />
        </div>

        <div className={cn(
          "flex-1 border rounded-lg overflow-hidden bg-card",
          "transition-[transform,opacity] duration-300",
          isMobileView && !selectedChat && "absolute inset-0 transform translate-x-full opacity-0 pointer-events-none"
        )}>
          {selectedChat ? (
            <ChatView 
              chat={selectedChat}
              onBack={isMobileView ? handleBackToList : undefined} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No chat selected</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Select a chat from the list to view the conversation
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}