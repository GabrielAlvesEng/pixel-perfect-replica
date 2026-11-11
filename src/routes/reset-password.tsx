import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button, TextField, logos } from "@/components/md3";
import { springs } from "@/lib/theme";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Definir nova senha · SolidAuto" },
      { name: "description", content: "Defina uma nova senha para entrar no SolidAuto." },
      { property: "og:title", content: "Definir nova senha · SolidAuto" },
      { property: "og:description", content: "Defina uma nova senha para entrar no SolidAuto." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const nav = useNavigate();
  const [ready, setReady] = useState<boolean | null>(null);
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  useEffect(() => {
    // O link de recuperação chega com type=recovery no endereço.
    const isRecovery =
      window.location.hash.includes("type=recovery") ||
      window.location.search.includes("type=recovery");
    setReady(isRecovery);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.length < 6) {
      setError("A nova senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (pwd !== confirm) {
      setError("As duas senhas precisam ser iguais.");
      return;
    }
    setError(null);
    setState("loading");
    const { error: err } = await supabase.auth.updateUser({ password: pwd });
    if (err) {
      setState("idle");
      setError("Não foi possível salvar a senha. Abra o link do e-mail de novo ou peça outro.");
      return;
    }
    setState("done");
    setTimeout(() => nav({ to: "/home", replace: true }), 700);
  };

  return (
    <div className="grid h-screen min-h-[660px] grid-cols-[5fr_6fr] overflow-hidden bg-card">
      <section className="relative flex flex-col items-center justify-center overflow-hidden bg-hero">
        <motion.img
          src={logos.negativo}
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-10 h-[130%] max-w-none opacity-[0.06]"
          animate={{ y: [0, -24, 0], x: [0, 12, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative flex flex-col items-center">
          <img src={logos.negativo} alt="Fabriaço" className="w-[300px]" />
          <div className="mt-8 flex items-center gap-4 text-[11px] font-semibold tracking-[0.32em] text-white/85">
            <span className="h-px w-10 bg-white/60" />
            MONTAGENS INDUSTRIAIS E CALDEIRARIA
            <span className="h-px w-10 bg-white/60" />
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-12">
        <div className="w-full max-w-[400px]">
          <div className="grid size-16 place-items-center rounded-card bg-primary-container">
            <KeyRound className="size-8 text-primary" />
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight">Nova senha</h1>

          {ready === null ? (
            <p className="mt-3 text-[15px] text-muted-foreground">Abrindo o link de recuperação…</p>
          ) : ready === false ? (
            <>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                Este link de recuperação não está válido. Abra o link que chegou no seu e-mail, ou
                peça um novo na tela de entrada.
              </p>
              <Button className="mt-6 w-full" onClick={() => nav({ to: "/" })}>
                Voltar para entrar
              </Button>
            </>
          ) : (
            <motion.form
              onSubmit={submit}
              className="mt-8 space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: springs.screen }}
            >
              <TextField
                label="Nova senha"
                type="password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                autoComplete="new-password"
              />
              <TextField
                label="Confirmar nova senha"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
              {error && (
                <div className="flex gap-2 rounded-field bg-error-bg p-3 text-sm text-error">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  {error}
                </div>
              )}
              <Button type="submit" state={state} className="w-full">
                Salvar nova senha
              </Button>
            </motion.form>
          )}
        </div>
      </section>
    </div>
  );
}
