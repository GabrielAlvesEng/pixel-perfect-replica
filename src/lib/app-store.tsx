import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import { initialProjects, initialUsers, type Project, type User } from "@/data/mock";
import { springs } from "@/lib/theme";

type ToastKind = "success" | "error" | "info";
interface Toast { id: number; text: string; kind: ToastKind }
interface Store {
  user: User; projects: Project[]; setProjects: (p: Project[]) => void;
  activeId: string | null; setActiveId: (id: string | null) => void; active: Project | null;
  users: User[]; setUsers: (u: User[]) => void; toast: (text: string, kind?: ToastKind) => void;
}
const Ctx = createContext<Store | null>(null);
export const useApp = () => { const c = useContext(Ctx); if (!c) throw new Error("no store"); return c; };

export function AppProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState(initialProjects);
  const [users, setUsers] = useState(initialUsers);
  const [activeId, setActiveId] = useState<string | null>("p1");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback((text: string, kind: ToastKind = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);
  const active = projects.find((p) => p.id === activeId) ?? null;
  const Icon = { success: CheckCircle2, error: AlertCircle, info: Info };
  return (
    <Ctx.Provider value={{ user: users[0] ?? initialUsers[0]!, projects, setProjects, activeId, setActiveId, active, users, setUsers, toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
        <AnimatePresence>
          {toasts.map((t) => { const I = Icon[t.kind]; return (
            <motion.div key={t.id} layout initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1, transition: springs.bouncy }} exit={{ opacity: 0, transition: { duration: 0.2 } }}
              className="pointer-events-auto flex min-w-72 items-center gap-3 rounded-field bg-steel px-4 py-3 text-sm text-white shadow-card-hover">
              <I className={t.kind === "error" ? "size-4 text-error-bg" : "size-4 text-lilac"} />{t.text}
            </motion.div>); })}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}
