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
export const getChatSessions = async () => {
  console.log('Starting getChatSessions call');
  try {
    const response = await axiosInstanceAI.get('/ai/chatbot/history');
    console.log('Raw response data:', response.data);
    
    // Transform the backend response to match our frontend format
    const chats: ChatSession[] = response.data.map((session: any) => ({
      id: session.id,
      title: session.title || 'Untitled Chat',
      lastMessage: session.lastMessage || 'No messages yet',
      timestamp: new Date(session.updatedAt),
      createdAt: new Date(session.createdAt),
      updatedAt: new Date(session.updatedAt),
    }));
    
    console.log('Transformed chats:', chats);
    return { chats };
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    return { chats: [] };
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
  sessionId: string | undefined, 
  message: string
): Promise<ChatResponse> => {
  console.log(`Sending message${sessionId ? ` to session ${sessionId}` : ' (new session)'}`);
  try {
    const payload = {
      message,
      sessionId // The backend will use this if provided
    };
    console.log('Request payload:', payload);
    
    const response = await axiosInstanceAI.post('/ai/chatbot/chat', payload);
    console.log('Message sent successfully, response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Create a new chat session
 */
export const createChatSession = async () => {
  console.log('Creating a new chat session');
  try {
    const response = await axiosInstanceAI.post('/ai/chatbot/create');
    console.log('Created new chat session:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating chat session:', error);
    throw error;
  }
};

/**
 * Refresh the chatbot knowledge index (admin only)
 */
export const refreshChatbotIndex = async () => {
  console.log('Requesting index refresh');
  try {
    const response = await axiosInstanceAI.post('/ai/chatbot/refresh-index');
    console.log('Index refresh response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error refreshing index:', error);
    throw error;
  }
};