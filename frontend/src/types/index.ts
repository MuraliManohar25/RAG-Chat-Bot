export type Role = "student" | "admin";

export interface User {
  id: string;
  email: string;
  name?: string;
  role: Role;
}

export interface Source {
  documentId: string;
  documentTitle: string;
  pageNumber?: number;
  chunkId: string;
  relevanceScore?: number;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  sources?: Source[];
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationDetail extends Conversation {
  messages: Message[];
}

export interface ChatResponse {
  answer: string;
  conversationId: string;
  messageId: string;
  sources: Source[];
  hasContext: boolean;
}

export type DocumentStatus = "processing" | "ready" | "failed" | "archived";

export interface Document {
  id: string;
  title: string;
  filename: string;
  description?: string;
  department?: string;
  documentType?: string;
  version?: string;
  status: DocumentStatus;
  fileSize?: number;
  pageCount?: number;
  chunkCount?: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  totalDocuments: number;
  indexedDocuments: number;
  failedDocuments: number;
  totalUsers: number;
  totalConversations: number;
  totalQuestions: number;
  totalChunks: number;
  positiveFeedback: number;
  negativeFeedback: number;
  recentDocuments: Document[];
}

export interface RetrievalResult {
  documentTitle: string;
  pageNumber?: number;
  content: string;
  relevanceScore: number;
  chunkId: string;
}

export type FeedbackType = "positive" | "negative";
