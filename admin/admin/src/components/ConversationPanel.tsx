import { useRef, useState } from "react";
import type { Conversation, ConversationSource } from "../api/StaffApi";
import { StaffApi } from "../api/StaffApi";

type Props = {
  conversation: Conversation | null;
  onTake: () => Promise<void>;
  onReply: (message: string) => Promise<void>;
  onClose: () => Promise<void>;
  onDelete: () => Promise<void>;
};

function normalizeSource(source?: ConversationSource): ConversationSource {
  if (!source || source === "web") return "website";
  return source;
}

function getSourceLabel(source?: ConversationSource) {
  const normalized = normalizeSource(source);

  if (normalized === "facebook") return "Messenger Facebook";
  if (normalized === "instagram") return "Instagram";
  if (normalized === "website") return "Web / Chatbot du site";
  if (normalized === "shopify_contact") return "Formulaire Shopify";
  if (normalized === "email") return "Courriel";

  return "Canal inconnu";
}

function getSourceIcon(source?: ConversationSource) {
  const normalized = normalizeSource(source);

  if (normalized === "facebook") return "f";
  if (normalized === "instagram") return "◉";
  if (normalized === "website") return "🌐";
  if (normalized === "shopify_contact") return "🛒";
  if (normalized === "email") return "✉";

  return "?";
}

function getConversationName(conversation: Conversation) {
  if (conversation.customer_name) return conversation.customer_name;
  if (conversation.visitor?.name) return conversation.visitor.name;

  const source = normalizeSource(conversation.source);

  if (source === "facebook") return "Client Messenger";
  if (source === "instagram") return "Client Instagram";
  if (source === "shopify_contact") return "Client Shopify";
  if (source === "email") return conversation.visitor?.email || "Contact courriel";

  return `Visiteur ${conversation.session_id.slice(0, 8)}`;
}

function getStatusLabel(status: Conversation["status"]) {
  if (status === "ai_active") return "IA active";
  if (status === "waiting_human") return "En attente d’un humain";
  if (status === "human_needed") return "À traiter";
  if (status === "human_active") return "Pris en charge";
  if (status === "closed") return "Fermée";
  if (status === "deleted") return "Supprimée";

  return status;
}

function getRoleLabel(role: string) {
  if (role === "user") return "Client";
  if (role === "customer") return "Client";
  if (role === "assistant") return "Assistant IA";
  if (role === "staff") return "Équipe Microtec";

  return role;
}

export function ConversationPanel({
  conversation,
  onTake,
  onReply,
  onClose,
  onDelete,
}: Props) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const typingTimeoutRef = useRef<number | null>(null);

  async function sendTyping(isTyping: boolean) {
    if (!conversation) return;
    if (conversation.status !== "human_active") return;

    try {
      await StaffApi.setTyping(conversation.session_id, isTyping);
    } catch {
      // ignore
    }
  }

  function handleMessageChange(value: string) {
    setMessage(value);

    if (!conversation || conversation.status !== "human_active") return;

    sendTyping(value.trim().length > 0);

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = window.setTimeout(() => {
      sendTyping(false);
    }, 1200);
  }

  async function handleReply() {
    if (!conversation) return;
    if (!message.trim()) return;

    setLoading(true);

    try {
      await sendTyping(false);
      await onReply(message.trim());
      setMessage("");
    } finally {
      setLoading(false);
    }
  }

  if (!conversation) {
    return (
      <main className="conversation-panel empty-panel">
        <div className="empty-panel-card">
          <div className="empty-icon">◎</div>
          <h1>Sélectionne une discussion</h1>
          <p>
            Tous les messages clients vont apparaître ici : Web, Shopify,
            Messenger, Instagram et courriel.
          </p>
        </div>
      </main>
    );
  }

  const source = normalizeSource(conversation.source);
  const name = getConversationName(conversation);

  return (
    <main className="conversation-panel">
      <header className={`panel-header source-${source}`}>
        <div className="panel-client">
          {conversation.customer_avatar ? (
            <img
              src={conversation.customer_avatar}
              alt=""
              className="panel-avatar"
            />
          ) : (
            <span className={`panel-avatar fallback ${source}`}>
              {getSourceIcon(source)}
            </span>
          )}

          <div>
            <div className="panel-title-row">
              <h1>{name}</h1>

              <span className={`source-badge source-${source}`}>
                {getSourceLabel(source)}
              </span>
            </div>

            <p>
              Discussion #{conversation.session_id.slice(0, 8)} ·{" "}
              <strong>{getStatusLabel(conversation.status)}</strong>
            </p>
          </div>
        </div>

        <div className="panel-actions">
          {(conversation.status === "waiting_human" ||
            conversation.status === "human_needed" ||
            conversation.status === "ai_active") && (
            <button className="primary-btn" onClick={onTake}>
              Prendre la discussion
            </button>
          )}

          {conversation.status !== "closed" && (
            <button className="danger-btn" onClick={onClose}>
              Fermer
            </button>
          )}

          {conversation.status === "closed" && (
            <button className="delete-btn" onClick={onDelete}>
              Supprimer
            </button>
          )}
        </div>
      </header>

      <section className="conversation-info-bar">
        <div>
          <span>Canal</span>
          <strong>{getSourceLabel(source)}</strong>
        </div>

        <div>
          <span>Statut</span>
          <strong>{getStatusLabel(conversation.status)}</strong>
        </div>

        <div>
          <span>Priorité</span>
          <strong>{conversation.priority || "Normale"}</strong>
        </div>

        <div>
          <span>Messages</span>
          <strong>{conversation.messages.length}</strong>
        </div>

        <div>
          <span>Contact</span>
          <strong>
            {conversation.visitor?.phone ||
              conversation.visitor?.email ||
              conversation.visitor?.name ||
              "Non fourni"}
          </strong>
        </div>
      </section>

      {conversation.subject && (
        <section className="conversation-subject-panel">
          <span>Sujet</span>
          <strong>{conversation.subject}</strong>
        </section>
      )}

      <section className="messages">
        {conversation.messages.map((msg, index) => (
          <div key={msg.id || index} className={`message ${msg.role}`}>
            <span>
              {msg.role === "staff"
                ? msg.staff_name || getRoleLabel(msg.role)
                : getRoleLabel(msg.role)}
            </span>

            <p>{msg.content}</p>
          </div>
        ))}
      </section>

      {conversation.status === "human_active" && (
        <footer className="reply-box">
          <textarea
            value={message}
            onChange={(e) => handleMessageChange(e.target.value)}
            placeholder={`Répondre au client via ${getSourceLabel(source)}...`}
          />

          <button disabled={loading} onClick={handleReply}>
            {loading ? "Envoi..." : "Envoyer"}
          </button>
        </footer>
      )}

      {conversation.status !== "human_active" &&
        conversation.status !== "closed" && (
          <footer className="locked-reply-box">
            Prends la discussion pour pouvoir répondre au client.
          </footer>
        )}

      {conversation.status === "closed" && (
        <footer className="locked-reply-box closed">
          Discussion fermée. Tu peux la supprimer si elle n’est plus nécessaire.
        </footer>
      )}
    </main>
  );
}