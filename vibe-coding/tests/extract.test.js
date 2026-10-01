import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { extractFile } from "../server/extract.js";
import { pdfFixture } from "./fixtures.js";
test("real PDF extraction preserves source page and text", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "talentflow-pdf-"));
  try {
    const file = path.join(dir, "resume.pdf");
    await writeFile(file, pdfFixture());
    const text = await extractFile(
      { name: "resume.pdf", path: file, kind: "pdf" },
      AbortSignal.timeout(30000),
    );
    assert.match(text, /\[Trang 1\]/);
    assert.match(text, /React TypeScript/);
    assert.match(text, /test@example.com/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
test(
  "OCR reads a real scanned PDF (opt-in; downloads language data once)",
  { skip: process.env.TEST_OCR !== "true", timeout: 180000 },
  async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "talentflow-ocr-"));
    try {
      const file = path.join(dir, "scan.pdf");
      await writeFile(file, pdfFixture(true));
      const text = await extractFile(
        { name: "scan.pdf", path: file, kind: "pdf" },
        AbortSignal.timeout(160000),
      );
      assert.match(text, /React TypeScript/);
      assert.match(text, /scan@example.com/);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  },
);
