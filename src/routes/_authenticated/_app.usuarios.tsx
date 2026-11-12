import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, Save, Trash2 } from "lucide-react";
import { Button, Card, PageHeader, TextField } from "@/components/md3";
import { useApp } from "@/lib/app-store";
import { initials } from "@/lib/types";
import { pageHead } from "@/lib/head";
import { springs } from "@/lib/theme";
import { atualizarPerfil, convidarUsuario, removerUsuario } from "@/lib/solidauto.functions";
import { meuPerfilQueryOptions, usuariosQueryOptions } from "@/lib/solidauto.queries";

export const Route = createFileRoute("/_authenticated/_app/usuarios")({
  head: pageHead("Usuários", "Quem pode entrar no SolidAuto."),
  component: UsersPage,
});

const msg = (e: unknown) => (e instanceof Error ? e.message : "Algo deu errado.");

function UsersPage() {
  const { toast } = useApp();
  const qc = useQueryClient();
  const { data: users = [], isLoading } = useQuery(usuariosQueryOptions);
  const { data: me } = useQuery(meuPerfilQueryOptions);

  const [convite, setConvite] = useState({ name: "", email: "" });
  const [errConvite, setErrConvite] = useState(false);
  const [perfil, setPerfil] = useState({ name: "", username: "" });
  const [confirmar, setConfirmar] = useState<string | null>(null);

  useEffect(() => {
    if (me) setPerfil({ name: me.name, username: me.username });
  }, [me]);

  const atualizarListas = () => {
    qc.invalidateQueries({ queryKey: usuariosQueryOptions.queryKey });
    qc.invalidateQueries({ queryKey: meuPerfilQueryOptions.queryKey });
  };

  const convidar = useMutation({
    mutationFn: (d: { name: string; email: string }) => convidarUsuario({ data: d }),
    onSuccess: (r) => {
      toast(`Convite enviado para ${r.email}`);
      setConvite({ name: "", email: "" });
      atualizarListas();
    },
    onError: (e) => toast(msg(e), "error"),
  });

  const remover = useMutation({
    mutationFn: (userId: string) => removerUsuario({ data: { userId } }),
    onSuccess: () => { toast("Usuário removido"); setConfirmar(null); atualizarListas(); },
    onError: (e) => toast(msg(e), "error"),
  });

  const salvarPerfil = useMutation({
    mutationFn: (d: { name: string; username: string }) => atualizarPerfil({ data: d }),
    onSuccess: () => { toast("Seu perfil foi salvo"); atualizarListas(); },
    onError: (e) => toast(msg(e), "error"),
  });

  const enviarConvite = () => {
    if (!convite.name.trim() || !convite.email.trim()) {
      setErrConvite(true);
      setTimeout(() => setErrConvite(false), 600);
      return;
    }
    convidar.mutate(convite);
  };

  return (
    <>
      <PageHeader eyebrow="SISTEMA" title="Usuários">
        Quem pode entrar no SolidAuto. Todos da equipe têm as mesmas permissões.
      </PageHeader>
      <div className="grid grid-cols-[1.4fr_1fr] items-start gap-5">
        <Card className="p-2">
          {isLoading && <p className="px-4 py-6 text-sm text-muted-foreground">Carregando equipe…</p>}
          <AnimatePresence initial={false}>
            {users.map((u) => {
              const souEu = u.id === me?.id;
              const bloqueado = souEu || users.length === 1;
              return (
                <motion.div key={u.id} layout initial={{ opacity: 0, height: 0, scale: 0.96 }} animate={{ opacity: 1, height: "auto", scale: 1 }} exit={{ opacity: 0, height: 0 }} transition={springs.standard} className="overflow-hidden">
                  <div className="flex items-center gap-4 rounded-field px-4 py-3 hover:bg-stripe">
                    <span className="grid size-10 place-items-center rounded-full bg-primary-container text-sm font-bold text-primary">{initials(u.name || u.username)}</span>
                    <div className="flex-1">
                      <p className="font-semibold">{u.name || "Sem nome"}{souEu && <span className="ml-2 text-xs font-normal text-faint">(você)</span>}</p>
                      <p className="font-mono text-xs text-muted-foreground">{u.username}</p>
                    </div>
                    {confirmar === u.id ? (
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="text" onClick={() => setConfirmar(null)}>Cancelar</Button>
                        <Button size="sm" variant="danger" disabled={remover.isPending} onClick={() => remover.mutate(u.id)}>
                          {remover.isPending ? "Removendo…" : "Confirmar"}
                        </Button>
                      </div>
                    ) : (
                      <span title={bloqueado ? "Não dá para remover o próprio usuário nem o único usuário." : undefined}>
                        <Button size="sm" variant="text" disabled={bloqueado} icon={<Trash2 className="size-4" />} onClick={() => setConfirmar(u.id)}>Remover</Button>
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </Card>
        <div className="space-y-5">
          <Card>
            <h2 className="text-lg font-bold">Convidar pessoa</h2>
            <p className="mt-1 text-sm text-muted-foreground">Ela recebe um e-mail para criar a senha e entrar.</p>
            <div className="mt-5 space-y-4">
              <TextField label="Nome" value={convite.name} onChange={(e) => setConvite({ ...convite, name: e.target.value })} error={errConvite && !convite.name.trim() ? "Preencha o nome" : undefined} />
              <TextField label="E-mail" type="email" value={convite.email} onChange={(e) => setConvite({ ...convite, email: e.target.value })} error={errConvite && !convite.email.trim() ? "Preencha o e-mail" : undefined} />
              <Button className="w-full" disabled={convidar.isPending} icon={<Mail className="size-4" />} onClick={enviarConvite}>
                {convidar.isPending ? "Enviando…" : "Enviar convite"}
              </Button>
            </div>
          </Card>
          <Card>
            <h2 className="text-lg font-bold">Meu perfil</h2>
            <div className="mt-5 space-y-4">
              <TextField label="Nome" value={perfil.name} onChange={(e) => setPerfil({ ...perfil, name: e.target.value })} />
              <TextField label="Usuário" mono value={perfil.username} onChange={(e) => setPerfil({ ...perfil, username: e.target.value })} />
              <Button className="w-full" variant="tonal" disabled={salvarPerfil.isPending || !perfil.name.trim() || !perfil.username.trim()} icon={<Save className="size-4" />} onClick={() => salvarPerfil.mutate(perfil)}>
                {salvarPerfil.isPending ? "Salvando…" : "Salvar perfil"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
