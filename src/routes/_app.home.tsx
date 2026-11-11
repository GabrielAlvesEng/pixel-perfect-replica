import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FolderOpen, PackageOpen, Search, SearchX, Trash2, ScanLine } from "lucide-react";
import { Button, Dialog, PageHeader, ProcessButton, TextField } from "@/components/md3";
import { useApp } from "@/lib/app-store";
import { pageHead } from "@/lib/head";
import { springs } from "@/lib/theme";
import type { Project } from "@/data/mock";

export const Route = createFileRoute("/_app/home")({ head: pageHead("Projetos vinculados", "Seus projetos Fabriaço vinculados ao SolidAuto."), component: HomePage });

function HomePage() {
  const { projects, setProjects, setActiveId, toast } = useApp();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [toRemove, setToRemove] = useState<Project | null>(null);
  const list = projects.filter((p) => `${p.code} ${p.title1} ${p.title2} ${p.order}`.toLowerCase().includes(q.toLowerCase()));
  const open = (p: Project) => { setActiveId(p.id); setTimeout(() => nav({ to: "/etapa/1" }), 220); };
  const addDemo = () => {
    const p = { id: `p${Date.now()}`, code: "26-072-ESC-00-00-000", title1: "Escada Marinheiro com Guarda-Corpo", title2: "Usiminas", order: "4533", updated: "Atualizado agora" };
    setProjects([p, ...projects]); toast("Projeto 26-072-ESC lido e vinculado");
  };

  return (
    <>
      <PageHeader eyebrow="INÍCIO" title="Projetos vinculados">Seus projetos vinculados ao SolidAuto. Abra um projeto para ler a montagem e seguir as etapas.</PageHeader>
      <div className="relative overflow-hidden rounded-xl2 bg-hero p-8 text-white shadow-card-hover">
        <ScanLine className="absolute -right-6 -top-6 size-48 opacity-10" />
        <p className="text-[11px] font-bold tracking-[0.14em] text-white/70">NOVO</p>
        <h2 className="mt-1 text-2xl font-bold">Cadastrar projeto</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/85">Abra a montagem geral do projeto no SolidWorks e clique no botão. O SolidAuto lê sozinho o código do projeto e as propriedades (26-Nº PEDIDO, 8-TITULO 1, 9-TITULO 2…).</p>
        <ProcessButton variant="white" className="mt-6" icon={<ScanLine className="size-4" />} onDone={addDemo}>Ler projeto aberto no SolidWorks</ProcessButton>
      </div>

      <div className="mb-5 mt-8 flex items-center justify-between gap-4">
        <TextField label="Buscar por código, título ou pedido" value={q} onChange={(e) => setQ(e.target.value)} trailing={<Search className="size-[18px]" />} className="w-[420px]" />
        <div className="flex gap-2">
          <Button variant="text" size="sm" onClick={() => setProjects([])}>Ver estado vazio</Button>
        </div>
      </div>

      {projects.length === 0 ? (
        <Empty icon={PackageOpen} title="Nenhum projeto vinculado ainda" text="Abra a montagem geral (…-00-00-000) no SolidWorks e clique em Ler projeto aberto no SolidWorks." />
      ) : list.length === 0 ? (
        <Empty icon={SearchX} title="Nenhum projeto encontrado para essa busca." text="Tente outro código, título ou número de pedido." />
      ) : (
        <motion.div layout className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
          <AnimatePresence>
            {list.map((p, i) => (
              <motion.article key={p.id} layout layoutId={`proj-${p.id}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { ...springs.standard, delay: i * 0.03 } }}
                exit={{ opacity: 0, scale: 0.9 }} whileHover={{ y: -3 }} transition={springs.standard}
                className="group flex cursor-pointer flex-col rounded-card bg-card p-5 shadow-card transition-shadow hover:shadow-card-hover" onClick={() => open(p)}>
                <p className="font-mono text-[13px] font-medium text-primary">{p.code}</p>
                <h3 className="mt-2 text-[17px] font-bold leading-snug">{p.title1}</h3>
                <p className="text-sm text-muted-foreground">{p.title2}</p>
                <div className="mt-4 flex gap-4 text-xs text-faint"><span>Pedido <b className="font-mono text-muted-foreground">{p.order}</b></span><span>{p.updated}</span></div>
                <div className="mt-5 flex gap-2">
                  <Button size="sm" icon={<FolderOpen className="size-4" />} onClick={(e) => { e.stopPropagation(); open(p); }}>Abrir</Button>
                  <Button size="sm" variant="text" icon={<Trash2 className="size-4" />} onClick={(e) => { e.stopPropagation(); setToRemove(p); }}>Remover</Button>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <Dialog open={!!toRemove} onClose={() => setToRemove(null)} title="Remover projeto?"
        actions={<><Button variant="text" onClick={() => setToRemove(null)}>Cancelar</Button>
          <Button variant="danger" onClick={() => { setProjects(projects.filter((x) => x.id !== toRemove?.id)); toast("Projeto removido da lista"); setToRemove(null); }}>Remover</Button></>}>
        O projeto <span className="font-mono text-foreground">{toRemove?.code}</span> sai da lista do SolidAuto. Nenhum arquivo do SolidWorks é apagado.
      </Dialog>
    </>
  );
}

function Empty({ icon: Icon, title, text }: { icon: typeof SearchX; title: string; text: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center rounded-card bg-card px-8 py-16 text-center shadow-card">
      <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="grid size-20 place-items-center rounded-full bg-primary-container text-primary"><Icon className="size-9" /></motion.div>
      <h3 className="mt-5 text-lg font-bold">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{text}</p>
    </motion.div>
  );
}
