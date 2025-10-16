export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export type CreateMessageInput = {
  sessionId: string;
  role: MessageRole;
  content: string;
};




