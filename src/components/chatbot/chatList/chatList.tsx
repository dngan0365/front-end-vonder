'use client'
import { useState, useEffect, useRef } from 'react'
import Link from "next/link"
import { SquarePen, Table2, Search, MessageSquare, Plus } from 'lucide-react'
import { getChatSessions, ChatSession } from '@/api/chatbot'

export default function ChatList() {
    const [chats, setChats] = useState<ChatSession[]>([]);
    const [loading, setLoading] = useState(true); // Start with loading true
    const [error, setError] = useState<string | null>(null); // Add error state
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef<IntersectionObserver | null>(null);
    const lastChatElementRef = useRef<HTMLDivElement>(null);
    const [collapse, setCollapse] = useState(false)

    // Fetch chats function with better error handling
    const fetchChats = async (pageNum: number) => {
        if (pageNum === 1) setLoading(true);
        setError(null);
        
        try {
            console.log(`Fetching chats page ${pageNum}`);
            // Using the getChatSessions function from your API
            const data = await getChatSessions();
            
            if (!data.chats || data.chats.length === 0) {
                setHasMore(false);
                if (pageNum === 1) {
                    // Just starting the list
                    console.log('No chats found');
                } else {
                    // Reached the end of the list
                    console.log('No more chats to load');
                }
            } else {
                console.log(`Received ${data.chats.length} chats`);
                setChats(prev => pageNum === 1 ? data.chats : [...prev, ...data.chats]);
                setPage(pageNum);
            }
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error('Error fetching chats:', errorMsg);
            setError('Failed to load chats. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Initialize with first page of chats
    useEffect(() => {
        fetchChats(1);
        
        // Cleanup function to cancel any pending requests
        return () => {
            if (observer.current) observer.current.disconnect();
        };
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
        // For new chat, we'll just redirect to the new chat page
        // The actual chat creation will happen in the ChatBot component
        // when the first message is sent
        return 'new';
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
                        title="Search"
                    >
                        <Search className="h-5 w-5"></Search>
                    </button>
                    <Link href="/chat/new">
                        <button
                            className="p-2 rounded-md hover:bg-[#77DAE6]/8 hover:text-[#4ad4e4] dark:hover:bg-slate-800"
                            title="Create New Chat"
                        >
                            <SquarePen className="h-5 w-5"></SquarePen>
                        </button>
                    </Link>
                </div>
            </div>
            
            {/* Chat List */}
            <div className={`${collapse ? 'hidden' : ''}`}>
                {/* Error Message */}
                {error && (
                    <div className="p-4 text-center text-red-500">
                        <p>{error}</p>
                        <button 
                            onClick={() => fetchChats(1)}
                            className="mt-2 text-sm text-blue-500 hover:underline"
                        >
                            Try again
                        </button>
                    </div>
                )}
                
                {/* Chat Items */}
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
                        <span className="text-sm text-gray-500">Loading chats...</span>
                    </div>
                )}
                
                {/* No more chats */}
                {!loading && !error && !hasMore && chats.length > 0 && (
                    <div className="p-4 text-center text-sm text-gray-500">
                        No more chats to load
                    </div>
                )}
                
                {/* No chats yet */}
                {!loading && !error && chats.length === 0 && (
                    <div className="p-8 text-center">
                        <p className="text-gray-500">No chats yet</p>
                        <p className="text-sm text-gray-400 mt-1">Start a new conversation</p>
                        <Link href="/chat/new">
                            <button className="mt-4 p-2 flex items-center justify-center gap-2 rounded-md bg-[#77DAE6]/20 text-[#4ad4e4] hover:bg-[#77DAE6]/30 mx-auto">
                                <Plus size={16} />
                                <span>New Chat</span>
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}