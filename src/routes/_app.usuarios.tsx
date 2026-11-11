import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, UserPlus } from "lucide-react";
import { Button, Card, PageHeader, TextField } from "@/components/md3";
import { useApp } from "@/lib/app-store";
import { initials } from "@/data/mock";
import { pageHead } from "@/lib/head";
import { springs } from "@/lib/theme";

export const Route = createFileRoute("/_app/usuarios")({ head: pageHead("Usuários", "Quem pode entrar no SolidAuto."), component: UsersPage });

function UsersPage() {
  const { users, setUsers, user: me, toast } = useApp();
  const [form, setForm] = useState({ name: "", username: "", pwd: "" });
  const [err, setErr] = useState(false);
  const create = () => {
    if (!form.name || !form.username) { setErr(true); setTimeout(() => setErr(false), 600); return; }
    setUsers([...users, { id: `u${Date.now()}`, name: form.name, username: form.username }]);
    setForm({ name: "", username: "", pwd: "" }); toast(`Usuário ${form.username} criado`);
  };
  return (
    <>
      <PageHeader eyebrow="SISTEMA" title="Usuários">Quem pode entrar no SolidAuto. A senha nunca fica salva, só uma assinatura dela.</PageHeader>
      <div className="grid grid-cols-[1.4fr_1fr] items-start gap-5">
        <Card className="p-2">
          <AnimatePresence initial={false}>
            {users.map((u) => {
              const blocked = u.id === me.id || users.length === 1;
              return (
                <motion.div key={u.id} layout initial={{ opacity: 0, height: 0, scale: 0.96 }} animate={{ opacity: 1, height: "auto", scale: 1 }} exit={{ opacity: 0, height: 0 }} transition={springs.standard} className="overflow-hidden">
                  <div className="flex items-center gap-4 rounded-field px-4 py-3 hover:bg-stripe">
                    <span className="grid size-10 place-items-center rounded-full bg-primary-container text-sm font-bold text-primary">{initials(u.name)}</span>
                    <div className="flex-1"><p className="font-semibold">{u.name}{u.id === me.id && <span className="ml-2 text-xs font-normal text-faint">(você)</span>}</p><p className="font-mono text-xs text-muted-foreground">{u.username}</p></div>
                    <span title={blocked ? "Não dá para remover o próprio usuário nem o único usuário." : undefined}>
                      <Button size="sm" variant="text" disabled={blocked} icon={<Trash2 className="size-4" />} onClick={() => setUsers(users.filter((x) => x.id !== u.id))}>Remover</Button>
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </Card>
        <Card>
          <h2 className="text-lg font-bold">Novo usuário</h2>
          <div className="mt-5 space-y-4">
            <TextField label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={err && !form.name ? "Preencha o nome" : undefined} />
            <TextField label="Usuário" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} error={err && !form.username ? "Preencha o usuário" : undefined} />
            <TextField label="Senha" type="password" value={form.pwd} onChange={(e) => setForm({ ...form, pwd: e.target.value })} />
            <Button className="w-full" icon={<UserPlus className="size-4" />} onClick={create}>Criar usuário</Button>
          </div>
        </Card>
      </div>
    </>
  );
}
