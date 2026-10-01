import { test } from "node:test";
import assert from "node:assert/strict";
import {
  totalScore,
  canAccess,
  canEdit,
  evidenceCheck,
  isCurrent,
  jobSchema,
} from "../server/domain.js";
import { inspectFile } from "../server/extract.js";
import AdmZip from "adm-zip";
test("weighted score is computed deterministically and rejects invalid weights/scores", () => {
  assert.equal(
    totalScore([95, 90, 92, 85, 80], [35, 30, 20, 10, 5]),
    (91.15).toFixed(1) * 1,
  );
  assert.equal(totalScore([100, 100, 100, 100, 100], [35, 30, 20, 10, 5]), 100);
  assert.throws(() =>
    totalScore([100, 100, 100, 100, 100], [35, 30, 20, 10, 10]),
  );
  assert.throws(() => totalScore([101, 0, 0, 0, 0], [35, 30, 20, 10, 5]));
  assert.throws(() => totalScore([NaN, 0, 0, 0, 0], [35, 30, 20, 10, 5]));
});
test("job-scoped authorization distinguishes manager read from recruiter write", () => {
  const job = { members: ["hr", "manager"] };
  assert.equal(
    canAccess({ id: "manager", role: "Hiring Manager", active: true }, job),
    true,
  );
  assert.equal(
    canEdit({ id: "manager", role: "Hiring Manager", active: true }, job),
    false,
  );
  assert.equal(
    canEdit({ id: "hr", role: "Recruiter", active: true }, job),
    true,
  );
  assert.equal(
    canAccess({ id: "other", role: "Recruiter", active: true }, job),
    false,
  );
  assert.equal(
    canAccess({ id: "admin", role: "Admin", active: false }, job),
    false,
  );
  assert.equal(
    canAccess({ id: "admin", role: "Admin", active: true }, null),
    null,
  );
});
test("AI evidence must occur in source and missing evidence cannot be a positive score", () => {
  assert.throws(() =>
    evidenceCheck(
      { criteria: [{ score: 90, evidence: "invented" }], mandatory: [] },
      "React",
    ),
  );
  assert.throws(() =>
    evidenceCheck(
      { criteria: [{ score: 90, evidence: "" }], mandatory: [] },
      "React",
    ),
  );
  assert.throws(() =>
    evidenceCheck(
      { criteria: [], mandatory: [{ status: "Đáp ứng", evidence: "" }] },
      "React",
    ),
  );
  assert.doesNotThrow(() =>
    evidenceCheck(
      {
        criteria: [{ score: 0, evidence: "" }],
        mandatory: [{ status: "Chưa đủ thông tin", evidence: "" }],
      },
      "React",
    ),
  );
});
test("ranking invalidates on rubric, CV changes, or unconfirmed CV", () => {
  const e = { rubricVersion: 1, resumeVersion: 2 };
  assert.equal(
    isCurrent(e, { rubricVersion: 1 }, { version: 2, confirmed: true }),
    true,
  );
  assert.equal(
    isCurrent(e, { rubricVersion: 2 }, { version: 2, confirmed: true }),
    false,
  );
  assert.equal(
    isCurrent(e, { rubricVersion: 1 }, { version: 3, confirmed: true }),
    false,
  );
  assert.equal(
    isCurrent(e, { rubricVersion: 1 }, { version: 2, confirmed: false }),
    false,
  );
});
test("upload inspects content and DOCX decompressed size", () => {
  assert.throws(() => inspectFile(Buffer.from("executable"), "cv.pdf"));
  assert.throws(() => inspectFile(Buffer.from("%PDF-1.7"), "cv.exe"));
  const zip = new AdmZip();
  zip.addFile("word/document.xml", Buffer.from("<xml/>"));
  zip.addFile("[Content_Types].xml", Buffer.from("<xml/>"));
  assert.equal(inspectFile(zip.toBuffer(), "cv.docx"), "docx");
  zip.addFile("bomb", Buffer.alloc(26 * 1024 * 1024));
  assert.throws(() => inspectFile(zip.toBuffer(), "cv.docx"));
});
