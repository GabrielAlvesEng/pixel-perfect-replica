import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Plus, Trash2 } from "lucide-react";
import { Button, Card, Chip, Counter, Dialog, PageHeader } from "@/components/md3";
import { useApp } from "@/lib/app-store";
import { pageHead } from "@/lib/head";
import { springs } from "@/lib/theme";
import { atualizarLinha, inserirLinha, removerLinha } from "@/lib/solidauto.functions";
import type { MaterialRow } from "@/lib/solidauto.functions";
import { CarregandoProjeto, ErroProjeto, SemProjetoAberto, useProjetoAberto } from "@/lib/projeto-ui";
import { CellNumber, CellText } from "@/lib/cells";
import { deliverFile, nomeArquivo, xlsxBlob } from "@/lib/exports";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/_app/etapa/6")({
  head: pageHead("Listas de materiais", "Etapa 6: materiais por montagem, prontos para comprar ou cortar."),
  component: Step6,
});

const cols =
  "grid grid-cols-[minmax(120px,1fr)_minmax(180px,1.4fr)_minmax(140px,1fr)_76px_76px_54px] items-center gap-3";

function Step6() {
  const { activeId, toast } = useApp();
  const { data, isPending, error } = useProjetoAberto();
  const queryClient = useQueryClient();
  const [exportando, setExportando] = useState(false);
  const [novo, setNovo] = useState({ aberto: false, assembly: "", item: "", description: "", spec: "", unit: "un", qty: "1" });

  const grupos = useMemo(() => {
    const g = new Map<string, MaterialRow[]>();
    for (const m of data?.materials ?? []) {
      const lista = g.get(m.assembly) ?? [];
      lista.push(m);
      g.set(m.assembly, lista);
    }
    return [...g.entries()];
  }, [data]);

  if (!activeId) return <SemProjetoAberto />;
  if (isPending) return <CarregandoProjeto />;
  if (error) return <ErroProjeto mensagem={String(error.message)} />;

  const recarregar = () =>
    queryClient.invalidateQueries({ queryKey: ["projeto", data.project.id] });

  const editar = async (m: MaterialRow, valores: Record<string, unknown>) => {
    try {
      await atualizarLinha({ data: { tabela: "material_items", id: m.id, valores } });
      await recarregar();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Não foi possível salvar.", "error");
    }
  };

  const incluir = async () => {
    if (!novo.item.trim()) {
      toast("Informe o item.", "error");
      return;
    }
    try {
      await inserirLinha({
        data: {
          tabela: "material_items",
          valores: {
            project_id: data.project.id,
            assembly: novo.assembly.trim(),
            title: novo.assembly.trim(),
            item: novo.item.trim(),
            description: novo.description.trim(),
            spec: novo.spec.trim(),
            unit: novo.unit.trim() || "un",
            qty: Number(novo.qty) || 1,
            position: (data.materials.length + 1) * 10,
          },
        },
      });
      setNovo({ aberto: false, assembly: "", item: "", description: "", spec: "", unit: "un", qty: "1" });
      await recarregar();
      toast("Material incluído");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Não foi possível incluir.", "error");
    }
  };

  const excluir = async (m: MaterialRow) => {
    try {
      await removerLinha({ data: { tabela: "material_items", id: m.id } });
      await recarregar();
      toast("Material removido");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Não foi possível remover.", "error");
    }
  };

  const exportar = async () => {
    setExportando(true);
    try {
      const blob = await xlsxBlob(
        "Listas de materiais",
        ["Montagem", "Título", "Item", "Descrição", "Especificação", "Unidade", "Qtd"],
        data.materials.map((m) => [m.assembly, m.title, m.item, m.description, m.spec, m.unit, m.qty]),
      );
      await deliverFile(blob, `${nomeArquivo(data.project.code)}-listas-de-materiais.xlsx`);
      toast("Planilha baixada");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Não foi possível gerar a planilha.", "error");
    } finally {
      setExportando(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="ETAPA 6"
        title="Listas de materiais"
        actions={
          <div className="flex gap-2">
            <Button icon={<Plus className="size-4" />} onClick={() => setNovo({ ...novo, aberto: true })}>
              Incluir material
            </Button>
            <Button
              variant="tonal"
              icon={<Download className="size-4" />}
              state={exportando ? "loading" : "idle"}
              disabled={exportando || data.materials.length === 0}
              onClick={exportar}
            >
              Exportar Excel
            </Button>
          </div>
        }
      >
        O que entra em cada montagem, com quantidade e especificação. Clique em um valor para editar.
      </PageHeader>

      <div className="mb-5 flex gap-2">
        <Chip><Counter value={data.materials.length} className="font-mono" /> materiais</Chip>
        <Chip tone="lilac"><Counter value={grupos.length} className="font-mono" /> montagens</Chip>
      </div>

      <div className="space-y-5">
        {grupos.length === 0 ? (
          <Card className="py-12 text-center text-sm text-muted-foreground">
            Nenhuma lista de material ainda. Inclua o primeiro material.
          </Card>
        ) : (
          grupos.map(([assembly, itens], gi) => (
            <motion.div key={assembly} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { ...springs.standard, delay: gi * 0.04 } }}>
              <div className="mb-2 flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-primary">{assembly || "(sem montagem)"}</span>
                <span className="text-sm text-muted-foreground">{itens[0]?.title}</span>
                <Chip tone="neutral" className="ml-auto">{itens.length} itens</Chip>
              </div>
              <Card className="overflow-hidden p-0">
                <div className={cn(cols, "border-b px-5 py-3 text-[11px] font-bold tracking-[0.1em] text-muted-foreground")}>
                  <span>ITEM</span>
                  <span>DESCRIÇÃO</span>
                  <span>ESPECIFICAÇÃO</span>
                  <span>UNID.</span>
                  <span className="text-right">QTD</span>
                  <span />
                </div>
                <AnimatePresence>
                  {itens.map((m, i) => (
                    <motion.div
                      key={m.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, height: 0 }}
                      className={cn(cols, "min-h-12 px-5 text-sm", i % 2 && "bg-stripe")}
                    >
                      <CellText value={m.item} onCommit={(v) => editar(m, { item: v })} className="font-medium" />
                      <CellText value={m.description} onCommit={(v) => editar(m, { description: v })} />
                      <CellText value={m.spec} onCommit={(v) => editar(m, { spec: v })} className="text-muted-foreground" />
                      <CellText value={m.unit} onCommit={(v) => editar(m, { unit: v })} />
                      <CellNumber value={m.qty} onCommit={(v) => editar(m, { qty: v })} className="font-semibold" />
                      <span className="flex justify-end">
                        <button
                          type="button"
                          aria-label={`Remover ${m.item}`}
                          onClick={() => excluir(m)}
                          className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-error-bg hover:text-error"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <Dialog
        open={novo.aberto}
        onClose={() => setNovo({ ...novo, aberto: false })}
        title="Incluir material"
        actions={
          <>
            <Button variant="text" onClick={() => setNovo({ ...novo, aberto: false })}>Cancelar</Button>
            <Button onClick={incluir}>Incluir</Button>
          </>
        }
      >
        <div className="space-y-3 pt-1">
          <Campo label="Montagem" value={novo.assembly} onChange={(v) => setNovo({ ...novo, assembly: v })} />
          <Campo label="Item" value={novo.item} onChange={(v) => setNovo({ ...novo, item: v })} />
          <Campo label="Descrição" value={novo.description} onChange={(v) => setNovo({ ...novo, description: v })} />
          <Campo label="Especificação" value={novo.spec} onChange={(v) => setNovo({ ...novo, spec: v })} />
          <div className="grid grid-cols-2 gap-3">
            <Campo label="Unidade" value={novo.unit} onChange={(v) => setNovo({ ...novo, unit: v })} />
            <Campo label="Qtd" value={novo.qty} onChange={(v) => setNovo({ ...novo, qty: v })} />
          </div>
        </div>
      </Dialog>
    </>
  );
}

function Campo({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-11 w-full rounded-field bg-muted px-4 text-sm outline-none focus:shadow-[inset_0_0_0_2px_var(--primary)]"
      />
    </label>
  );
}
