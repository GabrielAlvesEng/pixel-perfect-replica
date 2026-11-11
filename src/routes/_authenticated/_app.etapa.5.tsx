import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Download, FileDown, Plus, Trash2 } from "lucide-react";
import { Button, Card, Chip, Counter, Dialog, PageHeader } from "@/components/md3";
import { useApp } from "@/lib/app-store";
import { pageHead } from "@/lib/head";
import { springs } from "@/lib/theme";
import { atualizarLinha, inserirLinha, removerLinha } from "@/lib/solidauto.functions";
import type { SheetRow } from "@/lib/solidauto.functions";
import { CarregandoProjeto, ErroProjeto, SemProjetoAberto, useProjetoAberto } from "@/lib/projeto-ui";
import { CellNumber, CellText } from "@/lib/cells";
import { blobDeTexto, deliverFile, dxfForSheet, nomeArquivo, zipBlobs } from "@/lib/exports";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/_app/etapa/5")({
  head: pageHead("DXF das chapas", "Etapa 5: chapas com medidas e furos, prontas para o corte."),
  component: Step5,
});

const cols =
  "grid grid-cols-[minmax(120px,1fr)_92px_minmax(140px,1fr)_minmax(140px,1fr)_92px_92px_76px_76px_92px_54px] items-center gap-3";

function Step5() {
  const { activeId, toast } = useApp();
  const { data, isPending, error } = useProjetoAberto();
  const queryClient = useQueryClient();
  const [zip, setZip] = useState(false);
  const [novo, setNovo] = useState({ aberto: false, code: "", name: "", material: "", thickness: "6", w: "600", h: "400", qty: "1", holes: "4" });

  if (!activeId) return <SemProjetoAberto />;
  if (isPending) return <CarregandoProjeto />;
  if (error) return <ErroProjeto mensagem={String(error.message)} />;

  const recarregar = () =>
    queryClient.invalidateQueries({ queryKey: ["projeto", data.project.id] });

  const editar = async (s: SheetRow, valores: Record<string, unknown>) => {
    try {
      await atualizarLinha({ data: { tabela: "sheets", id: s.id, valores } });
      await recarregar();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Não foi possível salvar.", "error");
    }
  };

  const baixarUm = async (s: SheetRow) => {
    try {
      await deliverFile(blobDeTexto(dxfForSheet(s)), `${nomeArquivo(s.code || s.name)}.dxf`);
      toast(`DXF baixado: ${s.code}`);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Não foi possível baixar o DXF.", "error");
    }
  };

  const baixarTodos = async () => {
    setZip(true);
    try {
      const blob = await zipBlobs(
        data.sheets.map((s) => ({
          nome: `${nomeArquivo(s.code || s.name)}.dxf`,
          blob: blobDeTexto(dxfForSheet(s)),
        })),
      );
      await deliverFile(blob, `${nomeArquivo(data.project.code)}-dxf.zip`);
      toast("Pacote de DXF baixado");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Não foi possível gerar o pacote.", "error");
    } finally {
      setZip(false);
    }
  };

  const incluir = async () => {
    if (!novo.code.trim()) {
      toast("Informe o código da chapa.", "error");
      return;
    }
    try {
      await inserirLinha({
        data: {
          tabela: "sheets",
          valores: {
            project_id: data.project.id,
            code: novo.code.trim(),
            name: novo.name.trim(),
            material: novo.material.trim(),
            thickness: novo.thickness.trim(),
            w_mm: Number(novo.w) || 0,
            h_mm: Number(novo.h) || 0,
            qty: Number(novo.qty) || 1,
            holes: Number(novo.holes) || 0,
            shape: "rect",
            position: (data.sheets.length + 1) * 10,
          },
        },
      });
      setNovo({ aberto: false, code: "", name: "", material: "", thickness: "6", w: "600", h: "400", qty: "1", holes: "4" });
      await recarregar();
      toast("Chapa incluída");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Não foi possível incluir.", "error");
    }
  };

  const excluir = async (s: SheetRow) => {
    try {
      await removerLinha({ data: { tabela: "sheets", id: s.id } });
      await recarregar();
      toast("Chapa removida");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Não foi possível remover.", "error");
    }
  };

  const areas = data.sheets.reduce((s, x) => s + (x.w_mm * x.h_mm * x.qty) / 1_000_000, 0);

  return (
    <>
      <PageHeader
        eyebrow="ETAPA 5"
        title="DXF das chapas"
        actions={
          <div className="flex gap-2">
            <Button icon={<Plus className="size-4" />} onClick={() => setNovo({ ...novo, aberto: true })}>
              Incluir chapa
            </Button>
            <Button
              variant="tonal"
              icon={<Download className="size-4" />}
              state={zip ? "loading" : "idle"}
              disabled={zip || data.sheets.length === 0}
              onClick={baixarTodos}
            >
              Baixar todos os DXF
            </Button>
          </div>
        }
      >
        Cada chapa sai como arquivo DXF nas medidas reais, em milímetros, com os furos já desenhados.
      </PageHeader>

      <div className="mb-5 flex gap-2">
        <Chip><Counter value={data.sheets.length} className="font-mono" /> chapas</Chip>
        <Chip tone="lilac"><Counter value={data.sheets.reduce((s, x) => s + x.qty, 0)} className="font-mono" /> peças</Chip>
        <Chip tone="neutral">{areas.toFixed(2)} m²</Chip>
      </div>

      <Card className="overflow-hidden p-0">
        <div className={cn(cols, "border-b px-5 py-3 text-[11px] font-bold tracking-[0.1em] text-muted-foreground")}>
          <span>MATERIAL</span>
          <span className="text-right">ESP. (MM)</span>
          <span>CÓDIGO</span>
          <span>NOME</span>
          <span className="text-right">L (MM)</span>
          <span className="text-right">A (MM)</span>
          <span className="text-right">FURROS</span>
          <span className="text-right">QTD</span>
          <span>DXF</span>
          <span />
        </div>
        {data.sheets.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-muted-foreground">
            Nenhuma chapa ainda. Inclua a primeira para gerar o DXF.
          </p>
        ) : (
          <AnimatePresence>
            {data.sheets.map((s, i) => (
              <motion.div
                key={s.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { ...springs.standard, delay: i * 0.025 } }}
                exit={{ opacity: 0, height: 0 }}
                className={cn(cols, "min-h-12 px-5 text-sm", i % 2 && "bg-stripe")}
              >
                <CellText value={s.material} onCommit={(v) => editar(s, { material: v })} />
                <CellText value={s.thickness} onCommit={(v) => editar(s, { thickness: v })} className="text-right font-mono" />
                <CellText value={s.code} onCommit={(v) => editar(s, { code: v })} className="font-mono text-xs" />
                <CellText value={s.name} onCommit={(v) => editar(s, { name: v })} />
                <CellNumber value={s.w_mm} onCommit={(v) => editar(s, { w_mm: v })} />
                <CellNumber value={s.h_mm} onCommit={(v) => editar(s, { h_mm: v })} />
                <CellNumber value={s.holes} onCommit={(v) => editar(s, { holes: v })} />
                <CellNumber value={s.qty} onCommit={(v) => editar(s, { qty: v })} className="font-semibold" />
                <span>
                  <Button size="sm" variant="outlined" icon={<FileDown className="size-4" />} onClick={() => baixarUm(s)}>
                    DXF
                  </Button>
                </span>
                <span className="flex justify-end">
                  <button
                    type="button"
                    aria-label={`Remover chapa ${s.code}`}
                    onClick={() => excluir(s)}
                    className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-error-bg hover:text-error"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </Card>

      <Dialog
        open={novo.aberto}
        onClose={() => setNovo({ ...novo, aberto: false })}
        title="Incluir chapa"
        actions={
          <>
            <Button variant="text" onClick={() => setNovo({ ...novo, aberto: false })}>Cancelar</Button>
            <Button onClick={incluir}>Incluir</Button>
          </>
        }
      >
        <div className="space-y-3 pt-1">
          <Campo label="Código" value={novo.code} onChange={(v) => setNovo({ ...novo, code: v })} />
          <Campo label="Nome" value={novo.name} onChange={(v) => setNovo({ ...novo, name: v })} />
          <div className="grid grid-cols-2 gap-3">
            <Campo label="Material" value={novo.material} onChange={(v) => setNovo({ ...novo, material: v })} />
            <Campo label="Espessura (mm)" value={novo.thickness} onChange={(v) => setNovo({ ...novo, thickness: v })} />
          </div>
          <div className="grid grid-cols-4 gap-3">
            <Campo label="L (mm)" value={novo.w} onChange={(v) => setNovo({ ...novo, w: v })} />
            <Campo label="A (mm)" value={novo.h} onChange={(v) => setNovo({ ...novo, h: v })} />
            <Campo label="Furos" value={novo.holes} onChange={(v) => setNovo({ ...novo, holes: v })} />
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
