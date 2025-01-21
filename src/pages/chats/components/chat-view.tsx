import { useState, useRef, useEffect } from 'react';
import { Image, Send, ArrowLeft } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Chat, Message } from '@/types';
import { cn } from '@/lib/utils';

interface ChatViewProps {
  chat: Chat;
  onBack?: () => void;
}

export function ChatView({ chat, onBack }: ChatViewProps) {
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat.messages]);

  const handleSendMessage = () => {
    if (!message.trim() && !selectedImage) return;
    
    // Here we'll add the logic to send messages once we integrate with the database
    console.log('Sending message:', { text: message, image: selectedImage });
    
    setMessage('');
    setSelectedImage(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="px-4 sm:px-6 py-4 border-b flex items-center gap-3">
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

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {chat.messages.map((message, index) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.senderId === chat.model.id && "justify-end"
              )}
            >
              {message.senderId !== chat.model.id && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={chat.user.avatar} />
                </Avatar>
              )}
              
              <div className={cn(
                "rounded-lg p-3 max-w-[70%]",
                message.senderId === chat.model.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}>
                {message.image && (
                  <img
                    src={message.image}
                    alt="Message attachment"
                    className="rounded-md mb-2 max-w-full"
                  />
                )}
                {message.text && <p className="text-sm">{message.text}</p>}
                <span className="text-xs opacity-70 mt-1 block">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>

              {message.senderId === chat.model.id && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={chat.model.profileImage} />
                </Avatar>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-3 sm:p-4 border-t">
        {selectedImage && (
          <div className="mb-2 p-2 bg-muted rounded-lg flex items-center gap-2">
            <Image className="h-4 w-4" />
            <span className="text-sm truncate">{selectedImage.name}</span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => setSelectedImage(null)}
            >
              Remove
            </Button>
          </div>
        )}
        
        <div className="flex gap-2">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageSelect}
          />
          
          <Button
            variant="outline"
            size="icon-sm"
            className="h-9 w-9 shrink-0"
            onClick={() => fileInputRef.current?.click()}
          >
            <Image className="h-4 w-4" />
          </Button>
          
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1"
          />
          
          <Button 
            onClick={handleSendMessage}
            size="icon-sm"
            className="h-9 w-9 shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}