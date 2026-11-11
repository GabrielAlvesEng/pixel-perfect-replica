import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Clock } from "lucide-react";
import { Button, TextField, logos } from "@/components/md3";
import { springs } from "@/lib/theme";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Entrar · SolidAuto" },
    { name: "description", content: "Entre no SolidAuto, a automação de engenharia da Fabriaço no SolidWorks." },
    { property: "og:title", content: "Entrar · SolidAuto" },
    { property: "og:description", content: "Entre no SolidAuto, a automação de engenharia da Fabriaço no SolidWorks." },
  ] }),
  component: Login,
});

function Login() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"login" | "first">("login");
  const [user, setUser] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [leaving, setLeaving] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.trim()) { setError("Usuário ou senha incorretos. Confira e tente de novo."); return; }
    setError(null); setState("loading");
    setTimeout(() => { setState("done"); setTimeout(() => { setLeaving(true); setTimeout(() => nav({ to: "/home" }), 650); }, 450); }, 1100);
  };

  return (
    <div className="relative grid h-screen min-h-[660px] grid-cols-[5fr_6fr] overflow-hidden bg-card">
      <motion.section className="relative z-10 flex flex-col items-center justify-center overflow-hidden bg-hero"
        animate={leaving ? { width: "100vw" } : { width: "100%" }} transition={springs.screen}>
        <motion.img src={logos.negativo} aria-hidden className="pointer-events-none absolute -left-24 -top-10 h-[130%] max-w-none opacity-[0.06]"
          animate={{ y: [0, -24, 0], x: [0, 12, 0] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div animate={leaving ? { opacity: 0, scale: 0.96 } : { opacity: 1 }} className="relative flex flex-col items-center">
          <img src={logos.negativo} alt="Fabriaço" className="w-[300px]" />
          <div className="mt-8 flex items-center gap-4 text-[11px] font-semibold tracking-[0.32em] text-white/85">
            <span className="h-px w-10 bg-white/60" />MONTAGENS INDUSTRIAIS E CALDEIRARIA<span className="h-px w-10 bg-white/60" />
          </div>
        </motion.div>
      </motion.section>

      <section className="flex items-center justify-center px-12">
        <div className="w-full max-w-[400px]">
          <div className="grid size-16 place-items-center rounded-card bg-primary-container"><img src={logos.simbolo} alt="" className="size-9" /></div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight">SolidAuto</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">Automação da engenharia: propriedades, listas de corte, DXFs e listas de materiais direto do SolidWorks.</p>

          <AnimatePresence mode="wait">
            <motion.form key={mode} onSubmit={submit} className="mt-8 space-y-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: springs.screen }} exit={{ opacity: 0, transition: { duration: 0.1 } }}>
              {mode === "first" && <p className="eyebrow">PRIMEIRO ACESSO · CRIE O ADMINISTRADOR</p>}
              {mode === "first" && <TextField label="Nome" />}
              <TextField label="Usuário" value={user} onChange={(e) => setUser(e.target.value)} error={error ? " " : undefined} autoComplete="username" />
              <TextField label="Senha" type="password" error={error ? " " : undefined} autoComplete="current-password" />
              {mode === "first" && <TextField label="Confirmar senha" type="password" />}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="flex gap-2 rounded-field bg-error-bg p-3 text-sm text-error"><AlertCircle className="mt-0.5 size-4 shrink-0" />{error}</div>
                  </motion.div>
                )}
              </AnimatePresence>
              <Button type="submit" state={state} className="w-full">{mode === "first" ? "Criar e entrar" : "Entrar"}</Button>
              <div className="flex justify-between text-sm">
                <button type="button" className="font-semibold text-primary hover:underline">Esqueci minha senha</button>
                <button type="button" onClick={() => { setMode(mode === "login" ? "first" : "login"); setError(null); }} className="text-muted-foreground hover:text-foreground">
                  {mode === "login" ? "Ver primeiro acesso" : "Voltar ao login"}
                </button>
              </div>
            </motion.form>
          </AnimatePresence>

          <div className="mt-8 flex gap-3 rounded-field bg-primary-container p-4 text-[13px] leading-relaxed text-on-primary-container">
            <Clock className="mt-0.5 size-4 shrink-0" />A sessão fica aberta enquanto o app estiver em uso e termina depois de 3 horas sem uso.
          </div>
          <p className="mt-3 text-xs text-faint">Dica do protótipo: deixe o usuário vazio para ver o estado de erro.</p>
        </div>
      </section>
    </div>
  );
}
