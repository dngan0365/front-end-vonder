'use client'
import { useState, useRef, useEffect } from 'react';
import { Heart, MessageSquare, Paperclip, X } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image'

type Message = {
  role: 'user' | 'assistant';
  content: string;
  attachments?: Attachment[];
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea as content grows
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
        }, [input]);

  // Load chat data when chatId changes
  useEffect(() => {
    if (chatId && chatId !== 'new') {
      // Load the chat from API or local storage
      const loadChat = async () => {
        try {
          const response = await fetch(`/api/chats/${chatId}`);
          if (response.ok) {
            const chatData = await response.json();
            setCurrentChat(chatData);
            setMessages(chatData.messages || []);
          } else {
            console.error('Failed to load chat');
          }
        } catch (error) {
          console.error('Error loading chat:', error);
        }
      };
      
      loadChat();
    } else {
      // Clear the chat for a new conversation
      setMessages([]);
      setCurrentChat(null);
    }
  }, [chatId]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Function to update chat in the list
  const updateChatInList = async (chat: Chat) => {
    try {
      // In a real app, this would send an update to your API
      await fetch(`/api/chats/${chat.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chat),
      });
      
      // If this is a new chat, redirect to the proper URL
      if (chatId === 'new') {
        router.push(`/chat/${chat.id}`);
      }
    } catch (error) {
      console.error('Error updating chat:', error);
    }
  };

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
          headers: {
          },
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

    // Add user message to chat
    const userMessage: Message = { 
      role: 'user', 
      content: input,
      attachments: attachments.length > 0 ? [...attachments] : undefined
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setAttachments([]);
    setIsLoading(true);

    try {
      // Call API with LlamaIndex
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      // Add bot response to chat
      const botMessage: Message = { role: 'assistant', content: data.content };
      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);

      // Create or update the chat
      let chat: Chat;
      
      if (!currentChat) {
        // Create a new chat
        const title = input.length > 30 ? `${input.substring(0, 30)}...` : input || 'Image Chat';
        chat = {
          id: `chat-${Date.now()}`,
          title,
          messages: finalMessages,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setCurrentChat(chat);
      } else {
        // Update existing chat
        chat = {
          ...currentChat,
          messages: finalMessages,
          updatedAt: new Date()
        };
        setCurrentChat(chat);
      }
      
      // Update the chat in the list
      await updateChatInList(chat);
      
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full mx-auto rounded-lg overflow-hidden flex-1">
      {/* Chat header */}
      {/* <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center">
          <MessageSquare className="text-cyan-500 mr-2" size={24} />
          <h2 className="font-semibold text-gray-700">
            {currentChat?.title || 'New Chat'}
          </h2>
        </div>
      </div> */}


      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-center gap-6 p-6">
             {/* Logo */}
                <Image
                    src="/logo.svg"
                    alt="Vonders Logo"
                    width={100}
                    height={100}
                />
    
                {/* Heading */}
                <h1 className="mb-4 font-medium text-4xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-cyan-200 bg-clip-text text-transparent">
                    Welcome to your Vonder assistant
                </h1>
    
                {/* Feature Cards Container */}
                <div className="hidden lg:flex flex-col md:flex-row items-center justify-center gap-6 w-full max-w-5xl">
                    {/* Card 1 */}
                    <div className="flex flex-col items-center justify-center text-center gap-3 border-2 border-gray-200 dark:border-gray-800 rounded-lg p-6 w-full max-w-xs">
                        <Image
                            src="/icon/culture.png"
                            alt="Cultural Explorer Icon"
                            width={40}
                            height={40}
                            className="rounded-lg"
                        />
                        <h2 className="text-lg font-semibold">Cultural Explorer</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Provides detailed but easy-to-read information about Vietnamese culture.
                        </p>
                    </div>
    
                    {/* Card 2 */}
                    <div className="flex flex-col items-center justify-center text-center gap-3 border-2 border-gray-200 dark:border-gray-800 rounded-lg p-6 w-full max-w-xs">
                        <Image
                            src="/icon/pilgrim.png"
                            alt="Attraction Curator Icon"
                            width={40}
                            height={40}
                            className="rounded-lg"
                        />
                        <h2 className="text-lg font-semibold">Attraction Curator</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Recommends top tourist attractions based on your preferences.
                        </p>
                    </div>
    
                    {/* Card 3 */}
                    <div className="flex flex-col items-center justify-center text-center gap-3 border-2 border-gray-200 dark:border-gray-800 rounded-lg p-6 w-full max-w-xs">
                        <Image
                            src="/icon/schedule.png"
                            alt="Smart Trip Planner Icon"
                            width={40}
                            height={40}
                            className="rounded-lg"
                        />
                        <h2 className="text-lg font-semibold">Smart Trip Planner</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Create a customized daily travel schedule based on your interests, and trip duration.
                        </p>
                    </div>
                </div>
            </div>
        ): (
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div 
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-3/4 rounded-lg px-4 py-2 ${
                    msg.role === 'user' 
                      ? 'bg-cyan-400 text-white rounded-br-none' 
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {msg.content}
                  
                  {/* Display attachments if any */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {msg.attachments.map(attachment => (
                        <div key={attachment.id} className="relative">
                          {attachment.type.startsWith('image/') && (
                            <Image
                              src={attachment.url} 
                              alt={attachment.name}
                              className="max-w-full rounded border"
                            />
                          )}
                          <div className={`text-xs mt-1 ${msg.role === 'user' ? 'text-cyan-100' : 'text-gray-500'}`}>
                            {attachment.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-800 rounded-lg rounded-bl-none max-w-3/4 px-4 py-2">
                  <div className="flex space-x-1 items-center">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-0"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-400"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef}/>
          </div>
        )}
      </div>

      {/* Attachment preview area */}
      {attachments.length > 0 && (
        <div className="p-2 border-t bg-gray-50 flex flex-wrap gap-2">
          {attachments.map(attachment => (
            <div key={attachment.id} className="relative w-16 h-16 border rounded overflow-hidden bg-white">
              {attachment.type.startsWith('image/') && (
                <Image
                  src={attachment.url} 
                  alt={attachment.name}
                  className="w-full h-full object-cover"
                />
              )}
              <button 
                title="remove attachment"
                onClick={() => removeAttachment(attachment.id)}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 m-1"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Chat input */}
      <form onSubmit={handleSubmit} className="p-4 border-t flex">
        {/* Hidden file input */}
        <input
          type="file"
          title = "Upload image"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          multiple
          className="hidden"
          disabled={isLoading }
        />
        
        {/* File upload button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading }
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