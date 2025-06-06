'use client'
import { useState, useRef, useEffect } from 'react';
import { Heart, MessageSquare, Paperclip, X } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { sendChatMessage, getChatMessages, ChatMessage as ApiChatMessage, ChatResponse } from '@/api/chatbot';
import { ImageUploader } from '@/components/ui/ImageUploader';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';

type Message = {
  id?: string;
  role: 'customer' | 'assistant' | 'user';
  content: string;
  attachments?: Attachment[];
  createdAt?: string;
};

type Attachment = {
  id: string;
  type: string;
  url: string;
  name: string;
  size: number;
};

type Chat = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
};

export default function ChatBot() {
  const router = useRouter();
  const params = useParams();
  const chatId = params?.id as string;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load existing messages when chatId changes
  useEffect(() => {
    const loadMessages = async () => {
      if (chatId && chatId !== 'new') {
        setIsLoadingMessages(true);
        try {
          const existingMessages = await getChatMessages(chatId);
          const formattedMessages: Message[] = existingMessages.map((msg: any) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            createdAt: msg.createdAt
          }));
          setMessages(formattedMessages);
        } catch (error) {
          console.error('Error loading messages:', error);
          setMessages([]);
        } finally {
          setIsLoadingMessages(false);
        }
      } else {
        // New chat, start with empty messages
        setMessages([]);
      }
    };

    loadMessages();
  }, [chatId]);

  // Auto-resize textarea as content grows
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        alert(`File type not supported: ${file.type}. Please upload images only.`);
        continue;
      }

      // Validate file size
      if (file.size > maxSize) {
        alert(`File too large: ${file.name}. Maximum size is 5MB.`);
        continue;
      }

      try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('file', file);
        
        // Upload file to your API
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file');
        }

        const uploadData = await uploadResponse.json();
        
        // Add the file to attachments
        const newAttachment: Attachment = {
          id: uploadData.id,
          type: file.type,
          url: uploadData.url,
          name: file.name,
          size: file.size
        };
        
        setAttachments(prev => [...prev, newAttachment]);
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Failed to upload file. Please try again.');
      }
    }

    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(attachment => attachment.id !== id));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '' && attachments.length === 0) return;

    const messageText = input.trim();
    
    // Add user message to chat immediately
    const userMessage: Message = { 
      id: `temp-${Date.now()}`, // Temporary ID
      role: 'user', 
      content: messageText,
      attachments: attachments.length > 0 ? [...attachments] : undefined,
      createdAt: new Date().toISOString()
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setAttachments([]);
    setIsLoading(true);

    try {
      // Send the message using our API function
      const response = await sendChatMessage({
        message: messageText,
        sessionId: chatId !== 'new' ? chatId : undefined});
      
      // Add bot response to chat
      const botMessage: Message = { 
        id: response.id || `bot-${Date.now()}`,
        role: 'assistant', 
        content: response.response,
        createdAt: new Date().toISOString()
      };
      
      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);

      // If this was a new chat, update the URL
      if (chatId === 'new' && response.sessionId) {
        // Update URL without refreshing page
        router.push(`/chat/${response.sessionId}`, { scroll: false });
      }
      
    } catch (error) {
      console.error('Error:', error);
      // Remove the user message and add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        createdAt: new Date().toISOString()
      };
      setMessages([...messages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full mx-auto rounded-lg overflow-hidden flex-1">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoadingMessages ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <MessageSquare className="h-12 w-12 mb-2" />
            <p>Start a conversation</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message.id || index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-lg lg:max-w-xl px-4 py-2 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-cyan-400 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
              <div className="prose prose-sm dark:prose-invert max-w-none prose-a:no-underline prose-a:text-blue-600 hover:prose-a:underline">
                <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                  {message.content}
                </ReactMarkdown>
              </div>
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {message.attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center space-x-2">
                        {attachment.type.startsWith('image/') ? (
                          <Image
                            src={attachment.url}
                            alt={attachment.name}
                            width={200}
                            height={200}
                            className="rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Paperclip className="h-4 w-4" />
                            <span className="text-sm">{attachment.name}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {message.createdAt && (
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-lg">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="relative">
                {attachment.type.startsWith('image/') ? (
                  <div className="relative">
                    <Image
                      src={attachment.url}
                      alt={attachment.name}
                      width={80}
                      height={80}
                      className="rounded-lg object-cover"
                    />
                    <button
                      onClick={() => removeAttachment(attachment.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 bg-white p-2 rounded border">
                    <Paperclip className="h-4 w-4" />
                    <span className="text-sm truncate max-w-[100px]">{attachment.name}</span>
                    <button
                      onClick={() => removeAttachment(attachment.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Chat input */}
      <form onSubmit={handleSubmit} className="p-4 border-t flex">
        {/* Hidden file input */}
        <input
          type="file"
          title="Upload image"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          multiple
          className="hidden"
          disabled={isLoading}
        />
        
        {/* File upload button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          title="Upload image"
          className={`p-2 rounded-l-lg border border-r-0 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#77DAE6]/10 hover:text-[#4ad4e4]'
          }`}
        >
          <Paperclip className="h-6 w-6 text-gray-500" />
        </button>
        
        {/* Text input */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="How can I help you? (Ctrl+Enter to send)"
          className="chat-textarea flex-1 px-4 py-2 border border-l-0 resize-none overflow-hidden focus:outline-none focus:ring-1 focus:ring-cyan-400 min-h-[40px] max-h-32"
          disabled={isLoading}
          rows={1}
        />
        
        {/* Send button */}
        <button
          type="submit"
          title="Send message"
          className={`px-4 py-2 bg-cyan-400 text-white rounded-r-lg ${
            (isLoading || (input.trim() === '' && attachments.length === 0))
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-cyan-600'
          }`}
          disabled={isLoading || (input.trim() === '' && attachments.length === 0)}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </div>
  );
}