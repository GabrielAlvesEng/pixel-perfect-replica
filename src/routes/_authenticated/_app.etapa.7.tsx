import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Download, Info } from "lucide-react";
import { Button, Card, Chip, Counter, PageHeader } from "@/components/md3";
import { useApp } from "@/lib/app-store";
import { pageHead } from "@/lib/head";
import { springs } from "@/lib/theme";
import { removerLinha } from "@/lib/solidauto.functions";
import type { CheckRow } from "@/lib/solidauto.functions";
import { CarregandoProjeto, ErroProjeto, SemProjetoAberto, quando, useProjetoAberto } from "@/lib/projeto-ui";
import { deliverFile, nomeArquivo, xlsxBlob } from "@/lib/exports";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/_app/etapa/7")({
  head: pageHead("Relatório", "Etapa 7: conferência final do projeto e pendências."),
  component: Step7,
});

const severidade = {
  erro: { icone: AlertTriangle, cor: "text-error", fundo: "bg-error-bg", rotulo: "Erro" },
  aviso: { icone: AlertTriangle, cor: "text-warning", fundo: "bg-warning-bg", rotulo: "Aviso" },
  info: { icone: Info, cor: "text-primary", fundo: "bg-primary-container", rotulo: "Info" },
} as const;

function Step7() {
  const { activeId, toast } = useApp();
  const { data, isPending, error } = useProjetoAberto();
  const queryClient = useQueryClient();
  const [exportando, setExportando] = useState(false);

  if (!activeId) return <SemProjetoAberto />;
  if (isPending) return <CarregandoProjeto />;
  if (error) return <ErroProjeto mensagem={String(error.message)} />;

  const recarregar = () =>
    queryClient.invalidateQueries({ queryKey: ["projeto", data.project.id] });

  const resolver = async (c: CheckRow) => {
    try {
      await removerLinha({ data: { tabela: "project_checks", id: c.id } });
      await recarregar();
      toast("Pendência resolvida");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Não foi possível resolver.", "error");
    }
  };

  const exportar = async () => {
    setExportando(true);
    try {
      const blob = await xlsxBlob(
        "Relatório",
        ["Item", "Severidade", "Código", "Observação"],
        [
          ["Projeto", "", data.project.code, `${data.project.title1} — ${data.project.title2}`],
          ["Pedido", "", data.project.order_no, ""],
          ["Componentes na árvore", "", data.nodes.length, ""],
          ["Comerciais e referências", "", data.items.length, ""],
          ["Cortes", "", data.cuts.length, ""],
          ["Chapas", "", data.sheets.length, ""],
          ["Materiais", "", data.materials.length, ""],
          ...data.checks.map((c) => ["Pendência", c.severity, c.code, c.message]),
        ],
      );
      await deliverFile(blob, `${nomeArquivo(data.project.code)}-relatorio.xlsx`);
      toast("Relatório baixado");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Não foi possível gerar o relatório.", "error");
    } finally {
      setExportando(false);
    }
  };

  const erros = data.checks.filter((c) => c.severity === "erro").length;
  const avisos = data.checks.filter((c) => c.severity === "aviso").length;
  const pronto = erros === 0 && avisos === 0;

  return (
    <>
      <PageHeader
        eyebrow="ETAPA 7"
        title="Relatório"
        actions={
          <Button
            variant="tonal"
            icon={<Download className="size-4" />}
            state={exportando ? "loading" : "idle"}
            disabled={exportando}
            onClick={exportar}
          >
            Exportar Excel
          </Button>
        }
      >
        Conferência final: tudo que o projeto reúne e o que ainda precisa de atenção.
      </PageHeader>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "mb-5 flex items-center gap-4 rounded-xl2 p-6 text-white shadow-card",
          pronto ? "bg-hero" : "bg-steel",
        )}
      >
        <motion.div
          animate={pronto ? { scale: [1, 1.12, 1] } : { y: [0, -4, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="grid size-14 place-items-center rounded-full bg-white/15"
        >
          {pronto ? <CheckCircle2 className="size-8 text-lilac" /> : <AlertTriangle className="size-8 text-warning-bg" />}
        </motion.div>
        <div>
          <h2 className="text-xl font-bold">{pronto ? "Projeto liberado" : "Projeto com pendências"}</h2>
          <p className="text-sm text-white/80">
            <span className="font-mono">{data.project.code}</span> · {data.project.title1} · atualizado {quando(data.project.updated_at)}
          </p>
        </div>
      </motion.div>

      <div className="mb-5 grid grid-cols-4 gap-4">
        {[
          { l: "Componentes na árvore", v: data.nodes.length },
          { l: "Comerciais e referências", v: data.items.length },
          { l: "Cortes", v: data.cuts.length },
          { l: "Chapas", v: data.sheets.length },
          { l: "Materiais", v: data.materials.length },
          { l: "Erros", v: erros, tone: "erro" as const },
          { l: "Avisos", v: avisos, tone: "aviso" as const },
          { l: "Pendências", v: data.checks.length, tone: "neutral" as const },
        ].map((b, i) => (
          <motion.div
            key={b.l}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: { ...springs.standard, delay: i * 0.03 } }}
            className="rounded-card bg-card p-4 shadow-card"
          >
            <p className="text-xs text-muted-foreground">{b.l}</p>
            {b.tone ? (
              <Chip tone={b.tone} className="mt-2"><Counter value={b.v} className="font-mono" /></Chip>
            ) : (
              <p className="mt-1 text-2xl font-bold"><Counter value={b.v} className="font-mono" /></p>
            )}
          </motion.div>
        ))}
      </div>

      <Card className="overflow-hidden p-0">
        <div className="border-b px-5 py-3 text-[11px] font-bold tracking-[0.1em] text-muted-foreground">
          PENDÊNCIAS
        </div>
        {data.checks.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
            <CheckCircle2 className="size-8 text-success" />
            <p className="text-sm font-semibold">Nada pendente. O projeto está pronto para liberar.</p>
          </div>
        ) : (
          <AnimatePresence>
            {data.checks.map((c, i) => {
              const s = severidade[c.severity as keyof typeof severidade] ?? severidade.info;
              const I = s.icone;
              return (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0, transition: { ...springs.standard, delay: i * 0.03 } }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex min-h-14 items-center gap-4 px-5 py-3 text-sm"
                >
                  <span className={cn("grid size-8 shrink-0 place-items-center rounded-full", s.fundo, s.cor)}>
                    <I className="size-4" />
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">{c.code}</span>
                  <span className="flex-1">{c.message}</span>
                  <Chip tone={c.severity === "erro" ? "erro" : c.severity === "aviso" ? "aviso" : "neutral"}>
                    {s.rotulo}
                  </Chip>
                  <Button size="sm" variant="text" onClick={() => resolver(c)}>
                    Resolver
                  </Button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </Card>
    </>
  );
}
