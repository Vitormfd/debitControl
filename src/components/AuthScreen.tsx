import { Link, useLocation } from "react-router-dom";
import { useState, type KeyboardEvent } from "react";

interface AuthScreenProps {
  onSignIn: (email: string, password: string) => Promise<{ error: string | null }>;
  onSignUp: (email: string, password: string) => Promise<{ error: string | null; info?: string }>;
}

export function AuthScreen({ onSignIn, onSignUp }: AuthScreenProps) {
  const location = useLocation();
  const isCadastro = location.pathname === "/cadastro";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMsg, setAuthMsg] = useState("");
  const [msgIsInfo, setMsgIsInfo] = useState(false);

  function clearFeedback() {
    setAuthMsg("");
    setMsgIsInfo(false);
  }

  async function handleEntrar() {
    clearFeedback();
    if (!email.trim() || !password) {
      setAuthMsg("Preencha e-mail e senha.");
      return;
    }
    const { error } = await onSignIn(email.trim(), password);
    if (error) setAuthMsg(error);
  }

  async function handleCriarConta() {
    clearFeedback();
    if (!email.trim() || !password) {
      setAuthMsg("Preencha e-mail e senha.");
      return;
    }
    if (password.length < 6) {
      setAuthMsg("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    const { error, info } = await onSignUp(email.trim(), password);
    if (error) {
      setAuthMsg(error);
      return;
    }
    if (info) {
      setAuthMsg(info);
      setMsgIsInfo(true);
    }
  }

  function onPassKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    if (isCadastro) void handleCriarConta();
    else void handleEntrar();
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1 className="auth-title">💰 Controle de Dívidas</h1>

        {!isCadastro ? (
          <>
            <h2 className="auth-screen-title">Entrar</h2>
            <p className="auth-screen-sub">
              Acesse com o e-mail e a senha da sua conta. Os dados ficam sincronizados no Supabase.
            </p>
            <div className="form-group">
              <label htmlFor="auth-email-login">E-mail</label>
              <input
                id="auth-email-login"
                type="email"
                autoComplete="username"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="auth-pass-login">Senha</label>
              <input
                id="auth-pass-login"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={onPassKeyDown}
              />
            </div>
            <p
              className={`auth-msg${msgIsInfo ? " info" : ""}`}
              aria-live="polite"
            >
              {authMsg}
            </p>
            <div className="auth-primary-wrap">
              <button
                type="button"
                className="btn-salvar"
                onClick={() => void handleEntrar()}
              >
                Entrar
              </button>
            </div>
            <div className="auth-footer">
              Não tem conta?{" "}
              <Link to="/cadastro" className="auth-link">
                Criar conta
              </Link>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="auth-back">
              ← Voltar ao login
            </Link>
            <h2 className="auth-screen-title">Criar conta</h2>
            <p className="auth-screen-sub">
              Use o <strong>mesmo e-mail e senha</strong> no celular e no computador. A senha precisa
              de pelo menos 6 caracteres.
            </p>
            <div className="form-group">
              <label htmlFor="auth-email-cadastro">E-mail</label>
              <input
                id="auth-email-cadastro"
                type="email"
                autoComplete="username"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="auth-pass-cadastro">Senha</label>
              <input
                id="auth-pass-cadastro"
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={onPassKeyDown}
              />
            </div>
            <p
              className={`auth-msg${msgIsInfo ? " info" : ""}`}
              aria-live="polite"
            >
              {authMsg}
            </p>
            <div className="auth-primary-wrap">
              <button
                type="button"
                className="btn-salvar"
                onClick={() => void handleCriarConta()}
              >
                Criar conta
              </button>
            </div>
            <div className="auth-footer">
              Já tem conta?{" "}
              <Link to="/login" className="auth-link">
                Entrar
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
