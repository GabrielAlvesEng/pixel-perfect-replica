import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileSpreadsheet } from "lucide-react";
import { Button, Card, Chip, Counter, PageHeader, ProcessButton, Segmented } from "@/components/md3";
import { materialLists, type Material } from "@/data/mock";
import { useApp } from "@/lib/app-store";
import { pageHead } from "@/lib/head";
import { springs } from "@/lib/theme";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/etapa/6")({ head: pageHead("Listas de materiais", "Etapa 6: listas de compra em Excel por submontagem."), component: Step6 });

const cols = "grid grid-cols-[170px_1.5fr_1fr_60px_80px] items-center gap-3";

function Table({ items }: { items: Material[] }) {
  return (
    <>
      <div className={cn(cols, "border-y bg-stripe px-6 py-2.5 text-[11px] font-bold tracking-[0.1em] text-muted-foreground")}>
        <span>ITEM</span><span>DESCRIÇÃO</span><span>ESPECIFICAÇÃO</span><span>UN</span><span className="text-right">QTD</span>
      </div>
      {items.map((m, k) => (
        <motion.div key={m.item} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0, transition: { ...springs.standard, delay: k * 0.025 } }} className={cn(cols, "h-12 px-6 text-sm", k % 2 && "bg-stripe")}>
          <span className="truncate font-mono text-xs text-primary">{m.item}</span><span className="font-medium">{m.description}</span>
          <span className="text-muted-foreground">{m.spec}</span><span className="text-muted-foreground">{m.unit}</span><span className="text-right font-mono font-semibold">{m.qty}</span>
        </motion.div>
      ))}
    </>
  );
}

function Step6() {
  const { toast } = useApp();
  const [view, setView] = useState<"Por submontagem" | "Consolidada">("Por submontagem");
  const all = materialLists.flatMap((l) => l.items);
  const merged = Object.values(all.reduce<Record<string, Material>>((acc, m) => { acc[m.item] = { ...m, qty: (acc[m.item]?.qty ?? 0) + m.qty }; return acc; }, {}));
  return (
    <>
      <PageHeader eyebrow="ETAPA 6" title="Listas de materiais"
        actions={<ProcessButton icon={<FileSpreadsheet className="size-4" />} onDone={() => toast(`${materialLists.length} planilhas Excel geradas`)}>Gerar listas em Excel</ProcessButton>}>
        Tudo o que é comprado pronto (itens CM), agrupado por submontagem para a lista de compra.
      </PageHeader>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex gap-2">
          <Chip><Counter value={materialLists.length} className="font-mono" /> submontagens</Chip>
          <Chip tone="lilac"><Counter value={merged.length} className="font-mono" /> itens diferentes</Chip>
          <Chip tone="neutral"><Counter value={all.reduce((s, m) => s + m.qty, 0)} className="font-mono" /> unidades</Chip>
        </div>
        <Segmented options={["Por submontagem", "Consolidada"]} value={view} onChange={setView} />
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={view} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: springs.screen }} exit={{ opacity: 0 }} className="space-y-4">
          {view === "Por submontagem" ? materialLists.map((l) => (
            <Card key={l.assembly} className="overflow-hidden p-0">
              <div className="flex items-center gap-3 px-6 py-4">
                <Chip>Montagem</Chip><span className="font-mono text-[13px] text-primary">{l.assembly}</span><span className="flex-1 font-semibold">{l.title}</span>
                <Button size="sm" variant="text" icon={<FileSpreadsheet className="size-4" />} onClick={() => toast(`${l.assembly}.xlsx gerado`)}>Excel</Button>
              </div>
              <Table items={l.items} />
            </Card>
          )) : <Card className="overflow-hidden p-0"><div className="px-6 py-4 font-semibold">Lista de compra consolidada do projeto</div><Table items={merged} /></Card>}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
