import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/md3";
import type { Status } from "@/lib/types";

const base =
  "h-8 w-full rounded-chip bg-transparent px-2 text-sm outline-none transition-shadow focus:bg-card focus:shadow-[inset_0_0_0_2px_var(--primary)]";

/** Célula de texto: salva ao sair do campo. */
export function CellText({
  value,
  onCommit,
  className,
  placeholder,
}: {
  value: string;
  onCommit: (v: string) => void;
  className?: string;
  placeholder?: string;
}) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  return (
    <input
      value={v}
      placeholder={placeholder}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => {
        if (v !== value) onCommit(v);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        if (e.key === "Escape") setV(value);
      }}
      className={cn(base, className)}
    />
  );
}

/** Célula numérica: salva ao sair do campo. */
export function CellNumber({
  value,
  onCommit,
  className,
  step = 1,
}: {
  value: number;
  onCommit: (v: number) => void;
  className?: string;
  step?: number;
}) {
  const [v, setV] = useState(String(value));
  useEffect(() => setV(String(value)), [value]);
  const salvar = () => {
    const n = Number(v.replace(",", "."));
    if (!Number.isFinite(n) || n < 0) {
      setV(String(value));
      return;
    }
    if (n !== value) onCommit(n);
  };
  return (
    <input
      value={v}
      inputMode="decimal"
      step={step}
      onChange={(e) => setV(e.target.value)}
      onBlur={salvar}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        if (e.key === "Escape") setV(String(value));
      }}
      className={cn(base, "text-right font-mono", className)}
    />
  );
}

const ordem: Status[] = ["ok", "aviso", "erro"];

/** Célula de status: um clique leva para o próximo nível. */
export function CellStatus({
  value,
  onCommit,
  delay = 0,
}: {
  value: string;
  onCommit: (v: Status) => void;
  delay?: number;
}) {
  const s = (ordem.includes(value as Status) ? value : "ok") as Status;
  return (
    <button
      type="button"
      title="Clique para mudar o status"
      onClick={() => onCommit(ordem[(ordem.indexOf(s) + 1) % ordem.length]!)}
      className="rounded-chip transition-transform hover:scale-105"
    >
      <StatusBadge status={s} delay={delay} />
    </button>
  );
}
