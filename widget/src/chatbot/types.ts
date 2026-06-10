export type MessageRole = "user" | "assistant" | "staff";
export type MessageType = "user" | "bot";

export type ConversationStatus =
  | "ai_active"
  | "waiting_human"
  | "human_active"
  | "closed";

export interface ChatPayload {
  message: string;
  page_url: string;
  session_id?: string | null;
}

export interface ChatResponse {
  reply: string;
  session_id: string;
  status: ConversationStatus;
  needs_human: boolean;
}

export interface ConversationMessage {
  role: MessageRole;
  content: string;
  created_at?: string;
  staff_name?: string;
}

export interface ConversationResponse {
  session_id: string;
  status: ConversationStatus;
  priority?: "low" | "medium" | "high";
  reason?: string | null;
  staff_typing?: boolean;
  staff_typing_name?: string | null;
  messages: ConversationMessage[];
}