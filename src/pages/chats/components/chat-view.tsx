import { useRef, useEffect, useState } from 'react';
import { ArrowLeft, Trash2, Volume2, Video } from 'lucide-react';
import { AudioPlayer } from '@/components/chat/audio-player';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Chat } from '@/types';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ChatViewProps {
  chat: Chat;
  loading?: boolean;
  onBack?: () => void;
  onMessageSent?: () => void;
  onDelete?: (chatId: string) => void;
}

export function ChatView({ chat, loading = false, onBack, onMessageSent, onDelete }: ChatViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat.messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <header className="px-4 sm:px-6 py-4 border-b flex items-center gap-3">
        <div className="flex items-center gap-3 flex-1">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={chat.user.avatar} />
            </Avatar>
            <div>
              <h3 className="font-medium">{chat.user.username}</h3>
              <p className="text-sm text-primary">
                Chat with {chat.model.firstName} {chat.model.lastName}
              </p>
            </div>
          </div>
        </div>
        
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </header>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chat? This action cannot be undone and will remove all messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (onDelete) {
                  onDelete(chat.id);
                }
                setShowDeleteDialog(false);
              }}
            >
              Delete Chat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
        <div className="space-y-4">
          {chat.messages.map((message, index) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                !message.isFromUser && "justify-end"
              )}
            >
              {message.isFromUser && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={chat.user.avatar} />
                </Avatar>
              )}
              
              <div className={cn(
                "rounded-lg p-3 max-w-[70%]",
                !message.isFromUser
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}>
                {message.type === 'image' && message.image && (
                  <img
                    src={message.image}
                    alt="Message attachment"
                    className="rounded-md mb-2 max-w-full"
                  />
                )}
                {message.type === 'voice' && message.image && (
                  <AudioPlayer src={message.image} />
                )}
                {message.type === 'short_video' && message.image && (
                  <div className="relative rounded-md mb-2 overflow-hidden">
                    <video 
                      src={message.image} 
                      controls 
                      className="max-w-full"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
                {message.text && <p className="text-sm">{message.text}</p>}
                <span className="text-xs opacity-70 mt-1 block">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>

              {!message.isFromUser && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={chat.model.profileImage} />
                </Avatar>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        )}
      </ScrollArea> 
    </div>
  );
}