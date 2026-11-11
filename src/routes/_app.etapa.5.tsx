import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Download, FolderOpen } from "lucide-react";
import { Button, Card, Chip, Counter, PageHeader, TextField } from "@/components/md3";
import { sheetGroups, type Sheet } from "@/data/mock";
import { useApp } from "@/lib/app-store";
import { pageHead } from "@/lib/head";
import { springs } from "@/lib/theme";

export const Route = createFileRoute("/_app/etapa/5")({ head: pageHead("DXF das chapas", "Etapa 5: exportação dos DXFs por material e espessura."), component: Step5 });

function Preview({ s }: { s: Sheet }) {
  const r = s.w / s.h; const W = 64; const H = Math.max(28, Math.min(64, W / r));
  const holes = [[0.18, 0.22], [0.82, 0.22], [0.18, 0.78], [0.82, 0.78]].slice(0, s.holes);
  const path = s.shape === "l" ? `M2 2 H${W - 2} V${H * 0.45} H${W * 0.4} V${H - 2} H2 Z`
    : s.shape === "gusset" ? `M2 2 V${H - 2} H${W - 2} Z` : `M2 2 H${W - 2} V${H - 2} H2 Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-16 w-16 text-primary" aria-hidden>
      <path d={path} className="fill-primary-container stroke-current" strokeWidth={1.2} />
      {s.shape === "flange" && <circle cx={W / 2} cy={H / 2} r={H * 0.18} className="fill-card stroke-current" strokeWidth={1} />}
      {holes.map(([x, y], i) => <circle key={i} cx={x! * W} cy={y! * H} r={2.4} className="fill-card stroke-current" strokeWidth={1} />)}
    </svg>
  );
}

function Step5() {
  const { toast } = useApp();
  const [progress, setProgress] = useState<Record<number, number>>({});
  const [running, setRunning] = useState(false);
  const total = sheetGroups.reduce((s, g) => s + g.sheets.length, 0);
  const pieces = sheetGroups.reduce((s, g) => s + g.sheets.reduce((a, x) => a + x.qty, 0), 0);
  const exportAll = () => {
    setRunning(true); setProgress({});
    sheetGroups.forEach((_, gi) => {
      [25, 60, 100].forEach((v, k) => setTimeout(() => setProgress((p) => ({ ...p, [gi]: v })), gi * 700 + k * 260));
    });
    setTimeout(() => { setRunning(false); toast(`${total} DXFs exportados em ${sheetGroups.length} pastas`); }, sheetGroups.length * 700 + 700);
  };
  return (
    <>
      <PageHeader eyebrow="ETAPA 5" title="DXF das chapas"
        actions={<Button icon={<Download className="size-4" />} state={running ? "loading" : "idle"} onClick={exportAll}>Exportar todos os DXFs</Button>}>
        As chapas do projeto separadas por material e espessura. Cada grupo vira uma pasta com um DXF por peça.
      </PageHeader>
      <div className="mb-5 flex items-center gap-3">
        <Chip><Counter value={sheetGroups.length} className="font-mono" /> grupos</Chip>
        <Chip tone="lilac"><Counter value={total} className="font-mono" /> chapas</Chip>
        <Chip tone="neutral"><Counter value={pieces} className="font-mono" /> peças</Chip>
        <div className="ml-auto flex items-center gap-2">
          <TextField label="Pasta de saída" defaultValue="C:\Projetos\26-060\Saida\DXF" mono className="w-[360px]" />
          <Button variant="tonal" icon={<FolderOpen className="size-4" />}>Escolher</Button>
        </div>
      </div>
      <div className="space-y-4">
        {sheetGroups.map((g, gi) => {
          const p = progress[gi] ?? 0;
          return (
            <Card key={g.material + g.thickness} className="p-0">
              <div className="flex items-center gap-3 px-6 py-4">
                <span className="font-bold">{g.material}</span><Chip>{g.thickness}</Chip>
                <span className="font-mono text-xs text-muted-foreground">\DXF\{g.material.replace(/\s/g, "-")}_{g.thickness.replace(/[\s,]/g, "")}</span>
                <span className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
                  {p === 100 ? <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={springs.bouncy} className="flex items-center gap-1 font-semibold text-success"><Check className="size-4" />Exportado</motion.span> : `${g.sheets.length} chapas`}
                </span>
              </div>
              <div className="h-1 bg-muted"><motion.div className="h-full bg-primary" animate={{ width: `${p}%` }} transition={springs.standard} /></div>
              <div className="grid grid-cols-2 gap-3 p-4">
                {g.sheets.map((s, k) => (
                  <motion.div key={s.code} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { ...springs.standard, delay: k * 0.04 } }} whileHover={{ y: -2 }}
                    className="flex items-center gap-4 rounded-field bg-stripe p-3 shadow-[inset_0_0_0_1px_var(--border)]">
                    <div className="grid size-20 place-items-center rounded-field bg-card"><Preview s={s} /></div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-mono text-xs text-primary">{s.code}.dxf</p>
                      <p className="mt-0.5 truncate font-semibold">{s.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground"><span className="font-mono">{s.w} × {s.h} mm</span> · {s.holes} furos · <b className="font-mono text-foreground">× {s.qty}</b></p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
