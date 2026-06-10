import type { Conversation, ConversationSource } from "../api/StaffApi";

type Props = {
  conversations: Conversation[];
  selectedId: string | null;
  activeSource: "all" | ConversationSource;
  onSourceChange: (source: "all" | ConversationSource) => void;
  onSelect: (conversation: Conversation) => void;
};

function getSourceLabel(source?: ConversationSource) {
  if (source === "facebook") return "Messenger";
  if (source === "instagram") return "Instagram";
  if (source === "website") return "Chatbot site";
  return "Inconnu";
}

function getSourceIcon(source?: ConversationSource) {
  if (source === "facebook") return "f";
  if (source === "instagram") return "◎";
  if (source === "website") return "💬";
  return "?";
}

function getConversationName(conversation: Conversation) {
  if (conversation.customer_name) return conversation.customer_name;
  if (conversation.source === "facebook") return "Client Messenger";
  if (conversation.source === "instagram") return "Client Instagram";
  return `Visiteur ${conversation.session_id.slice(0, 8)}`;
}

function getLastMessage(conversation: Conversation) {
  return (
    conversation.messages[conversation.messages.length - 1]?.content ||
    "Nouvelle conversation"
  );
}

function getStatusLabel(status: Conversation["status"]) {
  if (status === "ai_active") return "IA";
  if (status === "waiting_human") return "À prendre";
  if (status === "human_active") return "Humain";
  if (status === "closed") return "Fermée";
  return status;
}

export function ConversationList({
  conversations,
  selectedId,
  activeSource,
  onSourceChange,
  onSelect,
}: Props) {
  const filtered =
    activeSource === "all"
      ? conversations
      : conversations.filter((conversation) => {
          const source = conversation.source || "website";
          return source === activeSource;
        });

  const websiteCount = conversations.filter(
    (conversation) => (conversation.source || "website") === "website"
  ).length;

  const facebookCount = conversations.filter(
    (conversation) => conversation.source === "facebook"
  ).length;

  const instagramCount = conversations.filter(
    (conversation) => conversation.source === "instagram"
  ).length;

  return (
    <aside className="conversation-list">
      <div className="sidebar-header">
        <div>
          <span className="eyebrow">Inbox centralisée</span>
          <h2>Discussions</h2>
          <p>Chatbot, Messenger et autres canaux</p>
        </div>

        <span className="total-count">{conversations.length}</span>
      </div>

      <div className="source-filters">
        <button
          className={activeSource === "all" ? "active" : ""}
          onClick={() => onSourceChange("all")}
        >
          Tout <span>{conversations.length}</span>
        </button>

        <button
          className={activeSource === "website" ? "active" : ""}
          onClick={() => onSourceChange("website")}
        >
          Website <span>{websiteCount}</span>
        </button>

        <button
          className={activeSource === "facebook" ? "active" : ""}
          onClick={() => onSourceChange("facebook")}
        >
          Messenger <span>{facebookCount}</span>
        </button>

        <button
          className={activeSource === "instagram" ? "active" : ""}
          onClick={() => onSourceChange("instagram")}
        >
          Instagram <span>{instagramCount}</span>
        </button>
      </div>

      {filtered.length === 0 && (
        <p className="empty-state">Aucune discussion dans ce canal.</p>
      )}

      <div className="conversation-items">
        {filtered.map((conversation) => {
          const source = conversation.source || "website";
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