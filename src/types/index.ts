export type {
  Session,
  SessionWithLastMessage,
  CreateSessionInput,
  UpdateSessionInput,
} from "@/domain/entities/Session";

export type {
  Message,
  MessageRole,
  CreateMessageInput,
} from "@/domain/entities/Message";

export interface User {
  id: string;
  email: string;
}

export interface ApiError extends Error {
  code?: string;
  status?: number;
}

export interface StreamingResponse {
  text: string;
  isComplete: boolean;
}
