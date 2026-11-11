export type Status = "ok" | "aviso" | "erro";
export interface Project { id: string; code: string; title1: string; title2: string; order: string; updated: string }
export const initialProjects: Project[] = [
  { id: "p1", code: "26-060-PGP-00-00-000", title1: "Proteção de Gradil Prensas", title2: "INCA", order: "4512", updated: "Atualizado agora" },
  { id: "p2", code: "26-038-SPP-00-00-000", title1: "Suporte de Plataforma Pneumática", title2: "Metalúrgica Vale", order: "4478", updated: "08/11/2026" },
  { id: "p3", code: "26-01-001-00-00-000", title1: "Estrutura de Caldeira Horizontal", title2: "Termoaço", order: "4390", updated: "02/11/2026" },
];

export interface TreeNode { code: string; type: "Montagem" | "Soldagem"; title3: string; qtyParent: number; qtyTotal: number; status: Status; children?: TreeNode[] }
export const tree: TreeNode = {
  code: "26-060-PGP-00-00-000", type: "Montagem", title3: "Montagem geral", qtyParent: 1, qtyTotal: 1, status: "ok",
  children: [
    { code: "26-060-PGP-0A-00-000", type: "Montagem", title3: "Gradil lado A", qtyParent: 1, qtyTotal: 1, status: "ok", children: [
      { code: "26-060-PGP-0A-01-000", type: "Montagem", title3: "Painel fixo", qtyParent: 2, qtyTotal: 2, status: "aviso" },
      { code: "26-060-PGP-0A-02-000", type: "Montagem", title3: "Porta de acesso", qtyParent: 1, qtyTotal: 1, status: "ok", children: [
        { code: "26-060-PGP-0A-02-001", type: "Soldagem", title3: "Quadro da porta", qtyParent: 1, qtyTotal: 1, status: "erro" },
        { code: "26-060-PGP-0A-02-002", type: "Soldagem", title3: "Batente", qtyParent: 2, qtyTotal: 2, status: "ok" },
      ] },
    ] },
    { code: "26-060-PGP-0B-00-000", type: "Montagem", title3: "Gradil lado B", qtyParent: 1, qtyTotal: 1, status: "ok", children: [
      { code: "26-060-PGP-0B-01-001", type: "Soldagem", title3: "Coluna", qtyParent: 4, qtyTotal: 4, status: "ok" },
      { code: "26-060-PGP-0B-01-002", type: "Soldagem", title3: "", qtyParent: 2, qtyTotal: 2, status: "aviso" },
    ] },
  ],
};

export type Kind = "CM" | "REF" | "Projeto";
export interface Commercial { id: string; name: string; file: string; folder: string; qty: number; type: string; kind: Kind }
export const commercials: Commercial[] = [
  { id: "c1", name: "Parafuso sextavado M12", file: "PAR-SEX-M12x40.SLDPRT", folder: "Biblioteca\\Fixadores", qty: 48, type: "Peça", kind: "CM" },
  { id: "c2", name: "Motor WEG 5cv", file: "WEG-W22-5CV.SLDASM", folder: "Biblioteca\\Motores", qty: 1, type: "Montagem", kind: "CM" },
  { id: "c3", name: "Prensa (referência)", file: "PRENSA-REF.SLDASM", folder: "Cliente\\INCA", qty: 2, type: "Montagem", kind: "REF" },
  { id: "c4", name: "Cilindro pneumático", file: "CIL-PN-63x200.SLDASM", folder: "Biblioteca\\Pneumática", qty: 2, type: "Montagem", kind: "CM" },
  { id: "c5", name: "Chapa de fechamento", file: "CHAPA-FECH-3MM.SLDPRT", folder: "Projeto\\26-060", qty: 6, type: "Peça", kind: "Projeto" },
  { id: "c6", name: "Porca sextavada M12", file: "POR-SEX-M12.SLDPRT", folder: "Biblioteca\\Fixadores", qty: 48, type: "Peça", kind: "CM" },
];

export const checks: { severity: Status; code: string; message: string }[] = [
  { severity: "erro", code: "26-060-PGP-0A-02-001", message: "Código de soldagem em uma montagem" },
  { severity: "erro", code: "26-060-PGP-0B-01-003", message: "Arquivo referenciado não encontrado" },
  { severity: "aviso", code: "26-060-PGP-0B-01-002", message: "Propriedade 10-TITULO 3 vazia" },
  { severity: "aviso", code: "26-060-PGP-0A-01-000", message: "Quantidade no pai diferente da última leitura" },
  { severity: "aviso", code: "PAR-SEX-M12x40", message: "Item comercial sem código de compra" },
  { severity: "ok", code: "26-060-PGP-00-00-000", message: "Propriedades da montagem geral completas" },
  { severity: "ok", code: "26-060-PGP-0B-00-000", message: "Estrutura de códigos consistente" },
  { severity: "ok", code: "26-060-PGP-0A-02-000", message: "Quantidades conferidas" },
];

export interface User { id: string; name: string; username: string }
export const initialUsers: User[] = [
  { id: "u1", name: "Guilhermina Katarina", username: "guilhermina" },
  { id: "u2", name: "Rafael Moreira", username: "rafael.m" },
  { id: "u3", name: "Ana Paula Siqueira", username: "anapaula" },
];
export const initials = (n: string) => n.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
