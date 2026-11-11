import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, AlertTriangle, CheckCircle2, ChevronDown } from "lucide-react";
import { Card, Counter, PageHeader } from "@/components/md3";
import { checks, type Status } from "@/data/mock";
import { pageHead } from "@/lib/head";
import { springs } from "@/lib/theme";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/etapa/7")({ head: pageHead("Relatório", "Etapa 7: verificações do projeto por severidade."), component: Report });

const groups: { s: Status; label: string; icon: typeof AlertCircle; cls: string }[] = [
  { s: "erro", label: "Erros", icon: AlertCircle, cls: "bg-error-bg text-error" },
  { s: "aviso", label: "Avisos", icon: AlertTriangle, cls: "bg-warning-bg text-warning" },
  { s: "ok", label: "OK", icon: CheckCircle2, cls: "bg-success-bg text-success" },
];

function Report() {
  const [open, setOpen] = useState<Record<string, boolean>>({ erro: true, aviso: true, ok: false });
  return (
    <>
      <PageHeader eyebrow="ETAPA 7" title="Relatório">Tudo o que o SolidAuto conferiu na montagem, do mais grave ao que está certo.</PageHeader>
      <div className="mb-6 grid grid-cols-3 gap-4">
        {groups.map((g) => (
          <Card key={g.s} className="flex items-center gap-4 p-5">
            <span className={cn("grid size-12 place-items-center rounded-field", g.cls)}><g.icon className="size-6" /></span>
            <div><Counter value={checks.filter((c) => c.severity === g.s).length} className="text-3xl font-bold" /><p className="text-sm text-muted-foreground">{g.label}</p></div>
          </Card>
        ))}
      </div>
      <div className="space-y-4">
        {groups.map((g) => {
          const items = checks.filter((c) => c.severity === g.s);
          return (
            <Card key={g.s} className="p-0">
              <button onClick={() => setOpen({ ...open, [g.s]: !open[g.s] })} className="flex w-full items-center gap-3 rounded-card px-6 py-4 text-left hover:bg-stripe">
                <span className={cn("grid size-8 place-items-center rounded-chip", g.cls)}><g.icon className="size-4" /></span>
                <span className="flex-1 font-bold">{g.label} <span className="font-mono text-sm text-muted-foreground">({items.length})</span></span>
                <motion.span animate={{ rotate: open[g.s] ? 180 : 0 }} transition={springs.standard}><ChevronDown className="size-5 text-muted-foreground" /></motion.span>
              </button>
              <AnimatePresence initial={false}>
                {open[g.s] && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={springs.screen} className="overflow-hidden">
                    <div className="border-t px-6 py-2">
                      {items.map((c, i) => (
                        <motion.div key={c.code + i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0, transition: { delay: i * 0.03 } }} className="flex items-center gap-4 py-2.5 text-sm">
                          <span className="w-56 shrink-0 font-mono text-[13px] text-primary">{c.code}</span><span>{c.message}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}
      </div>
    </>
  );
}
