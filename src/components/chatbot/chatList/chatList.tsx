'use client'
import { useState, useEffect, useRef } from 'react'
import Link from "next/link"
import { SquarePen, Table2, Search , MessageSquare, Plus } from 'lucide-react'

type ChatItem = {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  unread?: boolean;
}

export default function ChatList() {
    const [chats, setChats] = useState<ChatItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef<IntersectionObserver | null>(null);
    const lastChatElementRef = useRef<HTMLDivElement>(null);
    const [collapse, setCollapse] = useState(false)

    // Fetch chats function
    const fetchChats = async (pageNum: number) => {
        setLoading(true);
        try {
        // Replace with your API call to fetch chats
        const response = await fetch(`/api/chats?page=${pageNum}&limit=10`);
        const data = await response.json();
        
        if (data.chats.length === 0) {
            setHasMore(false);
        } else {
            setChats(prev => pageNum === 1 ? data.chats : [...prev, ...data.chats]);
            setPage(pageNum);
        }
        } catch (error) {
        console.error('Error fetching chats:', error);
        } finally {
        setLoading(false);
        }
    };

    // Initialize with first page of chats
    useEffect(() => {
        fetchChats(1);
    }, []);

    // Set up intersection observer for infinite scroll
    useEffect(() => {
        if (loading) return;

        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
            fetchChats(page + 1);
        }
        });

        if (lastChatElementRef.current) {
        observer.current.observe(lastChatElementRef.current);
        }
    }, [loading, hasMore, page]);

    // Function to create a new chat
    const createNewChat = () => {
        // Generate a new ID (in production you'd get this from your backend)
        const newId = `chat-${Date.now()}`;
        
        // Add the new chat to the beginning of the list
        const newChat: ChatItem = {
        id: newId,
        title: 'New Chat',
        lastMessage: 'Start a new conversation',
        timestamp: new Date(),
        unread: false
        };
        
        setChats(prev => [newChat, ...prev]);
        
        // Here you would also need to create the chat in your backend
        // and then redirect to the new chat
        
        // Return the ID so we can redirect to it
        return newId;
    };

    return (
        <div className={`${collapse ? 'w-14' : 'w-64'} border-r overflow-y-auto h-full`}>
            {/* New Chat Button */}
            <div className="sticky top-0 px-1 py-1 flex items-center justify-between border-b">
                <button
                    onClick={() => setCollapse(!collapse)}
                    className="p-2 rounded-md hover:bg-[#77DAE6]/8 hover:text-[#4ad4e4] dark:hover:bg-slate-800"
                    title={collapse ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                    <Table2 className="h-5 w-5" />
                </button>
                <div className={`${collapse ? 'hidden' : 'flex'}`}>
                    <button
                        onClick={() => createNewChat()}
                        className="p-2 rounded-md hover:bg-[#77DAE6]/8 hover:text-[#4ad4e4] dark:hover:bg-slate-800"
                        title="Create New Chat"
                        >
                        <Search  className="h-5 w-5"></Search>
                    </button>
                    <button
                        onClick={() => createNewChat()}
                        className="p-2 rounded-md hover:bg-[#77DAE6]/8 hover:text-[#4ad4e4] dark:hover:bg-slate-800"
                        title="Create New Chat"
                        >
                        <SquarePen  className="h-5 w-5"></SquarePen>
                    </button>
                </div>
            </div>
            
            {/* Chat List */}
            <div className={`${collapse ? 'hidden' : ''}`}>
                {chats.map((chat, index) => {
                if (chats.length === index + 1) {
                    return (
                    <div ref={lastChatElementRef} key={chat.id}>
                        <Link href={`/chat/${chat.id}`}>
                        <div className="flex items-start p-3 hover:bg-gray-200 cursor-pointer transition">
                            <MessageSquare className="text-gray-500 mr-3 mt-1" size={18} />
                            <div className="flex flex-col overflow-hidden">
                            <h3 className="font-medium text-gray-800 truncate">{chat.title}</h3>
                            <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
                            <span className="text-xs text-gray-400 mt-1">
                                {new Date(chat.timestamp).toLocaleDateString()}
                            </span>
                            </div>
                        </div>
                        </Link>
                    </div>
                    );
                } else {
                    return (
                    <Link href={`/chat/${chat.id}`} key={chat.id}>
                        <div className="flex items-start p-3 hover:bg-gray-200 cursor-pointer transition">
                        <MessageSquare className="text-gray-500 mr-3 mt-1" size={18} />
                        <div className="flex flex-col overflow-hidden">
                            <h3 className="font-medium text-gray-800 truncate">{chat.title}</h3>
                            <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
                            <span className="text-xs text-gray-400 mt-1">
                            {new Date(chat.timestamp).toLocaleDateString()}
                            </span>
                        </div>
                        </div>
                    </Link>
                    );
                }
                })}
                
                {/* Loading indicator */}
                {loading && (
                <div className="p-4 text-center">
                    <div className="inline-block animate-spin h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full mr-2"></div>
                    <span className="text-sm text-gray-500">Loading...</span>
                </div>
                )}
                
                {/* No more chats */}
                {!hasMore && chats.length > 0 && (
                <div className="p-4 text-center text-sm text-gray-500">
                    No more chats to load
                </div>
                )}
                
                {/* No chats yet */}
                {!loading && chats.length === 0 && (
                <div className="p-8 text-center">
                    <p className="text-gray-500">No chats yet</p>
                    <p className="text-sm text-gray-400 mt-1">Start a new conversation</p>
                </div>
                )}
            </div>
        </div>
    )
}