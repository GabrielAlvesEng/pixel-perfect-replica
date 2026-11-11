import { queryOptions } from "@tanstack/react-query";
import {
  dadosDoProjeto,
  listarProjetos,
  listarUsuarios,
  meuPerfil,
} from "@/lib/solidauto.functions";

export const meuPerfilQueryOptions = queryOptions({
  queryKey: ["perfil"],
  queryFn: () => meuPerfil(),
});

export const projetosQueryOptions = queryOptions({
  queryKey: ["projetos"],
  queryFn: () => listarProjetos(),
});

export const projetoQueryOptions = (projectId: string) =>
  queryOptions({
    queryKey: ["projeto", projectId],
    queryFn: () => dadosDoProjeto({ data: { projectId } }),
    enabled: Boolean(projectId),
  });

export const usuariosQueryOptions = queryOptions({
  queryKey: ["usuarios"],
  queryFn: () => listarUsuarios(),
});
