import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ScanLine } from "lucide-react";
import { Button, Card, Chip, Counter, PageHeader, ProcessButton, Segmented, Skeleton, StatusBadge, TextField, logos } from "@/components/md3";
import { colors } from "@/lib/theme";
import { useApp } from "@/lib/app-store";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/estilo")({ head: pageHead("Guia de estilo", "Paleta, tipografia e componentes do SolidAuto."), component: Style });

function Style() {
  const { toast } = useApp();
  const [seg, setSeg] = useState<"CM" | "REF" | "Projeto">("CM");
  const [n, setN] = useState(128);
  const [err, setErr] = useState(0);
  return (
    <div className="mx-auto max-w-[1100px] space-y-6 px-10 py-10">
      <PageHeader eyebrow="SISTEMA DE DESIGN" title="Guia de estilo SolidAuto">Tokens de cor, forma, tipografia e molas usados em todas as telas.</PageHeader>
      <Card><h2 className="mb-4 font-bold">Paleta</h2>
        <div className="grid grid-cols-6 gap-3">{Object.entries(colors).map(([k, v]) => (
          <div key={k}><div className="h-14 rounded-field shadow-[inset_0_0_0_1px_var(--border)]" style={{ background: v }} /><p className="mt-1 text-xs font-semibold">{k}</p><p className="font-mono text-[11px] text-muted-foreground">{v}</p></div>))}</div>
      </Card>
      <div className="grid grid-cols-2 gap-6">
        <Card><h2 className="mb-4 font-bold">Tipografia</h2><p className="eyebrow">EYEBROW</p><p className="text-[32px] font-bold">Título de página</p><p className="text-lg font-bold">Título de cartão</p><p className="text-muted-foreground">Texto de apoio secundário</p><p className="text-faint">Texto fraco</p><p className="mt-2 font-mono text-primary">26-060-PGP-00-00-000</p></Card>
        <Card><h2 className="mb-4 font-bold">Logos</h2><div className="flex items-center gap-6"><img src={logos.cor} alt="Fabriaço" className="h-10" /><img src={logos.simbolo} alt="" className="h-10" /></div>
          <div className="mt-4 flex items-center gap-6 rounded-field bg-hero p-4"><img src={logos.negativo} alt="Fabriaço negativo" className="h-8" /></div>
          <div className="mt-3 flex items-center gap-6 rounded-field bg-sidebar p-4"><img src={logos.simboloEscuro} alt="" className="h-8" /></div></Card>
      </div>
      <Card><h2 className="mb-4 font-bold">Botões</h2><div className="flex flex-wrap gap-3">
        <Button>Primário</Button><Button variant="tonal">Tonal</Button><Button variant="outlined">Contorno</Button><Button variant="text">Texto</Button><Button variant="danger">Remover</Button><Button disabled>Desabilitado</Button>
        <ProcessButton icon={<ScanLine className="size-4" />}>Processar</ProcessButton><Button variant="tonal" onClick={() => toast("Snackbar de exemplo")}>Mostrar toast</Button></div></Card>
      <Card><h2 className="mb-4 font-bold">Campos</h2><div className="grid grid-cols-3 gap-4">
        <TextField label="Usuário" /><TextField label="Senha" type="password" defaultValue="segredo" /><TextField label="Com erro" error={err ? `Valor inválido (${err})` : undefined} />
      </div><Button variant="text" className="mt-3" onClick={() => setErr((e) => e + 1)}>Disparar shake de erro</Button></Card>
      <Card><h2 className="mb-4 font-bold">Chips, segmentos, badges e contadores</h2><div className="flex flex-wrap items-center gap-3">
        <Segmented options={["CM", "REF", "Projeto"]} value={seg} onChange={setSeg} />
        <Chip>Montagem</Chip><Chip tone="lilac">Soldagem</Chip><StatusBadge status="ok" /><StatusBadge status="aviso" /><StatusBadge status="erro" />
        <Chip tone="neutral"><Counter key={n} value={n} className="font-mono" /> itens</Chip><Button size="sm" variant="tonal" onClick={() => setN(Math.round(Math.random() * 400))}>Novo valor</Button>
      </div>
      <div className="mt-6 space-y-2"><Skeleton className="h-4 w-80" /><Skeleton className="h-4 w-56" /></div></Card>
    </div>
  );
}
