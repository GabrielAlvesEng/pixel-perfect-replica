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

export interface CutItem { pos: string; profile: string; material: string; length: number; qty: number; kgm: number; status: Status }
export const cutLists: { weld: string; title: string; items: CutItem[] }[] = [
  { weld: "26-060-PGP-0A-02-001", title: "Quadro da porta", items: [
    { pos: "01", profile: "Tubo quadrado 50×50×2,65", material: "SAE 1020", length: 2100, qty: 2, kgm: 3.93, status: "ok" },
    { pos: "02", profile: "Tubo quadrado 50×50×2,65", material: "SAE 1020", length: 1060, qty: 2, kgm: 3.93, status: "ok" },
    { pos: "03", profile: "Barra chata 1¼″×¼″", material: "ASTM A36", length: 980, qty: 3, kgm: 1.58, status: "aviso" },
  ] },
  { weld: "26-060-PGP-0A-02-002", title: "Batente", items: [
    { pos: "01", profile: "Cantoneira 2″×3/16″", material: "ASTM A36", length: 2150, qty: 1, kgm: 3.63, status: "ok" },
  ] },
  { weld: "26-060-PGP-0B-01-001", title: "Coluna", items: [
    { pos: "01", profile: "Perfil W 150×13", material: "ASTM A572 Gr50", length: 2400, qty: 1, kgm: 13.0, status: "ok" },
    { pos: "02", profile: "Chapa base 200×200", material: "ASTM A36", length: 200, qty: 1, kgm: 15.7, status: "ok" },
  ] },
];

export interface Sheet { code: string; name: string; w: number; h: number; qty: number; holes: number; shape: "rect" | "l" | "flange" | "gusset" }
export const sheetGroups: { material: string; thickness: string; sheets: Sheet[] }[] = [
  { material: "ASTM A36", thickness: "3,00 mm", sheets: [
    { code: "26-060-PGP-0A-01-003", name: "Chapa de fechamento", w: 980, h: 620, qty: 6, holes: 4, shape: "rect" },
    { code: "26-060-PGP-0A-02-004", name: "Reforço da porta", w: 420, h: 180, qty: 2, holes: 2, shape: "l" },
  ] },
  { material: "ASTM A36", thickness: "6,35 mm", sheets: [
    { code: "26-060-PGP-0B-01-005", name: "Chapa base da coluna", w: 200, h: 200, qty: 4, holes: 4, shape: "flange" },
    { code: "26-060-PGP-0B-01-006", name: "Mão-francesa", w: 150, h: 150, qty: 8, holes: 0, shape: "gusset" },
  ] },
  { material: "Inox AISI 304", thickness: "2,00 mm", sheets: [
    { code: "26-060-PGP-0A-01-007", name: "Placa de identificação", w: 160, h: 90, qty: 2, holes: 4, shape: "rect" },
  ] },
];

export interface Material { item: string; description: string; spec: string; unit: string; qty: number }
export const materialLists: { assembly: string; title: string; items: Material[] }[] = [
  { assembly: "26-060-PGP-0A-00-000", title: "Gradil lado A", items: [
    { item: "PAR-SEX-M12x40", description: "Parafuso sextavado M12 × 40", spec: "Classe 8.8 zincado", unit: "pç", qty: 24 },
    { item: "POR-SEX-M12", description: "Porca sextavada M12", spec: "Classe 8 zincada", unit: "pç", qty: 24 },
    { item: "DOB-INOX-3", description: "Dobradiça industrial 3″", spec: "Inox 304", unit: "pç", qty: 3 },
    { item: "FEC-MAG-01", description: "Fecho de segurança com sensor", spec: "Schmersal AZM", unit: "pç", qty: 1 },
  ] },
  { assembly: "26-060-PGP-0B-00-000", title: "Gradil lado B", items: [
    { item: "PAR-SEX-M12x40", description: "Parafuso sextavado M12 × 40", spec: "Classe 8.8 zincado", unit: "pç", qty: 24 },
    { item: "POR-SEX-M12", description: "Porca sextavada M12", spec: "Classe 8 zincada", unit: "pç", qty: 24 },
    { item: "CHB-M16", description: "Chumbador químico M16", spec: "Hilti HAS-U", unit: "pç", qty: 16 },
  ] },
  { assembly: "26-060-PGP-00-00-000", title: "Montagem geral", items: [
    { item: "WEG-W22-5CV", description: "Motor WEG W22 5 cv", spec: "4 polos, 220/380 V", unit: "pç", qty: 1 },
    { item: "CIL-PN-63x200", description: "Cilindro pneumático Ø63 × 200", spec: "ISO 15552", unit: "pç", qty: 2 },
  ] },
];
