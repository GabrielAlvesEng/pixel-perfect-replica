import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, FileSpreadsheet, Scissors } from "lucide-react";
import { Button, Card, Chip, Counter, PageHeader, ProcessButton, Segmented, StatusBadge } from "@/components/md3";
import { cutLists } from "@/data/mock";
import { useApp } from "@/lib/app-store";
import { pageHead } from "@/lib/head";
import { springs } from "@/lib/theme";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/etapa/4")({ head: pageHead("Lista de corte", "Etapa 4: listas de corte preenchidas automaticamente por soldagem."), component: Step4 });

const cols = "grid grid-cols-[50px_1.6fr_1fr_110px_70px_110px_80px] items-center gap-3";
const fmt = (n: number, d = 1) => n.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });

function Step4() {
  const { toast } = useApp();
  const [view, setView] = useState<"Por soldagem" | "Consolidada">("Por soldagem");
  const [open, setOpen] = useState<Record<string, boolean>>(Object.fromEntries(cutLists.map((c) => [c.weld, true])));
  const all = cutLists.flatMap((c) => c.items);
  const pieces = all.reduce((s, i) => s + i.qty, 0);
  const meters = Math.round(all.reduce((s, i) => s + (i.length * i.qty) / 1000, 0));
  const kg = Math.round(all.reduce((s, i) => s + (i.length / 1000) * i.qty * i.kgm, 0));
  const consolidated = Object.values(all.reduce<Record<string, { profile: string; material: string; meters: number; kg: number; qty: number }>>((acc, i) => {
    const k = i.profile + i.material;
    const cur = acc[k] ?? { profile: i.profile, material: i.material, meters: 0, kg: 0, qty: 0 };
    cur.meters += (i.length * i.qty) / 1000; cur.kg += (i.length / 1000) * i.qty * i.kgm; cur.qty += i.qty; acc[k] = cur; return acc;
  }, {}));

  return (
    <>
      <PageHeader eyebrow="ETAPA 4" title="Lista de corte"
        actions={<div className="flex gap-2"><Button variant="outlined" icon={<FileSpreadsheet className="size-4" />} onClick={() => toast("Lista de corte exportada em Excel")}>Exportar Excel</Button>
          <ProcessButton icon={<Scissors className="size-4" />} onDone={() => toast("Listas de corte preenchidas em 3 soldagens")}>Preencher listas de corte</ProcessButton></div>}>
        Perfis, tubos e barras de cada soldagem com comprimento, quantidade e peso, prontos para a lista de corte do desenho.
      </PageHeader>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex gap-2">
          <Chip><Counter value={cutLists.length} className="font-mono" /> soldagens</Chip>
          <Chip tone="lilac"><Counter value={pieces} className="font-mono" /> peças</Chip>
          <Chip tone="neutral"><Counter value={meters} className="font-mono" /> m de perfil</Chip>
          <Chip tone="neutral"><Counter value={kg} className="font-mono" /> kg</Chip>
        </div>
        <Segmented options={["Por soldagem", "Consolidada"]} value={view} onChange={setView} />
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={view} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: springs.screen }} exit={{ opacity: 0 }} className="space-y-4">
          {view === "Por soldagem" ? cutLists.map((c) => (
            <Card key={c.weld} className="overflow-hidden p-0">
              <button onClick={() => setOpen({ ...open, [c.weld]: !open[c.weld] })} className="flex w-full items-center gap-3 px-6 py-4 text-left hover:bg-stripe">
                <Chip tone="lilac">Soldagem</Chip>
                <span className="font-mono text-[13px] text-primary">{c.weld}</span>
                <span className="flex-1 font-semibold">{c.title}</span>
                <span className="text-sm text-muted-foreground">{c.items.length} itens</span>
                <motion.span animate={{ rotate: open[c.weld] ? 180 : 0 }} transition={springs.standard}><ChevronDown className="size-5 text-muted-foreground" /></motion.span>
              </button>
              <AnimatePresence initial={false}>
                {open[c.weld] && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={springs.screen} className="overflow-hidden">
                    <div className={cn(cols, "border-y bg-stripe px-6 py-2.5 text-[11px] font-bold tracking-[0.1em] text-muted-foreground")}>
                      <span>POS</span><span>PERFIL</span><span>MATERIAL</span><span className="text-right">COMPR. (mm)</span><span className="text-right">QTD</span><span className="text-right">PESO (kg)</span><span>STATUS</span>
                    </div>
                    {c.items.map((i, k) => (
                      <motion.div key={i.pos} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0, transition: { ...springs.standard, delay: k * 0.025 } }} className={cn(cols, "h-12 px-6 text-sm", k % 2 && "bg-stripe")}>
                        <span className="font-mono text-muted-foreground">{i.pos}</span><span className="font-medium">{i.profile}</span><span className="text-muted-foreground">{i.material}</span>
                        <span className="text-right font-mono">{i.length.toLocaleString("pt-BR")}</span><span className="text-right font-mono font-semibold">{i.qty}</span>
                        <span className="text-right font-mono">{fmt((i.length / 1000) * i.qty * i.kgm)}</span><span><StatusBadge status={i.status} delay={k * 0.03} /></span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          )) : (
            <Card className="overflow-hidden p-0">
              <div className="grid grid-cols-[1.6fr_1fr_90px_120px_120px] gap-3 border-b px-6 py-3 text-[11px] font-bold tracking-[0.1em] text-muted-foreground">
                <span>PERFIL</span><span>MATERIAL</span><span className="text-right">PEÇAS</span><span className="text-right">TOTAL (m)</span><span className="text-right">PESO (kg)</span>
              </div>
              {consolidated.map((r, k) => (
                <motion.div key={r.profile + r.material} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0, transition: { delay: k * 0.03 } }} className={cn("grid h-12 grid-cols-[1.6fr_1fr_90px_120px_120px] items-center gap-3 px-6 text-sm", k % 2 && "bg-stripe")}>
                  <span className="font-medium">{r.profile}</span><span className="text-muted-foreground">{r.material}</span><span className="text-right font-mono">{r.qty}</span>
                  <span className="text-right font-mono">{fmt(r.meters, 2)}</span><span className="text-right font-mono font-semibold">{fmt(r.kg)}</span>
                </motion.div>
              ))}
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
