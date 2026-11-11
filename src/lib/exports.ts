import JSZip from "jszip";

/* ================= Download ================= */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export async function deliverFile(blob: Blob, filename: string) {
  const file = new File([blob], filename, { type: blob.type });
  const touch = matchMedia("(pointer: coarse)").matches;
  if (touch && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename });
      return;
    } catch (e) {
      if ((e as DOMException).name === "AbortError") return;
    }
  }
  downloadBlob(blob, filename);
}

export const nomeArquivo = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");

/* ================= Excel (.xlsx) =================
   Pasta .xlsx mínima escrita direto no navegador: um zip com as partes XML
   que o Excel e o LibreOffice leem. Sem dependência pesada. */
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const letraColuna = (i: number) => {
  let s = "";
  let n = i + 1;
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
};

const celula = (coluna: number, linha: number, valor: string | number, cabecalho: boolean) => {
  const ref = `${letraColuna(coluna)}${linha}`;
  const estilo = cabecalho ? ' s="1"' : "";
  if (typeof valor === "number" && Number.isFinite(valor)) {
    return `<c r="${ref}"${estilo}><v>${valor}</v></c>`;
  }
  return `<c r="${ref}"${estilo} t="inlineStr"><is><t xml:space="preserve">${esc(String(valor ?? ""))}</t></is></c>`;
};

export async function xlsxBlob(
  nomeAba: string,
  cabecalhos: string[],
  linhas: (string | number)[][],
): Promise<Blob> {
  const abas = nomeAba.slice(0, 31).replace(/[\\/*?:[\]]/g, "-") || "Planilha";
  const larguras = cabecalhos
    .map((_, i) => {
      const maior = Math.max(
        cabecalhos[i]!.length,
        ...linhas.map((l) => String(l[i] ?? "").length),
      );
      return `<col min="${i + 1}" max="${i + 1}" width="${Math.min(60, Math.max(10, maior + 2))}" customWidth="1"/>`;
    })
    .join("");

  const dados = [
    `<row r="1">${cabecalhos.map((h, i) => celula(i, 1, h, true)).join("")}</row>`,
    ...linhas.map(
      (l, ri) =>
        `<row r="${ri + 2}">${l.map((v, i) => celula(i, ri + 2, v, false)).join("")}</row>`,
    ),
  ].join("");

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`;

  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;

  const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${esc(abas)}" sheetId="1" r:id="rId1"/></sheets></workbook>`;

  const workbookRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;

  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="1"><fill><patternFill patternType="none"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs></styleSheet>`;

  const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cols>${larguras}</cols><sheetData>${dados}</sheetData></worksheet>`;

  const zip = new JSZip();
  zip.file("[Content_Types].xml", contentTypes);
  zip.folder("_rels")!.file(".rels", rels);
  zip.folder("xl")!.file("workbook.xml", workbook);
  zip.folder("xl")!.file("styles.xml", styles);
  zip.folder("xl")!.folder("_rels")!.file("workbook.xml.rels", workbookRels);
  zip.folder("xl")!.folder("worksheets")!.file("sheet1.xml", sheet);

  return zip.generateAsync({ type: "blob" });
}

/* ================= DXF =================
   DXF R12: contorno em LINEs e furos em CIRCLEs, nas medidas reais em mm. */
type Pt = [number, number];

const f = (n: number) => String(Math.round(n * 1000) / 1000);

const ent = (tipo: string, pares: [string, string][]) =>
  `0\n${tipo}\n` + pares.map(([c, v]) => `${c}\n${v}\n`).join("");

function contorno(w: number, h: number, shape: string): Pt[] {
  if (shape === "l") return [[0, 0], [w, 0], [w, h * 0.45], [w * 0.4, h * 0.45], [w * 0.4, h], [0, h]];
  if (shape === "gusset") return [[0, 0], [0, h], [w, 0]];
  return [[0, 0], [w, 0], [w, h], [0, h]];
}

const LOCAIS_FURO: Pt[] = [
  [0.18, 0.22],
  [0.82, 0.22],
  [0.18, 0.78],
  [0.82, 0.78],
  [0.5, 0.5],
  [0.18, 0.5],
  [0.82, 0.5],
  [0.5, 0.22],
  [0.5, 0.78],
];

export function dxfForSheet(s: {
  code: string;
  name: string;
  w_mm: number;
  h_mm: number;
  holes: number;
  shape: string;
}): string {
  const pts = contorno(s.w_mm, s.h_mm, s.shape);
  let entidades = "";

  for (let i = 0; i < pts.length; i++) {
    const a = pts[i]!;
    const b = pts[(i + 1) % pts.length]!;
    entidades += ent("LINE", [
      ["8", "SOLIDAUTO"],
      ["10", f(a[0])],
      ["20", f(a[1])],
      ["11", f(b[0])],
      ["21", f(b[1])],
    ]);
  }

  if (s.shape === "flange") {
    entidades += ent("CIRCLE", [
      ["8", "SOLIDAUTO"],
      ["10", f(s.w_mm / 2)],
      ["20", f(s.h_mm / 2)],
      ["40", f(Math.min(s.w_mm, s.h_mm) * 0.18)],
    ]);
  }

  for (let i = 0; i < s.holes; i++) {
    const [fx, fy] = LOCAIS_FURO[i % LOCAIS_FURO.length]!;
    entidades += ent("CIRCLE", [
      ["8", "FUROS"],
      ["10", f(s.w_mm * fx)],
      ["20", f(s.h_mm * fy)],
      ["40", "11"],
    ]);
  }

  entidades += ent("TEXT", [
    ["8", "SOLIDAUTO"],
    ["10", "0"],
    ["20", f(-s.h_mm - 12)],
    ["40", "8"],
    ["1", `${s.code} ${s.name}`.slice(0, 120)],
  ]);

  return (
    "0\nSECTION\n2\nHEADER\n9\n$ACADVER\n1\nAC1009\n0\nENDSEC\n" +
    "0\nSECTION\n2\nENTITIES\n" +
    entidades +
    "0\nENDSEC\n0\nEOF\n"
  );
}

export async function zipBlobs(entries: { nome: string; blob: Blob }[]): Promise<Blob> {
  const zip = new JSZip();
  for (const e of entries) zip.file(e.nome, e.blob);
  return zip.generateAsync({ type: "blob" });
}

export const blobDeTexto = (texto: string) =>
  new Blob([texto], { type: "application/dxf;charset=utf-8" });
