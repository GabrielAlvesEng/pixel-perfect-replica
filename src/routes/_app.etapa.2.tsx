import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Minus, Plus, Maximize } from "lucide-react";
import { Card, Chip, Counter, PageHeader, Segmented, StatusBadge } from "@/components/md3";
import { tree, type TreeNode } from "@/data/mock";
import { pageHead } from "@/lib/head";
import { springs } from "@/lib/theme";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/etapa/2")({ head: pageHead("Árvore e quantidades", "Etapa 2: árvore da montagem com quantidades e status."), component: Step2 });

const flat = (n: TreeNode): TreeNode[] => [n, ...(n.children ?? []).flatMap(flat)];
const all = flat(tree);

function Step2() {
  const [view, setView] = useState<"Lista" | "Organograma">("Lista");
  const c = { m: all.filter((n) => n.type === "Montagem").length, s: all.filter((n) => n.type === "Soldagem").length, a: all.filter((n) => n.status === "aviso").length, e: all.filter((n) => n.status === "erro").length };
  return (
    <>
      <PageHeader eyebrow="ETAPA 2" title="Árvore e quantidades" actions={<Segmented options={["Lista", "Organograma"]} value={view} onChange={setView} />}>
        Estrutura da montagem com a quantidade de cada item no pai e no total do projeto.
      </PageHeader>
      <div className="mb-5 flex gap-2">
        <Chip><Counter value={c.m} className="font-mono" /> montagens</Chip>
        <Chip tone="lilac"><Counter value={c.s} className="font-mono" /> soldagens</Chip>
        <Chip tone="aviso"><Counter value={c.a} className="font-mono" /> avisos</Chip>
        <Chip tone="erro"><Counter value={c.e} className="font-mono" /> erros</Chip>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={view} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: springs.screen }} exit={{ opacity: 0 }}>
          {view === "Lista" ? <TreeTable /> : <OrgChart />}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

const cols = "grid grid-cols-[minmax(300px,1.6fr)_110px_1fr_90px_90px_90px] items-center gap-3";
let rowIndex = 0;
function TreeTable() {
  rowIndex = 0;
  return (
    <Card className="overflow-hidden p-0">
      <div className={cn(cols, "border-b px-5 py-3 text-[11px] font-bold tracking-[0.1em] text-muted-foreground")}>
        <span>CÓDIGO</span><span>TIPO</span><span>TÍTULO 3</span><span className="text-right">QTD NO PAI</span><span className="text-right">QTD TOTAL</span><span>STATUS</span>
      </div>
      <Row node={tree} depth={0} />
    </Card>
  );
}
function Row({ node, depth }: { node: TreeNode; depth: number }) {
  const [open, setOpen] = useState(true);
  const i = rowIndex++;
  const has = !!node.children?.length;
  return (
    <div>
      <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0, transition: { ...springs.standard, delay: i * 0.025 } }}
        className={cn(cols, "h-12 px-5 text-sm transition-colors hover:bg-primary-container/50", i % 2 && "bg-stripe")}>
        <div className="relative flex h-full items-center" style={{ paddingLeft: depth * 22 }}>
          {Array.from({ length: depth }).map((_, d) => <span key={d} className="absolute inset-y-0 w-px bg-border" style={{ left: d * 22 + 12 }} />)}
          <button onClick={() => setOpen(!open)} disabled={!has} aria-label={open ? "Recolher" : "Expandir"} className={cn("mr-1.5 grid size-6 place-items-center rounded-full hover:bg-primary-container", !has && "invisible")}>
            <motion.span animate={{ rotate: open ? 90 : 0 }} transition={springs.standard}><ChevronRight className="size-4 text-muted-foreground" /></motion.span>
          </button>
          <span className="font-mono text-[13px]">{node.code}</span>
        </div>
        <span><Chip tone={node.type === "Montagem" ? "primary" : "lilac"}>{node.type}</Chip></span>
        <span className={cn("truncate", !node.title3 && "italic text-faint")}>{node.title3 || "vazio"}</span>
        <span className="text-right font-mono">{node.qtyParent}</span>
        <span className="text-right font-mono font-semibold">{node.qtyTotal}</span>
        <span><StatusBadge status={node.status} delay={i * 0.025 + 0.1} /></span>
      </motion.div>
      <AnimatePresence initial={false}>
        {has && open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={springs.screen} className="overflow-hidden">
            {node.children!.map((c) => <Row key={c.code} node={c} depth={depth + 1} />)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OrgChart() {
  const [zoom, setZoom] = useState(0.85);
  const box = useRef<HTMLDivElement>(null);
  return (
    <Card className="relative h-[540px] overflow-hidden bg-stripe p-0">
      <div ref={box} className="absolute inset-0 cursor-grab active:cursor-grabbing">
        <motion.div drag dragConstraints={box} dragElastic={0.2} dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }} animate={{ scale: zoom }} transition={springs.standard}
          className="absolute left-1/2 top-8 origin-top" style={{ x: "-50%" }}>
          <OrgNode node={tree} />
        </motion.div>
      </div>
      <div className="absolute bottom-4 right-4 flex gap-1 rounded-full bg-card p-1 shadow-card">
        {[{ i: Minus, f: () => setZoom((z) => Math.max(0.4, z - 0.15)), l: "Diminuir zoom" }, { i: Maximize, f: () => setZoom(0.85), l: "Ajustar" }, { i: Plus, f: () => setZoom((z) => Math.min(1.6, z + 0.15)), l: "Aumentar zoom" }].map(({ i: I, f, l }) => (
          <motion.button key={l} aria-label={l} whileTap={{ scale: 0.9 }} onClick={f} className="grid size-9 place-items-center rounded-full hover:bg-primary-container"><I className="size-4" /></motion.button>
        ))}
      </div>
    </Card>
  );
}
function OrgNode({ node }: { node: TreeNode }) {
  const kids = node.children ?? [];
  return (
    <div className="flex flex-col items-center">
      <div className={cn("w-[190px] rounded-field bg-card p-3 shadow-card", node.status === "erro" ? "pulse-error shadow-[inset_0_0_0_2px_var(--error)]" : "shadow-[inset_0_0_0_1px_var(--border)]")}>
        <p className="truncate font-mono text-[11px] font-medium">{node.code}</p>
        <div className="mt-2 flex items-center justify-between"><Chip tone={node.type === "Montagem" ? "primary" : "lilac"} className="h-6">{node.type}</Chip><span className="font-mono text-xs text-muted-foreground">× {node.qtyTotal}</span></div>
      </div>
      {kids.length > 0 && (
        <>
          <span className="h-5 w-px bg-primary/40" />
          <div className="flex">
            {kids.map((k, i) => (
              <div key={k.code} className="relative flex flex-col items-center px-2.5">
                <span className={cn("absolute top-0 h-px bg-primary/40", kids.length === 1 ? "hidden" : i === 0 ? "left-1/2 right-0" : i === kids.length - 1 ? "left-0 right-1/2" : "left-0 right-0")} />
                <span className="h-5 w-px bg-primary/40" />
                <OrgNode node={k} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
