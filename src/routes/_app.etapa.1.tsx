import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { FileBox, FolderOpen, Info, RefreshCw, ScanLine } from "lucide-react";
import { Button, Card, PageHeader, ProcessButton, Skeleton, TextField } from "@/components/md3";
import { useApp } from "@/lib/app-store";
import { pageHead } from "@/lib/head";
import { springs } from "@/lib/theme";

export const Route = createFileRoute("/_app/etapa/1")({ head: pageHead("Leitura da montagem", "Etapa 1: leia a montagem geral aberta no SolidWorks."), component: Step1 });

function Step1() {
  const { active, toast } = useApp();
  const [loading, setLoading] = useState(false);
  const [spin, setSpin] = useState(0);
  const code = active?.code ?? "26-060-PGP-00-00-000";
  const reload = () => { setSpin((s) => s + 1); setLoading(true); setTimeout(() => setLoading(false), 1300); };
  return (
    <>
      <PageHeader eyebrow="ETAPA 1" title="Leitura da montagem">Confira o documento ativo e as propriedades do projeto lidas da montagem geral.</PageHeader>
      <Card className="flex items-center gap-5">
        <div className="grid size-14 place-items-center rounded-field bg-primary-container text-primary"><FileBox className="size-7" /></div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-muted-foreground">Documento ativo no SolidWorks</p>
          {loading ? <div className="mt-2 space-y-2"><Skeleton className="h-4 w-72" /><Skeleton className="h-3 w-48" /></div> : (
            <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}>
              <p className="mt-1 truncate font-medium">C:\Projetos\26-060\{code}.SLDASM</p>
              <p className="font-mono text-sm text-primary">Código lido: {code}</p>
            </motion.div>
          )}
        </div>
        <Button variant="outlined" onClick={reload} icon={<motion.span animate={{ rotate: spin * 360 }} transition={springs.standard}><RefreshCw className="size-4" /></motion.span>}>Atualizar</Button>
        <ProcessButton icon={<ScanLine className="size-4" />} onDone={() => toast("Montagem lida: 14 componentes encontrados")}>Ler montagem</ProcessButton>
      </Card>

      <Card className="mt-5">
        <h2 className="text-lg font-bold">Campos do projeto</h2>
        {loading ? <div className="mt-5 grid grid-cols-2 gap-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-14 rounded-field" />)}</div> : (
          <div className="mt-5 grid grid-cols-2 gap-4">
            <TextField label="26-Nº PEDIDO" defaultValue={active?.order ?? "4512"} mono />
            <TextField label="8-TITULO 1" defaultValue={active?.title1 ?? ""} />
            <TextField label="9-TITULO 2" defaultValue={active?.title2 ?? ""} />
            <TextField label="10-TITULO 3" defaultValue="Montagem geral" />
            <div className="col-span-2 flex items-center gap-3">
              <TextField label="Pasta de saída (DXF e listas)" defaultValue="C:\Projetos\26-060\Saida" className="flex-1" mono />
              <Button variant="tonal" icon={<FolderOpen className="size-4" />}>Escolher pasta</Button>
            </div>
          </div>
        )}
        <div className="mt-6 space-y-1.5 rounded-field bg-muted p-4 text-[13px] text-muted-foreground">
          <p className="flex gap-2"><Info className="mt-0.5 size-4 shrink-0 text-primary" />Esses campos vêm da montagem geral quando já existem. A gravação em todas as montagens e soldagens chega na etapa 3.</p>
          <p className="pl-6">Nesta versão o SolidAuto só lê: nada é gravado nos arquivos.</p>
        </div>
      </Card>
    </>
  );
}
