import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { FileSearch, GitBranch, Home, Layers, Lock, LogOut, Scissors, FileBox, ListChecks, ClipboardCheck, Users } from "lucide-react";
import { useApp } from "@/lib/app-store";
import { logos } from "@/components/md3";
import { initials } from "@/data/mock";
import { fadeThrough, springs } from "@/lib/theme";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app")({ component: AppLayout });

const steps = [
  { n: "1", label: "Leitura da montagem", icon: FileSearch },
  { n: "2", label: "Árvore e quantidades", icon: GitBranch },
  { n: "3", label: "Comerciais e referências", icon: Layers },
  { n: "4", label: "Lista de corte", icon: Scissors },
  { n: "5", label: "DXF das chapas", icon: FileBox },
  { n: "6", label: "Listas de materiais", icon: ListChecks },
  { n: "7", label: "Relatório", icon: ClipboardCheck },
];

function NavItem({ to, active, icon: Icon, children, locked, num }: { to: string; active: boolean; icon: typeof Home; children: React.ReactNode; locked?: boolean | undefined; num?: string | undefined }) {
  return (
    <Link to={to} className={cn("relative flex h-10 items-center gap-3 rounded-full px-3 text-sm font-medium transition-colors",
      active ? "text-white" : locked ? "text-sidebar-muted hover:bg-sidebar-hover" : "text-sidebar-foreground hover:bg-sidebar-hover")}>
      {active && <motion.span layoutId="nav-pill" transition={springs.standard} className="absolute inset-0 rounded-full bg-sidebar-accent/25 shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--lilac)_50%,transparent)]" />}
      <motion.span key={String(active)} animate={active ? { scale: [1, 1.25, 1], y: [0, -2, 0] } : {}} transition={{ duration: 0.4, ease: "easeOut" }} className="relative">
        <Icon className={cn("size-[18px]", active && "text-lilac")} />
      </motion.span>
      <span className="relative flex-1 truncate">{num && <span className="mr-1.5 font-mono text-xs opacity-60">{num}.</span>}{children}</span>
      {locked && <Lock className="relative size-3.5" />}
    </Link>
  );
}

function AppLayout() {
  const { active, user } = useApp();
  const { pathname } = useLocation();
  const nav = useNavigate();
  return (
    <div className="flex h-screen min-h-[660px]">
      <aside className="flex w-[260px] shrink-0 flex-col bg-sidebar px-4 py-5 text-sidebar-foreground">
        <div className="flex items-center gap-3 px-2">
          <img src={logos.simboloEscuro} alt="" className="size-8" />
          <div>
            <p className="text-[17px] font-bold text-white">SolidAuto</p>
            <span className="rounded-chip bg-sidebar-hover px-1.5 py-0.5 text-[10px] font-semibold text-sidebar-muted">SolidWorks 2025</span>
          </div>
        </div>
        <nav className="mt-7 flex-1 space-y-0.5 overflow-y-auto">
          <NavItem to="/home" icon={Home} active={pathname === "/home"}>Home</NavItem>
          <p className="px-3 pb-2 pt-6 text-[10px] font-bold tracking-[0.14em] text-sidebar-muted">PROJETO ATIVO</p>
          {active ? (
            <>
              <div className="mb-2 rounded-field bg-sidebar-hover px-3 py-2.5">
                <p className="truncate font-mono text-xs text-lilac">{active.code}</p>
                <p className="mt-0.5 truncate text-[13px] text-white">{active.title1}</p>
              </div>
              {steps.map((s) => <NavItem key={s.n} to={`/etapa/${s.n}`} num={s.n} icon={s.icon} active={pathname === `/etapa/${s.n}`}>{s.label}</NavItem>)}
            </>
          ) : <p className="px-3 text-[13px] leading-relaxed text-sidebar-muted">Nenhum projeto aberto. Escolha um na Home.</p>}
          <p className="px-3 pb-2 pt-6 text-[10px] font-bold tracking-[0.14em] text-sidebar-muted">SISTEMA</p>
          <NavItem to="/usuarios" icon={Users} active={pathname === "/usuarios"}>Usuários</NavItem>
        </nav>
        <div className="mt-4 flex items-center gap-3 border-t border-sidebar-border px-2 pt-4">
          <span className="grid size-9 place-items-center rounded-full bg-lilac text-xs font-bold text-white">{initials(user.name)}</span>
          <div className="min-w-0 flex-1"><p className="truncate text-[13px] text-white">{user.name}</p><p className="truncate text-xs text-sidebar-muted">{user.username}</p></div>
          <button onClick={() => nav({ to: "/" })} aria-label="Sair" title="Sair" className="grid size-9 place-items-center rounded-full hover:bg-sidebar-hover"><LogOut className="size-4" /></button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-background">
        <AnimatePresence mode="wait">
          <motion.div key={pathname} {...fadeThrough} className="mx-auto max-w-[1100px] px-10 py-9"><Outlet /></motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
