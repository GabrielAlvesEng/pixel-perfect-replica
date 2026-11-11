import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

// Portão de acesso: nenhuma tela assinada abre sem sessão.
// ssr: false porque a sessão vive no armazenamento do navegador, que o servidor não enxerga.
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw redirect({ to: "/" });
  },
  component: () => <Outlet />,
});
