import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AlertCircle, FolderOpen } from "lucide-react";
import { Card, Skeleton } from "@/components/md3";
import { useApp } from "@/lib/app-store";
import { projetoQueryOptions } from "@/lib/solidauto.queries";

/** Dados do projeto aberto. Vazio quando ninguém escolheu um projeto ainda. */
export function useProjetoAberto() {
  const { activeId } = useApp();
  const q = useQuery(projetoQueryOptions(activeId ?? ""));
  return { activeId, ...q };
}

export function SemProjetoAberto() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center rounded-card bg-card px-8 py-16 text-center shadow-card">
      <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="grid size-20 place-items-center rounded-full bg-primary-container text-primary">
        <FolderOpen className="size-9" />
      </motion.div>
      <h3 className="mt-5 text-lg font-bold">Nenhum projeto aberto</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        Volte na Home e abra um projeto para trabalhar nas etapas dele.
      </p>
    </motion.div>
  );
}

export function CarregandoProjeto() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-4 w-full max-w-xl" />
      <Card className="space-y-3">
        <Skeleton className="h-14 w-full rounded-field" />
        <Skeleton className="h-14 w-full rounded-field" />
        <Skeleton className="h-14 w-full rounded-field" />
      </Card>
    </div>
  );
}

export function ErroProjeto({ mensagem }: { mensagem: string }) {
  return (
    <Card className="flex items-start gap-3 border border-error/30">
      <AlertCircle className="mt-0.5 size-5 shrink-0 text-error" />
      <div>
        <h3 className="font-bold">Não foi possível carregar o projeto</h3>
        <p className="mt-1 text-sm text-muted-foreground">{mensagem}</p>
      </div>
    </Card>
  );
}

export const quando = (iso: string) => {
  const d = new Date(iso);
  const min = (Date.now() - d.getTime()) / 60000;
  if (min < 1) return "Atualizado agora";
  if (min < 60) return `Atualizado há ${Math.round(min)} min`;
  return d.toLocaleDateString("pt-BR");
};
