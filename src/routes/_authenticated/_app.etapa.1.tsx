import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FolderOpen, Info, RefreshCw, Save, ScanLine } from "lucide-react";
import { Button, Card, PageHeader, Skeleton, TextField } from "@/components/md3";
import { useApp } from "@/lib/app-store";
import { pageHead } from "@/lib/head";
import { springs } from "@/lib/theme";
import { atualizarLinha } from "@/lib/solidauto.functions";
import { CarregandoProjeto, ErroProjeto, SemProjetoAberto, useProjetoAberto } from "@/lib/projeto-ui";

export const Route = createFileRoute("/_authenticated/_app/etapa/1")({
  head: pageHead("Leitura da montagem", "Etapa 1: leia a montagem geral aberta no SolidWorks."),
  component: Step1,
});

function Step1() {
  const { activeId, toast } = useApp();
  const { data, isPending, error, refetch } = useProjetoAberto();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ order_no: "", title1: "", title2: "" });
  const [pasta, setPasta] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [atualizando, setAtualizando] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({
        order_no: data.project.order_no,
        title1: data.project.title1,
        title2: data.project.title2,
      });
      setPasta(`C:\\Projetos\\${data.project.code.slice(0, 7)}\\Saida`);
    }
  }, [data]);

  if (!activeId) return <SemProjetoAberto />;
  if (isPending) return <CarregandoProjeto />;
  if (error) return <ErroProjeto mensagem={String(error.message)} />;

  const root = data.nodes.find((n) => !n.parent_id) ?? data.nodes[0];
  const sujo =
    form.order_no !== data.project.order_no ||
    form.title1 !== data.project.title1 ||
    form.title2 !== data.project.title2;

  const salvar = async () => {
    setSalvando(true);
    try {
      await atualizarLinha({
        data: { tabela: "projects", id: data.project.id, valores: { ...form } },
      });
      await queryClient.invalidateQueries({ queryKey: ["projeto", data.project.id] });
      await queryClient.invalidateQueries({ queryKey: ["projetos"] });
      toast("Propriedades do projeto salvas");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Não foi possível salvar.", "error");
    } finally {
      setSalvando(false);
    }
  };

  const reler = async () => {
    setAtualizando(true);
    await refetch();
    setAtualizando(false);
    toast(`Montagem relida: ${data.nodes.length} componentes na árvore`);
  };

  return (
    <>
      <PageHeader eyebrow="ETAPA 1" title="Leitura da montagem">
        Confira o documento ativo e as propriedades do projeto lidas da montagem geral.
      </PageHeader>

      <Card className="flex items-center gap-5">
        <div className="grid size-14 place-items-center rounded-field bg-primary-container text-primary">
          <ScanLine className="size-7" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-muted-foreground">Documento ativo no SolidWorks</p>
          {atualizando ? (
            <div className="mt-2 space-y-2">
              <Skeleton className="h-4 w-72" />
              <Skeleton className="h-3 w-48" />
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}>
              <p className="mt-1 truncate font-mono text-[13px]">
                C:\Projetos\{data.project.code.slice(0, 7)}\{data.project.code}.SLDASM
              </p>
              <p className="font-mono text-sm text-primary">Código lido: {data.project.code}</p>
            </motion.div>
          )}
        </div>
        <Button
          variant="outlined"
          onClick={reler}
          disabled={atualizando}
          icon={
            <motion.span animate={{ rotate: atualizando ? 360 : 0 }} transition={{ duration: 0.8, repeat: atualizando ? Infinity : 0, ease: "linear" }}>
              <RefreshCw className="size-4" />
            </motion.span>
          }
        >
          Atualizar
        </Button>
      </Card>

      <Card className="mt-5">
        <h2 className="text-lg font-bold">Campos do projeto</h2>
        <div className="mt-5 grid grid-cols-2 gap-4">
          <TextField
            label="26-Nº PEDIDO"
            value={form.order_no}
            onChange={(e) => setForm({ ...form, order_no: e.target.value })}
            mono
          />
          <TextField label="8-TITULO 1" value={form.title1} onChange={(e) => setForm({ ...form, title1: e.target.value })} />
          <TextField label="9-TITULO 2" value={form.title2} onChange={(e) => setForm({ ...form, title2: e.target.value })} />
          <TextField label="10-TITULO 3" value={root?.title3 ?? ""} readOnly />
          <div className="col-span-2 flex items-center gap-3">
            <TextField
              label="Pasta de saída (DXF e listas)"
              value={pasta}
              onChange={(e) => setPasta(e.target.value)}
              className="flex-1"
              mono
            />
            <Button variant="tonal" icon={<FolderOpen className="size-4" />} onClick={() => toast("A escolha da pasta do computador chega com o complemento do SolidWorks.")}>
              Escolher pasta
            </Button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="space-y-1.5 rounded-field bg-muted p-4 text-[13px] text-muted-foreground">
            <p className="flex gap-2">
              <Info className="mt-0.5 size-4 shrink-0 text-primary" />
              Os campos vêm da montagem geral. O que você editar aqui fica salvo para o projeto.
            </p>
            <p className="pl-6">O caminho da pasta de saída vale só para esta sessão, no seu computador.</p>
          </div>
          <Button icon={<Save className="size-4" />} state={salvando ? "loading" : "idle"} disabled={!sujo || salvando} onClick={salvar}>
            Salvar
          </Button>
        </div>
      </Card>
    </>
  );
}
