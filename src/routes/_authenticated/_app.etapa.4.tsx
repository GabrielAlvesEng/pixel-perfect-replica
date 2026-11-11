import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Plus, ScanSearch, Trash2 } from "lucide-react";
import { Button, Card, Chip, Counter, Dialog, PageHeader } from "@/components/md3";
import { useApp } from "@/lib/app-store";
import { pageHead } from "@/lib/head";
import { springs } from "@/lib/theme";
import { atualizarLinha, inserirLinha, removerLinha } from "@/lib/solidauto.functions";
import type { CutRow } from "@/lib/solidauto.functions";
import { CarregandoProjeto, ErroProjeto, SemProjetoAberto, useProjetoAberto } from "@/lib/projeto-ui";
import { CellNumber, CellStatus, CellText } from "@/lib/cells";
import { deliverFile, nomeArquivo, xlsxBlob } from "@/lib/exports";
import type { Status } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/_app/etapa/4")({
  head: pageHead("Lista de corte", "Etapa 4: barras e perfis cortados por soldagem."),
  component: Step4,
});

const cols =
  "grid grid-cols-[76px_minmax(150px,1fr)_minmax(120px,1fr)_112px_74px_88px_96px_92px_54px] items-center gap-3";

const kgTotais = (c: CutRow) => Math.round(((c.kgm * c.length_mm) / 1000) * c.qty * 100) / 100;

function Step4() {
  const { activeId, toast } = useApp();
  const { data, isPending, error } = useProjetoAberto();
  const queryClient = useQueryClient();
  const [exportando, setExportando] = useState(false);
  const [novo, setNovo] = useState({ aberto: false, weld_code: "", profile: "", material: "", length: "1000", qty: "1", kgm: "10" });

  const grupos = useMemo(() => {
    const g = new Map<string, CutRow[]>();
    for (const c of data?.cuts ?? []) {
      const lista = g.get(c.weld_code) ?? [];
      lista.push(c);
      g.set(c.weld_code, lista);
    }
    return [...g.entries()];
  }, [data]);

  if (!activeId) return <SemProjetoAberto />;
  if (isPending) return <CarregandoProjeto />;
  if (error) return <ErroProjeto mensagem={String(error.message)} />;

  const recarregar = () =>
    queryClient.invalidateQueries({ queryKey: ["projeto", data.project.id] });

  const editar = async (c: CutRow, valores: Record<string, unknown>) => {
    try {
      await atualizarLinha({ data: { tabela: "cut_items", id: c.id, valores } });
      await recarregar();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Não foi possível salvar.", "error");
    }
  };

  const incluir = async () => {
    if (!novo.weld_code.trim()) {
      toast("Informe a soldagem.", "error");
      return;
    }
    try {
      await inserirLinha({
        data: {
          tabela: "cut_items",
          valores: {
            project_id: data.project.id,
            weld_code: novo.weld_code.trim(),
            weld_title: data.nodes.find((n) => n.code === novo.weld_code.trim())?.title3 ?? "",
            pos: "",
            profile: novo.profile.trim(),
            material: novo.material.trim(),
            length_mm: Number(novo.length) || 0,
            qty: Number(novo.qty) || 1,
            kgm: Number(novo.kgm) || 0,
            status: "aviso",
            position: (data.cuts.length + 1) * 10,
          },
        },
      });
      setNovo({ aberto: false, weld_code: "", profile: "", material: "", length: "1000", qty: "1", kgm: "10" });
      await recarregar();
      toast("Corte incluído");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Não foi possível incluir.", "error");
    }
  };

  const excluir = async (c: CutRow) => {
    try {
      await removerLinha({ data: { tabela: "cut_items", id: c.id } });
      await recarregar();
      toast("Corte removido");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Não foi possível remover.", "error");
    }
  };

  const conferir = () => {
    const soldagens = data.nodes.filter((n) => n.node_type === "Soldagem");
    const semCorte = soldagens.filter((s) => !data.cuts.some((c) => c.weld_code === s.code));
    if (semCorte.length === 0) toast("Todas as soldagens têm lista de corte");
    else toast(`${semCorte.length} soldagens sem lista de corte`, "error");
  };

  const exportar = async () => {
    setExportando(true);
    try {
      const blob = await xlsxBlob(
        "Lista de corte",
        ["Soldagem", "Título", "Pos.", "Perfil", "Material", "Compr. (mm)", "Qtd", "Kg/m", "Total kg"],
        data.cuts.map((c) => [
          c.weld_code,
          c.weld_title,
          c.pos,
          c.profile,
          c.material,
          c.length_mm,
          c.qty,
          c.kgm,
          kgTotais(c),
        ]),
      );
      await deliverFile(blob, `${nomeArquivo(data.project.code)}-lista-de-corte.xlsx`);
      toast("Planilha baixada");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Não foi possível gerar a planilha.", "error");
    } finally {
      setExportando(false);
    }
  };

  const pesoTotal = Math.round(data.cuts.reduce((s, c) => s + kgTotais(c), 0) * 100) / 100;

  return (
    <>
      <PageHeader
        eyebrow="ETAPA 4"
        title="Lista de corte"
        actions={
          <div className="flex gap-2">
            <Button variant="outlined" icon={<ScanSearch className="size-4" />} onClick={conferir}>
              Conferir com a árvore
            </Button>
            <Button icon={<Plus className="size-4" />} onClick={() => setNovo({ ...novo, aberto: true })}>
              Incluir corte
            </Button>
          </div>
        }
      >
        Barras e perfis cortados, agrupados por soldagem. Clique em um valor para editar.
      </PageHeader>

      <div className="mb-5 flex gap-2">
        <Chip><Counter value={data.cuts.length} className="font-mono" /> cortes</Chip>
        <Chip tone="lilac"><Counter value={grupos.length} className="font-mono" /> soldagens</Chip>
        <Chip tone="neutral"><Counter value={pesoTotal} className="font-mono" /> kg no total</Chip>
      </div>

      <div className="space-y-5">
        {grupos.length === 0 ? (
          <Card className="py-12 text-center text-sm text-muted-foreground">
            Nenhum corte ainda. Inclua o primeiro corte ou confira com a árvore.
          </Card>
        ) : (
          grupos.map(([weld, cortes], gi) => (
            <motion.div key={weld} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { ...springs.standard, delay: gi * 0.04 } }}>
              <div className="mb-2 flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-primary">{weld || "(sem soldagem)"}</span>
                <span className="text-sm text-muted-foreground">{cortes[0]?.weld_title}</span>
                <Chip tone="neutral" className="ml-auto">{cortes.length} itens</Chip>
              </div>
              <Card className="overflow-hidden p-0">
                <div className={cn(cols, "border-b px-5 py-3 text-[11px] font-bold tracking-[0.1em] text-muted-foreground")}>
                  <span>POS.</span>
                  <span>PERFIL</span>
                  <span>MATERIAL</span>
                  <span className="text-right">COMPR. (MM)</span>
                  <span className="text-right">QTD</span>
                  <span className="text-right">KG/M</span>
                  <span className="text-right">TOTAL KG</span>
                  <span>STATUS</span>
                  <span />
                </div>
                <AnimatePresence>
                  {cortes.map((c, i) => (
                    <motion.div
                      key={c.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, height: 0 }}
                      className={cn(cols, "min-h-12 px-5 text-sm", i % 2 && "bg-stripe")}
                    >
                      <CellText value={c.pos} onCommit={(v) => editar(c, { pos: v })} className="font-mono text-xs" />
                      <CellText value={c.profile} onCommit={(v) => editar(c, { profile: v })} />
                      <CellText value={c.material} onCommit={(v) => editar(c, { material: v })} />
                      <CellNumber value={c.length_mm} onCommit={(v) => editar(c, { length_mm: v })} />
                      <CellNumber value={c.qty} onCommit={(v) => editar(c, { qty: v })} />
                      <CellNumber value={c.kgm} step={0.1} onCommit={(v) => editar(c, { kgm: v })} />
                      <span className="text-right font-mono font-semibold">{kgTotais(c)}</span>
                      <span>
                        <CellStatus value={c.status} onCommit={(v: Status) => editar(c, { status: v })} />
                      </span>
                      <span className="flex justify-end">
                        <button
                          type="button"
                          aria-label="Remover corte"
                          onClick={() => excluir(c)}
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

      <div className="mt-6 flex justify-end">
        <Button
          variant="tonal"
          icon={<Download className="size-4" />}
          state={exportando ? "loading" : "idle"}
          disabled={exportando || data.cuts.length === 0}
          onClick={exportar}
        >
          Exportar Excel
        </Button>
      </div>

      <Dialog
        open={novo.aberto}
        onClose={() => setNovo({ ...novo, aberto: false })}
        title="Incluir corte"
        actions={
          <>
            <Button variant="text" onClick={() => setNovo({ ...novo, aberto: false })}>Cancelar</Button>
            <Button onClick={incluir}>Incluir</Button>
          </>
        }
      >
        <div className="space-y-3 pt-1">
          <TextFieldWelds
            value={novo.weld_code}
            onChange={(v) => setNovo({ ...novo, weld_code: v })}
            soldagens={data.nodes.filter((n) => n.node_type === "Soldagem").map((n) => n.code)}
          />
          <TextField2 label="Perfil" value={novo.profile} onChange={(v) => setNovo({ ...novo, profile: v })} />
          <TextField2 label="Material" value={novo.material} onChange={(v) => setNovo({ ...novo, material: v })} />
          <div className="grid grid-cols-3 gap-3">
            <TextField2 label="Compr. (mm)" value={novo.length} onChange={(v) => setNovo({ ...novo, length: v })} />
            <TextField2 label="Qtd" value={novo.qty} onChange={(v) => setNovo({ ...novo, qty: v })} />
            <TextField2 label="Kg/m" value={novo.kgm} onChange={(v) => setNovo({ ...novo, kgm: v })} />
          </div>
        </div>
      </Dialog>
    </>
  );
}

function TextField2({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
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

function TextFieldWelds({ value, onChange, soldagens }: { value: string; onChange: (v: string) => void; soldagens: string[] }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">Soldagem</span>
      <input
        value={value}
        list="lista-soldagens"
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-11 w-full rounded-field bg-muted px-4 font-mono text-sm outline-none focus:shadow-[inset_0_0_0_2px_var(--primary)]"
      />
      <datalist id="lista-soldagens">
        {soldagens.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
    </label>
  );
}
