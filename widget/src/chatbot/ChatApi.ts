import type {
  ChatPayload,
  ChatResponse,
  ConversationResponse,
} from "./types";

export class ChatApi {
  constructor(private readonly apiUrl: string) {}

  async send(payload: ChatPayload): Promise<ChatResponse> {
    const response = await fetch(`${this.apiUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("API chatbot indisponible.");
    }

    return response.json();
  }

  async getConversation(sessionId: string): Promise<ConversationResponse> {
    const response = await fetch(
      `${this.apiUrl}/api/conversations/${sessionId}`
    );

    if (!response.ok) {
      throw new Error("Conversation indisponible.");
    }

    return response.json();
  }
}