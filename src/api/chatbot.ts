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
    console.log(response)
    console.log('Raw response data:', response.data);
    
    // Transform the backend response to match our frontend format
    const chats: ChatSession[] = response.data.map((session: any) => ({
      id: session.id,
      title: session.title || 'Untitled Chat', // Provide default title if missing
      lastMessage: session.lastMessage || 'No messages yet', // Provide default message if missing
      timestamp: new Date(session.updatedAt),
      createdAt: new Date(session.createdAt),
      updatedAt: new Date(session.updatedAt),
    }));
    
    console.log('Transformed chats:', chats);
    return { chats };
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    // Return empty array to prevent component crashes
    return { chats: [] };
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
    return response.data;
  } catch (error) {
    console.error(`Error fetching chat messages for session ${sessionId}:`, error);
    // Return empty array to prevent component crashes
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
) => {
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
    // Throw the error to let the component handle it
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