import path from "node:path";
import { readFile, mkdir } from "node:fs/promises";
import { DOMMatrix, ImageData, Path2D, createCanvas } from "@napi-rs/canvas";
import mammoth from "mammoth";
import AdmZip from "adm-zip";
import { createWorker } from "tesseract.js";
globalThis.DOMMatrix ??= DOMMatrix;
globalThis.ImageData ??= ImageData;
globalThis.Path2D ??= Path2D;
const MAX_TEXT = 50000;
export function inspectFile(buffer, name) {
  const ext = name.toLowerCase().split(".").pop();
  if (ext === "pdf" && buffer.subarray(0, 5).toString() === "%PDF-")
    return "pdf";
  if (ext === "docx" && buffer[0] === 0x50 && buffer[1] === 0x4b) {
    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();
    if (
      entries.length > 2000 ||
      entries.reduce((n, e) => n + e.header.size, 0) > 25 * 1024 * 1024
    )
      throw new Error("DOCX quá lớn sau giải nén.");
    if (
      !zip.getEntry("word/document.xml") ||
      !zip.getEntry("[Content_Types].xml")
    )
      throw new Error("Nội dung không phải DOCX.");
    return "docx";
  }
  throw new Error("Chỉ nhận PDF hoặc DOCX hợp lệ, tối đa 10 MB.");
}
export async function extractFile(file, signal, onProgress = () => {}) {
  const buffer = await readFile(file.path);
  inspectFile(buffer, file.name);
  if (file.kind === "docx") {
    const result = await mammoth.extractRawText({ buffer });
    if (result.value.length > MAX_TEXT)
      throw new Error("CV vượt giới hạn 50.000 ký tự.");
    if (!result.value.trim())
      throw new Error("DOCX không có nội dung văn bản.");
    return result.value;
  }
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const loadingTask = getDocument({
    data: new Uint8Array(buffer),
    isEvalSupported: false,
    useSystemFonts: true,
  });
  const document = await loadingTask.promise;
  let worker;
  const abort = () => {
    worker?.terminate().catch(() => {});
  };
  signal?.addEventListener("abort", abort, { once: true });
  const cachePath = path.resolve(process.env.DATA_DIR || ".data", "ocr");
  await mkdir(cachePath, { recursive: true, mode: 0o700 });
  try {
    if (document.numPages > 30) throw new Error("CV tối đa 30 trang.");
    let text = "";
    let scans = 0;
    for (let i = 1; i <= document.numPages; i++) {
      signal?.throwIfAborted();
      onProgress(Math.round(((i - 1) / document.numPages) * 90));
      const page = await document.getPage(i);
      const content = await page.getTextContent();
      let pageText = content.items
        .map((item) => item.str + (item.hasEOL ? "\n" : " "))
        .join("")
        .trim();
      if (pageText.replace(/\s/g, "").length < 30) {
        if (++scans > 10) throw new Error("OCR giới hạn 10 trang scan mỗi CV.");
        if (!worker)
          worker = await createWorker("eng+vie", 1, {
            cachePath,
            ...(process.env.OCR_LANG_PATH
              ? { langPath: process.env.OCR_LANG_PATH }
              : {}),
          });
        signal?.throwIfAborted();
        const viewport = page.getViewport({ scale: 1.5 });
        if (viewport.width * viewport.height > 15000000)
          throw new Error("Kích thước trang scan quá lớn.");
        const canvas = createCanvas(
          Math.ceil(viewport.width),
          Math.ceil(viewport.height),
        );
        await page.render({
          canvasContext: canvas.getContext("2d"),
          viewport,
          canvas,
        }).promise;
        const result = await worker.recognize(canvas.toBuffer("image/png"));
        pageText = result.data.text;
      }
      text += `\n[Trang ${i}]\n${pageText}`;
      if (text.length > MAX_TEXT)
        throw new Error("CV vượt giới hạn 50.000 ký tự.");
      page.cleanup();
    }
    if (text.replace(/\[Trang \d+\]/g, "").trim().length < 20)
      throw new Error("Không đọc được nội dung CV. Hãy nhập văn bản thủ công.");
    return text;
  } finally {
    signal?.removeEventListener("abort", abort);
    if (worker) await worker.terminate().catch(() => {});
    await loadingTask.destroy();
  }
}
export function extractProfile(text, existing = {}) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !/^\[Trang \d+\]$/.test(l));
  const pick = (labels) => {
    const re = new RegExp(`^(?:${labels})\\s*[:：]\\s*(.*)$`, "i");
    const line = lines.find((l) => re.test(l));
    return line ? line.match(re)[1] : "";
  };
  const named = pick("Họ tên|Full name|Name");
  const first = lines[0] || "";
  return {
    name:
      named ||
      (first.length >= 2 &&
      first.length <= 100 &&
      !/CV|resume|curriculum|@|\d/i.test(first)
        ? first
        : existing.name || "Chưa xác định"),
    email: text.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/)?.[0] || "",
    phone: text.match(/(?:\+84|0)[\d .-]{8,14}/)?.[0]?.trim() || "",
    skills: pick("Kỹ năng|Skills"),
    experience: pick("Kinh nghiệm|Experience"),
    education: pick("Học vấn|Education"),
    projects: pick("Dự án|Dự án và thành tích|Projects"),
    certificates: pick("Chứng chỉ|Certificates|Certifications"),
  };
}
