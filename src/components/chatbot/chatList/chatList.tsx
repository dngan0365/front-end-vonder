'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { SquarePen, Table2, Search, MessageSquare, Plus, Trash2, Edit3, Check, X } from 'lucide-react'
import { getChatSessions, ChatSession, PaginationInfo, deleteChatSession, editChatSessionTitle } from '@/api/chatbot'

export default function ChatList() {
    const [chats, setChats] = useState<ChatSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 0,
        limit: 20,
        total: 0,
        total_pages: 0,
        has_next: true,
        has_prev: false
    });
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const observer = useRef<IntersectionObserver | null>(null);
    const [collapse, setCollapse] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);
    
    // Get current pathname to detect URL changes
    const pathname = usePathname();

    // Fetch chats function with pagination
    const fetchChats = useCallback(async (pageNum: number, reset: boolean = false) => {
        if (reset) {
            setLoading(true);
            setError(null);
        } else {
            setIsLoadingMore(true);
        }
        
        try {
            console.log(`Fetching chats page ${pageNum}`);
            const response = await getChatSessions(pageNum, 20);
            
            if (!response.data || response.data.length === 0) {
                if (reset) {
                    // First load with no data
                    setChats([]);
                    console.log('No chats found');
                }
                // Update pagination to indicate no more data
                setPagination(prev => ({ ...prev, has_next: false }));
            } else {
                console.log(`Received ${response.data.length} chats`);
                setChats(prev => reset ? response.data : [...prev, ...response.data]);
                setPagination(response.pagination);
            }
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error('Error fetching chats:', errorMsg);
            setError('Failed to load chats. Please try again later.');
        } finally {
            setLoading(false);
            setIsLoadingMore(false);
        }
    }, []);

    // Initialize with first page of chats
    useEffect(() => {
        fetchChats(1, true);
        
        // Cleanup function
        return () => {
            if (observer.current) observer.current.disconnect();
        };
    }, [fetchChats]);

    // Reload chat list when URL changes
    useEffect(() => {
        console.log('URL changed to:', pathname);
        // Reset and reload the chat list when URL changes
        fetchChats(1, true);
    }, [pathname, fetchChats]);

    // Intersection observer callback
    const lastChatElementRef = useCallback((node: HTMLDivElement | null) => {
        if (isLoadingMore) return;
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && pagination.has_next && !isLoadingMore) {
                console.log('Loading more chats...');
                fetchChats(pagination.page + 1, false);
            }
        });
        
        if (node) observer.current.observe(node);
    }, [isLoadingMore, pagination.has_next, pagination.page, fetchChats]);

    // Function to refresh chat list
    const refreshChats = () => {
        fetchChats(1, true);
    };

    // Handle delete chat session
    const handleDeleteChat = async (sessionId: string, event: React.MouseEvent) => {
        event.preventDefault(); // Prevent navigation
        event.stopPropagation(); // Stop event bubbling
        
        if (!confirm('Are you sure you want to delete this chat?')) {
            return;
        }

        setDeletingId(sessionId);
        try {
            await deleteChatSession(sessionId);
            // Remove the deleted chat from the list
            setChats(prevChats => prevChats.filter(chat => chat.id !== sessionId));
            console.log('Chat deleted successfully');
        } catch (error) {
            console.error('Failed to delete chat:', error);
            setError('Failed to delete chat. Please try again.');
        } finally {
            setDeletingId(null);
        }
    };

    // Handle edit chat title
    const handleEditTitle = (chat: ChatSession, event: React.MouseEvent) => {
        event.preventDefault(); // Prevent navigation
        event.stopPropagation(); // Stop event bubbling
        
        setEditingId(chat.id);
        setEditTitle(chat.title);
    };

    // Save edited title
    const handleSaveTitle = async (sessionId: string, event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        
        if (!editTitle.trim()) {
            setEditingId(null);
            return;
        }

        try {
            await editChatSessionTitle(sessionId, editTitle.trim());
            // Update the chat title in the list
            setChats(prevChats => 
                prevChats.map(chat => 
                    chat.id === sessionId 
                        ? { ...chat, title: editTitle.trim() }
                        : chat
                )
            );
            setEditingId(null);
            setEditTitle('');
            console.log('Title updated successfully');
        } catch (error) {
            console.error('Failed to update title:', error);
            setError('Failed to update title. Please try again.');
        }
    };

    // Cancel edit
    const handleCancelEdit = (event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        setEditingId(null);
        setEditTitle('');
    };

    // Handle key press in edit input
    const handleKeyPress = (event: React.KeyboardEvent, sessionId: string) => {
        if (event.key === 'Enter') {
            handleSaveTitle(sessionId, event as any);
        } else if (event.key === 'Escape') {
            handleCancelEdit(event as any);
        }
    };

    return (
        <div className={`${collapse ? 'w-14' : 'w-78'} border-r overflow-y-auto`}>
            {/* New Chat Button */}
            <div className="sticky top-0 px-1 py-1 flex items-center justify-between border-b bg-white dark:bg-gray-900">
                <button
                    onClick={() => setCollapse(!collapse)}
                    className="p-2 rounded-md hover:bg-[#77DAE6]/8 hover:text-[#4ad4e4] dark:hover:bg-slate-800"
                    title={collapse ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    <Table2 className="h-5 w-5" />
                </button>
                <div className={`${collapse ? 'hidden' : 'flex'}`}>
                    <button
                        onClick={refreshChats}
                        className="p-2 rounded-md hover:bg-[#77DAE6]/8 hover:text-[#4ad4e4] dark:hover:bg-slate-800"
                        title="Refresh Chats"
                    >
                        <Search className="h-5 w-5" />
                    </button>
                    <Link href="/chat">
                        <button
                            className="p-2 rounded-md hover:bg-[#77DAE6]/8 hover:text-[#4ad4e4] dark:hover:bg-slate-800"
                            title="Create New Chat"
                        >
                            <SquarePen className="h-5 w-5" />
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
                            onClick={refreshChats}
                            className="mt-2 text-sm text-blue-500 hover:underline"
                        >
                            Try again
                        </button>
                    </div>
                )}
                
                {/* Chat Items */}
                {chats.map((chat, index) => {
                    const isLast = chats.length === index + 1;
                    const isEditing = editingId === chat.id;
                    const isDeleting = deletingId === chat.id;
                    
                    return (
                        <div 
                            key={chat.id}
                            ref={isLast ? lastChatElementRef : null}
                            className="group relative"
                        >
                            <Link href={`/chat/${chat.id}`}>
                                <div className="flex items-start p-3 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition">
                                    <div className="flex flex-col overflow-hidden flex-1">
                                        {isEditing ? (
                                            <div className="flex items-center gap-2 mb-1" onClick={(e) => e.preventDefault()}>
                                                <input
                                                    type="text"
                                                    value={editTitle}
                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                    onKeyDown={(e) => handleKeyPress(e, chat.id)}
                                                    className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={(e) => handleSaveTitle(chat.id, e)}
                                                    className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded"
                                                    title="Save"
                                                >
                                                    <Check size={14} />
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                                    title="Cancel"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <h3 className="font-medium text-gray-800 dark:text-gray-200 truncate">
                                                {chat.title}
                                            </h3>
                                        )}
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {chat.lastMessage}
                                        </p>
                                        <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                            {new Date(chat.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                    
                                    {/* Action buttons - show on hover */}
                                    {!isEditing && (
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                            <button
                                                onClick={(e) => handleEditTitle(chat, e)}
                                                className="p-1 text-gray-400 hover:text-cyan-500 hover:bg-blue-50 dark:hover:bg-cyan-900 rounded"
                                                title="Edit title"
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                            <button
                                                onClick={(e) => handleDeleteChat(chat.id, e)}
                                                disabled={isDeleting}
                                                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded disabled:opacity-50"
                                                title="Delete chat"
                                            >
                                                {isDeleting ? (
                                                    <div className="w-3.5 h-3.5 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Trash2 size={14} />
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        </div>
                    );
                })}
                
                {/* Loading more indicator */}
                {isLoadingMore && (
                    <div className="p-4 text-center">
                        <div className="inline-block animate-spin h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full mr-2"></div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Loading more chats...</span>
                    </div>
                )}
                
                {/* Initial loading indicator */}
                {loading && chats.length === 0 && (
                    <div className="p-4 text-center">
                        <div className="inline-block animate-spin h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full mr-2"></div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Loading chats...</span>
                    </div>
                )}
                
                {/* No more chats */}
                {!loading && !error && !pagination.has_next && chats.length > 0 && (
                    <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        {pagination.total > 0 ? `Loaded all ${pagination.total} chats` : 'No more chats to load'}
                    </div>
                )}
                
                {/* No chats yet */}
                {!loading && !error && chats.length === 0 && (
                    <div className="p-8 text-center">
                        <p className="text-gray-500 dark:text-gray-400">No chats yet</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Start a new conversation</p>
                        <Link href="/chat/new">
                            <button className="mt-4 p-2 flex items-center justify-center gap-2 rounded-md bg-[#77DAE6]/20 text-[#4ad4e4] hover:bg-[#77DAE6]/30 mx-auto">
                                <Plus size={16} />
                                <span>New Chat</span>
                            </button>
                        </Link>
                    </div>
                )}
                
                {/* Pagination info for debugging */}
                {/* {process.env.NODE_ENV === 'development' && pagination.total > 0 && (
                    <div className="p-2 text-xs text-gray-400 text-center border-t">
                        Page {pagination.page} of {pagination.total_pages} 
                        ({chats.length} of {pagination.total} total)
                    </div>
                )} */}
            </div>
        </div>
    );
}