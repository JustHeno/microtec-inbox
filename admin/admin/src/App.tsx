import { useEffect, useState } from "react";
import {
  StaffApi,
  type Conversation,
  type ConversationSource,
} from "./api/StaffApi";
import { AuthApi } from "./api/AuthApi";
import { ConversationList } from "./components/ConversationList";
import { ConversationPanel } from "./components/ConversationPanel";
import "./index.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    AuthApi.isAuthenticated()
  );

  const [email, setEmail] = useState("admin@microtec.local");
  const [password, setPassword] = useState("");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [activeSource, setActiveSource] = useState<"all" | ConversationSource>(
    "all"
  );

  const [error, setError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoginLoading(true);

    try {
      await AuthApi.login(email, password);
      setIsAuthenticated(true);
    } catch {
      setError("Email ou mot de passe invalide.");
    } finally {
      setLoginLoading(false);
    }
  }

  function handleLogout() {
    AuthApi.logout();
    setIsAuthenticated(false);
    setSelected(null);
    setConversations([]);
  }

  async function loadConversations() {
    if (!AuthApi.isAuthenticated()) return;

    try {
      const data = await StaffApi.getConversations();
      setConversations(data);

      if (selected) {
        const updatedSelected = data.find(
          (conv) => conv.session_id === selected.session_id
        );

        if (updatedSelected) {
          setSelected(updatedSelected);
        }
      }

      setError("");
    } catch {
      setError("Impossible de charger les conversations.");
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return;

    loadConversations();

    const interval = setInterval(() => {
      loadConversations();
    }, 3000);

    return () => clearInterval(interval);
  }, [isAuthenticated, selected?.session_id]);

  async function handleTake() {
    if (!selected) return;

    const updated = await StaffApi.takeConversation(selected.session_id);
    setSelected(updated);
    await loadConversations();
  }

  async function handleReply(message: string) {
    if (!selected) return;

    const updated = await StaffApi.reply(selected.session_id, message);
    setSelected(updated);
    await loadConversations();
  }

  async function handleClose() {
    if (!selected) return;

    const updated = await StaffApi.closeConversation(selected.session_id);
    setSelected(updated);
    await loadConversations();
  }

  if (!isAuthenticated) {
    return (
      <div className="login-page">
        <form className="login-card" onSubmit={handleLogin}>
          <div className="login-brand">
            <div className="login-logo">M</div>
            <div>
              <h1>Microtec Admin</h1>
              <p>Connexion au portail interne</p>
            </div>
          </div>

          <label>
            Courriel
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label>
            Mot de passe
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          <button type="submit" disabled={loginLoading}>
            {loginLoading ? "Connexion..." : "Se connecter"}
          </button>

          {error && <p className="login-error">{error}</p>}
        </form>
      </div>
    );
  }

  const user = AuthApi.getUser();

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="topbar-brand">
          <div className="topbar-logo">M</div>
          <div>
            <strong>Microtec Inbox</strong>
            <span>Chatbot · Messenger · Support client</span>
          </div>
        </div>

        <div className="admin-user">
          <span>{user?.name}</span>
          <button onClick={handleLogout}>Déconnexion</button>
        </div>
      </header>

      <div className="admin-app">
        <ConversationList
          conversations={conversations}
          selectedId={selected?.session_id || null}
          activeSource={activeSource}
          onSourceChange={setActiveSource}
          onSelect={setSelected}
        />

        <ConversationPanel
          conversation={selected}
          onTake={handleTake}
          onReply={handleReply}
          onClose={handleClose}
        />

        {error && <div className="error-toast">{error}</div>}
      </div>
    </div>
  );
}

export default App;