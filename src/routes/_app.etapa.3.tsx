import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HelpCircle, Search } from "lucide-react";
import { Card, PageHeader, Segmented, TextField } from "@/components/md3";
import { commercials, type Kind } from "@/data/mock";
import { pageHead } from "@/lib/head";
import { springs } from "@/lib/theme";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/etapa/3")({ head: pageHead("Comerciais e referências", "Etapa 3: separe itens comerciais, referências e peças do projeto."), component: Step3 });

const kindHelp: Record<Kind, string> = {
  CM: "Comercial: comprado pronto, entra na lista de compra.",
  REF: "Referência: só posiciona ou mostra, não entra em lista nenhuma.",
  Projeto: "Faz parte do projeto: entra na árvore e precisa de código.",
};
const cols = "grid grid-cols-[1.3fr_1.4fr_1fr_80px_90px_220px] items-center gap-3";

function Step3() {
  const [q, setQ] = useState("");
  const [kinds, setKinds] = useState<Record<string, Kind>>(() => Object.fromEntries(commercials.map((c) => [c.id, c.kind])) as Record<string, Kind>);
  const rows = commercials.filter((c) => `${c.name} ${c.file}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader eyebrow="ETAPA 3" title="Comerciais e referências">Diga o que cada item é. Comerciais vão para a lista de compra; referências ficam de fora.</PageHeader>
      <div className="mb-5 flex items-center justify-between">
        <TextField label="Buscar pelo nome ou arquivo" value={q} onChange={(e) => setQ(e.target.value)} trailing={<Search className="size-[18px]" />} className="w-[400px]" />
        <div className="group relative flex items-center gap-1.5 text-sm text-muted-foreground">
          <HelpCircle className="size-4" />O que é CM, REF e Projeto?
          <div className="pointer-events-none absolute right-0 top-7 z-10 w-80 space-y-2 rounded-field bg-steel p-4 text-xs text-white opacity-0 shadow-card-hover transition-opacity group-hover:opacity-100">
            {(Object.keys(kindHelp) as Kind[]).map((k) => <p key={k}><b className="text-lilac">{k}</b> · {kindHelp[k]}</p>)}
          </div>
        </div>
      </div>
      <Card className="overflow-hidden p-0">
        <div className={cn(cols, "border-b px-5 py-3 text-[11px] font-bold tracking-[0.1em] text-muted-foreground")}>
          <span>NOME NA PEÇA</span><span>ARQUIVO</span><span>PASTA</span><span className="text-right">QTD TOTAL</span><span>TIPO</span><span>É</span>
        </div>
        {rows.map((c, i) => {
          const changed = kinds[c.id] !== c.kind;
          return (
            <motion.div key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0, transition: { ...springs.standard, delay: i * 0.03 } }} className={cn(cols, "min-h-14 px-5 py-2 text-sm", i % 2 && "bg-stripe")}>
              <div>
                <p className="font-medium">{c.name}</p>
                <AnimatePresence>{changed && <motion.span initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={springs.bouncy}
                  className="mt-1 inline-block rounded-chip bg-primary-container px-2 py-0.5 text-[11px] font-semibold text-primary">Alterado por você</motion.span>}</AnimatePresence>
              </div>
              <span className="truncate font-mono text-xs">{c.file}</span>
              <span className="truncate text-muted-foreground">{c.folder}</span>
              <span className="text-right font-mono font-semibold">{c.qty}</span>
              <span className="text-muted-foreground">{c.type}</span>
              <Segmented size="sm" options={["CM", "REF", "Projeto"]} labels={kindHelp} value={kinds[c.id] ?? c.kind} onChange={(v) => setKinds({ ...kinds, [c.id]: v })} />
            </motion.div>
          );
        })}
      </Card>
    </>
  );
}
