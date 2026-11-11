import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { HelpCircle, Plus, Search, Trash2 } from "lucide-react";
import { Button, Card, Dialog, PageHeader, Segmented, TextField } from "@/components/md3";
import { useApp } from "@/lib/app-store";
import { pageHead } from "@/lib/head";
import { springs } from "@/lib/theme";
import { atualizarLinha, inserirLinha, removerLinha } from "@/lib/solidauto.functions";
import type { ItemRow, Kind } from "@/lib/solidauto.functions";
import { CarregandoProjeto, ErroProjeto, SemProjetoAberto, useProjetoAberto } from "@/lib/projeto-ui";
import { CellNumber, CellText } from "@/lib/cells";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/_app/etapa/3")({
  head: pageHead("Comerciais e referências", "Etapa 3: separe itens comerciais, referências e peças do projeto."),
  component: Step3,
});

const kindHelp: Record<Kind, string> = {
  CM: "Comercial: comprado pronto, entra na lista de compra.",
  REF: "Referência: só posiciona ou mostra, não entra em lista nenhuma.",
  Projeto: "Faz parte do projeto: entra na árvore e precisa de código.",
};
const cols = "grid grid-cols-[1.2fr_1.3fr_0.9fr_76px_84px_212px_56px] items-center gap-3";

function Step3() {
  const { activeId, toast } = useApp();
  const { data, isPending, error } = useProjetoAberto();
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [mudados, setMudados] = useState<Record<string, boolean>>({});
  const [novo, setNovo] = useState({ aberto: false, name: "", file: "", folder: "", qty: "1" });

  if (!activeId) return <SemProjetoAberto />;
  if (isPending) return <CarregandoProjeto />;
  if (error) return <ErroProjeto mensagem={String(error.message)} />;

  const recarregar = () =>
    queryClient.invalidateQueries({ queryKey: ["projeto", data.project.id] });

  const linhas = data.items.filter((c) => `${c.name} ${c.file}`.toLowerCase().includes(q.toLowerCase()));

  const classificar = async (c: ItemRow, kind: Kind) => {
    if (kind === c.kind) return;
    try {
      await atualizarLinha({ data: { tabela: "project_items", id: c.id, valores: { kind } } });
      setMudados((m) => ({ ...m, [c.id]: true }));
      await recarregar();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Não foi possível salvar.", "error");
    }
  };

  const editar = async (c: ItemRow, valores: Record<string, unknown>) => {
    try {
      await atualizarLinha({ data: { tabela: "project_items", id: c.id, valores } });
      await recarregar();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Não foi possível salvar.", "error");
    }
  };

  const incluir = async () => {
    if (!novo.name.trim()) {
      toast("Dê um nome para o item.", "error");
      return;
    }
    try {
      await inserirLinha({
        data: {
          tabela: "project_items",
          valores: {
            project_id: data.project.id,
            name: novo.name.trim(),
            file: novo.file.trim(),
            folder: novo.folder.trim(),
            qty: Math.max(1, Number(novo.qty) || 1),
            item_type: "Peça",
            kind: "CM",
            position: (data.items.length + 1) * 10,
          },
        },
      });
      setNovo({ aberto: false, name: "", file: "", folder: "", qty: "1" });
      await recarregar();
      toast("Item incluído");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Não foi possível incluir.", "error");
    }
  };

  const excluir = async (c: ItemRow) => {
    try {
      await removerLinha({ data: { tabela: "project_items", id: c.id } });
      await recarregar();
      toast("Item removido");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Não foi possível remover.", "error");
    }
  };

  return (
    <>
      <PageHeader eyebrow="ETAPA 3" title="Comerciais e referências" actions={<Button icon={<Plus className="size-4" />} onClick={() => setNovo({ ...novo, aberto: true })}>Incluir item</Button>}>
        Diga o que cada item é. Comerciais vão para a lista de compra; referências ficam de fora.
      </PageHeader>

      <div className="mb-5 flex items-center justify-between">
        <TextField label="Buscar pelo nome ou arquivo" value={q} onChange={(e) => setQ(e.target.value)} trailing={<Search className="size-[18px]" />} className="w-[400px]" />
        <div className="group relative flex items-center gap-1.5 text-sm text-muted-foreground">
          <HelpCircle className="size-4" />O que é CM, REF e Projeto?
          <div className="pointer-events-none absolute right-0 top-7 z-10 w-80 space-y-2 rounded-field bg-steel p-4 text-xs text-white opacity-0 shadow-card-hover transition-opacity group-hover:opacity-100">
            {(Object.keys(kindHelp) as Kind[]).map((k) => (
              <p key={k}><b className="text-lilac">{k}</b> · {kindHelp[k]}</p>
            ))}
          </div>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <div className={cn(cols, "border-b px-5 py-3 text-[11px] font-bold tracking-[0.1em] text-muted-foreground")}>
          <span>NOME NA PEÇA</span>
          <span>ARQUIVO</span>
          <span>PASTA</span>
          <span className="text-right">QTD TOTAL</span>
          <span>TIPO</span>
          <span>É</span>
          <span />
        </div>
        {linhas.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-muted-foreground">
            Nenhum item com esse nome. Limpe a busca ou inclua um item novo.
          </p>
        ) : (
          linhas.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0, transition: { ...springs.standard, delay: i * 0.03 } }}
              className={cn(cols, "min-h-14 px-5 py-2 text-sm", i % 2 && "bg-stripe")}
            >
              <div className="min-w-0">
                <CellText value={c.name} onCommit={(v) => editar(c, { name: v })} className="font-medium" />
                <AnimatePresence>
                  {mudados[c.id] && (
                    <motion.span
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={springs.bouncy}
                      className="mt-1 inline-block rounded-chip bg-primary-container px-2 py-0.5 text-[11px] font-semibold text-primary"
                    >
                      Alterado por você
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <CellText value={c.file} onCommit={(v) => editar(c, { file: v })} className="truncate font-mono text-xs" />
              <CellText value={c.folder} onCommit={(v) => editar(c, { folder: v })} className="truncate text-muted-foreground" />
              <CellNumber value={c.qty} onCommit={(v) => editar(c, { qty: v })} className="font-semibold" />
              <span className="text-muted-foreground">{c.item_type}</span>
              <Segmented
                size="sm"
                options={["CM", "REF", "Projeto"] as Kind[]}
                labels={kindHelp}
                value={(c.kind as Kind) ?? "CM"}
                onChange={(v) => classificar(c, v)}
              />
              <span className="flex justify-end">
                <button
                  type="button"
                  aria-label={`Remover ${c.name}`}
                  onClick={() => excluir(c)}
                  className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-error-bg hover:text-error"
                >
                  <Trash2 className="size-4" />
                </button>
              </span>
            </motion.div>
          ))
        )}
      </Card>

      <Dialog
        open={novo.aberto}
        onClose={() => setNovo({ aberto: false, name: "", file: "", folder: "", qty: "1" })}
        title="Incluir item"
        actions={
          <>
            <Button variant="text" onClick={() => setNovo({ aberto: false, name: "", file: "", folder: "", qty: "1" })}>Cancelar</Button>
            <Button onClick={incluir}>Incluir</Button>
          </>
        }
      >
        <div className="space-y-3 pt-1">
          <TextField label="Nome na peça" value={novo.name} onChange={(e) => setNovo({ ...novo, name: e.target.value })} />
          <TextField label="Arquivo" value={novo.file} onChange={(e) => setNovo({ ...novo, file: e.target.value })} mono />
          <TextField label="Pasta" value={novo.folder} onChange={(e) => setNovo({ ...novo, folder: e.target.value })} />
          <TextField label="Quantidade" value={novo.qty} onChange={(e) => setNovo({ ...novo, qty: e.target.value })} mono />
        </div>
      </Dialog>
    </>
  );
}
