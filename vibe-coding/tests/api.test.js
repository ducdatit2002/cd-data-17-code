import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import http from "node:http";
import AdmZip from "adm-zip";
let base, server, provider, dir;
let aiMode = "success",
  calls = 0;
const sessions = {};
const cv =
  "Nguyen Test\ntest@example.com\nReact TypeScript\n5 years of engineering experience\nBuilt web products with a team.";
const jobData = {
  title: "Frontend Integration Test",
  department: "Engineering",
  level: "Senior",
  headcount: 1,
  location: "TP.HCM",
  mode: "Remote",
  contract: "Full-time",
  salary: "30–40 triệu",
  description: "Build React applications with TypeScript.",
  benefits: "Learning budget",
  required: "React",
  preferred: "Testing",
  deadline: "2026-11-30",
  weights: [35, 30, 20, 10, 5],
};
const evaluation = {
  criteria: Array.from({ length: 5 }, () => ({
    score: 80,
    evidence: "React TypeScript",
    explanation: "Evidence in CV",
    source: "Đoạn 3",
  })),
  mandatory: [
    { requirement: "React", status: "Đáp ứng", evidence: "React TypeScript" },
  ],
  strengths: ["React"],
  gaps: ["Verify project scope"],
  verify: ["Project results"],
  questions: ["Describe your last project?"],
  recommendation: "HR verifies experience",
  coverage: 80,
};
async function request(
  url,
  method = "GET",
  body,
  role = "admin",
  headers = {},
) {
  const r = await fetch(base + "/api" + url, {
    method,
    headers: {
      ...(body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(sessions[role] ? { Cookie: sessions[role] } : {}),
      ...headers,
    },
    body: body
      ? body instanceof FormData
        ? body
        : JSON.stringify(body)
      : undefined,
  });
  let data;
  try {
    data = await r.json();
  } catch {
    data = null;
  }
  return { status: r.status, data, headers: r.headers };
}
async function waitTask(id) {
  for (let i = 0; i < 100; i++) {
    const { data } = await request("/state");
    const t = data.tasks.find((t) => t.id === id);
    if (t?.state === "done" || t?.state === "failed") return t;
    await new Promise((r) => setTimeout(r, 30));
  }
  throw new Error("task timeout");
}
before(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "talentflow-test-"));
  process.env.DATA_DIR = dir;
  process.env.SEED_DEMO = "true";
  process.env.OPENAI_API_KEY = "test-placeholder";
  process.env.OPENAI_MODEL = "mock-structured-model";
  provider = http.createServer(async (req, res) => {
    calls++;
    let content = "";
    for await (const chunk of req) content += chunk;
    const body = JSON.parse(content);
    assert.equal(body.store, false);
    assert.equal(body.text.format.strict, true);
    assert.equal(body.tools, undefined);
    if (aiMode === "unavailable") {
      res.writeHead(503).end("{}");
      return;
    }
    let result = structuredClone(evaluation);
    if (aiMode === "hallucination")
      result.criteria[0].evidence = "invented proof";
    if (aiMode === "injection") result.mandatory = [];
    const props = body.text.format.schema.properties;
    if (props.content)
      result = {
        content: "Bài tuyển dụng AI để HR kiểm duyệt",
        warnings: ["Xác minh thông tin liên hệ trước khi đăng."],
      };
    else if (props.name)
      result = {
        name: "Nguyen Test",
        email: "test@example.com",
        phone: "",
        skills: "React TypeScript",
        experience: "5 years of engineering experience",
        education: "",
        projects: "Built web products with a team.",
        certificates: "",
      };
    else if (props.answered)
      result = {
        answered: ["Ứng viên có kinh nghiệm React."],
        inferences: ["Có thể phù hợp; cần kiểm chứng."],
        verify: ["Kết quả dự án"],
        nextStep: "HR xác minh dự án.",
      };
    else if (!props.criteria && props.questions)
      result = {
        questions: ["Vai trò trong dự án?", "Kỹ năng React?", "Kỳ vọng lương?"],
      };
    if (aiMode === "slow")
      await new Promise((resolve) => setTimeout(resolve, 150));
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        status: "completed",
        output: [
          { content: [{ type: "output_text", text: JSON.stringify(result) }] },
        ],
      }),
    );
  });
  await new Promise((r) => provider.listen(0, "127.0.0.1", r));
  process.env.AI_BASE_URL = `http://127.0.0.1:${provider.address().port}`;
  const { app } = await import("../server/index.js");
  server = app.listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  base = `http://127.0.0.1:${server.address().port}`;
  for (const [role, email] of [
    ["admin", "admin"],
    ["hr", "hr"],
    ["manager", "manager"],
  ]) {
    const r = await request(
      "/login",
      "POST",
      { email: email + "@talentflow.local", password: "TalentFlow@demo2026" },
      "none",
    );
    assert.equal(r.status, 200);
    sessions[role] = r.headers.get("set-cookie").split(";")[0];
  }
});
after(async () => {
  server.closeAllConnections();
  provider.closeAllConnections();
  await Promise.all([
    new Promise((r) => server.close(r)),
    new Promise((r) => provider.close(r)),
  ]);
  await rm(dir, { recursive: true, force: true });
});
let job, application, interview;
test("unauthenticated and cross-origin writes are denied", async () => {
  assert.equal((await request("/state", "GET", null, "none")).status, 401);
  assert.equal(
    (
      await request("/jobs", "POST", jobData, "admin", {
        Origin: "https://evil.example",
      })
    ).status,
    403,
  );
});
test("manager only reads assigned job and cannot access unrelated candidate/file/task", async () => {
  const state = (await request("/state", "GET", null, "manager")).data;
  assert.equal(state.jobs.length, 1);
  assert.equal(state.jobs[0].id, "job-1");
  assert.equal(
    (await request("/applications/app-5", "GET", null, "manager")).status,
    403,
  );
  assert.equal(
    (await request("/resumes/resume-5/file", "GET", null, "manager")).status,
    403,
  );
  assert.equal(
    (await request("/jobs", "POST", jobData, "manager")).status,
    403,
  );
  assert.equal(
    (
      await request(
        "/applications/app-0/status",
        "PATCH",
        { status: "Shortlist" },
        "manager",
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await request(
        "/applications/app-0/comments",
        "POST",
        { content: "Review from manager" },
        "manager",
      )
    ).status,
    201,
  );
});
test("create job, validate weights and save immutable post versions", async () => {
  assert.equal(
    (
      await request("/jobs", "POST", {
        ...jobData,
        weights: [100, 10, 0, 0, 0],
      })
    ).status,
    400,
  );
  const r = await request("/jobs", "POST", jobData);
  assert.equal(r.status, 201);
  job = r.data;
  assert.equal(
    (
      await request("/jobs/" + job.id + "/posts", "POST", {
        content: "Draft one",
        channel: "Website",
        tone: "Chuyên nghiệp",
      })
    ).data.version,
    1,
  );
  assert.equal(
    (
      await request("/jobs/" + job.id + "/posts", "POST", {
        content: "Draft two",
        channel: "LinkedIn",
        tone: "Thân thiện",
      })
    ).data.version,
    2,
  );
  assert.equal(
    (await request("/jobs/" + job.id, "PUT", jobData, "hr")).status,
    403,
  );
});
test("manual profile, evaluation formula, history and stale ranking", async () => {
  const r = await request("/jobs/" + job.id + "/candidates", "POST", {
    profile: {
      name: "Nguyen Test",
      email: "test@example.com",
      phone: "",
      skills: "React",
      experience: "5 years",
      education: "",
      projects: "Web apps",
      certificates: "",
    },
    text: cv,
  });
  assert.equal(r.status, 201);
  application = r.data;
  let e = await request(
    "/applications/" + application.id + "/evaluations",
    "POST",
    {
      ...evaluation,
      rubricVersion: job.rubricVersion,
      resumeVersion: 1,
      reason: "Confirmed source",
    },
  );
  assert.equal(e.status, 201);
  assert.equal(e.data.score, 80);
  const old = e.data.id;
  e = await request(
    "/applications/" + application.id + "/evaluations",
    "POST",
    {
      ...evaluation,
      criteria: evaluation.criteria.map((c) => ({ ...c, score: 90 })),
      rubricVersion: job.rubricVersion,
      resumeVersion: 1,
      reason: "Verified project scope",
    },
  );
  assert.equal(e.data.score, 90);
  assert.equal(e.data.previousEvaluationId, old);
  assert.equal(e.data.originalScore, 80);
  let detail = (await request("/applications/" + application.id)).data;
  assert.equal(detail.current, true);
  assert.equal(detail.evaluations.length, 2);
  const changed = await request("/jobs/" + job.id, "PUT", {
    ...jobData,
    weights: [40, 25, 20, 10, 5],
  });
  job = changed.data;
  assert.equal(job.rubricVersion, 2);
  detail = (await request("/applications/" + application.id)).data;
  assert.equal(detail.current, false);
  assert.equal(detail.evaluation.rubricVersion, 1);
  assert.equal(
    (
      await request(
        "/applications/" + application.id + "/evaluations",
        "POST",
        {
          ...evaluation,
          rubricVersion: 1,
          resumeVersion: 1,
          reason: "Stale rubric",
        },
      )
    ).status,
    409,
  );
});
test("AI pipeline validates evidence, never auto-rejects, and bounded retries retain data", async () => {
  aiMode = "success";
  let r = await request("/ai", "POST", {
    kind: "evaluate",
    jobId: job.id,
    applicationId: application.id,
  });
  assert.equal(r.status, 202);
  let t = await waitTask(r.data.id);
  assert.equal(t.state, "done");
  let detail = (await request("/applications/" + application.id)).data;
  assert.equal(detail.current, true);
  assert.equal(detail.evaluation.source, "ai");
  assert.equal(detail.status, "Đã đánh giá CV");
  const goodId = detail.evaluation.id;
  for (const mode of ["hallucination", "injection"]) {
    aiMode = mode;
    r = await request("/ai", "POST", {
      kind: "evaluate",
      jobId: job.id,
      applicationId: application.id,
    });
    t = await waitTask(r.data.id);
    assert.equal(t.state, "failed");
    assert.equal(
      (await request("/applications/" + application.id)).data.evaluation.id,
      goodId,
    );
  }
  aiMode = "unavailable";
  calls = 0;
  r = await request("/ai", "POST", {
    kind: "evaluate",
    jobId: job.id,
    applicationId: application.id,
  });
  t = await waitTask(r.data.id);
  assert.equal(t.state, "failed");
  assert.equal(t.attempts, 2);
  assert.equal(calls, 2);
  assert.equal(
    (await request("/applications/" + application.id)).data.evaluation.id,
    goodId,
  );
  aiMode = "success";
});
test("CV content change invalidates score, unconfirmed CV blocks AI", async () => {
  const detail = (await request("/applications/" + application.id)).data;
  const r = await request(
    "/applications/" + application.id + "/profile",
    "PUT",
    {
      profile: detail.candidate,
      text: cv + "\nNew project evidence",
      confirmed: false,
    },
  );
  assert.equal(r.status, 200);
  assert.equal(
    (await request("/applications/" + application.id)).data.current,
    false,
  );
  assert.equal(
    (
      await request("/ai", "POST", {
        kind: "evaluate",
        jobId: job.id,
        applicationId: application.id,
      })
    ).status,
    400,
  );
});
test("PDF/DOCX type validation, background extraction, duplicate detection and private files", async () => {
  let form = new FormData();
  form.append(
    "files",
    new Blob(["not a real PDF"], { type: "application/pdf" }),
    "bad.pdf",
  );
  let r = await request("/jobs/" + job.id + "/upload", "POST", form);
  assert.match(r.data.results[0].error, /PDF/);
  const zip = new AdmZip();
  zip.addFile(
    "[Content_Types].xml",
    Buffer.from(
      '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
    ),
  );
  zip.addFile(
    "word/document.xml",
    Buffer.from(
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Nguyen Upload test.upload@example.com React TypeScript five years experience</w:t></w:r></w:p></w:body></w:document>',
    ),
  );
  const bytes = zip.toBuffer();
  form = new FormData();
  form.append("files", new Blob([bytes]), "valid.docx");
  r = await request("/jobs/" + job.id + "/upload", "POST", form);
  const appId = r.data.results[0].applicationId;
  assert.ok(appId);
  let t = (await request("/state")).data.tasks.find(
    (t) => t.kind === "extract" && t.jobId === job.id,
  );
  t = await waitTask(t.id);
  assert.equal(t.state, "done", t.error);
  const detail = (await request("/applications/" + appId)).data;
  assert.match(detail.resume.text, /React/);
  assert.equal(detail.resume.confirmed, false);
  assert.equal(
    (
      await request(
        "/resumes/" + detail.resume.id + "/file",
        "GET",
        null,
        "manager",
      )
    ).status,
    403,
  );
  form = new FormData();
  form.append("files", new Blob([bytes]), "copy.docx");
  r = await request("/jobs/" + job.id + "/upload", "POST", form);
  assert.equal(r.data.results[0].duplicate, true);
  assert.ok((await readdir(path.join(dir, "resumes"))).length);
});
test("phone interview notes persist and approval stays under HR control", async () => {
  let r = await request(
    "/applications/" + application.id + "/interviews",
    "POST",
    { scheduledAt: "2026-10-03T03:00:00.000Z", duration: 20 },
  );
  assert.equal(r.status, 201);
  interview = r.data;
  const data = {
    scheduledAt: interview.scheduledAt,
    duration: 20,
    questions: interview.questions.map((q) => ({
      ...q,
      answer: "Confirmed five years",
      asked: true,
    })),
    notes: "Candidate confirms experience",
    scores: [4, 4, 3],
    summary: null,
    state: "Nháp",
  };
  r = await request("/interviews/" + interview.id, "PUT", data);
  assert.equal(r.status, 200);
  assert.equal(r.data.notes, data.notes);
  r = await request("/interviews/" + interview.id, "PUT", {
    ...data,
    state: "Đã duyệt",
  });
  assert.equal(r.data.state, "Đã duyệt");
  assert.equal(
    (await request("/interviews/" + interview.id, "PUT", data, "manager"))
      .status,
    403,
  );
});
test("applications for different jobs keep independent evaluation and status", async () => {
  const r = await request("/applications/" + application.id + "/link", "POST", {
    jobId: "job-2",
  });
  assert.equal(r.status, 201);
  assert.equal(r.data.status, "Mới");
  assert.equal(r.data.evaluationId, undefined);
  assert.equal(
    (await request("/applications/" + application.id)).data.status,
    "Phone interview",
  );
});
test("admin data deletion removes resumes, linked applications and interview records", async () => {
  assert.equal(
    (
      await request(
        "/candidates/" + application.candidateId,
        "DELETE",
        null,
        "hr",
      )
    ).status,
    403,
  );
  assert.equal(
    (await request("/candidates/" + application.candidateId, "DELETE")).status,
    200,
  );
  assert.equal((await request("/applications/" + application.id)).status, 404);
  const s = (await request("/state")).data;
  assert.equal(
    s.interviews.some((i) => i.id === interview.id),
    false,
  );
  assert.equal(
    s.applications.some((a) => a.candidateId === application.candidateId),
    false,
  );
});

test("AI post draft, profile extraction and interview summary complete with human review", async () => {
  aiMode = "success";
  let response = await request("/ai", "POST", {
    kind: "post",
    jobId: job.id,
    channel: "LinkedIn",
    tone: "Thân thiện",
    draft: "Existing draft",
  });
  let task = await waitTask(response.data.id);
  assert.equal(task.state, "done", task.error);
  assert.match(task.result.content, /AI/);
  const created = await request("/jobs/" + job.id + "/candidates", "POST", {
    profile: {
      name: "Nguyen Test",
      email: "test@example.com",
      phone: "",
      skills: "",
      experience: "",
      education: "",
      projects: "",
      certificates: "",
    },
    text: cv,
  });
  const a = created.data;
  response = await request("/ai", "POST", {
    kind: "profile",
    jobId: job.id,
    applicationId: a.id,
  });
  task = await waitTask(response.data.id);
  assert.equal(task.state, "done", task.error);
  let detail = (await request("/applications/" + a.id)).data;
  assert.equal(detail.candidate.skills, "React TypeScript");
  assert.equal(detail.resume.confirmed, false);
  await request("/applications/" + a.id + "/profile", "PUT", {
    profile: detail.candidate,
    text: cv,
    confirmed: true,
  });
  const scheduled = await request(
    "/applications/" + a.id + "/interviews",
    "POST",
    { scheduledAt: "2026-10-03T03:00:00.000Z", duration: 20 },
  );
  let i = scheduled.data;
  response = await request("/ai", "POST", {
    kind: "questions",
    jobId: job.id,
    applicationId: a.id,
    interviewId: i.id,
  });
  task = await waitTask(response.data.id);
  assert.equal(task.state, "done", task.error);
  i = (await request("/state")).data.interviews.find((x) => x.id === i.id);
  assert.equal(i.questions.length, 3);
  const data = {
    scheduledAt: i.scheduledAt,
    duration: i.duration,
    questions: i.questions,
    notes: "Ứng viên có kinh nghiệm React.",
    scores: [4, 4, 3],
    summary: null,
    state: "Nháp",
  };
  await request("/interviews/" + i.id, "PUT", data);
  response = await request("/ai", "POST", {
    kind: "summary",
    jobId: job.id,
    applicationId: a.id,
    interviewId: i.id,
  });
  task = await waitTask(response.data.id);
  assert.equal(task.state, "done", task.error);
  i = (await request("/state")).data.interviews.find((x) => x.id === i.id);
  assert.equal(i.state, "Nháp");
  assert.equal(i.summary.inferences.length, 1);
  aiMode = "slow";
  const before = calls;
  response = await request("/ai", "POST", {
    kind: "summary",
    jobId: job.id,
    applicationId: a.id,
    interviewId: i.id,
  });
  while (calls === before) await new Promise((r) => setTimeout(r, 5));
  await request("/interviews/" + i.id, "PUT", {
    ...data,
    notes: "Updated notes during AI call",
  });
  task = await waitTask(response.data.id);
  assert.equal(task.state, "failed");
  assert.match(task.error, /Ghi chú đã thay đổi/);
  assert.equal(
    (await request("/state")).data.interviews.find((x) => x.id === i.id).notes,
    "Updated notes during AI call",
  );
  aiMode = "success";
});
test("AI cannot overwrite a newer human score and revoked members cannot see their queued task", async () => {
  const a = (
    await request("/jobs/" + job.id + "/candidates", "POST", {
      profile: {
        name: "Nguyen Test",
        email: "",
        phone: "",
        skills: "React",
        experience: "",
        education: "",
        projects: "",
        certificates: "",
      },
      text: cv,
    })
  ).data;
  aiMode = "slow";
  let before = calls;
  let response = await request("/ai", "POST", {
    kind: "evaluate",
    jobId: job.id,
    applicationId: a.id,
  });
  const duplicate = await request("/ai", "POST", {
    kind: "evaluate",
    jobId: job.id,
    applicationId: a.id,
  });
  assert.equal(duplicate.data.id, response.data.id);
  while (calls === before) await new Promise((r) => setTimeout(r, 5));
  const manual = await request(
    "/applications/" + a.id + "/evaluations",
    "POST",
    {
      ...evaluation,
      rubricVersion: job.rubricVersion,
      resumeVersion: 1,
      reason: "HR updates during AI",
    },
  );
  assert.equal(manual.status, 201);
  let task = await waitTask(response.data.id);
  assert.equal(task.state, "failed");
  assert.equal(
    (await request("/applications/" + a.id)).data.evaluation.id,
    manual.data.id,
  );
  await request("/jobs/" + job.id + "/members", "PATCH", {
    members: ["recruiter"],
  });
  before = calls;
  response = await request(
    "/ai",
    "POST",
    { kind: "evaluate", jobId: job.id, applicationId: a.id },
    "hr",
  );
  assert.equal(response.status, 202);
  while (calls === before) await new Promise((r) => setTimeout(r, 5));
  await request("/jobs/" + job.id + "/members", "PATCH", { members: [] });
  assert.equal(
    (await request("/state", "GET", null, "hr")).data.tasks.some(
      (t) => t.id === response.data.id,
    ),
    false,
  );
  task = await waitTask(response.data.id);
  assert.equal(task.state, "failed");
  assert.equal(
    (await request("/applications/" + a.id)).data.evaluation.id,
    manual.data.id,
  );
  aiMode = "success";
  const oldKey = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = "";
  assert.equal(
    (
      await request("/ai", "POST", {
        kind: "evaluate",
        jobId: job.id,
        applicationId: a.id,
      })
    ).status,
    503,
  );
  process.env.OPENAI_API_KEY = oldKey;
});
