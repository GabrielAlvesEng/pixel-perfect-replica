import { useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type MouseEvent } from "react";
import { AnimatePresence, animate, motion, useAnimationControls } from "framer-motion";
import { Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { springs } from "@/lib/theme";
import type { Status } from "@/data/mock";
import logoCor from "@/assets/fabriaco-logo-cor.svg.asset.json";
import logoNeg from "@/assets/fabriaco-logo-negativo.svg.asset.json";
import simbolo from "@/assets/fabriaco-simbolo.svg.asset.json";
import simboloDark from "@/assets/fabriaco-simbolo-fundo-escuro.svg.asset.json";

export const logos = { cor: logoCor.url, negativo: logoNeg.url, simbolo: simbolo.url, simboloEscuro: simboloDark.url };

/* ---------- Button ---------- */
type Variant = "filled" | "tonal" | "outlined" | "text" | "white" | "danger";
const variantCls: Record<Variant, string> = {
  filled: "bg-primary text-primary-foreground hover:bg-primary-hover",
  tonal: "bg-primary-container text-on-primary-container",
  outlined: "border border-border bg-card text-primary",
  text: "text-primary",
  white: "bg-white text-primary",
  danger: "bg-error text-white",
};
export interface BtnProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd" | "style"> {
  variant?: Variant; icon?: ReactNode | undefined; size?: "sm" | "md"; state?: "idle" | "loading" | "done";
}
export function Button({ variant = "filled", icon, size = "md", state = "idle", className, children, onClick, disabled, ...rest }: BtnProps) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const handle = (e: MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples((p) => [...p, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
    setTimeout(() => setRipples((p) => p.filter((x) => x.id !== id)), 600);
    onClick?.(e);
  };
  return (
    <motion.button
      whileHover={disabled ? {} : { y: -1 }} whileTap={disabled ? {} : { scale: 0.96 }} transition={springs.bouncy}
      onClick={handle} disabled={disabled || state !== "idle"}
      className={cn("group relative inline-flex select-none items-center justify-center gap-2 overflow-hidden rounded-full font-semibold transition-colors disabled:opacity-50",
        size === "md" ? "h-11 px-6 text-sm" : "h-9 px-4 text-[13px]", variantCls[variant], state !== "idle" && "disabled:opacity-100", className)}
      {...rest}>
      <span className="pointer-events-none absolute inset-0 bg-current opacity-0 transition-opacity group-hover:opacity-[0.08]" />
      {ripples.map((r) => (
        <motion.span key={r.id} className="pointer-events-none absolute rounded-full bg-current" style={{ left: r.x, top: r.y, width: 20, height: 20, marginLeft: -10, marginTop: -10 }}
          initial={{ scale: 0, opacity: 0.25 }} animate={{ scale: 18, opacity: 0 }} transition={{ duration: 0.55 }} />
      ))}
      <AnimatePresence mode="popLayout" initial={false}>
        {state === "loading" ? (
          <motion.span key="l" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}><Loader2 className="size-5 animate-spin" /></motion.span>
        ) : state === "done" ? (
          <motion.span key="d" initial={{ scale: 0 }} animate={{ scale: 1, transition: springs.bouncy }} exit={{ opacity: 0 }}><Check className="size-5" strokeWidth={3} /></motion.span>
        ) : (
          <motion.span key="i" className="relative inline-flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{icon}{children}</motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/** Button that simulates processing: spinner → bouncing check → back to idle. */
export function ProcessButton({ onDone, duration = 1400, ...props }: BtnProps & { onDone?: () => void; duration?: number }) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  return <Button {...props} state={state} onClick={() => { setState("loading"); setTimeout(() => { setState("done"); onDone?.(); setTimeout(() => setState("idle"), 900); }, duration); }} />;
}

/* ---------- TextField ---------- */
interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> { label: string; error?: string | undefined; trailing?: ReactNode; mono?: boolean }
export function TextField({ label, error, trailing, type = "text", mono, className, value, defaultValue, onChange, ...rest }: FieldProps) {
  const id = useId();
  const [focus, setFocus] = useState(false);
  const [inner, setInner] = useState(String(defaultValue ?? ""));
  const [show, setShow] = useState(false);
  const v = value !== undefined ? String(value) : inner;
  const controls = useAnimationControls();
  useEffect(() => { if (error) controls.start({ x: [0, -8, 7, -5, 3, 0], transition: { duration: 0.42 } }); }, [error, controls]);
  const floated = focus || v.length > 0;
  const isPwd = type === "password";
  return (
    <div className={className}>
      <motion.div animate={controls} className={cn("relative h-14 rounded-field bg-card transition-[box-shadow] duration-150",
        error ? "shadow-[inset_0_0_0_2px_var(--error)]" : focus ? "shadow-[inset_0_0_0_2px_var(--primary)]" : "shadow-[inset_0_0_0_1px_var(--border)]")}>
        <motion.label htmlFor={id} className={cn("pointer-events-none absolute left-4 origin-left bg-card px-1", error ? "text-error" : focus ? "text-primary" : "text-muted-foreground")}
          animate={floated ? { y: -28, scale: 0.78 } : { y: 0, scale: 1 }} initial={false} transition={springs.standard} style={{ top: 17 }}>{label}</motion.label>
        <input id={id} type={isPwd && show ? "text" : type} value={v}
          onChange={(e) => { setInner(e.target.value); onChange?.(e); }} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          className={cn("h-full w-full rounded-field bg-transparent px-5 pt-1 text-[15px] text-foreground outline-none", mono && "font-mono text-sm", (isPwd || trailing) && "pr-12")} {...rest} />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isPwd ? (
            <button type="button" aria-label={show ? "Ocultar senha" : "Mostrar senha"} onClick={() => setShow((s) => !s)} className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-muted">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={String(show)} initial={{ rotate: -90, scale: 0.4, opacity: 0 }} animate={{ rotate: 0, scale: 1, opacity: 1 }} exit={{ rotate: 90, scale: 0.4, opacity: 0 }} transition={springs.bouncy}>
                  {show ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
                </motion.span>
              </AnimatePresence>
            </button>
          ) : trailing ? <motion.span key={v.length > 0 ? "a" : "b"} initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={springs.bouncy} className="block text-muted-foreground">{trailing}</motion.span> : null}
        </div>
      </motion.div>
      <AnimatePresence>{error && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-1.5 px-4 text-xs text-error">{error}</motion.p>}</AnimatePresence>
    </div>
  );
}

/* ---------- Segmented ---------- */
export function Segmented<T extends string>({ options, value, onChange, size = "md", labels }: { options: T[]; value: T; onChange: (v: T) => void; size?: "sm" | "md"; labels?: Partial<Record<T, string>> | undefined }) {
  const id = useId();
  return (
    <div role="radiogroup" className={cn("inline-flex rounded-full bg-muted p-1 shadow-[inset_0_0_0_1px_var(--border)]", size === "sm" && "p-0.5")}>
      {options.map((o) => (
        <button key={o} role="radio" aria-checked={value === o} title={labels?.[o]} onClick={() => onChange(o)}
          className={cn("relative rounded-full font-semibold transition-colors", size === "md" ? "h-9 px-5 text-sm" : "h-7 px-3 text-xs", value === o ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
          {value === o && <motion.span layoutId={`seg-${id}`} transition={springs.standard} className="absolute inset-0 rounded-full bg-primary" />}
          <span className="relative">{o}</span>
        </button>
      ))}
    </div>
  );
}

/* ---------- Badges, chips, counters ---------- */
const statusCls: Record<Status, string> = { ok: "bg-success-bg text-success", aviso: "bg-warning-bg text-warning", erro: "bg-error-bg text-error" };
const statusLabel: Record<Status, string> = { ok: "OK", aviso: "Aviso", erro: "Erro" };
export function StatusBadge({ status, delay = 0 }: { status: Status; delay?: number }) {
  return <motion.span initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...springs.bouncy, delay }}
    className={cn("inline-flex h-6 items-center gap-1.5 rounded-chip px-2.5 text-xs font-bold", statusCls[status])}><span className="size-1.5 rounded-full bg-current" />{statusLabel[status]}</motion.span>;
}
export function Chip({ children, tone = "primary", className }: { children: ReactNode; tone?: "primary" | "lilac" | "neutral" | Status; className?: string }) {
  const t = { primary: "bg-primary-container text-primary", lilac: "bg-lilac/15 text-[color-mix(in_oklab,var(--lilac)_70%,var(--steel))]", neutral: "bg-muted text-muted-foreground shadow-[inset_0_0_0_1px_var(--border)]", ...statusCls }[tone];
  return <span className={cn("inline-flex h-7 items-center gap-1.5 rounded-chip px-2.5 text-xs font-semibold", t, className)}>{children}</span>;
}
export function Counter({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => { const c = animate(0, value, { duration: 0.9, ease: [0.2, 0.8, 0.2, 1], onUpdate: (v) => { if (ref.current) ref.current.textContent = String(Math.round(v)); } }); return () => c.stop(); }, [value]);
  return <span ref={ref} className={cn("tabular-nums", className)}>0</span>;
}

/* ---------- Layout bits ---------- */
export function Card({ children, className, ...rest }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-card bg-card p-6 shadow-card", className)} {...rest}>{children}</div>;
}
export function PageHeader({ eyebrow, title, children, actions }: { eyebrow: string; title: string; children?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-7 flex items-end justify-between gap-6">
      <div className="max-w-2xl">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-2 text-[32px] font-bold leading-tight tracking-tight">{title}</h1>
        {children && <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{children}</p>}
      </div>
      {actions}
    </div>
  );
}
export function Skeleton({ className }: { className?: string }) { return <div className={cn("shimmer rounded-chip", className)} />; }

export function Dialog({ open, onClose, title, children, actions }: { open: boolean; onClose: () => void; title: string; children: ReactNode; actions: ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-40 grid place-items-center bg-steel/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div role="dialog" aria-modal className="w-[400px] rounded-xl2 bg-card p-6 shadow-card-hover" onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, y: 16, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1, transition: springs.standard }} exit={{ scale: 0.96, opacity: 0, transition: { duration: 0.12 } }}>
            <h2 className="text-xl font-bold">{title}</h2>
            <div className="mt-2 text-sm text-muted-foreground">{children}</div>
            <div className="mt-6 flex justify-end gap-2">{actions}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
