import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Maximize, Minus, Plus, Trash2 } from "lucide-react";
import { Button, Card, Chip, Counter, Dialog, PageHeader, Segmented } from "@/components/md3";
import { useApp } from "@/lib/app-store";
import { pageHead } from "@/lib/head";
import { springs } from "@/lib/theme";
import { atualizarLinha, inserirLinha, removerLinha } from "@/lib/solidauto.functions";
import type { NodeRow } from "@/lib/solidauto.functions";
import { CarregandoProjeto, ErroProjeto, SemProjetoAberto, useProjetoAberto } from "@/lib/projeto-ui";
import { CellNumber, CellStatus, CellText } from "@/lib/cells";
import type { Status } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/_app/etapa/2")({
  head: pageHead("Árvore e quantidades", "Etapa 2: árvore da montagem com quantidades e status."),
  component: Step2,
});

interface Node extends NodeRow {
  children: Node[];
}

function arvore(nodes: NodeRow[]): Node[] {
  const mapa = new Map<string, Node>();
  for (const n of [...nodes].sort((a, b) => a.position - b.position)) mapa.set(n.id, { ...n, children: [] });
  const raizes: Node[] = [];
  for (const n of mapa.values()) {
    const pai = n.parent_id ? mapa.get(n.parent_id) : undefined;
    if (pai) pai.children.push(n);
    else raizes.push(n);
  }
  return raizes;
}

const flat = (ns: Node[]): Node[] => ns.flatMap((n) => [n, ...flat(n.children)]);

const cols =
  "grid grid-cols-[minmax(260px,1.5fr)_104px_minmax(150px,1fr)_86px_86px_92px_74px] items-center gap-3";

function Step2() {
  const { activeId, toast } = useApp();
  const { data, isPending, error } = useProjetoAberto();
  const queryClient = useQueryClient();
  const [view, setView] = useState<"Lista" | "Organograma">("Lista");
  const [toDelete, setToDelete] = useState<Node | null>(null);

  const raizes = useMemo(() => (data ? arvore(data.nodes) : []), [data]);
  const todos = useMemo(() => flat(raizes), [raizes]);

  if (!activeId) return <SemProjetoAberto />;
  if (isPending) return <CarregandoProjeto />;
  if (error) return <ErroProjeto mensagem={String(error.message)} />;

  const recarregar = () =>
    queryClient.invalidateQueries({ queryKey: ["projeto", data.project.id] });

  const editar = async (node: Node, valores: Record<string, unknown>) => {
    try {
      await atualizarLinha({ data: { tabela: "project_nodes", id: node.id, valores } });
      await recarregar();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Não foi possível salvar.", "error");
    }
  };

  const adicionarFilho = async (node: Node) => {
    try {
      await inserirLinha({
        data: {
          tabela: "project_nodes",
          valores: {
            project_id: data.project.id,
            parent_id: node.id,
            code: "",
            node_type: "Soldagem",
            title3: "",
            qty_parent: 1,
            qty_total: 1,
            status: "aviso",
            position: (data.nodes.length + 1) * 10,
          },
        },
      });
      await recarregar();
      toast("Item incluído na árvore");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Não foi possível incluir.", "error");
    }
  };

  const excluir = async () => {
    if (!toDelete) return;
    const alvo = toDelete;
    setToDelete(null);
    try {
      await removerLinha({ data: { tabela: "project_nodes", id: alvo.id } });
      await recarregar();
      toast("Item removido da árvore");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Não foi possível remover.", "error");
    }
  };

  const c = {
    m: todos.filter((n) => n.node_type === "Montagem").length,
    s: todos.filter((n) => n.node_type === "Soldagem").length,
    a: todos.filter((n) => n.status === "aviso").length,
    e: todos.filter((n) => n.status === "erro").length,
  };

  return (
    <>
      <PageHeader eyebrow="ETAPA 2" title="Árvore e quantidades" actions={<Segmented options={["Lista", "Organograma"]} value={view} onChange={setView} />}>
        Estrutura da montagem com a quantidade de cada item no pai e no total do projeto. Clique em um
        valor para editar.
      </PageHeader>

      <div className="mb-5 flex gap-2">
        <Chip><Counter value={c.m} className="font-mono" /> montagens</Chip>
        <Chip tone="lilac"><Counter value={c.s} className="font-mono" /> soldagens</Chip>
        <Chip tone="aviso"><Counter value={c.a} className="font-mono" /> avisos</Chip>
        <Chip tone="erro"><Counter value={c.e} className="font-mono" /> erros</Chip>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={view} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: springs.screen }} exit={{ opacity: 0 }}>
          {view === "Lista" ? (
            <Card className="overflow-hidden p-0">
              <div className={cn(cols, "border-b px-5 py-3 text-[11px] font-bold tracking-[0.1em] text-muted-foreground")}>
                <span>CÓDIGO</span>
                <span>TIPO</span>
                <span>TÍTULO 3</span>
                <span className="text-right">QTD NO PAI</span>
                <span className="text-right">QTD TOTAL</span>
                <span>STATUS</span>
                <span />
              </div>
              {raizes.map((r) => (
                <Row
                  key={r.id}
                  node={r}
                  depth={0}
                  onEdit={editar}
                  onAdd={adicionarFilho}
                  onDelete={setToDelete}
                />
              ))}
            </Card>
          ) : (
            <OrgChart raizes={raizes} />
          )}
        </motion.div>
      </AnimatePresence>

      <Dialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Remover item da árvore?"
        actions={
          <>
            <Button variant="text" onClick={() => setToDelete(null)}>Cancelar</Button>
            <Button variant="danger" onClick={excluir}>Remover</Button>
          </>
        }
      >
        <span className="font-mono text-foreground">{toDelete?.code || "(sem código)"}</span> e todos os
        itens abaixo dele saem da árvore. Nada é apagado no SolidWorks.
      </Dialog>
    </>
  );
}

function Row({
  node,
  depth,
  onEdit,
  onAdd,
  onDelete,
}: {
  node: Node;
  depth: number;
  onEdit: (n: Node, v: Record<string, unknown>) => void;
  onAdd: (n: Node) => void;
  onDelete: (n: Node) => void;
}) {
  const [open, setOpen] = useState(true);
  const has = node.children.length > 0;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={springs.standard}
        className={cn(cols, "min-h-12 px-5 text-sm transition-colors hover:bg-primary-container/50", depth % 2 && "bg-stripe")}
      >
        <div className="relative flex h-full min-h-11 items-center" style={{ paddingLeft: depth * 22 }}>
          {Array.from({ length: depth }).map((_, d) => (
            <span key={d} className="absolute inset-y-0 w-px bg-border" style={{ left: d * 22 + 12 }} />
          ))}
          <button
            onClick={() => setOpen(!open)}
            disabled={!has}
            aria-label={open ? "Recolher" : "Expandir"}
            className={cn("mr-1.5 grid size-6 shrink-0 place-items-center rounded-full hover:bg-primary-container", !has && "invisible")}
          >
            <motion.span animate={{ rotate: open ? 90 : 0 }} transition={springs.standard}>
              <ChevronRight className="size-4 text-muted-foreground" />
            </motion.span>
          </button>
          <div className="min-w-0 flex-1">
            <CellText
              value={node.code}
              placeholder="código"
              onCommit={(v) => onEdit(node, { code: v })}
              className="font-mono text-[13px]"
            />
          </div>
        </div>
        <span><Chip tone={node.node_type === "Montagem" ? "primary" : "lilac"}>{node.node_type}</Chip></span>
        <CellText
          value={node.title3}
          placeholder="vazio"
          onCommit={(v) => onEdit(node, { title3: v })}
          className={cn(!node.title3 && "italic text-faint")}
        />
        <CellNumber value={node.qty_parent} onCommit={(v) => onEdit(node, { qty_parent: v })} />
        <CellNumber value={node.qty_total} onCommit={(v) => onEdit(node, { qty_total: v })} className="font-semibold" />
        <span>
          <CellStatus value={node.status} onCommit={(v: Status) => onEdit(node, { status: v })} />
        </span>
        <span className="flex justify-end gap-1">
          <button
            type="button"
            aria-label="Incluir item abaixo"
            title="Incluir item abaixo"
            onClick={() => onAdd(node)}
            className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-primary-container hover:text-primary"
          >
            <Plus className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Remover item"
            title="Remover item"
            onClick={() => onDelete(node)}
            className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-error-bg hover:text-error"
          >
            <Trash2 className="size-4" />
          </button>
        </span>
      </motion.div>

      <AnimatePresence initial={false}>
        {has && open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={springs.screen} className="overflow-hidden">
            {node.children.map((c) => (
              <Row key={c.id} node={c} depth={depth + 1} onEdit={onEdit} onAdd={onAdd} onDelete={onDelete} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OrgChart({ raizes }: { raizes: Node[] }) {
  const [zoom, setZoom] = useState(0.85);
  const [box, setBox] = useState<HTMLDivElement | null>(null);
  return (
    <Card className="relative h-[540px] overflow-hidden bg-stripe p-0">
      <div ref={setBox} className="absolute inset-0 cursor-grab active:cursor-grabbing">
        <motion.div
          drag
          dragConstraints={box}
          dragElastic={0.2}
          dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
          animate={{ scale: zoom }}
          transition={springs.standard}
          className="absolute left-1/2 top-8 origin-top"
          style={{ x: "-50%" }}
        >
          {raizes.map((r) => (
            <OrgNode key={r.id} node={r} />
          ))}
        </motion.div>
      </div>
      <div className="absolute bottom-4 right-4 flex gap-1 rounded-full bg-card p-1 shadow-card">
        {[
          { i: Minus, f: () => setZoom((z) => Math.max(0.4, z - 0.15)), l: "Diminuir zoom" },
          { i: Maximize, f: () => setZoom(0.85), l: "Ajustar" },
          { i: Plus, f: () => setZoom((z) => Math.min(1.6, z + 0.15)), l: "Aumentar zoom" },
        ].map(({ i: I, f, l }) => (
          <motion.button key={l} aria-label={l} whileTap={{ scale: 0.9 }} onClick={f} className="grid size-9 place-items-center rounded-full hover:bg-primary-container">
            <I className="size-4" />
          </motion.button>
        ))}
      </div>
    </Card>
  );
}

function OrgNode({ node }: { node: Node }) {
  const kids = node.children;
  return (
    <div className="flex flex-col items-center">
      <div className={cn("w-[190px] rounded-field bg-card p-3", node.status === "erro" ? "pulse-error shadow-[inset_0_0_0_2px_var(--error)]" : "shadow-[inset_0_0_0_1px_var(--border)] shadow-card")}>
        <p className="truncate font-mono text-[11px] font-medium">{node.code || "(sem código)"}</p>
        <div className="mt-2 flex items-center justify-between">
          <Chip tone={node.node_type === "Montagem" ? "primary" : "lilac"} className="h-6">{node.node_type}</Chip>
          <span className="font-mono text-xs text-muted-foreground">× {node.qty_total}</span>
        </div>
      </div>
      {kids.length > 0 && (
        <>
          <span className="h-5 w-px bg-primary/40" />
          <div className="flex">
            {kids.map((k, i) => (
              <div key={k.id} className="relative flex flex-col items-center px-2.5">
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
