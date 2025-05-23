import axiosInstanceAI from "./ai_axiosInstance";

export interface ChatResponse {
    response: string;
    sources?: Array<{
      title?: string;
      content?: string;
      url?: string;
    }>;
  }
  
  export interface ChatHistoryItem {
    id: string;
    role: string;
    content: string;
    createdAt: string;
  }
  
  export interface ChatSession {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
  }
  // Create a singleton instance

  // Send a message to the chatbot
  export const sendMessage = async (message: string)=> {
    try {
        const response = await axiosInstanceAI.post<ChatResponse>('/chatbot/chat', { message });
        return response.data;
    } catch (error) {
        console.error('Error fetching blogs:', error);
        throw error;
      }
  }

  // Get all chat sessions for the current user
  export const getChatSessions = async (): Promise<ChatSession[]> => {
    try {
        const response = await axiosInstanceAI.get<ChatSession[]>('/chatbot/history');
        return response.data;
    } catch (error) {
        console.error('Error fetching blogs:', error);
        throw error;
    }
  }

  // Get messages for a specific chat session
  export const getChatSessionMessages = async (sessionId: string): Promise<ChatHistoryItem[]> => {
    try {
        const response = await axiosInstanceAI.get<ChatHistoryItem[]>(`/chatbot/history/${sessionId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching blogs:', error);
        throw error;
    }
  }

  // Admin only: refresh the knowledge index
  export const refreshIndex = async (): Promise<any> => {
    try{
        const response = await axiosInstanceAI.post('/chatbot/refresh-index');
        return response.data;
    } catch (error) {
        console.error('Error fetching blogs:', error);
        throw error;
    }
  }

