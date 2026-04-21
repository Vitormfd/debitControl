import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { AuthScreen } from "./components/AuthScreen";
import { Dashboard } from "./components/Dashboard";
import { ErrorBanner } from "./components/ErrorBanner";
import {
  createSupabaseClient,
  isSupabaseConfigured,
} from "./lib/supabaseClient";

function dataHojeLabel(): string {
  const hoje = new Date();
  return hoje.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function App() {
  const queryClient = useQueryClient();
  const [banner, setBanner] = useState("");
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [subtitleHoje, setSubtitleHoje] = useState(dataHojeLabel);

  const configured = useMemo(() => isSupabaseConfigured(), []);

  useEffect(() => {
    if (!configured) {
      setBanner("");
      return;
    }
    const sb = createSupabaseClient();
    if (!sb) {
      setBanner("Não foi possível iniciar o cliente Supabase.");
      return;
    }
    setClient(sb);
    setBanner("");

    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((_event, sess) => {
      setSubtitleHoje(dataHojeLabel());
      setSession(sess);
      if (sess) setBanner("");
    });

    return () => subscription.unsubscribe();
  }, [configured]);

  async function handleSignIn(email: string, password: string) {
    if (!client) return { error: "Cliente indisponível." };
    const { error } = await client.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async function handleSignUp(email: string, password: string) {
    if (!client) return { error: "Cliente indisponível." };
    const { data, error } = await client.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (!data.session) {
      return {
        error: null as string | null,
        info: "Conta criada. Se aparecer pedido de confirmação, verifique o e-mail ou desative “Confirm email” em Authentication > Providers > Email no Supabase.",
      };
    }
    return { error: null as string | null };
  }

  async function handleSignOut() {
    if (!client) return;
    queryClient.removeQueries({ queryKey: ["dividas"] });
    await client.auth.signOut();
  }

  if (!configured) {
    return (
      <ErrorBanner
        message={
          banner ||
          "Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env (veja .env.example)."
        }
      />
    );
  }

  if (!client) {
    return <ErrorBanner message={banner || "Carregando…"} />;
  }

  return (
    <>
      <ErrorBanner message={banner} />
      <Routes>
        <Route
          path="/login"
          element={
            session ? (
              <Navigate to="/" replace />
            ) : (
              <AuthScreen onSignIn={handleSignIn} onSignUp={handleSignUp} />
            )
          }
        />
        <Route
          path="/cadastro"
          element={
            session ? (
              <Navigate to="/" replace />
            ) : (
              <AuthScreen onSignIn={handleSignIn} onSignUp={handleSignUp} />
            )
          }
        />
        <Route
          path="/"
          element={
            session ? (
              <Dashboard
                supabase={client}
                onSignOut={handleSignOut}
                subtitleHoje={subtitleHoje}
                onLoadError={(msg) => setBanner(msg)}
                onLoadStart={() => setBanner("")}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="*"
          element={<Navigate to={session ? "/" : "/login"} replace />}
        />
      </Routes>
    </>
  );
}
