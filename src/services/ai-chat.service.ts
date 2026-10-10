import { api } from './api/axiosInstance';
import { API_ENDPOINTS } from './api/endpoints';

interface ChatMessagePayload {
  message: string;
  conversation_id?: string;
}

export interface ChatReply {
  content: string;
  conversationId?: string;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export const aiChatService = {
  async sendMessage(message: string, conversationId?: string): Promise<ChatReply> {
    const payload: ChatMessagePayload = { message };
    if (conversationId) payload.conversation_id = conversationId;

    const { data } = await api.post<unknown>(API_ENDPOINTS.aiChat.message, payload);
    const response = asRecord(data);
    const body = asRecord(response?.data) ?? asRecord(response?.result) ?? response;
    const nestedMessage = asRecord(body?.message);
    const content = [body?.reply, body?.response, body?.content, body?.text, body?.message, nestedMessage?.content]
      .find((value): value is string => typeof value === 'string' && value.trim().length > 0);

    if (!content) throw new Error('The chat service returned no message.');

    const id = body?.conversation_id ?? body?.conversationId;
    return { content, conversationId: typeof id === 'string' ? id : undefined };
  },
};