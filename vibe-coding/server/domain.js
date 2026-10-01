import { z } from "zod";
export const statuses = [
  "Mới",
  "Đã đánh giá CV",
  "Shortlist",
  "Phone interview",
  "Phỏng vấn chuyên môn",
  "Offer",
  "Đã tuyển",
  "Từ chối",
];
export const criteria = [
  "Kỹ năng chuyên môn",
  "Kinh nghiệm liên quan",
  "Dự án và thành tích",
  "Học vấn, chứng chỉ",
  "Yêu cầu khác",
];
export const defaultWeights = [35, 30, 20, 10, 5];
export const text = z.string().trim().max(50000);
export const jobSchema = z.object({
  title: text.min(2).max(150),
  department: text.max(100),
  level: text.max(100),
  headcount: z.number().int().min(1).max(10000),
  location: text.max(150),
  mode: text.max(50),
  contract: text.max(50),
  salary: text.max(100),
  description: text.min(10),
  benefits: text,
  required: text,
  preferred: text,
  deadline: text.max(30),
  weights: z
    .array(z.number().min(0).max(100))
    .length(5)
    .refine(
      (w) => Math.abs(w.reduce((a, b) => a + b, 0) - 100) < 0.001,
      "Tổng trọng số phải bằng 100%",
    ),
});
export const profileSchema = z.object({
  name: text.min(2).max(150),
  email: z.union([z.email(), z.literal("")]),
  phone: text.max(50),
  skills: text,
  experience: text,
  education: text,
  projects: text,
  certificates: text,
});
export const criterionSchema = z.object({
  score: z.number().min(0).max(100),
  evidence: text,
  explanation: text,
  source: text.max(200),
});
export const evaluationSchema = z.object({
  criteria: z.array(criterionSchema).length(5),
  mandatory: z.array(
    z.object({
      requirement: text,
      status: z.enum(["Đáp ứng", "Chưa đáp ứng", "Chưa đủ thông tin"]),
      evidence: text,
    }),
  ),
  strengths: z.array(text),
  gaps: z.array(text),
  verify: z.array(text),
  questions: z.array(text),
  recommendation: text,
  coverage: z.number().min(0).max(100),
});
export function totalScore(scores, weights) {
  if (
    scores.length !== 5 ||
    weights.length !== 5 ||
    scores.some((s) => !Number.isFinite(s) || s < 0 || s > 100) ||
    weights.some((w) => !Number.isFinite(w) || w < 0) ||
    Math.abs(weights.reduce((a, b) => a + b, 0) - 100) > 0.001
  )
    throw new Error("Điểm hoặc trọng số không hợp lệ");
  return (
    Math.round(scores.reduce((a, s, i) => a + (s * weights[i]) / 100, 0) * 10) /
    10
  );
}
export function canAccess(user, job) {
  return (
    user?.active &&
    job &&
    (user.role === "Admin" || job.members.includes(user.id))
  );
}
export function canEdit(user, job) {
  return canAccess(user, job) && user.role !== "Hiring Manager";
}
export function evidenceCheck(result, source) {
  for (const c of result.criteria) {
    if (c.evidence && !source.includes(c.evidence))
      throw new Error(
        "AI trả bằng chứng không khớp nội dung CV. Vui lòng thử lại hoặc chấm thủ công.",
      );
    if (!c.evidence && c.score !== 0)
      throw new Error(
        "Điểm không có bằng chứng. Vui lòng chấm thủ công hoặc thử lại.",
      );
  }
  for (const r of result.mandatory) {
    if (r.evidence && !source.includes(r.evidence))
      throw new Error("Bằng chứng yêu cầu bắt buộc không khớp CV.");
    if (!r.evidence && r.status !== "Chưa đủ thông tin")
      throw new Error("Yêu cầu bắt buộc thiếu bằng chứng.");
  }
  return result;
}
export function isCurrent(evaluation, job, resume) {
  return (
    !!evaluation &&
    resume.confirmed &&
    evaluation.rubricVersion === job.rubricVersion &&
    evaluation.resumeVersion === resume.version
  );
}
