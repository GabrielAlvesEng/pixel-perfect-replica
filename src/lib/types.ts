// Tipos e utilidades usados no navegador. Nada aqui pode importar código de servidor.
export type Status = "ok" | "aviso" | "erro";
export type Kind = "CM" | "REF" | "Projeto";
export type Shape = "rect" | "l" | "flange" | "gusset";

export const initials = (n: string) =>
  n
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
