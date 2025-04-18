import { NextRequest } from 'next/server';
import {
  storageContextFromDefaults,
  VectorStoreIndex,
  OpenAIEmbedding,
} from 'llamaindex'; // Adjust imports based on your llamaindex version

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key is required' }), { status: 401 });
    }

    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Invalid messages format' }), { status: 400 });
    }

    const serviceContext = await storageContextFromDefaults({
      llm: {
        model: 'gpt-3.5-turbo',
        apiKey: apiKey,
      },
      embedModel: new OpenAIEmbedding({
        apiKey: apiKey,
        model: 'text-embedding-ada-002',
      }),
    });

    const index = new VectorStoreIndex(serviceContext);

    const chatEngine = index.asRetrieverChatEngine();

    const llamaMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));

    const response = await chatEngine.chat({
      message: messages[messages.length - 1].content,
      chatHistory: llamaMessages.slice(0, -1),
    });

    return new Response(JSON.stringify({ content: response.response }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error processing chat request:', error.message || error);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), { status: 500 });
  }
}
