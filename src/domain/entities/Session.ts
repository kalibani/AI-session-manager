export interface Session {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionWithLastMessage extends Session {
  lastMessage?: string;
  lastMessageAt?: string;
}

export type CreateSessionInput = {
  userId: string;
  title: string;
};

export type UpdateSessionInput = {
  id: string;
  title?: string;
};




