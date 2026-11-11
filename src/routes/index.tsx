import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowLeft, Clock, MailCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button, TextField, logos } from "@/components/md3";
import { springs } from "@/lib/theme";
import "@lovable.dev/cloud-auth-js/styles.css";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Entrar · SolidAuto" },
      { name: "description", content: "Entre no SolidAuto, a automação de engenharia da Fabriaço no SolidWorks." },
      { property: "og:title", content: "Entrar · SolidAuto" },
      { property: "og:description", content: "Entre no SolidAuto, a automação de engenharia da Fabriaço no SolidWorks." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Login,
});

type Mode = "login" | "signup" | "forgot" | "sent" | "confirm";

function GoogleGlyph() {
  // Arte e cores oficiais do "G" da Google — não podem ser alteradas.
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
    </svg>
  );
}

function traduzErro(msg: string) {
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos. Confira e tente de novo.";
  if (m.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar. Veja a caixa de entrada.";
  if (m.includes("already registered") || m.includes("already exists")) return "Esse e-mail já tem conta. Entre com a senha.";
  if (m.includes("password")) return "A senha não atende aos requisitos. Use pelo menos 6 caracteres.";
  if (m.includes("rate limit") || m.includes("too many")) return "Muitas tentativas seguidas. Aguarde um pouco e tente de novo.";
  return msg;
}

function Login() {
  const nav = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [leaving, setLeaving] = useState(false);

  // Quem já está dentro não precisa ver a tela de entrada de novo.
  useEffect(() => {
    let vivo = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (vivo && session) nav({ to: "/home", replace: true });
    });
    return () => {
      vivo = false;
    };
  }, [nav]);

  const irParaHome = () => {
    setLeaving(true);
    setTimeout(() => nav({ to: "/home", replace: true }), 650);
  };

  const trocar = (m: Mode) => {
    setMode(m);
    setError(null);
    setState("idle");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === "login") {
      if (!email.trim() || !pwd) {
        setError("Preencha e-mail e senha.");
        return;
      }
      setState("loading");
      const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pwd });
      if (err) {
        setState("idle");
        setError(traduzErro(err.message));
        return;
      }
      setState("done");
      irParaHome();
      return;
    }

    if (mode === "signup") {
      if (!name.trim() || !username.trim() || !email.trim() || !pwd) {
        setError("Preencha nome, usuário, e-mail e senha.");
        return;
      }
      if (pwd !== confirm) {
        setError("As duas senhas precisam ser iguais.");
        return;
      }
      setState("loading");
      const { data, error: err } = await supabase.auth.signUp({
        email: email.trim(),
        password: pwd,
        options: {
          data: { name: name.trim(), username: username.trim() },
          emailRedirectTo: window.location.origin,
        },
      });
      if (err) {
        setState("idle");
        setError(traduzErro(err.message));
        return;
      }
      setState("done");
      // Com confirmação de e-mail ligada, a conta só entra depois do clique no link.
      setTimeout(() => trocar(data.session ? "login" : "confirm"), 500);
      if (data.session) irParaHome();
      return;
    }

    if (mode === "forgot") {
      if (!email.trim()) {
        setError("Digite o e-mail da sua conta.");
        return;
      }
      setState("loading");
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setState("idle");
      if (err) {
        setError(traduzErro(err.message));
        return;
      }
      setMode("sent");
    }
  };

  const entrarCom = async (provedor: "google" | "lovable") => {
    setError(null);
    const resultado = await lovable.auth.signInWithOAuth(provedor, {
      redirect_uri: window.location.origin,
    });
    if (resultado.error) {
      setError(traduzErro(resultado.error.message ?? "Não foi possível entrar com esse provedor."));
      return;
    }
    if (resultado.redirected) return;
    irParaHome();
  };

  return (
    <div className="relative grid h-screen min-h-[660px] grid-cols-[5fr_6fr] overflow-hidden bg-card">
      <motion.section
        className="relative z-10 flex flex-col items-center justify-center overflow-hidden bg-hero"
        animate={leaving ? { width: "100vw" } : { width: "100%" }}
        transition={springs.screen}
      >
        <motion.img
          src={logos.negativo}
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-10 h-[130%] max-w-none opacity-[0.06]"
          animate={{ y: [0, -24, 0], x: [0, 12, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div animate={leaving ? { opacity: 0, scale: 0.96 } : { opacity: 1 }} className="relative flex flex-col items-center">
          <img src={logos.negativo} alt="Fabriaço" className="w-[300px]" />
          <div className="mt-8 flex items-center gap-4 text-[11px] font-semibold tracking-[0.32em] text-white/85">
            <span className="h-px w-10 bg-white/60" />
            MONTAGENS INDUSTRIAIS E CALDEIRARIA
            <span className="h-px w-10 bg-white/60" />
          </div>
        </motion.div>
      </motion.section>

      <section className="flex items-center justify-center overflow-y-auto px-12">
        <div className="w-full max-w-[400px]">
          <div className="grid size-16 place-items-center rounded-card bg-primary-container">
            <img src={logos.simbolo} alt="" className="size-9" />
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight">SolidAuto</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
            Automação da engenharia: propriedades, listas de corte, DXFs e listas de materiais direto do SolidWorks.
          </p>

          {mode === "confirm" ? (
            <motion.div key="confirm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
              <div className="grid size-12 place-items-center rounded-full bg-success-bg">
                <MailCheck className="size-6 text-success" />
              </div>
              <h2 className="mt-4 text-xl font-bold">Confirme seu e-mail</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                Mandamos um link para <b className="text-foreground">{email}</b>. Clique nele para ativar a
                conta e depois volte para entrar.
              </p>
              <Button className="mt-6 w-full" onClick={() => trocar("login")}>
                Já confirmei, entrar
              </Button>
            </motion.div>
          ) : mode === "sent" ? (
            <motion.div key="sent" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
              <div className="grid size-12 place-items-center rounded-full bg-primary-container">
                <MailCheck className="size-6 text-primary" />
              </div>
              <h2 className="mt-4 text-xl font-bold">Link enviado</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                Se <b className="text-foreground">{email}</b> estiver cadastrado, você recebe um link para
                criar uma senha nova.
              </p>
              <Button className="mt-6 w-full" onClick={() => trocar("login")}>
                Voltar para entrar
              </Button>
            </motion.div>
          ) : (
            <>
              <AnimatePresence mode="wait">
                <motion.form
                  key={mode}
                  onSubmit={submit}
                  className="mt-8 space-y-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0, transition: springs.screen }}
                  exit={{ opacity: 0, transition: { duration: 0.1 } }}
                >
                  {mode === "signup" && (
                    <>
                      <TextField label="Nome" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                      <TextField
                        label="Usuário"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoComplete="username"
                        mono
                      />
                    </>
                  )}
                  <TextField
                    label="E-mail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={error ? " " : undefined}
                    autoComplete="email"
                  />
                  {mode !== "forgot" && (
                    <TextField
                      label="Senha"
                      type="password"
                      value={pwd}
                      onChange={(e) => setPwd(e.target.value)}
                      error={error ? " " : undefined}
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    />
                  )}
                  {mode === "signup" && (
                    <TextField
                      label="Confirmar senha"
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      autoComplete="new-password"
                    />
                  )}

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex gap-2 rounded-field bg-error-bg p-3 text-sm text-error">
                          <AlertCircle className="mt-0.5 size-4 shrink-0" />
                          {error}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button type="submit" state={state} className="w-full">
                    {mode === "signup" ? "Criar conta" : mode === "forgot" ? "Enviar link" : "Entrar"}
                  </Button>

                  <div className="flex justify-between text-sm">
                    {mode === "login" ? (
                      <button type="button" className="font-semibold text-primary hover:underline" onClick={() => trocar("forgot")}>
                        Esqueci minha senha
                      </button>
                    ) : (
                      <button type="button" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground" onClick={() => trocar("login")}>
                        <ArrowLeft className="size-3.5" />
                        Voltar
                      </button>
                    )}
                    {mode !== "signup" && (
                      <button type="button" onClick={() => trocar("signup")} className="text-muted-foreground hover:text-foreground">
                        Criar conta
                      </button>
                    )}
                  </div>
                </motion.form>
              </AnimatePresence>

              <div className="mt-6 flex items-center gap-3">
                <span className="h-px flex-1 bg-border" />
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">ou</span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <div className="mt-4 space-y-3">
                <Button
                  variant="outlined"
                  className="w-full gap-2.5 border border-google-border bg-google-bg px-3 text-google-text hover:bg-google-bg"
                  icon={<GoogleGlyph />}
                  onClick={() => entrarCom("google")}
                >
                  Continuar com Google
                </Button>
                <button
                  type="button"
                  className="lovable-auth-button w-full"
                  onClick={() => entrarCom("lovable")}
                >
                  Continuar com Lovable
                </button>
              </div>

              <div className="mt-6 flex gap-3 rounded-field bg-primary-container p-4 text-[13px] leading-relaxed text-on-primary-container">
                <Clock className="mt-0.5 size-4 shrink-0" />
                Sua sessão fica salva neste navegador até você sair.
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
