// Updated API functions for chatbot
// File: api/chatbot.ts

import axiosInstanceAI from "./ai_axiosInstance";

// Consolidated ChatSession interface to match component requirements
export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp?: Date;
  unread?: boolean;
  createdAt?: Date; // Keep for backend compatibility
  updatedAt?: Date; // Keep for backend compatibility
}

export interface ChatMessage {
  id: string;
  role: string;
  content: string;
  createdAt: Date;
}

export interface ChatResponse {
  id?: string;
  response: string;
  sessionId?: string;
  sources?: Array<{
    title?: string;
    content?: string;
    url?: string;
  }>;
}

/**
 * Get all chat sessions for the current user
 */
export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ChatSessionsResponse {
  data: ChatSession[];
  pagination: PaginationInfo;
}

/**
 * Get chat sessions with pagination
 */
export const getChatSessions = async (page: number = 1, limit: number = 20): Promise<ChatSessionsResponse> => {
  console.log(`Starting getChatSessions call - page: ${page}, limit: ${limit}`);
  try {
    const response = await axiosInstanceAI.get('/ai/chatbot/history', {
      params: { page, limit }
    });
    console.log('Raw response data:', response.data);
    
    // Handle both old format (array) and new format (object with data and pagination)
    let sessionsData, paginationData;
    
    if (Array.isArray(response.data)) {
      // Old format - convert to new format
      sessionsData = response.data;
      paginationData = {
        page: 1,
        limit: sessionsData.length,
        total: sessionsData.length,
        total_pages: 1,
        has_next: false,
        has_prev: false
      };
    } else {
      // New format with pagination
      sessionsData = response.data.data || response.data;
      paginationData = response.data.pagination || {
        page: 1,
        limit: sessionsData.length,
        total: sessionsData.length,
        total_pages: 1,
        has_next: false,
        has_prev: false
      };
    }
    
    // Transform the backend response to match our frontend format
    const chats: ChatSession[] = sessionsData.map((session: any) => ({
      id: session.id,
      title: session.title || 'Untitled Chat',
      lastMessage: session.lastMessage || 'No messages yet',
      timestamp: new Date(session.updatedAt),
      createdAt: new Date(session.createdAt),
      updatedAt: new Date(session.updatedAt),
    }));
    
    console.log('Transformed chats:', chats);
    console.log('Pagination info:', paginationData);
    
    return { 
      data: chats, 
      pagination: paginationData 
    };
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    return { 
      data: [], 
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        total_pages: 0,
        has_next: false,
        has_prev: false
      }
    };
  }
};

/**
 * Delete a chat session
 */
export const deleteChatSession = async (sessionId: string) => {
  console.log('Deleting chat session:', sessionId);
  try {
    const response = await axiosInstanceAI.delete(`/ai/chatbot/history/${sessionId}`);
    console.log('Delete response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting chat session:', error);
    throw error;
  }
};

/**
 * Edit chat session title
 */
export const editChatSessionTitle = async (sessionId: string, title: string) => {
  console.log('Editing chat session title:', sessionId, title);
  try {
    const response = await axiosInstanceAI.put(`/ai/chatbot/history/${sessionId}`, {
      title
    });
    console.log('Edit title response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error editing title:', error);
    throw error;
  }
};

/**
 * Get messages for a specific chat session
 */
export const getChatMessages = async (sessionId: string) => {
  console.log(`Fetching messages for session: ${sessionId}`);
  try {
    const response = await axiosInstanceAI.get(`/ai/chatbot/history/${sessionId}`);
    console.log('Messages received:', response.data);
    
    // Transform messages to match frontend format
    const messages = response.data.map((message: any) => ({
      id: message.id,
      role: message.role,
      content: message.content,
      createdAt: message.createdAt
    }));
    
    return messages;
  } catch (error) {
    console.error(`Error fetching chat messages for session ${sessionId}:`, error);
    return [];
  }
};

/**
 * Send a chat message
 * @param sessionId Optional session ID for existing conversations
 * @param message Message text to send
 */
export const sendChatMessage = async (
  message: string, sessionId: string | undefined
): Promise<ChatResponse> => {
  console.log(`Sending message${sessionId ? ` to session ${sessionId}` : ' (new session)'}`);

  // Declare the payload *without redeclaring its type inline*
  const payload = {
    message: message,
    ...(sessionId ? { sessionId } : {})
  };

  console.log('Request payload:', payload);

  try {
    const response = await axiosInstanceAI.post('/ai/chatbot/chat', payload, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    console.log('Message sent successfully, response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

