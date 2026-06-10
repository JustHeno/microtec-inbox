import { AuthApi } from "./AuthApi";

export type ConversationSource =
  | "website"
  | "facebook"
  | "instagram"
  | "unknown";

export type ChatMessage = {
  role: "user" | "assistant" | "staff";
  content: string;
  created_at?: string;
  staff_name?: string;
};

export type Conversation = {
  session_id: string;
  status: "ai_active" | "waiting_human" | "human_active" | "closed";
  priority?: "low" | "medium" | "high";
  reason?: string | null;

  staff_typing?: boolean;
  staff_typing_name?: string | null;

  source?: ConversationSource;
  external_id?: string | null;
  customer_name?: string | null;
  customer_avatar?: string | null;

  visitor?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  };

  messages: ChatMessage[];
};

const API_URL = "http://localhost:8000";

function authHeaders(): HeadersInit {
  const token = AuthApi.getToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleAuthError(res: Response) {
  if (res.status === 401) {
    AuthApi.logout();
    window.location.reload();
    throw new Error("Session expirée");
  }
}

export class StaffApi {
  static async getConversations(): Promise<Conversation[]> {
    const res = await fetch(`${API_URL}/staff/conversations`, {
      headers: authHeaders(),
    });

    await handleAuthError(res);

    if (!res.ok) {
      throw new Error("Erreur chargement conversations");
    }

    return res.json();
  }

  static async takeConversation(sessionId: string): Promise<Conversation> {
    const res = await fetch(`${API_URL}/staff/conversations/${sessionId}/take`, {
      method: "POST",
      headers: authHeaders(),
    });

    await handleAuthError(res);

    if (!res.ok) {
      throw new Error("Erreur prise de conversation");
    }

    return res.json();
  }

  static async reply(sessionId: string, message: string): Promise<Conversation> {
    const res = await fetch(`${API_URL}/staff/conversations/${sessionId}/reply`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ message }),
    });

    await handleAuthError(res);

    if (!res.ok) {
      throw new Error("Erreur envoi réponse");
    }

    return res.json();
  }

  static async setTyping(
    sessionId: string,
    isTyping: boolean
  ): Promise<Conversation> {
    const res = await fetch(`${API_URL}/staff/conversations/${sessionId}/typing`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ is_typing: isTyping }),
    });

    await handleAuthError(res);

    if (!res.ok) {
      throw new Error("Erreur typing");
    }

    return res.json();
  }

  static async closeConversation(sessionId: string): Promise<Conversation> {
    const res = await fetch(`${API_URL}/staff/conversations/${sessionId}/close`, {
      method: "POST",
      headers: authHeaders(),
    });

    await handleAuthError(res);

    if (!res.ok) {
      throw new Error("Erreur fermeture conversation");
    }

    return res.json();
  }
}