import { createFileRoute, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { FileBox, ListChecks, Scissors } from "lucide-react";
import { PageHeader } from "@/components/md3";

const soon = {
  "4": { title: "Lista de corte", icon: Scissors, text: "Preenchimento automático das listas de corte. Chega numa próxima versão." },
  "5": { title: "DXF das chapas", icon: FileBox, text: "Exportação dos DXFs por material e espessura. Chega numa próxima versão." },
  "6": { title: "Listas de materiais", icon: ListChecks, text: "Listas de compra em Excel por submontagem. Chega numa próxima versão." },
} as const;

export const Route = createFileRoute("/_app/etapa/$etapa")({
  loader: ({ params }) => { if (!(params.etapa in soon)) throw notFound(); return { n: params.etapa as keyof typeof soon }; },
  head: ({ loaderData }) => {
    const s = loaderData ? soon[loaderData.n] : null;
    const t = s ? `${s.title} · SolidAuto` : "Etapa · SolidAuto";
    return { meta: [{ title: t }, { name: "description", content: s?.text ?? "Etapa do SolidAuto." }, { property: "og:title", content: t }, { property: "og:description", content: s?.text ?? "Etapa do SolidAuto." }] };
  },
  component: Soon,
});

function Soon() {
  const { n } = Route.useLoaderData();
  const s = soon[n];
  return (
    <>
      <PageHeader eyebrow={`ETAPA ${n}`} title={s.title} />
      <div className="flex flex-col items-center rounded-xl2 bg-card px-10 py-20 text-center shadow-card">
        <div className="relative grid size-28 place-items-center">
          <motion.span className="absolute inset-0 rounded-full bg-primary-container" animate={{ scale: [1, 1.15, 1], opacity: [1, 0.6, 1] }} transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }} />
          <motion.span className="relative text-primary" animate={{ rotate: [0, -8, 8, 0], y: [0, -4, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}><s.icon className="size-12" /></motion.span>
        </div>
        <span className="mt-6 rounded-full bg-primary-container px-3 py-1 text-xs font-bold tracking-[0.1em] text-primary">EM BREVE</span>
        <h2 className="mt-3 text-2xl font-bold">{s.title}</h2>
        <p className="mt-2 max-w-md text-muted-foreground">{s.text}</p>
      </div>
    </>
  );
}
