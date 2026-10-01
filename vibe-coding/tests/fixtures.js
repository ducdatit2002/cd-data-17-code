import { createCanvas } from "@napi-rs/canvas";
export function pdfFixture(scan = false) {
  const objects = [];
  const add = (s) => objects.push(Buffer.isBuffer(s) ? s : Buffer.from(s));
  add("<< /Type /Catalog /Pages 2 0 R >>");
  add("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  add(
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 800] /Resources ${scan ? "<< /XObject << /Im0 5 0 R >> >>" : "<< /Font << /F1 5 0 R >> >>"} /Contents 4 0 R >>`,
  );
  const text = scan
    ? "q 600 0 0 800 0 0 cm /Im0 Do Q"
    : "BT /F1 20 Tf 40 740 Td (Nguyen Test) Tj 0 -40 Td (test@example.com) Tj 0 -40 Td (React TypeScript - five years experience) Tj ET";
  add(`<< /Length ${Buffer.byteLength(text)} >>\nstream\n${text}\nendstream`);
  if (scan) {
    const canvas = createCanvas(900, 1200);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, 900, 1200);
    ctx.fillStyle = "#111";
    ctx.font = "40px sans-serif";
    [
      "Nguyen Scan Test",
      "scan@example.com",
      "React TypeScript",
      "Five years engineering experience",
    ].forEach((s, i) => ctx.fillText(s, 55, 100 + i * 90));
    const jpg = canvas.toBuffer("image/jpeg");
    add(
      Buffer.concat([
        Buffer.from(
          `<< /Type /XObject /Subtype /Image /Width 900 /Height 1200 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`,
        ),
        jpg,
        Buffer.from("\nendstream"),
      ]),
    );
  } else add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const chunks = [Buffer.from("%PDF-1.4\n")];
  const offsets = [0];
  let offset = chunks[0].length;
  objects.forEach((obj, i) => {
    offsets.push(offset);
    const b = Buffer.concat([
      Buffer.from(`${i + 1} 0 obj\n`),
      obj,
      Buffer.from("\nendobj\n"),
    ]);
    chunks.push(b);
    offset += b.length;
  });
  chunks.push(
    Buffer.from(
      `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets
        .slice(1)
        .map((n) => String(n).padStart(10, "0") + " 00000 n \n")
        .join(
          "",
        )}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${offset}\n%%EOF`,
    ),
  );
  return Buffer.concat(chunks);
}
