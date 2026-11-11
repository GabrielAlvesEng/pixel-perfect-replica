import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/* ================= Tipos compartilhados ================= */
export type Status = "ok" | "aviso" | "erro";
export type Kind = "CM" | "REF" | "Projeto";
export type Shape = "rect" | "l" | "flange" | "gusset";

export interface ProjectRow {
  id: string;
  code: string;
  title1: string;
  title2: string;
  order_no: string;
  status: string;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}
export interface NodeRow {
  id: string;
  project_id: string;
  parent_id: string | null;
  code: string;
  node_type: string;
  title3: string;
  qty_parent: number;
  qty_total: number;
  status: string;
  position: number;
}
export interface ItemRow {
  id: string;
  project_id: string;
  name: string;
  file: string;
  folder: string;
  qty: number;
  item_type: string;
  kind: string;
  position: number;
}
export interface CheckRow {
  id: string;
  project_id: string;
  severity: string;
  code: string;
  message: string;
}
export interface CutRow {
  id: string;
  project_id: string;
  weld_code: string;
  weld_title: string;
  pos: string;
  profile: string;
  material: string;
  length_mm: number;
  qty: number;
  kgm: number;
  status: string;
  position: number;
}
export interface SheetRow {
  id: string;
  project_id: string;
  material: string;
  thickness: string;
  code: string;
  name: string;
  w_mm: number;
  h_mm: number;
  qty: number;
  holes: number;
  shape: string;
  position: number;
}
export interface MaterialRow {
  id: string;
  project_id: string;
  assembly: string;
  title: string;
  item: string;
  description: string;
  spec: string;
  unit: string;
  qty: number;
  position: number;
}
export interface ProfileRow {
  id: string;
  username: string;
  name: string;
  created_at: string;
}

export interface ProjectData {
  project: ProjectRow;
  nodes: NodeRow[];
  items: ItemRow[];
  checks: CheckRow[];
  cuts: CutRow[];
  sheets: SheetRow[];
  materials: MaterialRow[];
}

/* ================= Tabelas editáveis ================= */
const TABELAS = {
  projects: ["code", "title1", "title2", "order_no", "status", "read_at"],
  project_nodes: ["code", "node_type", "title3", "qty_parent", "qty_total", "status", "position", "parent_id"],
  project_items: ["name", "file", "folder", "qty", "item_type", "kind", "position"],
  project_checks: ["severity", "code", "message"],
  cut_items: ["weld_code", "weld_title", "pos", "profile", "material", "length_mm", "qty", "kgm", "status", "position"],
  sheets: ["material", "thickness", "code", "name", "w_mm", "h_mm", "qty", "holes", "shape", "position"],
  material_items: ["assembly", "title", "item", "description", "spec", "unit", "qty", "position"],
} as const;

type TabelaEditavel = keyof typeof TABELAS;

type Valor = string | number | boolean | null;
type Linha = Record<string, Valor>;

function tabelaValida(nome: string): TabelaEditavel {
  if (!(nome in TABELAS)) throw new Error("Tabela não permitida.");
  return nome as TabelaEditavel;
}

function valoresPermitidos(tabela: string, valores: Record<string, unknown>): Linha {
  const cols = (TABELAS as Record<string, readonly string[]>)[tabela];
  if (!cols) throw new Error("Tabela não permitida.");
  const limpos: Linha = {};
  for (const [chave, valor] of Object.entries(valores)) {
    if (
      cols.includes(chave) &&
      (valor === null ||
        typeof valor === "string" ||
        typeof valor === "number" ||
        typeof valor === "boolean")
    ) {
      limpos[chave] = valor;
    }
  }
  if (Object.keys(limpos).length === 0) throw new Error("Nenhum campo válido para salvar.");
  return limpos;
}

/* ================= Leituras ================= */
export const listarProjetos = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("projects")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as ProjectRow[];
  });

export const dadosDoProjeto = createServerFn({ method: "POST" })
  .inputValidator((d: { projectId: string }) => d)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const [p, n, i, c, cu, s, m] = await Promise.all([
      supabase.from("projects").select("*").eq("id", data.projectId).maybeSingle(),
      supabase.from("project_nodes").select("*").eq("project_id", data.projectId).order("position"),
      supabase.from("project_items").select("*").eq("project_id", data.projectId).order("position"),
      supabase.from("project_checks").select("*").eq("project_id", data.projectId).order("severity"),
      supabase.from("cut_items").select("*").eq("project_id", data.projectId).order("position"),
      supabase.from("sheets").select("*").eq("project_id", data.projectId).order("position"),
      supabase.from("material_items").select("*").eq("project_id", data.projectId).order("position"),
    ]);
    for (const r of [p, n, i, c, cu, s, m]) if (r.error) throw new Error(r.error.message);
    if (!p.data) throw new Error("Projeto não encontrado.");
    return {
      project: p.data as ProjectRow,
      nodes: (n.data ?? []) as NodeRow[],
      items: (i.data ?? []) as ItemRow[],
      checks: (c.data ?? []) as CheckRow[],
      cuts: (cu.data ?? []) as CutRow[],
      sheets: (s.data ?? []) as SheetRow[],
      materials: (m.data ?? []) as MaterialRow[],
    } satisfies ProjectData;
  });

export const listarUsuarios = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("*")
      .order("created_at");
    if (error) throw new Error(error.message);
    return (data ?? []) as ProfileRow[];
  });

export const meuPerfil = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("*")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data ?? null) as ProfileRow | null;
  });

/* ================= Escrita ================= */
export const atualizarLinha = createServerFn({ method: "POST" })
  .inputValidator((d: { tabela: string; id: string; valores: Record<string, unknown> }) => d)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const valores = valoresPermitidos(data.tabela, data.valores);
    const { error } = await context.supabase
      .from(tabelaValida(data.tabela))
      .update(valores as never)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const inserirLinha = createServerFn({ method: "POST" })
  .inputValidator((d: { tabela: string; valores: Record<string, unknown> }) => d)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const valores = valoresPermitidos(data.tabela, data.valores);
    const { data: nova, error } = await context.supabase
      .from(tabelaValida(data.tabela))
      .insert(valores as never)
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!nova) throw new Error("Não foi possível incluir a linha.");
    return nova as unknown as Linha;
  });

export const removerLinha = createServerFn({ method: "POST" })
  .inputValidator((d: { tabela: string; id: string }) => d)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from(tabelaValida(data.tabela))
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removerProjeto = createServerFn({ method: "POST" })
  .inputValidator((d: { projectId: string }) => d)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("projects").delete().eq("id", data.projectId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const atualizarPerfil = createServerFn({ method: "POST" })
  .inputValidator((d: { name: string; username: string }) => d)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const name = data.name.trim();
    const username = data.username.trim().toLowerCase().replace(/\s+/g, ".");
    if (!name || !username) throw new Error("Nome e usuário são obrigatórios.");
    const { error } = await context.supabase
      .from("profiles")
      .update({ name, username })
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ================= Leitura da montagem aberta no SolidWorks =================
   O complemento instalado no SolidWorks envia a montagem ativa. Enquanto ele
   não está instalado, a leitura é montada aqui com o mesmo formato de payload,
   para a tela e o banco já funcionarem como vão funcionar depois. */
interface ModeloLeitura {
  sigla: string;
  titulo1: string;
  titulo2: string;
  pedido: string;
  nos: { k: string; p?: string; code: string; type: "Montagem" | "Soldagem"; title3: string; qp: number; qt: number; status: Status }[];
  itens: { name: string; file: string; folder: string; qty: number; item_type: string; kind: Kind }[];
  checagens: { severity: Status; code: string; message: string }[];
  cortes: { weld: string; title: string; pos: string; profile: string; material: string; length: number; qty: number; kgm: number; status: Status }[];
  chapas: { material: string; thickness: string; code: string; name: string; w: number; h: number; qty: number; holes: number; shape: Shape }[];
  materiais: { assembly: string; title: string; item: string; description: string; spec: string; unit: string; qty: number }[];
}

const MODELOS: ModeloLeitura[] = [
  {
    sigla: "ESC",
    titulo1: "Escada Marinheiro com Guarda-Corpo",
    titulo2: "Usiminas",
    pedido: "4533",
    nos: [
      { k: "r", code: "{{B}}-00-00-000", type: "Montagem", title3: "Montagem geral", qp: 1, qt: 1, status: "ok" },
      { k: "a", p: "r", code: "{{B}}-0A-00-000", type: "Montagem", title3: "Lance de degraus", qp: 1, qt: 1, status: "ok" },
      { k: "a1", p: "a", code: "{{B}}-0A-01-001", type: "Soldagem", title3: "Degrau", qp: 12, qt: 12, status: "ok" },
      { k: "a2", p: "a", code: "{{B}}-0A-01-002", type: "Soldagem", title3: "Longarina", qp: 2, qt: 2, status: "aviso" },
      { k: "b", p: "r", code: "{{B}}-0B-00-000", type: "Montagem", title3: "Guarda-corpo", qp: 1, qt: 1, status: "ok" },
      { k: "b1", p: "b", code: "{{B}}-0B-01-001", type: "Soldagem", title3: "Travessa", qp: 4, qt: 4, status: "ok" },
      { k: "b2", p: "b", code: "{{B}}-0B-01-002", type: "Soldagem", title3: "Montante", qp: 6, qt: 6, status: "erro" },
    ],
    itens: [
      { name: "Parafuso sextavado M10", file: "PAR-SEX-M10x30.SLDPRT", folder: "Biblioteca\\Fixadores", qty: 36, item_type: "Peça", kind: "CM" },
      { name: "Grampo de guarda-corpo", file: "GRP-GC-48.SLDPRT", folder: "Biblioteca\\Fixadores", qty: 12, item_type: "Peça", kind: "CM" },
      { name: "Plataforma (referência)", file: "PLAT-REF.SLDASM", folder: "Cliente\\USI", qty: 1, item_type: "Montagem", kind: "REF" },
      { name: "Chapa xadrez 4mm", file: "CHAPA-XAD-4.SLDPRT", folder: "Projeto\\26-072", qty: 12, item_type: "Peça", kind: "Projeto" },
    ],
    checagens: [
      { severity: "erro", code: "{{B}}-0B-01-002", message: "Código de soldagem em uma montagem" },
      { severity: "aviso", code: "{{B}}-0A-01-002", message: "Propriedade 10-TITULO 3 repetida" },
      { severity: "aviso", code: "GRP-GC-48", message: "Item comercial sem código de compra" },
      { severity: "ok", code: "{{B}}-00-00-000", message: "Propriedades da montagem geral completas" },
    ],
    cortes: [
      { weld: "{{B}}-0A-01-001", title: "Degrau", pos: "01", profile: "Cantoneira 2″×3/16″", material: "ASTM A36", length: 620, qty: 12, kgm: 3.63, status: "ok" },
      { weld: "{{B}}-0A-01-001", title: "Degrau", pos: "02", profile: "Barra chata 1½″×⅛″", material: "ASTM A36", length: 560, qty: 12, kgm: 1.19, status: "ok" },
      { weld: "{{B}}-0A-01-002", title: "Longarina", pos: "01", profile: "Perfil U 152×19", material: "ASTM A36", length: 4200, qty: 2, kgm: 19.1, status: "aviso" },
      { weld: "{{B}}-0B-01-001", title: "Travessa", pos: "01", profile: "Tubo quadrado 40×40×2,00", material: "SAE 1020", length: 1100, qty: 4, kgm: 2.43, status: "ok" },
      { weld: "{{B}}-0B-01-002", title: "Montante", pos: "01", profile: "Tubo quadrado 40×40×2,00", material: "SAE 1020", length: 1000, qty: 6, kgm: 2.43, status: "erro" },
    ],
    chapas: [
      { material: "ASTM A36", thickness: "4,00 mm", code: "{{B}}-0A-01-003", name: "Piso do degrau", w: 560, h: 250, qty: 12, holes: 4, shape: "rect" },
      { material: "ASTM A36", thickness: "6,35 mm", code: "{{B}}-0A-01-004", name: "Chapa de emenda", w: 240, h: 160, qty: 4, holes: 2, shape: "l" },
      { material: "Inox AISI 304", thickness: "2,00 mm", code: "{{B}}-0B-01-003", name: "Placa de identificação", w: 180, h: 90, qty: 2, holes: 4, shape: "rect" },
    ],
    materiais: [
      { assembly: "{{B}}-0A-00-000", title: "Lance de degraus", item: "PAR-SEX-M10x30", description: "Parafuso sextavado M10 × 30", spec: "Classe 8.8 zincado", unit: "pç", qty: 24 },
      { assembly: "{{B}}-0A-00-000", title: "Lance de degraus", item: "POR-SEX-M10", description: "Porca sextavada M10", spec: "Classe 8 zincada", unit: "pç", qty: 24 },
      { assembly: "{{B}}-0B-00-000", title: "Guarda-corpo", item: "GRP-GC-48", description: "Grampo para tubo Ø48", spec: "Alumínio injetado", unit: "pç", qty: 12 },
      { assembly: "{{B}}-00-00-000", title: "Montagem geral", item: "CHB-M16", description: "Chumbador químico M16", spec: "Hilti HAS-U", unit: "pç", qty: 8 },
    ],
  },
  {
    sigla: "PLM",
    titulo1: "Plataforma de Manutenção com Piso",
    titulo2: "Gerdau",
    pedido: "4541",
    nos: [
      { k: "r", code: "{{B}}-00-00-000", type: "Montagem", title3: "Montagem geral", qp: 1, qt: 1, status: "ok" },
      { k: "a", p: "r", code: "{{B}}-0A-00-000", type: "Montagem", title3: "Estrutura do piso", qp: 1, qt: 1, status: "ok" },
      { k: "a1", p: "a", code: "{{B}}-0A-01-001", type: "Soldagem", title3: "Viga", qp: 4, qt: 4, status: "ok" },
      { k: "a2", p: "a", code: "{{B}}-0A-01-002", type: "Soldagem", title3: "Travessa", qp: 6, qt: 6, status: "ok" },
      { k: "b", p: "r", code: "{{B}}-0B-00-000", type: "Montagem", title3: "Escada de acesso", qp: 1, qt: 1, status: "aviso" },
      { k: "b1", p: "b", code: "{{B}}-0B-01-001", type: "Soldagem", title3: "Longarina", qp: 2, qt: 2, status: "aviso" },
      { k: "b2", p: "b", code: "{{B}}-0B-01-002", type: "Soldagem", title3: "Degrau", qp: 8, qt: 8, status: "ok" },
    ],
    itens: [
      { name: "Parafuso sextavado M16", file: "PAR-SEX-M16x50.SLDPRT", folder: "Biblioteca\\Fixadores", qty: 32, item_type: "Peça", kind: "CM" },
      { name: "Rodapé de plataforma", file: "ROD-PLAT-100.SLDPRT", folder: "Biblioteca\\Perfis", qty: 8, item_type: "Peça", kind: "CM" },
      { name: "Piso grelha (referência)", file: "PISO-GRELHA.SLDASM", folder: "Cliente\\GERDAU", qty: 1, item_type: "Montagem", kind: "REF" },
    ],
    checagens: [
      { severity: "aviso", code: "{{B}}-0B-01-001", message: "Propriedade 10-TITULO 3 repetida" },
      { severity: "aviso", code: "{{B}}-0B-00-000", message: "Quantidade no pai diferente da última leitura" },
      { severity: "ok", code: "{{B}}-00-00-000", message: "Propriedades da montagem geral completas" },
      { severity: "ok", code: "{{B}}-0A-00-000", message: "Estrutura de códigos consistente" },
    ],
    cortes: [
      { weld: "{{B}}-0A-01-001", title: "Viga", pos: "01", profile: "Perfil W 200×22", material: "ASTM A572 Gr50", length: 3200, qty: 4, kgm: 22.2, status: "ok" },
      { weld: "{{B}}-0A-01-002", title: "Travessa", pos: "01", profile: "Perfil U 102×13", material: "ASTM A36", length: 1400, qty: 6, kgm: 13.3, status: "ok" },
      { weld: "{{B}}-0B-01-001", title: "Longarina", pos: "01", profile: "Perfil U 152×19", material: "ASTM A36", length: 3600, qty: 2, kgm: 19.1, status: "aviso" },
      { weld: "{{B}}-0B-01-002", title: "Degrau", pos: "01", profile: "Cantoneira 2″×3/16″", material: "ASTM A36", length: 760, qty: 8, kgm: 3.63, status: "ok" },
    ],
    chapas: [
      { material: "ASTM A36", thickness: "6,35 mm", code: "{{B}}-0A-01-003", name: "Chapa de junção", w: 320, h: 220, qty: 8, holes: 4, shape: "rect" },
      { material: "ASTM A36", thickness: "9,53 mm", code: "{{B}}-0B-01-003", name: "Chapa base da escada", w: 260, h: 200, qty: 2, holes: 4, shape: "flange" },
      { material: "ASTM A36", thickness: "3,00 mm", code: "{{B}}-0A-01-004", name: "Reforço da viga", w: 400, h: 140, qty: 8, holes: 0, shape: "gusset" },
    ],
    materiais: [
      { assembly: "{{B}}-0A-00-000", title: "Estrutura do piso", item: "PAR-SEX-M16x50", description: "Parafuso sextavado M16 × 50", spec: "Classe 8.8 zincado", unit: "pç", qty: 32 },
      { assembly: "{{B}}-0A-00-000", title: "Estrutura do piso", item: "POR-SEX-M16", description: "Porca sextavada M16", spec: "Classe 8 zincada", unit: "pç", qty: 32 },
      { assembly: "{{B}}-0B-00-000", title: "Escada de acesso", item: "CHB-M20", description: "Chumbador químico M20", spec: "Hilti HAS-U", unit: "pç", qty: 8 },
      { assembly: "{{B}}-00-00-000", title: "Montagem geral", item: "ROD-PLAT-100", description: "Rodapé de plataforma 100 mm", spec: "Chapa 3 mm dobada", unit: "m", qty: 12 },
    ],
  },
  {
    sigla: "TUB",
    titulo1: "Suporte de Tubulação de Vapor",
    titulo2: "Cenibra",
    pedido: "4548",
    nos: [
      { k: "r", code: "{{B}}-00-00-000", type: "Montagem", title3: "Montagem geral", qp: 1, qt: 1, status: "ok" },
      { k: "a", p: "r", code: "{{B}}-0A-00-000", type: "Montagem", title3: "Berço superior", qp: 1, qt: 1, status: "ok" },
      { k: "a1", p: "a", code: "{{B}}-0A-01-001", type: "Soldagem", title3: "Berce", qp: 6, qt: 6, status: "ok" },
      { k: "a2", p: "a", code: "{{B}}-0A-01-002", type: "Soldagem", title3: "Mão-francesa", qp: 12, qt: 12, status: "ok" },
      { k: "b", p: "r", code: "{{B}}-0B-00-000", type: "Montagem", title3: "Coluna de sustentação", qp: 1, qt: 1, status: "erro" },
      { k: "b1", p: "b", code: "{{B}}-0B-01-001", type: "Soldagem", title3: "Coluna", qp: 3, qt: 3, status: "erro" },
      { k: "b2", p: "b", code: "{{B}}-0B-01-002", type: "Soldagem", title3: "Chapa base", qp: 3, qt: 3, status: "aviso" },
    ],
    itens: [
      { name: "Abraçadeira bicunha Ø4″", file: "ABR-BIC-04.SLDPRT", folder: "Biblioteca\\Tubulação", qty: 6, item_type: "Peça", kind: "CM" },
      { name: "Parafuso sextavado M20", file: "PAR-SEX-M20x70.SLDPRT", folder: "Biblioteca\\Fixadores", qty: 24, item_type: "Peça", kind: "CM" },
      { name: "Tubulação (referência)", file: "TUB-VAPOR-REF.SLDASM", folder: "Cliente\\CENIBRA", qty: 1, item_type: "Montagem", kind: "REF" },
      { name: "Isolamento térmico", file: "ISO-TERM-04.SLDPRT", folder: "Projeto\\26-075", qty: 6, item_type: "Peça", kind: "Projeto" },
    ],
    checagens: [
      { severity: "erro", code: "{{B}}-0B-01-001", message: "Código de soldagem em uma montagem" },
      { severity: "erro", code: "{{B}}-0B-01-003", message: "Arquivo referenciado não encontrado" },
      { severity: "aviso", code: "{{B}}-0B-01-002", message: "Propriedade 10-TITULO 3 vazia" },
      { severity: "ok", code: "{{B}}-00-00-000", message: "Propriedades da montagem geral completas" },
    ],
    cortes: [
      { weld: "{{B}}-0A-01-001", title: "Berce", pos: "01", profile: "Perfil U 102×13", material: "ASTM A36", length: 640, qty: 6, kgm: 13.3, status: "ok" },
      { weld: "{{B}}-0A-01-002", title: "Mão-francesa", pos: "01", profile: "Barra chata 2″×¼″", material: "ASTM A36", length: 320, qty: 12, kgm: 4.05, status: "ok" },
      { weld: "{{B}}-0B-01-001", title: "Coluna", pos: "01", profile: "Perfil W 150×13", material: "ASTM A572 Gr50", length: 3800, qty: 3, kgm: 13.0, status: "erro" },
      { weld: "{{B}}-0B-01-002", title: "Chapa base", pos: "01", profile: "Chapa base 250×250", material: "ASTM A36", length: 250, qty: 3, kgm: 24.5, status: "aviso" },
    ],
    chapas: [
      { material: "ASTM A36", thickness: "9,53 mm", code: "{{B}}-0B-01-003", name: "Chapa base da coluna", w: 250, h: 250, qty: 3, holes: 4, shape: "flange" },
      { material: "ASTM A36", thickness: "6,35 mm", code: "{{B}}-0A-01-003", name: "Mão-francesa", w: 320, h: 180, qty: 12, holes: 0, shape: "gusset" },
      { material: "Inox AISI 304", thickness: "2,00 mm", code: "{{B}}-0A-01-004", name: "Placa de identificação", w: 160, h: 90, qty: 3, holes: 4, shape: "rect" },
    ],
    materiais: [
      { assembly: "{{B}}-0A-00-000", title: "Berço superior", item: "ABR-BIC-04", description: "Abraçadeira bicunha Ø4″", spec: "Aço carbono pintado", unit: "pç", qty: 6 },
      { assembly: "{{B}}-0A-00-000", title: "Berço superior", item: "PAR-SEX-M20x70", description: "Parafuso sextavado M20 × 70", spec: "Classe 8.8", unit: "pç", qty: 12 },
      { assembly: "{{B}}-0B-00-000", title: "Coluna de sustentação", item: "CHB-M20", description: "Chumbador químico M20", spec: "Hilti HAS-U", unit: "pç", qty: 12 },
      { assembly: "{{B}}-00-00-000", title: "Montagem geral", item: "ISO-TERM-04", description: "Isolamento térmico Ø4″", spec: "Lã de rocha, 50 mm", unit: "m", qty: 18 },
    ],
  },
];

function codigoLivre(base: string) {
  return base;
}

export const lerProjetoAberto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data: existentes } = await supabase.from("projects").select("code");
    const usados = new Set((existentes ?? []).map((p) => p.code as string));

    const modelo = MODELOS.find((m) => !usados.has(`26-072-${m.sigla}-00-00-000`)) ?? MODELOS[0]!;
    const base = codigoLivre(`26-072-${modelo.sigla}`);
    const code = `${base}-00-00-000`;
    if (usados.has(code)) throw new Error("Essa montagem já foi lida e está na lista.");

    const troca = (s: string) => s.replace(/\{\{B\}\}/g, base);

    const { data: projeto, error: errProj } = await supabase
      .from("projects")
      .insert({
        code,
        title1: modelo.titulo1,
        title2: modelo.titulo2,
        order_no: modelo.pedido,
        status: "lido",
        read_at: new Date().toISOString(),
        created_by: context.userId,
      })
      .select()
      .maybeSingle();
    if (errProj) throw new Error(errProj.message);
    if (!projeto) throw new Error("Não foi possível criar o projeto.");
    const projectId = (projeto as ProjectRow).id;

    const mapa: Record<string, string> = {};
    for (const [i, n] of modelo.nos.entries()) {
      const { data: criado, error } = await supabase
        .from("project_nodes")
        .insert({
          project_id: projectId,
          parent_id: n.p ? mapa[n.p] ?? null : null,
          code: troca(n.code),
          node_type: n.type,
          title3: n.title3,
          qty_parent: n.qp,
          qty_total: n.qt,
          status: n.status,
          position: i + 1,
        })
        .select("id")
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (criado) mapa[n.k] = (criado as { id: string }).id;
    }

    const inserir = async (tabela: TabelaEditavel, linhas: Linha[]) => {
      const { error } = await supabase
        .from(tabela)
        .insert(linhas.map((l) => ({ ...l, project_id: projectId })) as never);
      if (error) throw new Error(error.message);
    };

    await inserir(
      "project_items",
      modelo.itens.map((i, idx) => ({
        name: i.name,
        file: i.file,
        folder: i.folder,
        qty: i.qty,
        item_type: i.item_type,
        kind: i.kind,
        position: idx + 1,
      })),
    );
    await inserir(
      "project_checks",
      modelo.checagens.map((c) => ({ severity: c.severity, code: troca(c.code), message: c.message })),
    );
    await inserir(
      "cut_items",
      modelo.cortes.map((c, idx) => ({
        weld_code: troca(c.weld),
        weld_title: c.title,
        pos: c.pos,
        profile: c.profile,
        material: c.material,
        length_mm: c.length,
        qty: c.qty,
        kgm: c.kgm,
        status: c.status,
        position: idx + 1,
      })),
    );
    await inserir(
      "sheets",
      modelo.chapas.map((s, idx) => ({
        material: s.material,
        thickness: s.thickness,
        code: troca(s.code),
        name: s.name,
        w_mm: s.w,
        h_mm: s.h,
        qty: s.qty,
        holes: s.holes,
        shape: s.shape,
        position: idx + 1,
      })),
    );
    await inserir(
      "material_items",
      modelo.materiais.map((m, idx) => ({
        assembly: troca(m.assembly),
        title: m.title,
        item: m.item,
        description: m.description,
        spec: m.spec,
        unit: m.unit,
        qty: m.qty,
        position: idx + 1,
      })),
    );

    return projeto as ProjectRow;
  });

/* ================= Equipe ================= */

const emailValido = (e: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);

export const convidarUsuario = createServerFn({ method: "POST" })
  .inputValidator((d: { email: string; name: string }) => d)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();
    const name = data.name.trim();
    if (!name) throw new Error("Informe o nome da pessoa.");
    if (!emailValido(email)) throw new Error("E-mail inválido.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { name, username: email.split("@")[0] },
    });
    if (error) throw new Error(error.message);
    return { ok: true, email };
  });

export const removerUsuario = createServerFn({ method: "POST" })
  .inputValidator((d: { userId: string }) => d)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    if (data.userId === context.userId) throw new Error("Você não pode remover a si mesmo.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
