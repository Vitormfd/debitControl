import { useState, type KeyboardEvent } from "react";

interface AuthScreenProps {
  onSignIn: (email: string, password: string) => Promise<{ error: string | null }>;
  onSignUp: (email: string, password: string) => Promise<{ error: string | null; info?: string }>;
}

export function AuthScreen({ onSignIn, onSignUp }: AuthScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMsg, setAuthMsg] = useState("");

  async function handleEntrar() {
    setAuthMsg("");
    if (!email.trim() || !password) {
      setAuthMsg("Preencha e-mail e senha.");
      return;
    }
    const { error } = await onSignIn(email.trim(), password);
    if (error) setAuthMsg(error);
  }

  async function handleCriar() {
    setAuthMsg("");
    if (!email.trim() || !password) {
      setAuthMsg("Preencha e-mail e senha.");
      return;
    }
    if (password.length < 6) {
      setAuthMsg("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    const { error, info } = await onSignUp(email.trim(), password);
    if (error) setAuthMsg(error);
    else if (info) setAuthMsg(info);
  }

  function onPassKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") void handleEntrar();
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1 className="auth-title">💰 Controle de Dívidas</h1>
        <p className="auth-hint">
          Use o <strong>mesmo e-mail e senha</strong> no celular e no computador.
          Os dados ficam no Supabase (nuvem).
        </p>
        <div className="form-group">
          <label htmlFor="auth-email">E-mail</label>
          <input
            id="auth-email"
            type="email"
            autoComplete="username"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="auth-pass">Senha</label>
          <input
            id="auth-pass"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={onPassKeyDown}
          />
        </div>
        <p className="auth-msg" aria-live="polite">
          {authMsg}
        </p>
        <div className="auth-actions">
          <button type="button" className="btn-salvar" onClick={() => void handleEntrar()}>
            Entrar
          </button>
          <button type="button" className="btn-secondary" onClick={() => void handleCriar()}>
            Criar conta
          </button>
        </div>
      </div>
    </div>
  );
}
