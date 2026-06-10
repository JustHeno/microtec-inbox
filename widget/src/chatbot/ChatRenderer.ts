import microtecAvatar from "../assets/microtec-avatar.png";
import type { MessageType } from "./types";

const CHAT_ICON = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2.25" stroke-linecap="round"
    stroke-linejoin="round" aria-hidden="true">
    <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
    <path d="M8 9h8" />
    <path d="M8 13h5" />
  </svg>
`;

const SEND_ICON = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2" stroke-linecap="round"
    stroke-linejoin="round" aria-hidden="true">
    <path d="M22 2 11 13" />
    <path d="M22 2 15 22 11 13 2 9 22 2Z" />
  </svg>
`;

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "T";
}

export class ChatRenderer {
  public root: HTMLDivElement;
  public window!: HTMLDivElement;
  public messages!: HTMLDivElement;
  public input!: HTMLInputElement;
  public form!: HTMLFormElement;
  public button!: HTMLButtonElement;
  public submitButton!: HTMLButtonElement;
  public closeButton!: HTMLButtonElement;

  constructor() {
    this.root = document.createElement("div");
    this.root.id = "microtec-chatbot-root";
  }

  render(): void {
    this.root.innerHTML = `
      <button
        id="microtec-chatbot-button"
        type="button"
        aria-label="Ouvrir le chatbot Microtec"
        aria-expanded="false"
        aria-controls="microtec-chatbot-window"
      >
        ${CHAT_ICON}
        <span class="online-dot" aria-hidden="true"></span>
      </button>

      <section
        id="microtec-chatbot-window"
        role="dialog"
        aria-modal="false"
        aria-labelledby="microtec-chatbot-title"
      >
        <div id="microtec-chatbot-header">
          <div class="microtec-header-left">
            <img src="${microtecAvatar}" alt="" class="microtec-header-avatar" />

            <div class="microtec-header-info">
              <div id="microtec-chatbot-title" class="microtec-header-title">
                Assistant Microtec
              </div>

              <div class="microtec-header-status">
                En ligne
              </div>
            </div>
          </div>

          <button
            class="microtec-header-close"
            type="button"
            aria-label="Fermer le chatbot"
          >
            ×
          </button>
        </div>

        <div
          id="microtec-chatbot-messages"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
        ></div>

        <form id="microtec-chatbot-form">
          <label class="microtec-sr-only" for="microtec-chatbot-input">
            Message
          </label>

          <input
            id="microtec-chatbot-input"
            type="text"
            placeholder="Pose ta question..."
            autocomplete="off"
            maxlength="500"
          />

          <button
            id="microtec-chatbot-submit"
            type="submit"
            aria-label="Envoyer le message"
          >
            ${SEND_ICON}
          </button>
        </form>
      </section>
    `;

    this.button = this.getElement<HTMLButtonElement>("#microtec-chatbot-button");
    this.window = this.getElement<HTMLDivElement>("#microtec-chatbot-window");
    this.messages = this.getElement<HTMLDivElement>("#microtec-chatbot-messages");
    this.input = this.getElement<HTMLInputElement>("#microtec-chatbot-input");
    this.form = this.getElement<HTMLFormElement>("#microtec-chatbot-form");
    this.submitButton = this.getElement<HTMLButtonElement>("#microtec-chatbot-submit");
    this.closeButton = this.getElement<HTMLButtonElement>(".microtec-header-close");

    this.bindKeyboardEvents();
  }

  mount(): void {
    if (!document.body.contains(this.root)) {
      document.body.appendChild(this.root);
    }
  }

  toggle(): void {
    const isOpen = this.window.classList.toggle("is-open");
    this.button.setAttribute("aria-expanded", String(isOpen));

    if (isOpen) {
      window.setTimeout(() => this.focusInput(), 160);
    }
  }

  close(): void {
    this.window.classList.remove("is-open");
    this.button.setAttribute("aria-expanded", "false");
    this.button.focus();
  }

  addMessage(text: string, type: MessageType): void {
    if (!text.trim()) return;

    const message = document.createElement("div");
    message.className = `microtec-message microtec-${type}`;
    message.textContent = text;

    this.messages.appendChild(message);
    this.scrollToBottom();
  }

  addSystemMessage(text: string): void {
    if (!text.trim()) return;

    const message = document.createElement("div");
    message.className = "microtec-system-message";
    message.textContent = text;

    this.messages.appendChild(message);
    this.scrollToBottom();
  }

  addStaffMessage(text: string, name = "Technicien Microtec"): void {
    if (!text.trim()) return;

    const wrapper = document.createElement("div");
    wrapper.className = "microtec-staff-row";

    const avatar = document.createElement("div");
    avatar.className = "microtec-staff-avatar";
    avatar.textContent = getInitials(name);

    const bubble = document.createElement("div");
    bubble.className = "microtec-message microtec-staff";

    const label = document.createElement("div");
    label.className = "microtec-staff-name";
    label.textContent = name;

    const content = document.createElement("div");
    content.className = "microtec-staff-content";
    content.textContent = text;

    bubble.appendChild(label);
    bubble.appendChild(content);

    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);

    this.messages.appendChild(wrapper);
    this.scrollToBottom();
  }

  showStaffTyping(name = "Technicien Microtec"): void {
    if (this.messages.querySelector("#microtec-staff-typing")) return;

    const wrapper = document.createElement("div");
    wrapper.id = "microtec-staff-typing";
    wrapper.className = "microtec-staff-row typing";

    const avatar = document.createElement("div");
    avatar.className = "microtec-staff-avatar";
    avatar.textContent = getInitials(name);

    const bubble = document.createElement("div");
    bubble.className = "microtec-staff-typing-bubble";

    bubble.innerHTML = `
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
    `;

    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);

    this.messages.appendChild(wrapper);
    this.scrollToBottom();
  }

  hideStaffTyping(): void {
    this.messages.querySelector("#microtec-staff-typing")?.remove();
  }

  showTyping(): void {
    if (this.messages.querySelector("#microtec-typing")) return;

    const typing = document.createElement("div");
    typing.id = "microtec-typing";
    typing.className = "microtec-typing";
    typing.setAttribute("aria-label", "Microtec écrit une réponse");

    typing.innerHTML = `
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
    `;

    this.messages.appendChild(typing);
    this.scrollToBottom();
  }

  hideTyping(): void {
    this.messages.querySelector("#microtec-typing")?.remove();
  }

  setLoading(isLoading: boolean): void {
    this.input.disabled = isLoading;
    this.submitButton.disabled = isLoading;
    this.submitButton.setAttribute("aria-busy", String(isLoading));

    this.submitButton.innerHTML = isLoading
      ? `<span class="microtec-submit-loader" aria-hidden="true"></span>`
      : SEND_ICON;
  }

  clearInput(): void {
    this.input.value = "";
  }

  focusInput(): void {
    this.input.focus();
  }

  getInputValue(): string {
    return this.input.value.trim();
  }

  private bindKeyboardEvents(): void {
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && this.window.classList.contains("is-open")) {
        this.close();
      }
    });
  }

  private scrollToBottom(): void {
    requestAnimationFrame(() => {
      this.messages.scrollTop = this.messages.scrollHeight;
    });
  }

  private getElement<T extends HTMLElement>(selector: string): T {
    const element = this.root.querySelector<T>(selector);

    if (!element) {
      throw new Error(`Élément introuvable: ${selector}`);
    }

    return element;
  }
}