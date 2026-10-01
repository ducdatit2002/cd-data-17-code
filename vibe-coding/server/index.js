import "dotenv/config";
import express from "express";
import multer from "multer";
import { z } from "zod";
import { readFile, writeFile, unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import {
  all,
  get,
  put,
  del,
  id,
  now,
  transaction,
  session,
  sessionUser,
  logout,
  verifyPassword,
  hashPassword,
  publicUser,
  audit,
  uploadDir,
} from "./store.js";
import {
  statuses,
  jobSchema,
  profileSchema,
  evaluationSchema,
  totalScore,
  canAccess,
  canEdit,
  isCurrent,
} from "./domain.js";
import {
  aiConfigured,
  evaluate,
  structured,
  postOutput,
  interviewOutput,
  summaryOutput,
} from "./ai.js";
import { inspectFile, extractFile, extractProfile } from "./extract.js";
export const app = express();
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "same-origin",
    "Cache-Control": "no-store",
    "Content-Security-Policy":
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'self'",
  });
  next();
});
app.use(express.json({ limit: "1mb" }));
const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ||
  "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3001,http://127.0.0.1:3001"
).split(",");
app.use("/api", (req, res, next) => {
  if (
    !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
    req.headers.origin &&
    !allowedOrigins.includes(req.headers.origin)
  )
    return res.status(403).json({ error: "Nguồn yêu cầu không được phép." });
  next();
});
const fail = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  throw error;
};
const body = (schema, req) => {
  const result = schema.safeParse(req.body);
  if (!result.success)
    fail(
      result.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; "),
    );
  return result.data;
};
const cookieToken = (req) =>
  (req.headers.cookie || "")
    .split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith("tf_session="))
    ?.slice(11) || "";
const loginAttempts = new Map();
app.post("/api/login", (req, res) => {
  const { email, password } = body(
    z.object({ email: z.string().max(200), password: z.string().max(200) }),
    req,
  );
  const key = req.socket.remoteAddress;
  const old = loginAttempts.get(key);
  const count =
    old && Date.now() - old.start < 60000
      ? old
      : { start: Date.now(), count: 0 };
  count.count++;
  loginAttempts.set(key, count);
  if (count.count > 12)
    fail("Thử đăng nhập quá nhiều lần. Hãy chờ một phút.", 429);
  const u = all("users").find((u) => u.email === email.toLowerCase().trim());
  if (!u?.active || !verifyPassword(password, u.passwordHash))
    fail("Email hoặc mật khẩu không đúng.", 401);
  loginAttempts.delete(key);
  const token = session(u.id);
  res
    .cookie("tf_session", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.SECURE_COOKIE === "true",
      maxAge: 8 * 3600000,
      path: "/",
    })
    .json(publicUser(u));
});
app.use("/api", (req, res, next) => {
  req.user = sessionUser(cookieToken(req));
  if (!req.user?.active)
    return res.status(401).json({ error: "Vui lòng đăng nhập." });
  next();
});
app.post("/api/logout", (req, res) => {
  logout(cookieToken(req));
  res.clearCookie("tf_session", { path: "/" }).json({ ok: true });
});
function jobFor(user, jobId, edit = false) {
  const j = get("jobs", jobId);
  if (!(edit ? canEdit(user, j) : canAccess(user, j)))
    fail("Không có quyền truy cập vị trí này.", 403);
  return j;
}
function applicationFor(user, applicationId, edit = false) {
  const a = get("applications", applicationId);
  if (!a) fail("Không tìm thấy hồ sơ.", 404);
  jobFor(user, a.jobId, edit);
  return a;
}
function resumeFor(user, resumeId, edit = false) {
  const r = get("resumes", resumeId);
  if (!r) fail("Không tìm thấy CV.", 404);
  if (
    !all("applications").some(
      (a) =>
        a.resumeId === resumeId &&
        (edit
          ? canEdit(user, get("jobs", a.jobId))
          : canAccess(user, get("jobs", a.jobId))),
    )
  )
    fail("Không có quyền truy cập CV.", 403);
  return r;
}
function admin(req) {
  if (req.user.role !== "Admin") fail("Chỉ Admin có quyền thao tác.", 403);
}
const enriched = (a) => {
  const c = get("candidates", a.candidateId),
    r = get("resumes", a.resumeId),
    e = get("evaluations", a.evaluationId),
    j = get("jobs", a.jobId);
  return {
    ...a,
    candidate: c,
    resume: r
      ? {
          id: r.id,
          status: r.status,
          error: r.error,
          confirmed: r.confirmed,
          version: r.version,
          demo: r.demo,
          fileName: r.file?.name,
        }
      : null,
    evaluation: e,
    jobTitle: j?.title,
    current: r && j ? isCurrent(e, j, r) : false,
  };
};
app.get("/api/state", (req, res) => {
  const jobs = all("jobs").filter((j) => canAccess(req.user, j));
  const jobIds = new Set(jobs.map((j) => j.id));
  const applications = all("applications")
    .filter((a) => jobIds.has(a.jobId))
    .map(enriched);
  const appIds = new Set(applications.map((a) => a.id));
  res.json({
    user: publicUser(req.user),
    jobs,
    applications,
    posts: all("posts").filter((p) => jobIds.has(p.jobId)),
    interviews: all("interviews").filter((i) => appIds.has(i.applicationId)),
    tasks: all("tasks")
      .filter((t) => t.jobId && jobIds.has(t.jobId))
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, 50),
    users: req.user.role === "Admin" ? all("users").map(publicUser) : [],
    settings: get("settings", "main"),
    ai: { configured: aiConfigured(), model: process.env.OPENAI_MODEL || null },
    demo: jobs.some((j) => j.demo),
  });
});
app.post("/api/jobs", (req, res) => {
  if (req.user.role === "Hiring Manager")
    fail("Không có quyền tạo vị trí.", 403);
  const data = body(jobSchema, req);
  const j = put("jobs", {
    ...data,
    id: id(),
    rubricVersion: 1,
    members: [req.user.id],
    state: "Đang tuyển",
    createdAt: now(),
  });
  put("rubrics", {
    id: j.id + ":1",
    jobId: j.id,
    version: 1,
    ...data,
    at: now(),
  });
  audit(req.user, "Tạo vị trí", j.id);
  res.status(201).json(j);
});
app.put("/api/jobs/:id", (req, res) => {
  const j = jobFor(req.user, req.params.id, true);
  const data = body(jobSchema, req);
  const changed = [
    "weights",
    "description",
    "required",
    "preferred",
    "level",
  ].some((k) => JSON.stringify(j[k]) !== JSON.stringify(data[k]));
  const updated = {
    ...j,
    ...data,
    rubricVersion: j.rubricVersion + (changed ? 1 : 0),
  };
  transaction(() => {
    put("jobs", updated);
    if (changed)
      put("rubrics", {
        id: j.id + ":" + updated.rubricVersion,
        jobId: j.id,
        version: updated.rubricVersion,
        ...data,
        at: now(),
      });
    audit(req.user, "Cập nhật vị trí", j.id);
  });
  res.json(updated);
});
app.patch("/api/jobs/:id/members", (req, res) => {
  admin(req);
  const j = jobFor(req.user, req.params.id);
  const { members } = body(
    z.object({ members: z.array(z.string()).max(100) }),
    req,
  );
  if (members.some((m) => !get("users", m)?.active))
    fail("Thành viên không hợp lệ.");
  put("jobs", { ...j, members: [...new Set(members)] });
  audit(req.user, "Cập nhật quyền vị trí", j.id);
  res.json({ ok: true });
});
app.patch("/api/jobs/:id/state", (req, res) => {
  const j = jobFor(req.user, req.params.id, true);
  const { state } = body(
    z.object({ state: z.enum(["Đang tuyển", "Đã đóng"]) }),
    req,
  );
  put("jobs", { ...j, state });
  res.json({ ok: true });
});
app.post("/api/jobs/:id/posts", (req, res) => {
  const j = jobFor(req.user, req.params.id, true);
  const data = body(
    z.object({
      content: z.string().min(1).max(30000),
      channel: z.enum(["Website", "Facebook", "LinkedIn"]),
      tone: z.enum(["Chuyên nghiệp", "Thân thiện", "Ngắn gọn"]),
    }),
    req,
  );
  const p = put("posts", {
    ...data,
    id: id(),
    jobId: j.id,
    version: all("posts").filter((p) => p.jobId === j.id).length + 1,
    source: "manual",
    at: now(),
  });
  audit(req.user, "Lưu phiên bản bài tuyển dụng", p.id);
  res.status(201).json(p);
});
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 10, fields: 2 },
  fileFilter: (req, file, cb) =>
    /\.(pdf|docx)$/i.test(file.originalname)
      ? cb(null, true)
      : cb(
          Object.assign(new Error("Chỉ nhận file PDF hoặc DOCX."), {
            status: 400,
          }),
        ),
});
app.post(
  "/api/jobs/:id/upload",
  (req, res, next) => {
    jobFor(req.user, req.params.id, true);
    next();
  },
  upload.array("files", 10),
  async (req, res) => {
    const j = jobFor(req.user, req.params.id, true);
    if (!req.files?.length) fail("Chọn ít nhất một file PDF hoặc DOCX.");
    const results = [];
    for (const f of req.files) {
      const safeName = path.basename(f.originalname).slice(0, 180);
      let filePath;
      try {
        const kind = inspectFile(f.buffer, safeName);
        const hash = createHash("sha256").update(f.buffer).digest("hex");
        const duplicate = all("resumes").find(
          (r) =>
            r.hash === hash &&
            all("applications").some(
              (a) =>
                a.resumeId === r.id &&
                canAccess(req.user, get("jobs", a.jobId)),
            ),
        );
        if (duplicate) {
          results.push({
            name: safeName,
            duplicate: true,
            resumeId: duplicate.id,
          });
          continue;
        }
        const candidateId = id(),
          resumeId = id(),
          applicationId = id();
        filePath = path.join(uploadDir, resumeId + "." + kind);
        await writeFile(filePath, f.buffer, { mode: 0o600 });
        const r = {
          id: resumeId,
          candidateId,
          hash,
          text: "",
          version: 1,
          confirmed: false,
          status: "queued",
          file: { path: filePath, name: safeName, kind },
          at: now(),
        };
        transaction(() => {
          put("candidates", {
            id: candidateId,
            name: safeName.replace(/\.[^.]+$/, ""),
            email: "",
            phone: "",
            skills: "",
            experience: "",
            education: "",
            projects: "",
            certificates: "",
            createdAt: now(),
          });
          put("resumes", r);
          put("applications", {
            id: applicationId,
            candidateId,
            resumeId,
            jobId: j.id,
            status: "Mới",
            createdAt: now(),
          });
        });
        queue(req.user, "extract", j.id, { resumeId });
        results.push({ name: safeName, applicationId });
        audit(req.user, "Tải CV", resumeId);
      } catch (e) {
        if (filePath) await unlink(filePath).catch(() => {});
        results.push({ name: safeName, error: e.message });
      }
    }
    res.status(201).json({ results });
  },
);
app.post("/api/jobs/:id/candidates", (req, res) => {
  const j = jobFor(req.user, req.params.id, true);
  const data = body(
    z.object({ profile: profileSchema, text: z.string().min(20).max(50000) }),
    req,
  );
  const candidateId = id(),
    resumeId = id();
  const a = transaction(() => {
    put("candidates", { ...data.profile, id: candidateId, createdAt: now() });
    put("resumes", {
      id: resumeId,
      candidateId,
      text: data.text,
      version: 1,
      confirmed: true,
      status: "done",
      file: null,
      at: now(),
    });
    return put("applications", {
      id: id(),
      candidateId,
      resumeId,
      jobId: j.id,
      status: "Mới",
      createdAt: now(),
    });
  });
  audit(req.user, "Tạo ứng viên thủ công", candidateId);
  res.status(201).json(a);
});
app.get("/api/applications/:id", (req, res) => {
  const a = applicationFor(req.user, req.params.id);
  const r = get("resumes", a.resumeId);
  const c = get("candidates", a.candidateId);
  const duplicates = all("candidates")
    .filter(
      (other) =>
        other.id !== c.id &&
        ((c.email && other.email.toLowerCase() === c.email.toLowerCase()) ||
          (c.phone &&
            other.phone.replace(/\D/g, "") === c.phone.replace(/\D/g, ""))),
    )
    .filter((other) =>
      all("applications").some(
        (x) =>
          x.candidateId === other.id &&
          canAccess(req.user, get("jobs", x.jobId)),
      ),
    )
    .map((other) => ({ id: other.id, name: other.name }));
  res.json({
    ...enriched(a),
    resume: r
      ? { ...r, file: r.file ? { name: r.file.name, kind: r.file.kind } : null }
      : null,
    evaluations: all("evaluations")
      .filter((e) => e.applicationId === a.id)
      .sort((x, y) => y.at.localeCompare(x.at)),
    duplicates,
    comments: all("comments").filter((c) => c.applicationId === a.id),
  });
});
app.get("/api/resumes/:id/file", (req, res) => {
  const r = resumeFor(req.user, req.params.id);
  if (!r.file) fail("CV này được nhập dạng văn bản.", 404);
  res.set({
    "Content-Type":
      r.file.kind === "pdf"
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "Content-Disposition": `${r.file.kind === "pdf" ? "inline" : "attachment"}; filename="resume.${r.file.kind}"`,
  });
  res.sendFile(r.file.path);
});
app.put("/api/applications/:id/profile", (req, res) => {
  const a = applicationFor(req.user, req.params.id, true);
  const r = get("resumes", a.resumeId);
  if (["queued", "running"].includes(r.status))
    fail("CV đang được xử lý. Hãy chờ hoàn tất.");
  const data = body(
    z.object({
      profile: profileSchema,
      text: z.string().min(20).max(50000),
      confirmed: z.boolean(),
    }),
    req,
  );
  transaction(() => {
    put("candidates", { ...get("candidates", a.candidateId), ...data.profile });
    put("resumes", {
      ...r,
      text: data.text,
      confirmed: data.confirmed,
      status: "done",
      error: null,
      version: r.version + (r.text !== data.text ? 1 : 0),
    });
    audit(req.user, "Xác nhận dữ liệu CV", a.id);
  });
  res.json({ ok: true });
});
app.patch("/api/applications/:id/status", (req, res) => {
  const a = applicationFor(req.user, req.params.id, true);
  const { status } = body(z.object({ status: z.enum(statuses) }), req);
  put("applications", { ...a, status });
  audit(req.user, "Trạng thái: " + status, a.id);
  res.json({ ok: true });
});
app.post("/api/applications/:id/link", (req, res) => {
  const a = applicationFor(req.user, req.params.id, true);
  const { jobId } = body(z.object({ jobId: z.string() }), req);
  jobFor(req.user, jobId, true);
  if (
    all("applications").some(
      (x) => x.candidateId === a.candidateId && x.jobId === jobId,
    )
  )
    fail("Ứng viên đã có hồ sơ cho vị trí này.");
  res.status(201).json(
    put("applications", {
      id: id(),
      candidateId: a.candidateId,
      resumeId: a.resumeId,
      jobId,
      status: "Mới",
      createdAt: now(),
    }),
  );
});
app.post("/api/applications/:id/comments", (req, res) => {
  const a = applicationFor(req.user, req.params.id);
  const { content } = body(
    z.object({ content: z.string().trim().min(1).max(5000) }),
    req,
  );
  res.status(201).json(
    put("comments", {
      id: id(),
      applicationId: a.id,
      content,
      actor: req.user.name,
      userId: req.user.id,
      at: now(),
    }),
  );
});
app.post("/api/applications/:id/evaluations", (req, res) => {
  const a = applicationFor(req.user, req.params.id, true);
  const j = get("jobs", a.jobId),
    r = get("resumes", a.resumeId);
  if (!r.confirmed) fail("Hãy xác nhận nội dung CV trước khi chấm điểm.");
  const data = body(
    evaluationSchema.extend({
      reason: z.string().trim().min(3).max(2000),
      rubricVersion: z.number().int().positive(),
      resumeVersion: z.number().int().positive(),
    }),
    req,
  );
  if (
    data.rubricVersion !== j.rubricVersion ||
    data.resumeVersion !== r.version
  )
    fail("CV hoặc tiêu chí đã thay đổi. Làm mới hồ sơ rồi chấm lại.", 409);
  const requirements = j.required
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  if (
    data.mandatory.length !== requirements.length ||
    data.mandatory.some((r, i) => r.requirement !== requirements[i])
  )
    fail("Yêu cầu bắt buộc không khớp phiên bản tiêu chí.");
  const old = get("evaluations", a.evaluationId);
  const e = put("evaluations", {
    ...data,
    id: id(),
    applicationId: a.id,
    rubricVersion: j.rubricVersion,
    resumeVersion: r.version,
    weights: j.weights,
    score: totalScore(
      data.criteria.map((c) => c.score),
      j.weights,
    ),
    source: "manual",
    model: null,
    promptVersion: null,
    previousEvaluationId: old?.id || null,
    originalScore: old?.score ?? null,
    actor: req.user.name,
    at: now(),
  });
  put("applications", {
    ...a,
    evaluationId: e.id,
    status: a.status === "Mới" ? "Đã đánh giá CV" : a.status,
  });
  audit(req.user, "Chấm điểm thủ công", a.id);
  res.status(201).json(e);
});
app.post("/api/applications/:id/interviews", (req, res) => {
  const a = applicationFor(req.user, req.params.id, true);
  const { scheduledAt, duration } = body(
    z.object({
      scheduledAt: z.iso.datetime(),
      duration: z.number().int().min(15).max(30),
    }),
    req,
  );
  const e = get("evaluations", a.evaluationId);
  const questions = [
    ...(e?.questions || []),
    "Bạn mong muốn điều gì ở vai trò mới?",
    "Kỳ vọng lương và thời gian có thể nhận việc?",
  ].map((text) => ({ text, answer: "", asked: false }));
  const interview = put("interviews", {
    id: id(),
    applicationId: a.id,
    scheduledAt,
    duration,
    questions,
    notes: "",
    scores: [0, 0, 0],
    summary: null,
    state: "Nháp",
    at: now(),
  });
  put("applications", { ...a, status: "Phone interview" });
  res.status(201).json(interview);
});
const interviewSchema = z.object({
  scheduledAt: z.iso.datetime(),
  duration: z.number().int().min(15).max(30),
  questions: z
    .array(
      z.object({
        text: z.string().min(1).max(2000),
        answer: z.string().max(10000),
        asked: z.boolean(),
      }),
    )
    .min(1)
    .max(20),
  notes: z.string().max(30000),
  scores: z.array(z.number().min(0).max(5)).length(3),
  state: z.enum(["Nháp", "Đã duyệt"]),
  summary: z.union([summaryOutput, z.null()]),
});
app.put("/api/interviews/:id", (req, res) => {
  const i = get("interviews", req.params.id);
  if (!i) fail("Không tìm thấy cuộc phỏng vấn.", 404);
  applicationFor(req.user, i.applicationId, true);
  const data = body(interviewSchema, req);
  const inputsChanged =
    JSON.stringify(i.questions) !== JSON.stringify(data.questions) ||
    i.notes !== data.notes;
  const updated = put("interviews", {
    ...i,
    ...data,
    summary: inputsChanged ? null : data.summary,
    state: inputsChanged ? "Nháp" : data.state,
    updatedAt: now(),
  });
  audit(
    req.user,
    data.state === "Đã duyệt" && !inputsChanged
      ? "Duyệt phỏng vấn"
      : "Lưu phỏng vấn",
    i.id,
  );
  res.json(updated);
});
app.post("/api/ai", (req, res) => {
  if (!aiConfigured())
    fail("AI chưa được cấu hình. Vui lòng dùng chế độ thủ công.", 503);
  const data = body(
    z.object({
      kind: z.enum(["evaluate", "profile", "post", "questions", "summary"]),
      jobId: z.string(),
      applicationId: z.string().optional(),
      interviewId: z.string().optional(),
      channel: z.enum(["Website", "Facebook", "LinkedIn"]).optional(),
      tone: z.enum(["Chuyên nghiệp", "Thân thiện", "Ngắn gọn"]).optional(),
      draft: z.string().max(30000).optional(),
    }),
    req,
  );
  const j = jobFor(req.user, data.jobId, true);
  if (data.kind !== "post") {
    const a = applicationFor(req.user, data.applicationId, true);
    if (a.jobId !== j.id) fail("Hồ sơ không thuộc vị trí.");
    const r = get("resumes", a.resumeId);
    if (data.kind !== "profile" && !r.confirmed)
      fail("Hãy xác nhận nội dung CV trước.");
    if (data.kind === "profile" && (r.status !== "done" || !r.text))
      fail("Hãy hoàn tất trích xuất hoặc nhập nội dung CV trước.");
    if (["questions", "summary"].includes(data.kind)) {
      const i = get("interviews", data.interviewId);
      if (!i || i.applicationId !== a.id) fail("Cuộc phỏng vấn không hợp lệ.");
    }
  }
  res.status(202).json(queue(req.user, data.kind, j.id, data));
});
app.post("/api/tasks/:id/retry", (req, res) => {
  const t = get("tasks", req.params.id);
  if (!t) fail("Không tìm thấy tác vụ.", 404);
  jobFor(req.user, t.jobId, true);
  if (t.state !== "failed") fail("Tác vụ chưa thất bại.");
  if (t.kind !== "extract" && !aiConfigured())
    fail("AI chưa được cấu hình.", 503);
  if (t.kind === "extract") {
    const r = get("resumes", t.data.resumeId);
    if (!r?.file) fail("CV đã bị xóa hoặc không có file.");
    put("resumes", { ...r, status: "queued", error: null });
  }
  res.status(202).json(queue(req.user, t.kind, t.jobId, t.data));
});
app.post("/api/users", (req, res) => {
  admin(req);
  const d = body(
    z.object({
      name: z.string().trim().min(2).max(100),
      email: z.email(),
      password: z.string().min(12).max(200),
      role: z.enum(["Admin", "Recruiter", "Hiring Manager"]),
    }),
    req,
  );
  if (all("users").some((u) => u.email === d.email.toLowerCase()))
    fail("Email đã tồn tại.");
  const u = put("users", {
    id: id(),
    name: d.name,
    email: d.email.toLowerCase(),
    passwordHash: hashPassword(d.password),
    role: d.role,
    active: true,
  });
  audit(req.user, "Tạo người dùng", u.id);
  res.status(201).json(publicUser(u));
});
app.patch("/api/users/:id", (req, res) => {
  admin(req);
  const u = get("users", req.params.id);
  if (!u) fail("Không tìm thấy người dùng.", 404);
  const data = body(
    z.object({
      role: z.enum(["Admin", "Recruiter", "Hiring Manager"]),
      active: z.boolean(),
    }),
    req,
  );
  if (u.id === req.user.id && (data.role !== "Admin" || !data.active))
    fail("Không thể tự thu hồi quyền Admin.");
  put("users", { ...u, ...data });
  audit(req.user, "Cập nhật người dùng", u.id);
  res.json({ ok: true });
});
app.post("/api/password", (req, res) => {
  const { currentPassword, newPassword } = body(
    z.object({
      currentPassword: z.string().max(200),
      newPassword: z.string().min(12).max(200),
    }),
    req,
  );
  if (!verifyPassword(currentPassword, req.user.passwordHash))
    fail("Mật khẩu hiện tại không đúng.");
  put("users", { ...req.user, passwordHash: hashPassword(newPassword) });
  res.json({ ok: true });
});
app.put("/api/settings", (req, res) => {
  admin(req);
  const { retentionDays } = body(
    z.object({ retentionDays: z.number().int().min(1).max(3650) }),
    req,
  );
  put("settings", { id: "main", retentionDays });
  audit(req.user, "Cập nhật thời hạn lưu trữ", "settings");
  res.json({ ok: true });
});
app.get("/api/audit", (req, res) => {
  admin(req);
  res.json(
    all("audit")
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, 100),
  );
});
async function eraseCandidate(candidateId, user) {
  const applications = all("applications").filter(
    (a) => a.candidateId === candidateId,
  );
  const ids = new Set(applications.map((a) => a.id));
  for (const t of all("tasks").filter(
    (t) =>
      ids.has(t.data.applicationId) ||
      all("resumes").some(
        (r) => r.candidateId === candidateId && r.id === t.data.resumeId,
      ),
  )) {
    controllers.get(t.id)?.abort();
    del("tasks", t.id);
  }
  for (const r of all("resumes").filter((r) => r.candidateId === candidateId)) {
    if (r.file) await unlink(r.file.path).catch(() => {});
    del("resumes", r.id);
  }
  for (const type of ["evaluations", "interviews", "comments"])
    for (const v of all(type).filter((v) => ids.has(v.applicationId)))
      del(type, v.id);
  for (const a of applications) del("applications", a.id);
  del("candidates", candidateId);
  if (user) audit(user, "Xóa dữ liệu ứng viên", candidateId);
}
app.delete("/api/candidates/:id", async (req, res) => {
  admin(req);
  if (!get("candidates", req.params.id)) fail("Không tìm thấy ứng viên.", 404);
  await eraseCandidate(req.params.id, req.user);
  res.json({ ok: true, deleted: true });
});
async function purge() {
  const cutoff = Date.now() - get("settings", "main").retentionDays * 86400000;
  let count = 0;
  for (const c of all("candidates")) {
    const applications = all("applications").filter(
      (a) => a.candidateId === c.id,
    );
    if (
      new Date(c.createdAt).getTime() < cutoff &&
      applications.every((a) => new Date(a.createdAt).getTime() < cutoff)
    ) {
      await eraseCandidate(c.id, { id: "system", name: "Hệ thống" });
      count++;
    }
  }
  return count;
}
app.post("/api/purge", async (req, res) => {
  admin(req);
  res.json({ count: await purge() });
});
setInterval(
  () =>
    purge().catch(() => console.error("Không hoàn tất tác vụ hết hạn dữ liệu")),
  3600000,
).unref();
const controllers = new Map();
let processing = false;
function queue(user, kind, jobId, data) {
  const existing = all("tasks").find(
    (t) =>
      t.kind === kind &&
      t.jobId === jobId &&
      JSON.stringify(t.data) === JSON.stringify(data) &&
      ["queued", "running"].includes(t.state),
  );
  if (existing) return existing;
  const t = put("tasks", {
    id: id(),
    kind,
    jobId,
    data,
    userId: user.id,
    state: "queued",
    progress: 0,
    attempts: 0,
    error: null,
    at: now(),
  });
  setImmediate(work);
  return t;
}
async function runTask(t, signal) {
  const j = get("jobs", t.jobId);
  const user = get("users", t.userId);
  if (!canEdit(user, j)) throw new Error("Quyền truy cập đã thay đổi.");
  if (t.kind === "extract") {
    const r = get("resumes", t.data.resumeId);
    if (!r?.file) throw new Error("Không tìm thấy CV.");
    put("resumes", { ...r, status: "running" });
    const text = await extractFile(r.file, signal, (progress) => {
      const task = get("tasks", t.id);
      if (task) put("tasks", { ...task, progress });
    });
    signal.throwIfAborted();
    if (!get("resumes", r.id)) return;
    if (!canEdit(get("users", t.userId), get("jobs", t.jobId)))
      throw new Error("Quyền truy cập đã thay đổi.");
    if (get("resumes", r.id).version !== r.version)
      throw new Error("CV đã thay đổi trong lúc trích xuất. Hãy thử lại.");
    put("resumes", {
      ...r,
      text,
      status: "done",
      error: null,
      confirmed: false,
      version: r.version + (r.text && r.text !== text ? 1 : 0),
    });
    const c = get("candidates", r.candidateId);
    if (c) put("candidates", { ...c, ...extractProfile(text, c) });
    return;
  }
  if (t.kind === "post") {
    const result = await structured(
      "Viết bài tuyển dụng từ job, đúng channel và tone. Nếu có draft, viết lại theo channel và tone. Thông tin trong job là căn cứ chính; không giữ chi tiết trong draft mâu thuẫn với job. Không thêm quyền lợi, mức lương hoặc thông tin doanh nghiệp chưa có. Trả warnings nếu dữ liệu thiếu/mâu thuẫn.",
      {
        job: j,
        channel: t.data.channel || "Website",
        tone: t.data.tone || "Chuyên nghiệp",
        draft: t.data.draft || "",
      },
      postOutput,
      signal,
    );
    signal.throwIfAborted();
    const current = get("jobs", j.id);
    if (!canEdit(get("users", t.userId), current))
      throw new Error("Quyền truy cập đã thay đổi.");
    if (JSON.stringify(j) !== JSON.stringify(current))
      throw new Error("Thông tin vị trí đã thay đổi. Hãy tạo lại bài.");
    return { result: { ...result, source: "ai" } };
  }
  const a = get("applications", t.data.applicationId);
  if (!a || a.jobId !== j.id) throw new Error("Hồ sơ đã bị xóa.");
  const r = get("resumes", a.resumeId);
  if (!r || (t.kind !== "profile" && !r.confirmed))
    throw new Error("CV chưa được xác nhận.");
  const check = () => {
    signal.throwIfAborted();
    const current = get("applications", a.id),
      job = get("jobs", j.id),
      resume = get("resumes", r.id);
    if (!current || !resume || !canEdit(get("users", t.userId), job))
      throw new Error("Hồ sơ hoặc quyền truy cập đã thay đổi.");
    if (
      job.rubricVersion !== j.rubricVersion ||
      resume.version !== r.version ||
      resume.confirmed !== r.confirmed
    )
      throw new Error("CV hoặc tiêu chí đã thay đổi. Hãy chạy lại.");
    return current;
  };
  if (t.kind === "profile") {
    const candidate = get("candidates", a.candidateId);
    const result = await structured(
      "Trích thông tin ứng viên từ cv. Các trường chỉ chứa thông tin có trong nguồn, giữ nguyên văn khi có thể. Nếu thiếu, trả chuỗi rỗng; nếu thiếu tên trả Chưa xác định. Không suy đoán kỹ năng, kinh nghiệm hoặc thành tích.",
      { cv: r.text },
      profileSchema,
      signal,
    );
    check();
    if (
      JSON.stringify(candidate) !==
      JSON.stringify(get("candidates", a.candidateId))
    )
      throw new Error(
        "HR đã chỉnh thông tin ứng viên. Hãy làm mới trước khi trích xuất lại.",
      );
    put("candidates", { ...candidate, ...result });
    put("resumes", {
      ...r,
      confirmed: false,
      profileSource: "ai",
      profileModel: process.env.OPENAI_MODEL,
      profilePromptVersion: "profile-v1",
    });
    audit(user, "AI trích thông tin CV", a.id);
    return;
  }
  if (t.kind === "evaluate") {
    const result = await evaluate(j, r, signal);
    const current = check();
    if (current.evaluationId !== a.evaluationId)
      throw new Error(
        "HR đã cập nhật điểm trong lúc AI chạy. Hãy kiểm tra kết quả mới.",
      );
    const e = put("evaluations", {
      ...result,
      id: id(),
      applicationId: a.id,
      rubricVersion: j.rubricVersion,
      resumeVersion: r.version,
      weights: j.weights,
      score: totalScore(
        result.criteria.map((c) => c.score),
        j.weights,
      ),
      source: "ai",
      model: process.env.OPENAI_MODEL,
      promptVersion: "cv-v1",
      previousEvaluationId: a.evaluationId || null,
      at: now(),
    });
    put("applications", {
      ...current,
      evaluationId: e.id,
      status: current.status === "Mới" ? "Đã đánh giá CV" : current.status,
    });
    audit(user, "AI đánh giá CV", a.id);
    return;
  }
  const i = get("interviews", t.data.interviewId);
  if (!i || i.applicationId !== a.id) throw new Error("Phỏng vấn đã bị xóa.");
  let result;
  if (t.kind === "questions")
    result = await structured(
      "Tạo 5–8 câu hỏi cho phone interview 15–30 phút dựa vào JD, CV và thông tin cần xác minh. Chỉ đặt câu hỏi liên quan công việc.",
      { job: j, cv: r.text, evaluation: get("evaluations", a.evaluationId) },
      interviewOutput,
      signal,
    );
  else
    result = await structured(
      "Tóm tắt ghi chú phỏng vấn. answered chỉ chứa thông tin từ câu trả lời/ghi chú. inferences ghi rõ là suy luận. verify chứa điều cần xác minh. nextStep là đề xuất cho HR.",
      { questions: i.questions, notes: i.notes },
      summaryOutput,
      signal,
    );
  check();
  if (JSON.stringify(i) !== JSON.stringify(get("interviews", i.id)))
    throw new Error("Ghi chú đã thay đổi. Hãy chạy lại AI.");
  if (t.kind === "questions")
    put("interviews", {
      ...i,
      questions: [
        ...i.questions.filter((q) => q.answer || q.asked),
        ...result.questions.map((text) => ({ text, answer: "", asked: false })),
      ].slice(0, 20),
      state: "Nháp",
      summary: null,
    });
  else
    put("interviews", {
      ...i,
      summary: result,
      state: "Nháp",
      summarySource: "ai",
      model: process.env.OPENAI_MODEL,
      promptVersion: "interview-v1",
    });
}
async function work() {
  if (processing) return;
  processing = true;
  try {
    let t;
    while ((t = all("tasks").find((t) => t.state === "queued"))) {
      const controller = new AbortController();
      controllers.set(t.id, controller);
      const timer = setTimeout(
        () => controller.abort(new Error("Tác vụ quá thời gian. Hãy thử lại.")),
        180000,
      );
      put("tasks", {
        ...t,
        state: "running",
        attempts: t.attempts + 1,
        progress: 5,
      });
      try {
        const result = await runTask(t, controller.signal);
        const current = get("tasks", t.id);
        if (current)
          put("tasks", {
            ...current,
            ...result,
            state: "done",
            progress: 100,
            error: null,
            finishedAt: now(),
          });
      } catch (e) {
        const current = get("tasks", t.id);
        if (!current) continue;
        const retry = e.retryable && current.attempts < 2;
        put("tasks", {
          ...current,
          state: retry ? "queued" : "failed",
          error: e.message || "Không hoàn thành tác vụ.",
          finishedAt: now(),
        });
        if (t.kind === "extract") {
          const r = get("resumes", t.data.resumeId);
          if (r) put("resumes", { ...r, status: "failed", error: e.message });
        }
      } finally {
        clearTimeout(timer);
        controllers.delete(t.id);
      }
    }
  } finally {
    processing = false;
  }
}
for (const t of all("tasks").filter((t) => t.state === "running")) {
  put("tasks", {
    ...t,
    state: "failed",
    error: "Server khởi động lại. Hãy thử lại tác vụ.",
  });
  if (t.kind === "extract") {
    const r = get("resumes", t.data.resumeId);
    if (r)
      put("resumes", {
        ...r,
        status: "failed",
        error: "Server khởi động lại. Hãy thử lại.",
      });
  }
}
setImmediate(work);
const dist = path.resolve("dist");
if (existsSync(dist)) {
  app.use(express.static(dist));
  app.get("/{*path}", (req, res, next) =>
    req.path.startsWith("/api")
      ? next()
      : res.sendFile(path.join(dist, "index.html")),
  );
}
app.use("/api", (req, res) =>
  res.status(404).json({ error: "Không tìm thấy chức năng." }),
);
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status =
    error.status || (error instanceof multer.MulterError ? 400 : 500);
  res.status(status).json({
    error:
      error instanceof multer.MulterError
        ? "File tối đa 10 MB, mỗi lần tối đa 10 CV."
        : status === 500
          ? "Không hoàn tất thao tác. Vui lòng thử lại."
          : error.message,
  });
});
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  app.listen(Number(process.env.PORT) || 3001, "127.0.0.1", () =>
    console.log(`TalentFlow API: http://localhost:${process.env.PORT || 3001}`),
  );
}
