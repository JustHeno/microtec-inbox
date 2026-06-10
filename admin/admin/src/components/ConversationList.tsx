import type { Conversation, ConversationSource } from "../api/StaffApi";

type Props = {
  conversations: Conversation[];
  selectedId: string | null;
  activeSource: "all" | ConversationSource;
  onSourceChange: (source: "all" | ConversationSource) => void;
  onSelect: (conversation: Conversation) => void;
};

const SOURCES: Array<{
  key: "all" | ConversationSource;
  label: string;
  icon: string;
}> = [
  { key: "all", label: "Tout", icon: "◎" },
  { key: "website", label: "Web", icon: "🌐" },
  { key: "shopify_contact", label: "Shopify", icon: "🛒" },
  { key: "facebook", label: "Messenger", icon: "f" },
  { key: "instagram", label: "Instagram", icon: "◉" },
  { key: "email", label: "Courriel", icon: "✉" },
];

function normalizeSource(source?: ConversationSource): ConversationSource {
  if (!source || source === "web") return "website";
  return source;
}

function getSourceLabel(source?: ConversationSource) {
  const normalized = normalizeSource(source);

  if (normalized === "facebook") return "Messenger";
  if (normalized === "instagram") return "Instagram";
  if (normalized === "website") return "Web / Chatbot";
  if (normalized === "shopify_contact") return "Formulaire Shopify";
  if (normalized === "email") return "Courriel";

  return "Inconnu";
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

function getLastMessage(conversation: Conversation) {
  return (
    conversation.messages[conversation.messages.length - 1]?.content ||
    conversation.subject ||
    "Nouvelle conversation"
  );
}

function getStatusLabel(status: Conversation["status"]) {
  if (status === "ai_active") return "IA";
  if (status === "waiting_human") return "À prendre";
  if (status === "human_needed") return "À traiter";
  if (status === "human_active") return "Humain";
  if (status === "closed") return "Fermée";
  if (status === "deleted") return "Supprimée";

  return status;
}

export function ConversationList({
  conversations,
  selectedId,
  activeSource,
  onSourceChange,
  onSelect,
}: Props) {
  const visibleConversations = conversations.filter(
    (conversation) => conversation.status !== "deleted"
  );

  const filtered =
    activeSource === "all"
      ? visibleConversations
      : visibleConversations.filter((conversation) => {
          return normalizeSource(conversation.source) === activeSource;
        });

  function countSource(source: "all" | ConversationSource) {
    if (source === "all") return visibleConversations.length;

    return visibleConversations.filter(
      (conversation) => normalizeSource(conversation.source) === source
    ).length;
  }

  return (
    <aside className="conversation-list">
      <div className="sidebar-header">
        <div>
          <span className="eyebrow">Inbox centralisée</span>
          <h2>Discussions</h2>
          <p>Web · Shopify · Messenger · Instagram · Courriel</p>
        </div>

        <span className="total-count">{visibleConversations.length}</span>
      </div>

      <div className="source-filters">
        {SOURCES.map((source) => (
          <button
            key={source.key}
            className={activeSource === source.key ? "active" : ""}
            onClick={() => onSourceChange(source.key)}
          >
            <span className="filter-label">
              <strong>{source.icon}</strong>
              {source.label}
            </span>

            <span>{countSource(source.key)}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="empty-state">Aucune discussion dans ce canal.</p>
      )}

      <div className="conversation-items">
        {filtered.map((conversation) => {
          const source = normalizeSource(conversation.source);
          const lastMessage = getLastMessage(conversation);
          const name = getConversationName(conversation);

          return (
            <button
              key={conversation.session_id}
              className={
                conversation.session_id === selectedId
                  ? `conversation-item active source-${source}`
                  : `conversation-item source-${source}`
              }
              onClick={() => onSelect(conversation)}
            >
              <div className="conversation-top">
                <div className="conversation-identity">
                  {conversation.customer_avatar ? (
                    <img
                      src={conversation.customer_avatar}
                      alt=""
                      className="conversation-avatar"
                    />
                  ) : (
                    <span className={`conversation-avatar fallback ${source}`}>
                      {getSourceIcon(source)}
                    </span>
                  )}

                  <div>
                    <strong>{name}</strong>

                    <div className="conversation-meta">
                      <span className={`source-badge source-${source}`}>
                        {getSourceLabel(source)}
                      </span>

                      <span className="conversation-id">
                        #{conversation.session_id.slice(0, 8)}
                      </span>
                    </div>
                  </div>
                </div>

                <span className={`status ${conversation.status}`}>
                  {getStatusLabel(conversation.status)}
                </span>
              </div>

              {conversation.subject && (
                <div className="conversation-subject">
                  {conversation.subject}
                </div>
              )}

              <p>{lastMessage}</p>

              <div className="conversation-bottom">
                {conversation.priority && (
                  <small className={`priority ${conversation.priority}`}>
                    Priorité {conversation.priority}
                  </small>
                )}

                {conversation.reason && (
                  <small className="reason">{conversation.reason}</small>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}