import { DatabaseSync } from "node:sqlite";
import { mkdirSync, chmodSync } from "node:fs";
import path from "node:path";
import {
  randomUUID,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { defaultWeights, totalScore, criteria } from "./domain.js";
export const dataDir = path.resolve(process.env.DATA_DIR || ".data");
mkdirSync(dataDir, { recursive: true, mode: 0o700 });
chmodSync(dataDir, 0o700);
export const uploadDir = path.join(dataDir, "resumes");
mkdirSync(uploadDir, { recursive: true, mode: 0o700 });
const db = new DatabaseSync(path.join(dataDir, "talentflow.sqlite"));
chmodSync(path.join(dataDir, "talentflow.sqlite"), 0o600);
db.exec(
  "PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS entities (type TEXT NOT NULL,id TEXT NOT NULL,data TEXT NOT NULL,PRIMARY KEY(type,id)); CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,userId TEXT NOT NULL,expires INTEGER NOT NULL);",
);
export const all = (type) =>
  db
    .prepare("SELECT data FROM entities WHERE type=?")
    .all(type)
    .map((r) => JSON.parse(r.data));
export const get = (type, id) => {
  if (!id) return null;
  const r = db
    .prepare("SELECT data FROM entities WHERE type=? AND id=?")
    .get(type, id);
  return r ? JSON.parse(r.data) : null;
};
export function put(type, value) {
  db.prepare(
    "INSERT INTO entities(type,id,data) VALUES(?,?,?) ON CONFLICT(type,id) DO UPDATE SET data=excluded.data",
  ).run(type, value.id, JSON.stringify(value));
  return value;
}
export const del = (type, id) =>
  db.prepare("DELETE FROM entities WHERE type=? AND id=?").run(type, id);
export function transaction(fn) {
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = fn();
    db.exec("COMMIT");
    return result;
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}
export const id = () => randomUUID();
export const now = () => new Date().toISOString();
export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  return salt + ":" + scryptSync(password, salt, 64).toString("hex");
}
export function verifyPassword(password, hash) {
  const [salt, h] = hash.split(":");
  const actual = scryptSync(password, salt, 64);
  return timingSafeEqual(actual, Buffer.from(h, "hex"));
}
export const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  active: u.active,
});
export function session(userId) {
  const token = randomBytes(32).toString("hex");
  db.prepare("INSERT INTO sessions VALUES(?,?,?)").run(
    token,
    userId,
    Date.now() + 8 * 3600000,
  );
  return token;
}
export function sessionUser(token) {
  const s = db
    .prepare("SELECT * FROM sessions WHERE token=? AND expires>?")
    .get(token, Date.now());
  return s ? get("users", s.userId) : null;
}
export const logout = (token) =>
  db.prepare("DELETE FROM sessions WHERE token=?").run(token);
export const audit = (user, action, target) =>
  put("audit", {
    id: id(),
    userId: user.id,
    actor: user.name,
    action,
    target,
    at: now(),
  });
if (!all("settings").length)
  put("settings", { id: "main", retentionDays: 365 });
if (!all("users").length) {
  const demo = process.env.SEED_DEMO !== "false";
  const password =
    process.env.BOOTSTRAP_PASSWORD ||
    (demo ? "TalentFlow@demo2026" : randomBytes(18).toString("base64url"));
  if (password.length < 12)
    throw new Error("BOOTSTRAP_PASSWORD phải có ít nhất 12 ký tự");
  const users = [
    {
      id: "admin",
      name: "Minh Anh",
      email: "admin@talentflow.local",
      role: "Admin",
    },
    {
      id: "recruiter",
      name: "Hoàng Linh",
      email: "hr@talentflow.local",
      role: "Recruiter",
    },
    {
      id: "manager",
      name: "Đức Huy",
      email: "manager@talentflow.local",
      role: "Hiring Manager",
    },
  ];
  for (const u of demo ? users : users.slice(0, 1))
    put("users", { ...u, active: true, passwordHash: hashPassword(password) });
  console.log(
    `Tài khoản khởi tạo: admin@talentflow.local / ${password}${demo ? " (dữ liệu DEMO, chỉ dùng cục bộ)" : ""}`,
  );
  if (demo) seed();
}
function seed() {
  const titles = [
    "Senior Frontend Developer",
    "Product Designer",
    "Backend Engineer",
    "Talent Acquisition Specialist",
  ];
  const depts = ["Engineering", "Design", "Engineering", "People & Culture"];
  for (let i = 0; i < 4; i++) {
    const j = {
      id: "job-" + (i + 1),
      title: titles[i],
      department: depts[i],
      level: i === 0 ? "Senior" : "Middle",
      headcount: 2,
      location: "TP. Hồ Chí Minh",
      mode: i === 3 ? "Tại văn phòng" : "Hybrid",
      contract: "Toàn thời gian",
      salary: i === 0 ? "35–50 triệu VNĐ" : "Thỏa thuận",
      description:
        i === 0
          ? "Xây dựng sản phẩm web bằng React và TypeScript; phối hợp với đội thiết kế và backend. Tối ưu hiệu năng và trải nghiệm người dùng."
          : i === 1
            ? "Thiết kế trải nghiệm và giao diện sản phẩm; nghiên cứu người dùng và xây dựng design system."
            : i === 2
              ? "Xây dựng API Node.js, thiết kế dữ liệu PostgreSQL và vận hành dịch vụ."
              : "Tìm kiếm ứng viên, quản lý tuyển dụng và phối hợp với các phòng ban.",
      benefits: "Bảo hiểm theo quy định; ngân sách học tập; 15 ngày phép.",
      required:
        i === 0
          ? "React\nTypeScript\nKinh nghiệm phát triển ứng dụng web"
          : i === 1
            ? "Figma\nPortfolio thiết kế sản phẩm"
            : i === 2
              ? "Node.js\nPostgreSQL"
              : "Kinh nghiệm tuyển dụng",
      preferred:
        i === 0 ? "Next.js, testing, accessibility" : "Khả năng phối hợp nhóm",
      deadline: "2026-11-30",
      weights: defaultWeights,
      rubricVersion: 1,
      members: i === 0 ? ["recruiter", "manager"] : ["recruiter"],
      state: "Đang tuyển",
      demo: true,
      createdAt: now(),
    };
    put("jobs", j);
    put("rubrics", {
      id: j.id + ":1",
      jobId: j.id,
      version: 1,
      weights: j.weights,
      required: j.required,
      description: j.description,
      at: now(),
    });
    const content = `${j.title}\n${j.location} · ${j.mode}\n\nMÔ TẢ CÔNG VIỆC\n${j.description}\n\nYÊU CẦU\n${j.required}\n\nQUYỀN LỢI\n${j.benefits}\nLương: ${j.salary}`;
    put("posts", {
      id: "post-" + j.id,
      jobId: j.id,
      content,
      channel: "Website",
      tone: "Chuyên nghiệp",
      version: 1,
      source: "demo",
      at: now(),
    });
  }
  const names = [
    "Nguyễn Minh Khang",
    "Trần Ngọc Anh",
    "Lê Hoàng Nam",
    "Phạm Thảo Vy",
    "Đỗ Gia Huy",
    "Vũ Hải Yến",
    "Bùi Tuấn Kiệt",
    "Mai Khánh Linh",
  ];
  const scores = [
    [95, 90, 92, 85, 80],
    [90, 88, 87, 90, 80],
    [85, 83, 80, 82, 75],
    [80, 78, 85, 85, 70],
    [75, 72, 78, 80, 65],
    [92, 88, 90, 85, 80],
    [86, 82, 85, 80, 75],
    [78, 75, 80, 80, 70],
  ];
  names.forEach((name, i) => {
    const jobId = "job-" + (i < 5 ? 1 : i === 5 ? 2 : i === 6 ? 3 : 4);
    const j = get("jobs", jobId);
    const skills =
      i < 5
        ? "React, TypeScript, Next.js, CSS, Git"
        : i === 5
          ? "Figma, UX research, Design system"
          : i === 6
            ? "Node.js, PostgreSQL, Docker"
            : "Sourcing, phỏng vấn, ATS";
    const profile = {
      name,
      email: `candidate${i + 1}@example.com`,
      phone: "09000000" + String(i + 10),
      skills,
      experience: `${i < 2 ? 5 : 3} năm kinh nghiệm liên quan. Phối hợp với nhóm sản phẩm để triển khai tính năng.`,
      education: "Cử nhân — dữ liệu tổng hợp",
      projects:
        "Xây dựng sản phẩm với 10.000 người dùng; cải thiện tốc độ tải trang 25%.",
      certificates: "Chưa cung cấp",
    };
    const cv = `CV TỔNG HỢP — DEMO\n${name}\n${profile.email}\n${profile.phone}\n\nKỹ năng: ${skills}\nKinh nghiệm: ${profile.experience}\nHọc vấn: ${profile.education}\nDự án: ${profile.projects}`;
    put("candidates", {
      id: "candidate-" + i,
      ...profile,
      demo: true,
      createdAt: now(),
    });
    put("resumes", {
      id: "resume-" + i,
      candidateId: "candidate-" + i,
      text: cv,
      version: 1,
      confirmed: true,
      file: null,
      status: "done",
      demo: true,
      at: now(),
    });
    const appId = "app-" + i;
    const ev = {
      id: "eval-" + i,
      applicationId: appId,
      rubricVersion: 1,
      resumeVersion: 1,
      weights: j.weights,
      criteria: scores[i].map((score, k) => ({
        score,
        evidence:
          k === 0
            ? skills
            : k === 1
              ? profile.experience
              : k === 2
                ? profile.projects
                : k === 3
                  ? profile.education
                  : skills,
        source: "CV tổng hợp",
        explanation:
          "Điểm mẫu để trải nghiệm giao diện, không phải kết quả AI.",
      })),
      mandatory: j.required
        .split("\n")
        .map((requirement) => ({
          requirement,
          status: "Chưa đủ thông tin",
          evidence: "",
        })),
      strengths: [
        "Kinh nghiệm triển khai sản phẩm thực tế",
        "Kỹ năng phù hợp với vị trí",
      ],
      gaps: ["Cần xác minh phạm vi trách nhiệm cá nhân"],
      verify: ["Xác minh kết quả dự án và mức độ sử dụng từng kỹ năng"],
      questions: [
        "Bạn đóng vai trò gì trong dự án gần nhất?",
        "Bạn đã đo kết quả cải thiện hiệu năng như thế nào?",
      ],
      recommendation: "HR xác minh thông tin qua phone interview.",
      coverage: 80,
      source: "demo",
      model: "demo",
      promptVersion: "demo-v1",
      at: now(),
      score: totalScore(scores[i], j.weights),
    };
    put("evaluations", ev);
    put("applications", {
      id: appId,
      candidateId: "candidate-" + i,
      resumeId: "resume-" + i,
      jobId,
      status:
        i === 0 ? "Phone interview" : i === 1 ? "Shortlist" : "Đã đánh giá CV",
      evaluationId: ev.id,
      createdAt: now(),
    });
  });
  put("interviews", {
    id: "interview-0",
    applicationId: "app-0",
    scheduledAt: "2026-10-02T03:00:00.000Z",
    duration: 20,
    questions: [
      {
        text: "Bạn đóng vai trò gì trong dự án gần nhất?",
        answer: "",
        asked: false,
      },
      {
        text: "Bạn đã tối ưu hiệu năng React như thế nào?",
        answer: "",
        asked: false,
      },
      {
        text: "Kỳ vọng lương và thời gian có thể nhận việc?",
        answer: "",
        asked: false,
      },
    ],
    notes: "",
    scores: [0, 0, 0],
    summary: null,
    state: "Nháp",
    at: now(),
  });
}
