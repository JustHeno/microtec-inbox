import "./styles/index.css";

import { ChatApi } from "./ChatApi";
import { ChatRenderer } from "./ChatRenderer";
import type { ConversationMessage } from "./types";

const SESSION_KEY = "microtec_chatbot_session_id";

export class MicrotecChatbot {
  private api: ChatApi;
  private renderer: ChatRenderer;

  private sessionId: string | null = localStorage.getItem(SESSION_KEY);
  private pollingId: number | null = null;

  private renderedMessageKeys = new Set<string>();
  private humanTakeoverShown = false;

  constructor(apiUrl: string) {
    this.api = new ChatApi(apiUrl);
    this.renderer = new ChatRenderer();
  }

  mount(): void {
    this.renderer.render();
    this.renderer.mount();

    this.bindEvents();

    this.renderer.addMessage(
      "Salut 👋 Je suis l’assistant Microtec.\nComment je peux t’aider?",
      "bot"
    );

    this.startPolling();
  }

  private bindEvents(): void {
    this.renderer.button.addEventListener("click", () => {
      this.renderer.toggle();
    });

    this.renderer.closeButton.addEventListener("click", () => {
      this.renderer.close();
    });

    this.renderer.form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const message = this.renderer.getInputValue();

      if (!message) return;

      this.renderer.addMessage(message, "user");
      this.renderer.clearInput();

      await this.sendMessage(message);
    });
  }

  private async sendMessage(message: string): Promise<void> {
    this.renderer.showTyping();
    this.renderer.setLoading(true);

    try {
      const data = await this.api.send({
        message,
        page_url: window.location.href,
        session_id: this.sessionId,
      });

      this.sessionId = data.session_id;
      localStorage.setItem(SESSION_KEY, data.session_id);

      this.renderer.hideTyping();

      if (data.reply && data.reply.trim()) {
        this.renderer.addMessage(data.reply, "bot");
      }

      await this.syncConversation();
    } catch {
      this.renderer.hideTyping();

      this.renderer.addMessage(
        "Erreur de connexion avec l’assistant Microtec.",
        "bot"
      );
    } finally {
      this.renderer.setLoading(false);
      this.renderer.focusInput();
    }
  }

  private startPolling(): void {
    if (this.pollingId !== null) return;

    this.pollingId = window.setInterval(() => {
      this.syncConversation();
    }, 1500);
  }

  private async syncConversation(): Promise<void> {
    if (!this.sessionId) return;

    try {
      const conversation = await this.api.getConversation(this.sessionId);

      if (
        conversation.status === "human_active" &&
        !this.humanTakeoverShown
      ) {
        this.humanTakeoverShown = true;

        this.renderer.addSystemMessage(
          "👨 Un membre de l’équipe Microtec a pris le relais."
        );
      }

      if (conversation.staff_typing) {
        this.renderer.showStaffTyping(
          conversation.staff_typing_name || "Technicien Microtec"
        );
      } else {
        this.renderer.hideStaffTyping();
      }

      for (const msg of conversation.messages) {
        if (msg.role !== "staff") continue;

        const key = this.getMessageKey(msg);

        if (this.renderedMessageKeys.has(key)) continue;

        this.renderedMessageKeys.add(key);

        this.renderer.hideStaffTyping();

        this.renderer.addStaffMessage(
          msg.content,
          msg.staff_name || "Technicien Microtec"
        );
      }
    } catch {
      // Ignore polling errors.
    }
  }

  private getMessageKey(msg: ConversationMessage): string {
    return `${msg.role}-${msg.created_at ?? ""}-${msg.staff_name ?? ""}-${msg.content}`;
  }
}