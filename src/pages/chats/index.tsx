import { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { ChatList } from './components/chat-list';
import { ChatView } from './components/chat-view';
import { getChats, getChatMessages, sendMessage, uploadChatImage } from '@/lib/chats';
import { Chat, Message } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function Chats() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [chats, setChats] = useState<Omit<Chat, 'messages'>[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedChatMessages, setSelectedChatMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  const selectedChat = selectedChatId ? {
    ...chats.find(chat => chat.id === selectedChatId)!,
    messages: selectedChatMessages
  } : null;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    if (selectedChatId) {
      loadChatMessages(selectedChatId);
    }
  }, [selectedChatId]);

  const loadChats = async () => {
    try {
      setLoading(true);
      const { chats: data, hasMore: more } = await getChats(1);
      setChats(data);
      setHasMore(more);
      setPage(1);
    } catch (error) {
      console.error('Error loading chats:', error);
      toast.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreChats = async () => {
    if (!hasMore || loadingMore) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const { chats: newChats, hasMore: more } = await getChats(nextPage);
      
      setChats(prev => [...prev, ...newChats]);
      setHasMore(more);
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more chats:', error);
      toast.error('Failed to load more chats');
    } finally {
      setLoadingMore(false);
    }
  };

  const loadChatMessages = async (chatId: string) => {
    try {
      setLoadingMessages(true);
      const messages = await getChatMessages(chatId);
      setSelectedChatMessages(messages);

      // Update last message in chats list
      if (messages.length > 0) {
        setChats(prev => prev.map(chat => 
          chat.id === chatId 
            ? { ...chat, lastMessage: messages[0].text || 'Photo' }
            : chat
        ));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleBackToList = () => {
    setSelectedChatId(null);
    setSelectedChatMessages([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
            chats={chats}
            selectedChatId={selectedChatId}
            onSelectChat={setSelectedChatId}
            onLoadMore={loadMoreChats}
            hasMore={hasMore}
            loading={loadingMore}
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
              loading={loadingMessages}
              onMessageSent={loadChats}
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