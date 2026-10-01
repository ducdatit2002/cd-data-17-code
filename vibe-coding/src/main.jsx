import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  Users,
  Trophy,
  Phone,
  Settings,
  Search,
  Bell,
  Plus,
  ArrowUpRight,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Sparkles,
  FileText,
  Upload,
  MoreHorizontal,
  X,
  Check,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Copy,
  LogOut,
  LoaderCircle,
  SlidersHorizontal,
  CalendarDays,
  Download,
  Pencil,
  ShieldCheck,
  Menu,
  RotateCcw,
  Trash2,
  Building2,
  Layers,
  Mail,
  MessageSquare,
  Eye,
} from "lucide-react";
import "@fontsource/be-vietnam-pro/400.css";
import "@fontsource/be-vietnam-pro/500.css";
import "@fontsource/be-vietnam-pro/600.css";
import "@fontsource/be-vietnam-pro/700.css";
import "./styles.css";
const nav = [
  ["dashboard", "Tổng quan", LayoutDashboard],
  ["jobs", "Vị trí tuyển dụng", BriefcaseBusiness],
  ["posts", "Bài tuyển dụng", FileText],
  ["candidates", "Ứng viên", Users],
  ["ranking", "CV Ranking", Trophy],
  ["interviews", "Phone interview", Phone],
];
const statuses = [
  "Mới",
  "Đã đánh giá CV",
  "Shortlist",
  "Phone interview",
  "Phỏng vấn chuyên môn",
  "Offer",
  "Đã tuyển",
  "Từ chối",
];
const criteria = [
  "Kỹ năng chuyên môn",
  "Kinh nghiệm liên quan",
  "Dự án và thành tích",
  "Học vấn, chứng chỉ",
  "Yêu cầu khác",
];
const blankProfile = {
  name: "",
  email: "",
  phone: "",
  skills: "",
  experience: "",
  education: "",
  projects: "",
  certificates: "",
};
const blankJob = {
  title: "",
  department: "Engineering",
  level: "Middle",
  headcount: 1,
  location: "TP. Hồ Chí Minh",
  mode: "Hybrid",
  contract: "Toàn thời gian",
  salary: "",
  description: "",
  benefits: "",
  required: "",
  preferred: "",
  deadline: "",
  weights: [35, 30, 20, 10, 5],
};
const initial = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((n) => n[0])
    .join("");
const date = (
  value,
  opts = { day: "2-digit", month: "2-digit", year: "numeric" },
) =>
  value
    ? new Date(value).toLocaleDateString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        ...opts,
      })
    : "—";
const time = (value) =>
  new Date(value).toLocaleTimeString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
  });
const localDate = (value) => {
  const d = new Date(value);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};
async function api(url, options = {}) {
  const response = await fetch("/api" + url, {
    credentials: "same-origin",
    ...options,
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...options.headers,
    },
    body:
      options.body instanceof FormData
        ? options.body
        : options.body
          ? JSON.stringify(options.body)
          : undefined,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Không hoàn tất yêu cầu.");
  return data;
}
const Button = ({ children, variant = "", className = "", ...props }) => (
  <button className={`btn ${variant} ${className}`} {...props}>
    {children}
  </button>
);
const Badge = ({ children, color = "" }) => (
  <span className={`badge ${color}`}>{children}</span>
);
const Avatar = ({ name, index = 0, small = false }) => (
  <span className={`avatar av-${index % 5} ${small ? "small" : ""}`}>
    {initial(name)}
  </span>
);
const Empty = ({
  icon: Icon = Users,
  title = "Chưa có dữ liệu",
  text = "Dữ liệu sẽ xuất hiện khi bạn bắt đầu.",
  children,
}) => (
  <div className="empty">
    <span className="empty-icon">
      <Icon size={25} />
    </span>
    <h3>{title}</h3>
    <p>{text}</p>
    {children}
  </div>
);
function Field({ label, children, hint }) {
  return (
    <label className="field">
      <span>{label}</span>
      {React.isValidElement(children) &&
      ["input", "textarea", "select"].includes(children.type)
        ? React.cloneElement(children, {
            "aria-label": children.props["aria-label"] || label,
          })
        : children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
function Modal({ title, subtitle, children, onClose, wide = false }) {
  const ref = useRef();
  useEffect(() => {
    const old = document.activeElement;
    ref.current?.focus();
    const fn = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const nodes = ref.current.querySelectorAll(
          'button,input,select,textarea,a[href],[tabindex="0"]',
        );
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", fn);
    return () => {
      document.removeEventListener("keydown", fn);
      old?.focus();
    };
  }, []);
  return (
    <div
      className="overlay"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section
        ref={ref}
        tabIndex={-1}
        className={`modal ${wide ? "wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-head">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="icon-btn" aria-label="Đóng" onClick={onClose}>
            <X size={21} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </section>
    </div>
  );
}
function App() {
  const [state, setState] = useState(null),
    [authChecked, setAuthChecked] = useState(false),
    [view, setView] = useState("dashboard"),
    [selectedJob, setSelectedJob] = useState(""),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("Tất cả"),
    [modal, setModal] = useState(null),
    [toast, setToast] = useState(null),
    [busy, setBusy] = useState(false),
    [mobile, setMobile] = useState(false),
    [notifications, setNotifications] = useState(false),
    [detail, setDetail] = useState(null);
  const refresh = async () => {
    const s = await api("/state");
    setState(s);
    setSelectedJob((prev) =>
      s.jobs.some((j) => j.id === prev) ? prev : s.jobs[0]?.id || "",
    );
    return s;
  };
  useEffect(() => {
    refresh()
      .catch(() => {})
      .finally(() => setAuthChecked(true));
  }, []);
  const taskKey = state?.tasks
    .filter((t) => ["queued", "running"].includes(t.state))
    .map((t) => t.id)
    .join(",");
  useEffect(() => {
    if (!taskKey) return;
    const timer = setInterval(() => refresh().catch(() => {}), 2000);
    return () => clearInterval(timer);
  }, [taskKey]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 5500);
      return () => clearTimeout(t);
    }
  }, [toast]);
  const notify = (message, error = false) => setToast({ message, error });
  async function act(fn, message) {
    setBusy(true);
    try {
      const result = await fn();
      await refresh();
      if (message) notify(message);
      return result;
    } catch (e) {
      notify(e.message, true);
      return null;
    } finally {
      setBusy(false);
    }
  }
  async function openCandidate(id) {
    try {
      setDetail(await api("/applications/" + id));
    } catch (e) {
      notify(e.message, true);
    }
  }
  const go = (v) => {
    setView(v);
    setQuery("");
    setFilter("Tất cả");
    setMobile(false);
  };
  if (!authChecked)
    return (
      <div className="boot">
        <LoaderCircle className="spin" /> Đang mở không gian tuyển dụng…
      </div>
    );
  if (!state)
    return (
      <Login
        onLogin={async () => {
          await refresh();
        }}
      />
    );
  const editable = state.user.role !== "Hiring Manager",
    job = state.jobs.find((j) => j.id === selectedJob),
    activeJobs = state.jobs.filter((j) => j.state === "Đang tuyển");
  const filtered = state.applications.filter(
    (a) =>
      (!query ||
        [a.candidate.name, a.candidate.email, a.jobTitle, a.candidate.skills]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase())) &&
      (filter === "Tất cả" || a.status === filter),
  );
  const running = state.tasks.filter((t) =>
    ["queued", "running"].includes(t.state),
  );
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobile ? "open" : ""}`}>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            go("dashboard");
          }}
        >
          <span className="brand-mark">
            <Layers size={23} strokeWidth={2.4} />
          </span>
          talentflow<span className="brand-dot">.</span>
        </a>
        <div className="workspace">
          <div className="workspace-icon">T</div>
          <div>
            <strong>TalentFlow Workspace</strong>
            <small>Không gian tuyển dụng</small>
          </div>
          <ChevronDown size={15} />
        </div>
        <div className="nav-caption">WORKSPACE</div>
        <nav>
          {nav.map(([key, title, Icon]) => (
            <button
              key={key}
              className={`nav-item ${view === key ? "active" : ""}`}
              onClick={() => go(key)}
            >
              <Icon size={19} />
              <span>{title}</span>
              {key === "candidates" && (
                <span className="nav-count">{state.applications.length}</span>
              )}
              {key === "ranking" && <span className="tiny-ai">AI</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="ai-card">
            <span className="ai-card-icon">
              <Sparkles size={18} />
            </span>
            <strong>Trợ lý tuyển dụng AI</strong>
            <p>
              {state.ai.configured
                ? "Sẵn sàng hỗ trợ đánh giá và viết nội dung."
                : "Chấm điểm có căn cứ. Quyết định bởi con người."}
            </p>
            <button onClick={() => go("settings")}>
              Cấu hình trợ lý <ArrowUpRight size={15} />
            </button>
          </div>
          <button
            className={`nav-item ${view === "settings" ? "active" : ""}`}
            onClick={() => go("settings")}
          >
            <Settings size={19} />
            <span>Cài đặt</span>
          </button>
          <div className="profile">
            <Avatar name={state.user.name} small />
            <div>
              <strong>{state.user.name}</strong>
              <small>{state.user.role}</small>
            </div>
            <button
              aria-label="Đăng xuất"
              className="icon-btn"
              onClick={async () => {
                await api("/logout", { method: "POST" });
                setState(null);
              }}
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
      {mobile && (
        <div className="sidebar-scrim" onClick={() => setMobile(false)} />
      )}
      <div className="main-wrap">
        <header className="topbar">
          <div className="breadcrumbs">
            <button
              className="icon-btn menu-btn"
              aria-label="Mở menu"
              onClick={() => setMobile(!mobile)}
            >
              <Menu size={20} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{nav.find((n) => n[0] === view)?.[1] || "Cài đặt"}</strong>
          </div>
          <div className="top-actions">
            <span className="system-dot" />{" "}
            <span className="system-label">
              {state.demo ? "Không gian demo" : "Không gian làm việc"}
            </span>
            <div className="notification-wrap">
              <button
                className="icon-btn notification"
                aria-label="Thông báo tác vụ"
                onClick={() => setNotifications(!notifications)}
              >
                <Bell size={19} />
                {running.length > 0 && <i />}
              </button>
              {notifications && (
                <div className="notification-panel">
                  <h3>Tác vụ gần đây</h3>
                  {state.tasks.length === 0 ? (
                    <p>Chưa có tác vụ AI hoặc CV.</p>
                  ) : (
                    state.tasks.slice(0, 6).map((t) => (
                      <div key={t.id} className="task">
                        <div>
                          <strong>
                            {
                              {
                                extract: "Trích xuất CV",
                                profile: "Trích thông tin ứng viên",
                                evaluate: "Đánh giá CV",
                                post: "Viết bài tuyển dụng",
                                questions: "Chuẩn bị câu hỏi",
                                summary: "Tóm tắt phỏng vấn",
                              }[t.kind]
                            }
                          </strong>
                          <small>
                            {t.state === "done"
                              ? "Hoàn tất"
                              : t.state === "failed"
                                ? t.error
                                : `Đang xử lý · ${t.progress}%`}
                          </small>
                        </div>
                        {t.state === "failed" && editable && (
                          <button
                            className="icon-btn"
                            aria-label="Thử lại"
                            onClick={() =>
                              act(
                                () =>
                                  api("/tasks/" + t.id + "/retry", {
                                    method: "POST",
                                  }),
                                "Đã đưa vào hàng đợi",
                              )
                            }
                          >
                            <RotateCcw size={16} />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="top-divider" />
            <Avatar name={state.user.name} small />
          </div>
        </header>
        <main>
          <div className="page-header">
            <div>
              <div className="eyebrow">TALENT ACQUISITION</div>
              <h1>
                {view === "dashboard"
                  ? `Chào ${state.user.name.split(" ").slice(-2).join(" ")}, một ngày tốt lành ${"✦"}`
                  : nav.find((n) => n[0] === view)?.[1] || "Cài đặt workspace"}
              </h1>
              <p>
                {
                  {
                    dashboard:
                      "Mọi cơ hội tuyển dụng, trong một không gian rõ ràng.",
                    jobs: "Tìm đúng người, bắt đầu từ một vị trí được mô tả rõ.",
                    posts: "Từ ý tưởng đến bài tuyển dụng sẵn sàng chia sẻ.",
                    candidates: "Theo dõi và đồng hành cùng từng ứng viên.",
                    ranking:
                      "Đánh giá có bằng chứng. Xếp hạng theo từng vị trí.",
                    interviews: "Chuẩn bị kỹ hơn cho mỗi cuộc trò chuyện.",
                    settings:
                      "Quản lý quyền truy cập và cấu hình không gian làm việc.",
                  }[view]
                }
              </p>
            </div>
            <div className="page-actions">
              {view === "dashboard" && (
                <span className="date-pill">
                  <CalendarDays size={16} />
                  {date(new Date())}
                </span>
              )}
              {editable && ["dashboard", "jobs"].includes(view) && (
                <Button onClick={() => setModal({ type: "job" })}>
                  <Plus size={17} />
                  Tạo vị trí
                </Button>
              )}
              {editable && view === "candidates" && (
                <Button onClick={() => setModal({ type: "upload" })}>
                  <Upload size={17} />
                  Tải CV lên
                </Button>
              )}
              {editable && view === "interviews" && (
                <Button onClick={() => setModal({ type: "schedule" })}>
                  <Plus size={17} />
                  Lên lịch phỏng vấn
                </Button>
              )}
            </div>
          </div>
          {running.length > 0 && (
            <div className="processing-banner">
              <LoaderCircle size={16} className="spin" />
              {running.length} tác vụ đang xử lý nền. Bạn có thể tiếp tục làm
              việc.
              <button onClick={() => setNotifications(true)}>
                Xem tiến độ <ArrowRight size={14} />
              </button>
            </div>
          )}
          {view === "dashboard" && (
            <Dashboard
              state={state}
              go={go}
              setModal={setModal}
              setSelectedJob={setSelectedJob}
              openCandidate={openCandidate}
              editable={editable}
            />
          )}
          {view === "jobs" && (
            <>
              <div className="toolbar">
                <SearchBox
                  query={query}
                  setQuery={setQuery}
                  placeholder="Tìm vị trí, phòng ban…"
                />
                <span className="muted">
                  {activeJobs.length} vị trí đang tuyển
                </span>
              </div>
              <div className="job-grid">
                {state.jobs
                  .filter((j) =>
                    (j.title + " " + j.department)
                      .toLowerCase()
                      .includes(query.toLowerCase()),
                  )
                  .map((j, i) => (
                    <JobCard
                      key={j.id}
                      job={j}
                      index={i}
                      count={
                        state.applications.filter((a) => a.jobId === j.id)
                          .length
                      }
                      onClick={() => setModal({ type: "job", job: j })}
                    />
                  ))}
              </div>
              {state.jobs.length === 0 && (
                <Empty
                  icon={BriefcaseBusiness}
                  title="Vị trí đầu tiên của bạn"
                  text="Tạo vị trí và tiêu chí để bắt đầu tuyển dụng."
                />
              )}
            </>
          )}
          {view === "posts" && (
            <PostEditor
              state={state}
              job={job}
              selectedJob={selectedJob}
              setSelectedJob={setSelectedJob}
              act={act}
              notify={notify}
              editable={editable}
              busy={busy}
            />
          )}
          {view === "candidates" && (
            <>
              <div className="toolbar">
                <SearchBox
                  query={query}
                  setQuery={setQuery}
                  placeholder="Tìm tên, email, kỹ năng…"
                />
                <select
                  aria-label="Lọc trạng thái"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option>Tất cả</option>
                  {statuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                {editable && (
                  <Button
                    variant="secondary"
                    onClick={() => setModal({ type: "manual" })}
                  >
                    <Plus size={16} />
                    Nhập thủ công
                  </Button>
                )}
              </div>
              <CandidateTable
                applications={filtered}
                onOpen={openCandidate}
                emptyText="Chưa có ứng viên phù hợp với bộ lọc."
              />
            </>
          )}
          {view === "ranking" && (
            <Ranking
              state={state}
              job={job}
              selectedJob={selectedJob}
              setSelectedJob={setSelectedJob}
              openCandidate={openCandidate}
              act={act}
              editable={editable}
              notify={notify}
            />
          )}
          {view === "interviews" && (
            <Interviews
              state={state}
              act={act}
              notify={notify}
              editable={editable}
              openCandidate={openCandidate}
              busy={busy}
            />
          )}
          {view === "settings" && (
            <SettingsView state={state} act={act} notify={notify} busy={busy} />
          )}
          <footer>
            <span>TalentFlow · Tuyển dụng với sự thấu hiểu</span>
            <span>
              <ShieldCheck size={13} /> AI đề xuất · HR quyết định
            </span>
          </footer>
        </main>
      </div>
      {modal?.type === "job" && (
        <JobModal
          job={modal.job}
          users={state.users}
          role={state.user.role}
          busy={busy}
          onClose={() => setModal(null)}
          onSave={(data) =>
            act(async () => {
              await api("/jobs" + (modal.job ? "/" + modal.job.id : ""), {
                method: modal.job ? "PUT" : "POST",
                body: data,
              });
              setModal(null);
            }, "Đã lưu vị trí")
          }
          onMembers={(members) =>
            act(
              () =>
                api("/jobs/" + modal.job.id + "/members", {
                  method: "PATCH",
                  body: { members },
                }),
              "Đã cập nhật quyền",
            )
          }
          onState={(value) =>
            act(async () => {
              await api("/jobs/" + modal.job.id + "/state", {
                method: "PATCH",
                body: { state: value },
              });
              setModal(null);
            }, "Đã cập nhật trạng thái")
          }
        />
      )}
      {modal?.type === "upload" && (
        <UploadModal
          state={state}
          selectedJob={selectedJob}
          onClose={() => setModal(null)}
          act={act}
          busy={busy}
        />
      )}
      {modal?.type === "manual" && (
        <ManualModal
          state={state}
          selectedJob={selectedJob}
          onClose={() => setModal(null)}
          busy={busy}
          onSave={(jobId, data) =>
            act(async () => {
              await api("/jobs/" + jobId + "/candidates", {
                method: "POST",
                body: data,
              });
              setModal(null);
            }, "Đã thêm ứng viên")
          }
        />
      )}
      {modal?.type === "schedule" && (
        <ScheduleModal
          initialApplicationId={modal.applicationId}
          applications={state.applications}
          onClose={() => setModal(null)}
          busy={busy}
          onSave={(applicationId, data) =>
            act(async () => {
              await api("/applications/" + applicationId + "/interviews", {
                method: "POST",
                body: data,
              });
              setModal(null);
            }, "Đã lên lịch phỏng vấn")
          }
        />
      )}
      {detail && (
        <CandidateDetail
          detail={detail}
          state={state}
          busy={busy}
          onClose={() => setDetail(null)}
          act={async (fn, message) => {
            const result = await act(fn, message);
            if (result && !result.deleted) await openCandidate(detail.id);
            return result;
          }}
          onSchedule={() => {
            setDetail(null);
            setModal({ type: "schedule", applicationId: detail.id });
          }}
          onDeleted={() => setDetail(null)}
          notify={notify}
        />
      )}
      {toast && (
        <div role="status" className={`toast ${toast.error ? "error" : ""}`}>
          {toast.error ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.message}</span>
          <button
            aria-label="Đóng thông báo"
            className="icon-btn"
            onClick={() => setToast(null)}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
function Login({ onLogin }) {
  const [email, setEmail] = useState("admin@talentflow.local"),
    [password, setPassword] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <div className="login-page">
      <div className="login-story">
        <a className="brand">
          <span className="brand-mark">
            <Layers size={23} />
          </span>
          talentflow.
        </a>
        <span className="eyebrow">A LITTLE MORE HUMAN</span>
        <h1>
          Tìm đúng người.
          <br />
          Mở ra cơ hội mới.
        </h1>
        <p>
          Không gian làm việc dành cho những người kết nối tài năng với cơ hội.
        </p>
        <div className="login-orbit">
          <div className="orbit-line" />
          <span className="orbit-center">
            <Users size={46} />
          </span>
          <span className="orbit-one">
            <FileText />
          </span>
          <span className="orbit-two">
            <Sparkles />
          </span>
          <span className="orbit-three">
            <Phone />
          </span>
        </div>
        <small>AI đề xuất · HR quyết định</small>
      </div>
      <div className="login-form">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            try {
              await api("/login", {
                method: "POST",
                body: { email, password },
              });
              await onLogin();
            } catch (e) {
              setError(e.message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <Badge color="green">CHÀO MỪNG TRỞ LẠI</Badge>
          <h2>Không gian tuyển dụng của bạn</h2>
          <p>Đăng nhập để bắt đầu một ngày làm việc.</p>
          <Field label="Email">
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Field label="Mật khẩu">
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>
          {error && (
            <div className="inline-error" role="alert">
              {error}
            </div>
          )}
          <Button disabled={busy} className="full">
            {busy ? (
              <LoaderCircle className="spin" size={18} />
            ) : (
              <ArrowRight size={18} />
            )}
            Đăng nhập
          </Button>
          <div className="demo-login">
            <strong>Chạy thử với dữ liệu tổng hợp</strong>
            <p>
              Nếu dùng cấu hình demo mặc định: mật khẩu{" "}
              <code>TalentFlow@demo2026</code>.
            </p>
            <div>
              {[
                ["Admin", "admin"],
                ["Recruiter", "hr"],
                ["Hiring Manager", "manager"],
              ].map(([role, email]) => (
                <button
                  type="button"
                  key={role}
                  onClick={() => {
                    setEmail(email + "@talentflow.local");
                    setPassword("TalentFlow@demo2026");
                  }}
                >
                  {role}
                </button>
              ))}
            </div>
            <small>
              Nếu đã đổi mật khẩu khởi tạo, dùng thông tin trong terminal.
            </small>
          </div>
        </form>
      </div>
    </div>
  );
}
function SearchBox({ query, setQuery, placeholder }) {
  return (
    <div className="search-box">
      <Search size={17} />
      <input
        aria-label={placeholder}
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query && (
        <button
          className="icon-btn"
          aria-label="Xóa tìm kiếm"
          onClick={() => setQuery("")}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
function Dashboard({
  state,
  go,
  setModal,
  setSelectedJob,
  openCandidate,
  editable,
}) {
  const applications = state.applications,
    active = state.jobs.filter((j) => j.state === "Đang tuyển"),
    pending = applications.filter((a) => !a.evaluation || !a.current),
    shortlist = applications.filter((a) => a.status === "Shortlist"),
    scheduled = state.interviews.filter((i) => i.state !== "Đã duyệt");
  const metrics = [
    [
      "Vị trí đang tuyển",
      active.length,
      BriefcaseBusiness,
      "Cơ hội đang mở",
      "green",
    ],
    [
      "Tổng ứng viên",
      applications.length,
      Users,
      "Hồ sơ trong workspace",
      "blue",
    ],
    [
      "CV chờ đánh giá",
      pending.length,
      FileText,
      "Sẵn sàng cho bước tiếp theo",
      "amber",
    ],
    [
      "Phone interview",
      scheduled.length,
      Phone,
      "Cuộc trò chuyện chưa duyệt",
      "purple",
    ],
  ];
  const funnel = [
    ["Hồ sơ ứng tuyển", applications.length],
    [
      "Đã đánh giá CV",
      applications.filter((a) => a.evaluation && a.current).length,
    ],
    ["Đang shortlist", shortlist.length],
    [
      "Đang phỏng vấn",
      applications.filter((a) =>
        ["Phone interview", "Phỏng vấn chuyên môn"].includes(a.status),
      ).length,
    ],
    [
      "Offer / Đã tuyển",
      applications.filter((a) => ["Offer", "Đã tuyển"].includes(a.status))
        .length,
    ],
  ];
  const interviews = [...scheduled]
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
    .slice(0, 3);
  return (
    <>
      <div className="metric-grid">
        {metrics.map(([label, value, Icon, caption, color]) => (
          <div className="metric-card" key={label}>
            <div className="metric-top">
              <span>{label}</span>
              <span className={`metric-icon ${color}`}>
                <Icon size={19} />
              </span>
            </div>
            <div className="metric-value">
              {String(value).padStart(2, "0")}
              <svg
                viewBox="0 0 90 32"
                className={`sparkline ${color}`}
                aria-hidden="true"
              >
                <path
                  d="M0 27 L12 21 L24 24 L37 15 L49 18 L62 8 L73 12 L90 3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M0 27 L12 21 L24 24 L37 15 L49 18 L62 8 L73 12 L90 3 L90 32 L0 32Z"
                  fill="currentColor"
                  opacity=".07"
                />
              </svg>
            </div>
            <small>{caption}</small>
          </div>
        ))}
      </div>
      <div className="dashboard-row">
        <section className="card funnel-card">
          <div className="section-head">
            <div>
              <h2>Pipeline tuyển dụng</h2>
              <p>Tình hình ứng viên qua từng giai đoạn</p>
            </div>
            <Badge>Hiện tại</Badge>
          </div>
          <div className="funnel">
            {funnel.map(([label, count], i) => (
              <div className="funnel-row" key={label}>
                <div>
                  <span className="funnel-number">0{i + 1}</span>
                  <span>{label}</span>
                </div>
                <div className="funnel-track">
                  <span
                    style={{
                      width: applications.length
                        ? `${Math.max((count / applications.length) * 100, count ? 5 : 0)}%`
                        : "0%",
                      opacity: 1 - i * 0.13,
                    }}
                  />
                </div>
                <strong>{count}</strong>
                <small>
                  {applications.length
                    ? Math.round((count / applications.length) * 100)
                    : 0}
                  %
                </small>
              </div>
            ))}
          </div>
          <div className="card-foot">
            <span>
              <span className="legend-dot" />
              Tỷ lệ trên tổng hồ sơ · trạng thái hiện tại
            </span>
            <button onClick={() => go("candidates")}>
              Xem ứng viên <ArrowRight size={14} />
            </button>
          </div>
        </section>
        <section className="card interview-card">
          <div className="section-head">
            <div>
              <h2>Lịch phỏng vấn</h2>
              <p>Những cuộc trò chuyện sắp tới</p>
            </div>
            <span className="soft-icon">
              <CalendarDays size={19} />
            </span>
          </div>
          {interviews.length === 0 ? (
            <Empty
              icon={CalendarDays}
              title="Lịch đang trống"
              text="Lên lịch cuộc trò chuyện đầu tiên của bạn."
            />
          ) : (
            <div className="interview-list">
              {interviews.map((i, index) => {
                const a = applications.find((a) => a.id === i.applicationId);
                return (
                  <button
                    className="interview-item"
                    key={i.id}
                    onClick={() => go("interviews")}
                  >
                    <div className="time-block">
                      <strong>{time(i.scheduledAt)}</strong>
                      <small>
                        {date(i.scheduledAt, {
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </small>
                    </div>
                    <div className="interview-person">
                      <strong>{a?.candidate.name}</strong>
                      <span>{a?.jobTitle}</span>
                      <small>
                        <Phone size={11} />
                        Phone interview · {i.duration} phút
                      </small>
                    </div>
                    <ChevronRight size={15} />
                  </button>
                );
              })}
            </div>
          )}
          <button className="schedule-link" onClick={() => go("interviews")}>
            Xem tất cả lịch phỏng vấn <ArrowRight size={15} />
          </button>
        </section>
      </div>
      <section className="card active-jobs">
        <div className="section-head">
          <div>
            <h2>
              Vị trí đang tuyển{" "}
              <span className="heading-count">{active.length}</span>
            </h2>
            <p>Mỗi vị trí là một cơ hội tìm thấy đồng đội mới</p>
          </div>
          <button className="text-link" onClick={() => go("jobs")}>
            Xem tất cả <ArrowRight size={15} />
          </button>
        </div>
        <div className="job-strip">
          {active.slice(0, 3).map((j, i) => (
            <JobCard
              key={j.id}
              job={j}
              index={i}
              count={applications.filter((a) => a.jobId === j.id).length}
              compact
              onClick={() => {
                setSelectedJob(j.id);
                go("ranking");
              }}
            />
          ))}
        </div>
        {!active.length && (
          <Empty icon={BriefcaseBusiness} title="Chưa có vị trí đang tuyển" />
        )}
      </section>
      <div className="dashboard-row lower-row">
        <section className="card latest-card">
          <div className="section-head">
            <div>
              <h2>Ứng viên nổi bật</h2>
              <p>
                {state.demo
                  ? "Hồ sơ và điểm tổng hợp để trải nghiệm"
                  : "Hồ sơ mới được đánh giá gần đây"}
              </p>
            </div>
            <button className="text-link" onClick={() => go("ranking")}>
              Đến ranking <ArrowRight size={15} />
            </button>
          </div>
          <CandidateTable
            applications={applications.filter((a) => a.current).slice(0, 4)}
            onOpen={openCandidate}
            compact
          />
        </section>
        <section className="next-card">
          <div className="next-spark">
            <Sparkles size={23} />
          </div>
          <Badge color="green">YOUR NEXT GREAT HIRE</Badge>
          <h2>
            Để AI hỗ trợ.
            <br />
            Để bạn thấu hiểu.
          </h2>
          <p>
            Khám phá điểm mạnh, tìm bằng chứng và chuẩn bị câu hỏi tốt hơn cho
            từng ứng viên.
          </p>
          <Button
            variant="white"
            onClick={() =>
              editable ? setModal({ type: "upload" }) : go("ranking")
            }
          >
            {editable ? "Bắt đầu với một CV" : "Khám phá ranking"}
            <ArrowUpRight size={16} />
          </Button>
          <span className="decor-circle circle-one" />
          <span className="decor-circle circle-two" />
        </section>
      </div>
    </>
  );
}
function JobCard({ job, index, count, onClick, compact }) {
  return (
    <button
      className={`job-card ${compact ? "compact" : ""}`}
      onClick={onClick}
    >
      <div className="job-card-top">
        <span className={`job-icon av-${index % 5}`}>
          {job.department === "Design" ? (
            <Pencil size={21} />
          ) : job.department === "Engineering" ? (
            <Layers size={21} />
          ) : (
            <Users size={21} />
          )}
        </span>
        <Badge color={job.state === "Đang tuyển" ? "green" : ""}>
          {job.state}
        </Badge>
      </div>
      <small className="department">
        {job.department} · {job.level}
      </small>
      <h3>{job.title}</h3>
      <div className="job-meta">
        <span>
          <MapPin size={13} />
          {job.location}
        </span>
        <span>•</span>
        <span>{job.mode}</span>
      </div>
      <div className="job-tags">
        <span>{job.contract}</span>
        <span>{job.headcount} vị trí</span>
      </div>
      <div className="job-card-bottom">
        <span>
          <Users size={15} />
          <strong>{count}</strong> ứng viên
        </span>
        <ArrowUpRight size={18} />
      </div>
    </button>
  );
}
function CandidateTable({ applications, onOpen, compact, emptyText }) {
  return (
    <div className={`table-wrap ${compact ? "compact-table" : ""}`}>
      <table>
        <thead>
          <tr>
            <th>Ứng viên</th>
            {!compact && <th>Vị trí ứng tuyển</th>}
            <th>Điểm CV</th>
            <th>Trạng thái</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {applications.map((a, i) => (
            <tr key={a.id} onClick={() => onOpen(a.id)}>
              <td>
                <div className="person-cell">
                  <Avatar name={a.candidate.name} index={i} />
                  <div>
                    <button
                      className="name-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpen(a.id);
                      }}
                    >
                      {a.candidate.name}
                    </button>
                    <small>
                      {compact
                        ? a.jobTitle
                        : a.candidate.email || "Chưa có email"}
                    </small>
                  </div>
                </div>
              </td>
              {!compact && (
                <td>
                  <span className="job-name">{a.jobTitle}</span>
                  {a.candidate.demo && (
                    <small className="table-note">Hồ sơ demo tổng hợp</small>
                  )}
                </td>
              )}
              <td>
                {a.current ? (
                  <div className="score-cell">
                    <strong>{a.evaluation.score}</strong>
                    <span>/100</span>
                  </div>
                ) : (
                  <span className="muted">
                    {a.evaluation ? "Cần chấm lại" : "Chưa đánh giá"}
                  </span>
                )}
                {a.current && (
                  <small className="table-note">
                    {a.evaluation.source === "demo"
                      ? "Điểm demo"
                      : a.evaluation.source === "ai"
                        ? "AI đề xuất"
                        : "HR đánh giá"}
                  </small>
                )}
              </td>
              <td>
                <Badge
                  color={
                    ["Shortlist", "Đã tuyển"].includes(a.status)
                      ? "green"
                      : a.status === "Phone interview"
                        ? "purple"
                        : a.status === "Từ chối"
                          ? "red"
                          : "blue"
                  }
                >
                  {a.status}
                </Badge>
                {["running", "queued", "failed"].includes(a.resume?.status) && (
                  <small className="table-note">
                    {a.resume.status === "failed"
                      ? "Lỗi trích xuất CV"
                      : "Đang đọc CV…"}
                  </small>
                )}
              </td>
              <td>
                <ChevronRight size={16} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!applications.length && (
        <Empty
          title="Chưa có ứng viên"
          text={emptyText || "Thêm CV để bắt đầu đánh giá và kết nối."}
        />
      )}
    </div>
  );
}
function JobSelect({ state, value, onChange }) {
  return (
    <select
      aria-label="Chọn vị trí tuyển dụng"
      className="job-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {!state.jobs.length && <option value="">Chưa có vị trí</option>}
      {state.jobs.map((j) => (
        <option value={j.id} key={j.id}>
          {j.title}
        </option>
      ))}
    </select>
  );
}
function JobModal({
  job,
  users,
  role,
  onClose,
  onSave,
  onMembers,
  onState,
  busy,
}) {
  const [data, setData] = useState(
      job ? { ...job, weights: [...job.weights] } : structuredClone(blankJob),
    ),
    [tab, setTab] = useState("info"),
    [members, setMembers] = useState(job?.members || []);
  const update = (k, v) => setData((d) => ({ ...d, [k]: v }));
  const readonly = role === "Hiring Manager";
  return (
    <Modal
      title={job ? job.title : "Tạo vị trí tuyển dụng"}
      subtitle="Thông tin rõ ràng là nền tảng của một đánh giá công bằng."
      onClose={onClose}
      wide
    >
      <div className="tabs">
        <button
          className={tab === "info" ? "active" : ""}
          onClick={() => setTab("info")}
        >
          Thông tin vị trí
        </button>
        <button
          className={tab === "rubric" ? "active" : ""}
          onClick={() => setTab("rubric")}
        >
          Tiêu chí đánh giá {job && `· v${job.rubricVersion}`}
        </button>
        {role === "Admin" && job && (
          <button
            className={tab === "members" ? "active" : ""}
            onClick={() => setTab("members")}
          >
            Quyền truy cập
          </button>
        )}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(data);
        }}
      >
        <fieldset disabled={readonly || busy}>
          {tab === "info" && (
            <div className="form-grid">
              <Field label="Tên vị trí *">
                <input
                  required
                  value={data.title}
                  onChange={(e) => update("title", e.target.value)}
                />
              </Field>
              <Field label="Phòng ban">
                <input
                  value={data.department}
                  onChange={(e) => update("department", e.target.value)}
                />
              </Field>
              <Field label="Cấp bậc">
                <select
                  value={data.level}
                  onChange={(e) => update("level", e.target.value)}
                >
                  {[
                    "Intern",
                    "Junior",
                    "Middle",
                    "Senior",
                    "Lead",
                    "Manager",
                  ].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Số lượng cần tuyển">
                <input
                  type="number"
                  min="1"
                  required
                  value={data.headcount}
                  onChange={(e) => update("headcount", Number(e.target.value))}
                />
              </Field>
              <Field label="Địa điểm">
                <input
                  value={data.location}
                  onChange={(e) => update("location", e.target.value)}
                />
              </Field>
              <Field label="Hình thức làm việc">
                <select
                  value={data.mode}
                  onChange={(e) => update("mode", e.target.value)}
                >
                  {["Hybrid", "Remote", "Tại văn phòng"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Loại hợp đồng">
                <input
                  value={data.contract}
                  onChange={(e) => update("contract", e.target.value)}
                />
              </Field>
              <Field label="Khoảng lương">
                <input
                  placeholder="Ví dụ: 25–35 triệu VNĐ"
                  value={data.salary}
                  onChange={(e) => update("salary", e.target.value)}
                />
              </Field>
              <Field label="Hạn tuyển dụng">
                <input
                  type="date"
                  value={data.deadline}
                  onChange={(e) => update("deadline", e.target.value)}
                />
              </Field>
              <div className="span-2">
                <Field label="Mô tả công việc *">
                  <textarea
                    rows="4"
                    minLength="10"
                    required
                    value={data.description}
                    onChange={(e) => update("description", e.target.value)}
                  />
                </Field>
                <Field label="Quyền lợi">
                  <textarea
                    rows="3"
                    value={data.benefits}
                    onChange={(e) => update("benefits", e.target.value)}
                  />
                </Field>
                <Field
                  label="Yêu cầu bắt buộc"
                  hint="Mỗi yêu cầu một dòng; được đánh giá riêng với điểm tổng."
                >
                  <textarea
                    rows="3"
                    value={data.required}
                    onChange={(e) => update("required", e.target.value)}
                  />
                </Field>
                <Field label="Yêu cầu ưu tiên">
                  <textarea
                    rows="2"
                    value={data.preferred}
                    onChange={(e) => update("preferred", e.target.value)}
                  />
                </Field>
              </div>
            </div>
          )}
          {tab === "rubric" && (
            <>
              <div className="notice">
                <ShieldCheck size={18} />
                <p>
                  Điểm tổng = tổng điểm tiêu chí × trọng số. Thay đổi tiêu chí
                  tạo phiên bản mới; kết quả cũ sẽ được đánh dấu cần chấm lại.
                </p>
              </div>
              {criteria.map((label, i) => (
                <Field label={label} key={label}>
                  <div className="weight-row">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={data.weights[i]}
                      onChange={(e) =>
                        update(
                          "weights",
                          data.weights.map((w, k) =>
                            k === i ? Number(e.target.value) : w,
                          ),
                        )
                      }
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={data.weights[i]}
                      onChange={(e) =>
                        update(
                          "weights",
                          data.weights.map((w, k) =>
                            k === i ? Number(e.target.value) : w,
                          ),
                        )
                      }
                    />
                    <span>%</span>
                  </div>
                </Field>
              ))}
              <div
                className={`weight-total ${data.weights.reduce((a, b) => a + b, 0) !== 100 ? "invalid" : ""}`}
              >
                Tổng trọng số:{" "}
                <strong>{data.weights.reduce((a, b) => a + b, 0)}%</strong>
              </div>
            </>
          )}
          {tab === "members" && (
            <>
              <p className="muted">
                Admin có quyền xem mọi vị trí. Recruiter và Hiring Manager chỉ
                xem vị trí được phân công.
              </p>
              {users
                .filter((u) => u.active && u.role !== "Admin")
                .map((u) => (
                  <label className="member-row" key={u.id}>
                    <input
                      type="checkbox"
                      checked={members.includes(u.id)}
                      onChange={(e) =>
                        setMembers((prev) =>
                          e.target.checked
                            ? [...prev, u.id]
                            : prev.filter((m) => m !== u.id),
                        )
                      }
                    />
                    <Avatar name={u.name} small />
                    <span>
                      <strong>{u.name}</strong>
                      <small>
                        {u.role} · {u.email}
                      </small>
                    </span>
                  </label>
                ))}
            </>
          )}
        </fieldset>
        {!readonly && (
          <div className="form-actions">
            {job && tab === "info" && (
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  onState(job.state === "Đang tuyển" ? "Đã đóng" : "Đang tuyển")
                }
              >
                {job.state === "Đang tuyển" ? "Đóng vị trí" : "Mở lại vị trí"}
              </Button>
            )}
            <Button type="button" variant="secondary" onClick={onClose}>
              Hủy
            </Button>
            {tab === "members" ? (
              <Button
                type="button"
                disabled={busy}
                onClick={() => onMembers(members)}
              >
                Lưu quyền truy cập
              </Button>
            ) : (
              <Button
                disabled={
                  busy || data.weights.reduce((a, b) => a + b, 0) !== 100
                }
              >
                <Check size={16} />
                Lưu vị trí
              </Button>
            )}
          </div>
        )}
      </form>
    </Modal>
  );
}
function UploadModal({ state, selectedJob, onClose, act, busy }) {
  const [jobId, setJobId] = useState(selectedJob),
    [files, setFiles] = useState([]),
    [results, setResults] = useState(null),
    [drag, setDrag] = useState(false);
  const fileRef = useRef();
  return (
    <Modal
      title="Thêm những tài năng mới"
      subtitle="Tải CV lên và kiểm tra thông tin trước khi đánh giá."
      onClose={onClose}
    >
      <Field label="Vị trí ứng tuyển">
        <JobSelect state={state} value={jobId} onChange={setJobId} />
      </Field>
      <div
        className={`dropzone ${drag ? "drag" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          setFiles(Array.from(e.dataTransfer.files));
          setResults(null);
        }}
      >
        <Upload size={28} />
        <h3>Kéo CV vào đây</h3>
        <p>PDF hoặc DOCX · tối đa 10 MB/file · 10 file/lần</p>
        <Button variant="secondary" onClick={() => fileRef.current.click()}>
          Chọn từ máy tính
        </Button>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept=".pdf,.docx"
          hidden
          onChange={(e) => {
            setFiles(Array.from(e.target.files));
            setResults(null);
          }}
        />
      </div>
      {files.map((f, i) => (
        <div className="upload-file" key={i}>
          <FileText size={17} />
          <span>{f.name}</span>
          <small>{(f.size / 1024 / 1024).toFixed(2)} MB</small>
          <button
            className="icon-btn"
            aria-label="Bỏ file"
            onClick={() => setFiles((fs) => fs.filter((_, k) => k !== i))}
          >
            <X size={15} />
          </button>
        </div>
      ))}
      {results && (
        <div className="upload-results">
          {results.map((r, i) => (
            <p key={i} className={r.error ? "inline-error" : ""}>
              {r.error ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
              <span>
                {r.name}:{" "}
                {r.error ||
                  (r.duplicate
                    ? "CV có thể trùng, không tạo thêm hồ sơ."
                    : "Đã lưu và đưa vào hàng đợi trích xuất.")}
              </span>
            </p>
          ))}
        </div>
      )}
      <div className="notice">
        <ShieldCheck size={17} />
        <p>
          CV lưu riêng tư. PDF scan được OCR; hãy kiểm tra văn bản trích xuất
          trước khi chấm điểm.
        </p>
      </div>
      <div className="form-actions">
        <Button variant="secondary" onClick={onClose}>
          Đóng
        </Button>
        <Button
          disabled={busy || !jobId || !files.length || files.length > 10}
          onClick={() =>
            act(async () => {
              const form = new FormData();
              files.forEach((f) => form.append("files", f));
              const result = await api("/jobs/" + jobId + "/upload", {
                method: "POST",
                body: form,
              });
              setResults(result.results);
              setFiles([]);
              return result;
            }, "Đã xử lý yêu cầu tải lên")
          }
        >
          <Upload size={16} />
          {busy ? "Đang tải…" : "Tải CV lên"}
        </Button>
      </div>
    </Modal>
  );
}
function ManualModal({ state, selectedJob, onClose, onSave, busy }) {
  const [jobId, setJobId] = useState(selectedJob),
    [profile, setProfile] = useState({ ...blankProfile }),
    [text, setText] = useState("");
  return (
    <Modal title="Thêm ứng viên thủ công" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(jobId, { profile, text });
        }}
      >
        <Field label="Vị trí ứng tuyển">
          <JobSelect state={state} value={jobId} onChange={setJobId} />
        </Field>
        <ProfileFields profile={profile} setProfile={setProfile} />
        <Field
          label="Nội dung CV *"
          hint="Dán nội dung nguồn. Thông tin ở trên cần khớp với nội dung CV."
        >
          <textarea
            required
            minLength="20"
            rows="7"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </Field>
        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button disabled={busy || !jobId}>Lưu ứng viên</Button>
        </div>
      </form>
    </Modal>
  );
}
function ProfileFields({ profile, setProfile }) {
  return (
    <div className="form-grid">
      {[
        ["name", "Họ tên *"],
        ["email", "Email"],
        ["phone", "Số điện thoại"],
        ["skills", "Kỹ năng"],
        ["experience", "Kinh nghiệm"],
        ["education", "Học vấn"],
        ["projects", "Dự án, thành tích"],
        ["certificates", "Chứng chỉ"],
      ].map(([k, label]) => (
        <Field label={label} key={k}>
          {["experience", "projects"].includes(k) ? (
            <textarea
              rows="2"
              value={profile[k] || ""}
              onChange={(e) =>
                setProfile((p) => ({ ...p, [k]: e.target.value }))
              }
            />
          ) : (
            <input
              type={k === "email" ? "email" : "text"}
              required={k === "name"}
              value={profile[k] || ""}
              onChange={(e) =>
                setProfile((p) => ({ ...p, [k]: e.target.value }))
              }
            />
          )}
        </Field>
      ))}
    </div>
  );
}
function PostEditor({
  state,
  job,
  selectedJob,
  setSelectedJob,
  act,
  notify,
  editable,
  busy,
}) {
  const [content, setContent] = useState(""),
    [channel, setChannel] = useState("Website"),
    [tone, setTone] = useState("Chuyên nghiệp"),
    [history, setHistory] = useState(false),
    [taskId, setTaskId] = useState(null),
    [warnings, setWarnings] = useState([]);
  const posts = state.posts
    .filter((p) => p.jobId === selectedJob)
    .sort((a, b) => b.version - a.version);
  useEffect(() => {
    setContent(posts[0]?.content || "");
    setChannel(posts[0]?.channel || "Website");
    setTone(posts[0]?.tone || "Chuyên nghiệp");
    setWarnings([]);
    setTaskId(null);
  }, [selectedJob]);
  useEffect(() => {
    const t = state.tasks.find((t) => t.id === taskId);
    if (t?.state === "done" && t.result) {
      setContent(t.result.content);
      setWarnings(t.result.warnings);
      setTaskId(null);
      notify("Đã nhận bản nháp AI. Kiểm duyệt và lưu phiên bản.");
    }
    if (t?.state === "failed") {
      notify(t.error, true);
      setTaskId(null);
    }
  }, [state.tasks, taskId]);
  const template = () =>
    `${job.title}\n${job.location} · ${job.mode} · ${job.contract}\n\nMÔ TẢ CÔNG VIỆC\n${job.description}\n\nYÊU CẦU BẮT BUỘC\n${job.required}\n\nƯU TIÊN\n${job.preferred}\n\nQUYỀN LỢI\n${job.benefits}\n${job.salary ? "Lương: " + job.salary : ""}`;
  return (
    <>
      <div className="toolbar">
        <JobSelect
          state={state}
          value={selectedJob}
          onChange={setSelectedJob}
        />
        <Button variant="secondary" onClick={() => setHistory(!history)}>
          <Clock size={16} />
          Lịch sử ({posts.length})
        </Button>
      </div>
      {!job ? (
        <Empty icon={BriefcaseBusiness} title="Tạo vị trí trước khi viết bài" />
      ) : (
        <div className="editor-layout">
          <section className="card editor-card">
            <div className="section-head">
              <h2>
                <FileText size={18} />
                Bản nháp tuyển dụng
              </h2>
              <Badge>{channel}</Badge>
            </div>
            <textarea
              className="post-textarea"
              aria-label="Nội dung bài tuyển dụng"
              value={content}
              readOnly={!editable || !!taskId}
              placeholder="Viết nội dung hoặc tạo từ thông tin vị trí…"
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="editor-footer">
              <span>
                {content.length.toLocaleString("vi-VN")} ký tự · Kiểm duyệt
                trước khi chia sẻ
              </span>
              <div>
                <Button
                  variant="secondary"
                  disabled={!content}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(content);
                      notify("Đã sao chép nội dung");
                    } catch {
                      notify("Trình duyệt chưa cho phép sao chép.", true);
                    }
                  }}
                >
                  <Copy size={15} />
                  Sao chép
                </Button>
                {editable && (
                  <Button
                    disabled={busy || !content.trim()}
                    onClick={() =>
                      act(
                        () =>
                          api("/jobs/" + job.id + "/posts", {
                            method: "POST",
                            body: { content, channel, tone },
                          }),
                        "Đã lưu phiên bản bài tuyển dụng",
                      )
                    }
                  >
                    <Check size={15} />
                    Lưu bản nháp
                  </Button>
                )}
              </div>
            </div>
          </section>
          <aside className="editor-assistant">
            <section className="card">
              <span className="assistant-label">
                <Sparkles size={19} />
                Trợ lý viết bài
              </span>
              <h3>Một thông điệp phù hợp</h3>
              <p>
                Tạo nội dung từ thông tin đã xác nhận của vị trí tuyển dụng.
              </p>
              <Field label="Kênh đăng tuyển">
                <select
                  value={channel}
                  disabled={!!taskId}
                  onChange={(e) => setChannel(e.target.value)}
                >
                  {["Website", "Facebook", "LinkedIn"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Giọng văn">
                <select
                  disabled={!!taskId}
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                >
                  {["Chuyên nghiệp", "Thân thiện", "Ngắn gọn"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              {editable && (
                <>
                  <Button
                    className="full"
                    disabled={busy || !state.ai.configured || !!taskId}
                    onClick={() =>
                      act(async () => {
                        const t = await api("/ai", {
                          method: "POST",
                          body: {
                            kind: "post",
                            jobId: job.id,
                            channel,
                            tone,
                            draft: content,
                          },
                        });
                        setTaskId(t.id);
                        return t;
                      }, "AI đang viết bản nháp")
                    }
                  >
                    <Sparkles size={16} />
                    {content.trim()
                      ? "Viết lại bằng AI"
                      : "Tạo bản nháp bằng AI"}
                  </Button>
                  <Button
                    variant="secondary"
                    className="full"
                    disabled={!!taskId}
                    onClick={() => setContent(template())}
                  >
                    Dùng mẫu từ JD
                  </Button>
                </>
              )}
              {!state.ai.configured && (
                <small className="muted">
                  AI chưa cấu hình. Mẫu từ JD dùng nguyên thông tin vị trí,
                  không phải nội dung AI.
                </small>
              )}
              {state.tasks
                .filter(
                  (t) =>
                    t.kind === "post" &&
                    t.jobId === selectedJob &&
                    t.state === "done" &&
                    t.result,
                )
                .slice(0, 3)
                .map((t) => (
                  <button
                    className="ai-draft-link"
                    key={t.id}
                    disabled={!!taskId}
                    onClick={() => {
                      setContent(t.result.content);
                      setChannel(t.data.channel || "Website");
                      setTone(t.data.tone || "Chuyên nghiệp");
                      setWarnings(t.result.warnings);
                      notify("Đã mở bản nháp AI. Kiểm duyệt trước khi lưu.");
                    }}
                  >
                    <Sparkles size={13} />
                    <span>
                      Mở bản nháp AI · {date(t.at)} · {time(t.at)}
                    </span>
                    <ArrowRight size={13} />
                  </button>
                ))}
              {warnings.map((w, i) => (
                <div key={i} className="notice amber">
                  <AlertCircle size={16} />
                  <p>{w}</p>
                </div>
              ))}
            </section>
            <section className="card writing-note">
              <ShieldCheck size={21} />
              <h3>Rõ ràng và nhất quán</h3>
              <p>
                Kiểm tra mức lương, quyền lợi và yêu cầu trước khi đăng bài. Mỗi
                lần lưu tạo một phiên bản mới.
              </p>
            </section>
          </aside>
        </div>
      )}
      {history && (
        <section className="card history-card">
          <div className="section-head">
            <h2>Lịch sử phiên bản</h2>
          </div>
          {posts.map((p) => (
            <button
              className="history-item"
              disabled={!!taskId}
              key={p.id}
              onClick={() => {
                setContent(p.content);
                setChannel(p.channel);
                setTone(p.tone);
                notify(
                  `Đã mở phiên bản ${p.version}. Lưu để tạo phiên bản mới.`,
                );
              }}
            >
              <span>
                <strong>Phiên bản {p.version}</strong>
                <small>
                  {p.channel} · {p.tone} · {date(p.at)}
                </small>
              </span>
              <Eye size={17} />
            </button>
          ))}
          {!posts.length && <Empty icon={Clock} title="Chưa lưu phiên bản" />}
        </section>
      )}
    </>
  );
}
function Ranking({
  state,
  job,
  selectedJob,
  setSelectedJob,
  openCandidate,
  act,
  editable,
  notify,
}) {
  const [query, setQuery] = useState(""),
    [selected, setSelected] = useState([]),
    [compare, setCompare] = useState(false),
    [status, setStatus] = useState("Tất cả"),
    [sort, setSort] = useState("desc");
  useEffect(() => {
    setSelected([]);
    setCompare(false);
  }, [selectedJob]);
  const apps = state.applications.filter((a) => a.jobId === selectedJob),
    valid = apps.filter((a) => a.current),
    list = apps
      .filter(
        (a) =>
          (a.candidate.name + " " + a.candidate.skills)
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (status === "Tất cả" || a.status === status),
      )
      .sort(
        (a, b) =>
          Number(b.current) - Number(a.current) ||
          (a.current && b.current
            ? sort === "desc"
              ? b.evaluation.score - a.evaluation.score
              : a.evaluation.score - b.evaluation.score
            : 0),
      );
  useEffect(() => {
    setSelected((old) => old.filter((id) => valid.some((a) => a.id === id)));
  }, [state.applications]);
  const compared = valid.filter((a) => selected.includes(a.id));
  return (
    <>
      <div className="toolbar">
        <JobSelect
          state={state}
          value={selectedJob}
          onChange={setSelectedJob}
        />
        {job && (
          <Badge color="green">
            <SlidersHorizontal size={12} />
            Tiêu chí v{job.rubricVersion}
          </Badge>
        )}
        <Button
          variant="secondary"
          disabled={compared.length < 2}
          onClick={() => setCompare(true)}
        >
          <Users size={16} />
          So sánh ({compared.length}/4)
        </Button>
      </div>
      <div className="ranking-banner">
        <span className="ranking-banner-icon">
          <Trophy size={26} />
        </span>
        <div>
          <h3>Đúng vị trí. Cùng tiêu chí. Có bằng chứng.</h3>
          <p>
            Điểm phản ánh thông tin trong CV; mở hồ sơ để xem căn cứ và điều cần
            xác minh.
          </p>
        </div>
        <div className="ranking-stats">
          <strong>
            {valid.length}
            <small>đã đánh giá hiện hành</small>
          </strong>
          <strong>
            {apps.length - valid.length}
            <small>chờ đánh giá / chấm lại</small>
          </strong>
        </div>
      </div>
      <section className="card">
        <div className="toolbar table-toolbar">
          <SearchBox
            query={query}
            setQuery={setQuery}
            placeholder="Tìm tên hoặc kỹ năng…"
          />
          <select
            aria-label="Lọc trạng thái ranking"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option>Tất cả</option>
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            aria-label="Sắp xếp điểm"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="desc">Điểm cao → thấp</option>
            <option value="asc">Điểm thấp → cao</option>
          </select>
        </div>
        <div className="table-wrap">
          <table className="ranking-table">
            <thead>
              <tr>
                <th />
                <th>Hạng</th>
                <th>Ứng viên</th>
                <th>Điểm tổng</th>
                <th>Yêu cầu bắt buộc</th>
                <th>Bằng chứng</th>
                <th>Trạng thái / ngày</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {list.map((a, i) => {
                const e = a.evaluation,
                  rank =
                    valid
                      .slice()
                      .sort((x, y) => y.evaluation.score - x.evaluation.score)
                      .findIndex((x) => x.id === a.id) + 1;
                return (
                  <tr key={a.id}>
                    <td>
                      <input
                        type="checkbox"
                        aria-label={"So sánh " + a.candidate.name}
                        disabled={!a.current}
                        checked={selected.includes(a.id)}
                        onChange={(ev) => {
                          if (ev.target.checked && selected.length >= 4) {
                            notify("Chọn tối đa 4 ứng viên.", true);
                            return;
                          }
                          setSelected((s) =>
                            ev.target.checked
                              ? [...s, a.id]
                              : s.filter((id) => id !== a.id),
                          );
                        }}
                      />
                    </td>
                    <td>
                      <span
                        className={`rank-number ${a.current && rank <= 3 ? "top-rank" : ""}`}
                      >
                        {a.current ? String(rank).padStart(2, "0") : "—"}
                      </span>
                    </td>
                    <td>
                      <div className="person-cell">
                        <Avatar name={a.candidate.name} index={i} />
                        <div>
                          <button
                            className="name-button"
                            onClick={() => openCandidate(a.id)}
                          >
                            {a.candidate.name}
                          </button>
                          <small>
                            {a.candidate.skills.slice(0, 45) ||
                              "Chưa xác nhận kỹ năng"}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      {a.current ? (
                        <>
                          <div className="score-cell">
                            <strong>{e.score}</strong>
                            <span>/100</span>
                          </div>
                          <small className="table-note">
                            {e.source === "demo"
                              ? "Điểm demo"
                              : e.source === "ai"
                                ? "AI đề xuất"
                                : "HR đánh giá"}
                          </small>
                        </>
                      ) : (
                        <Badge color="amber">
                          {e ? "Cần chấm lại" : "Chưa đánh giá"}
                        </Badge>
                      )}
                    </td>
                    <td>
                      {a.current ? (
                        <Badge
                          color={
                            e.mandatory.some((r) => r.status === "Chưa đáp ứng")
                              ? "red"
                              : e.mandatory.some(
                                    (r) => r.status === "Chưa đủ thông tin",
                                  )
                                ? "amber"
                                : "green"
                          }
                        >
                          {!e.mandatory.length
                            ? "Chưa có yêu cầu"
                            : e.mandatory.some(
                                  (r) => r.status === "Chưa đáp ứng",
                                )
                              ? "Cần xem xét"
                              : e.mandatory.some(
                                    (r) => r.status === "Chưa đủ thông tin",
                                  )
                                ? "Cần xác minh"
                                : "Đáp ứng"}
                        </Badge>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td>
                      {a.current ? (
                        <div className="coverage">
                          <strong>{e.coverage}%</strong>
                          <span>
                            <i style={{ width: e.coverage + "%" }} />
                          </span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <Badge
                        color={a.status === "Shortlist" ? "green" : "blue"}
                      >
                        {a.status}
                      </Badge>
                      <small className="table-note">
                        {e ? date(e.at) : "—"}
                      </small>
                    </td>
                    <td>
                      {editable && a.status !== "Shortlist" ? (
                        <button
                          className="icon-btn"
                          title="Thêm vào shortlist"
                          aria-label={"Shortlist " + a.candidate.name}
                          onClick={() =>
                            act(
                              () =>
                                api("/applications/" + a.id + "/status", {
                                  method: "PATCH",
                                  body: { status: "Shortlist" },
                                }),
                              "Đã thêm vào shortlist",
                            )
                          }
                        >
                          <Plus size={17} />
                        </button>
                      ) : (
                        <button
                          className="icon-btn"
                          aria-label="Xem hồ sơ"
                          onClick={() => openCandidate(a.id)}
                        >
                          <ChevronRight size={17} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!list.length && (
            <Empty
              icon={Trophy}
              title="Chưa có ứng viên để xếp hạng"
              text="Thêm CV cho vị trí này và xác nhận kết quả đánh giá."
            />
          )}
        </div>
      </section>
      {compare && (
        <Modal
          title="So sánh ứng viên"
          subtitle={`Cùng tiêu chí v${job.rubricVersion} · ${job.title}`}
          wide
          onClose={() => setCompare(false)}
        >
          <div className="table-wrap">
            <table className="compare-table">
              <thead>
                <tr>
                  <th>Tiêu chí</th>
                  {compared.map((a) => (
                    <th key={a.id}>{a.candidate.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Điểm tổng</td>
                  {compared.map((a) => (
                    <td key={a.id}>
                      <strong className="compare-score">
                        {a.evaluation.score}
                      </strong>
                    </td>
                  ))}
                </tr>
                {criteria.map((label, i) => (
                  <tr key={label}>
                    <td>
                      {label} ({job.weights[i]}%)
                    </td>
                    {compared.map((a) => (
                      <td key={a.id}>
                        <strong>{a.evaluation.criteria[i].score}</strong>
                        <p>{a.evaluation.criteria[i].explanation}</p>
                        <blockquote>
                          {a.evaluation.criteria[i].evidence ||
                            "Chưa có bằng chứng"}
                        </blockquote>
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td>Cần xác minh</td>
                  {compared.map((a) => (
                    <td key={a.id}>{a.evaluation.verify.join("; ")}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Modal>
      )}
    </>
  );
}
function CandidateDetail({
  detail,
  state,
  act,
  busy,
  onClose,
  onSchedule,
  onDeleted,
  notify,
}) {
  const [tab, setTab] = useState("evaluation"),
    [profile, setProfile] = useState({ ...detail.candidate }),
    [text, setText] = useState(detail.resume?.text || ""),
    [confirmed, setConfirmed] = useState(detail.resume?.confirmed || false),
    [editScore, setEditScore] = useState(false),
    [comment, setComment] = useState(""),
    [linkJob, setLinkJob] = useState(""),
    [deleteConfirm, setDeleteConfirm] = useState(false);
  const job = state.jobs.find((j) => j.id === detail.jobId),
    ev = detail.evaluation,
    editable = state.user.role !== "Hiring Manager";
  useEffect(() => {
    setProfile({ ...detail.candidate });
    setText(detail.resume?.text || "");
    setConfirmed(detail.resume?.confirmed || false);
  }, [
    detail.id,
    detail.resume?.version,
    detail.resume?.status,
    JSON.stringify(detail.candidate),
    detail.resume?.confirmed,
  ]);
  const task = state.tasks.find(
    (t) =>
      t.kind === "evaluate" &&
      t.data.applicationId === detail.id &&
      ["queued", "running"].includes(t.state),
  );
  return (
    <Modal
      title={detail.candidate.name}
      subtitle={`${job?.title} · ${detail.candidate.email || "Chưa có email"}`}
      wide
      onClose={onClose}
    >
      <div className="candidate-overview">
        <div className="person-cell">
          <Avatar name={detail.candidate.name} />
          <div>
            <Badge color="blue">{detail.status}</Badge>
            <small>
              {detail.candidate.demo
                ? "Hồ sơ tổng hợp · Demo"
                : `Tạo ngày ${date(detail.createdAt)}`}
            </small>
          </div>
        </div>
        <div className="detail-actions">
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() =>
              act(() => api("/applications/" + detail.id), "Đã cập nhật hồ sơ")
            }
          >
            <RotateCcw size={15} />
            Làm mới
          </Button>
          {editable && (
            <select
              aria-label="Thay đổi trạng thái ứng viên"
              value={detail.status}
              disabled={busy}
              onChange={(e) =>
                act(
                  () =>
                    api("/applications/" + detail.id + "/status", {
                      method: "PATCH",
                      body: { status: e.target.value },
                    }),
                  "Đã cập nhật trạng thái",
                )
              }
            >
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          )}
        </div>
      </div>
      {detail.duplicates.length > 0 && (
        <div className="notice amber">
          <AlertCircle size={17} />
          <p>
            Có thể trùng email hoặc số điện thoại với:{" "}
            {detail.duplicates.map((d) => d.name).join(", ")}. HR kiểm tra trước
            khi gộp hồ sơ.
          </p>
        </div>
      )}
      <div className="tabs">
        {[
          ["evaluation", "Đánh giá CV"],
          ["profile", "Thông tin & CV"],
          ["history", "Lịch sử điểm"],
          ["comments", "Nhận xét"],
        ].map(([key, label]) => (
          <button
            className={tab === key ? "active" : ""}
            onClick={() => setTab(key)}
            key={key}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "evaluation" && (
        <>
          {detail.resume?.status === "failed" && (
            <div className="notice amber">
              <AlertCircle size={18} />
              <p>
                {detail.resume.error} Hãy thử lại tác vụ hoặc nhập nội dung ở
                tab Thông tin & CV.
              </p>
            </div>
          )}
          {!detail.resume?.confirmed && (
            <div className="notice">
              <Eye size={18} />
              <p>Hãy kiểm tra và xác nhận nội dung CV trước khi chấm điểm.</p>
              <button onClick={() => setTab("profile")}>
                Kiểm tra CV <ArrowRight size={15} />
              </button>
            </div>
          )}
          {ev && !detail.current && (
            <div className="notice amber">
              <AlertCircle size={18} />
              <p>
                CV hoặc tiêu chí đã thay đổi. Kết quả v{ev.rubricVersion} được
                lưu trong lịch sử và cần đánh giá lại theo tiêu chí v
                {job.rubricVersion}.
              </p>
            </div>
          )}
          {ev && !editScore ? (
            <>
              <div className="evaluation-top">
                <div className="score-orb">
                  <strong>{ev.score}</strong>
                  <small>/ 100</small>
                </div>
                <div>
                  <h3>
                    {ev.source === "demo"
                      ? "Kết quả minh họa"
                      : ev.source === "ai"
                        ? "AI đề xuất · HR kiểm duyệt"
                        : "Đánh giá bởi HR"}
                  </h3>
                  <p>{ev.recommendation}</p>
                  <Badge color="green">Tiêu chí v{ev.rubricVersion}</Badge>{" "}
                  <Badge>Bằng chứng {ev.coverage}%</Badge>
                  {ev.source === "demo" && (
                    <p className="demo-disclosure">
                      Điểm và nhận xét tổng hợp để trải nghiệm. Không phải đánh
                      giá AI thật.
                    </p>
                  )}
                </div>
              </div>
              <div className="criterion-list">
                {ev.criteria.map((c, i) => (
                  <div className="criterion-card" key={i}>
                    <div>
                      <strong>{criteria[i]}</strong>
                      <span>
                        {ev.weights[i]}% trọng số <b>{c.score}/100</b>
                      </span>
                    </div>
                    <div className="criterion-bar">
                      <i style={{ width: c.score + "%" }} />
                    </div>
                    <p>{c.explanation}</p>
                    <blockquote>
                      {c.evidence || "Chưa đủ thông tin trong CV"}
                      <small>{c.source || "Nguồn chưa xác định"}</small>
                    </blockquote>
                  </div>
                ))}
              </div>
              <h3 className="subheading">Yêu cầu bắt buộc</h3>
              {ev.mandatory.map((r, i) => (
                <div className="mandatory-row" key={i}>
                  <div>
                    <strong>{r.requirement}</strong>
                    {r.evidence && <small>{r.evidence}</small>}
                  </div>
                  <Badge
                    color={
                      r.status === "Đáp ứng"
                        ? "green"
                        : r.status === "Chưa đáp ứng"
                          ? "red"
                          : "amber"
                    }
                  >
                    {r.status}
                  </Badge>
                </div>
              ))}
              <div className="evaluation-notes">
                {[
                  ["Điểm mạnh", ev.strengths],
                  ["Khoảng trống cần xem xét", ev.gaps],
                  ["Cần xác minh", ev.verify],
                  ["Câu hỏi gợi ý", ev.questions],
                ].map(([label, items]) => (
                  <div key={label}>
                    <h4>{label}</h4>
                    <ul>
                      {items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </>
          ) : (
            !editScore && (
              <Empty
                icon={FileText}
                title="Sẵn sàng cho một đánh giá có căn cứ"
                text="Xác nhận nội dung CV, sau đó dùng AI hoặc chấm điểm thủ công."
              />
            )
          )}
          {editScore && (
            <EvaluationForm
              resumeVersion={detail.resume.version}
              evaluation={ev}
              job={job}
              busy={busy}
              onCancel={() => setEditScore(false)}
              onSave={(data) =>
                act(async () => {
                  const result = await api(
                    "/applications/" + detail.id + "/evaluations",
                    { method: "POST", body: data },
                  );
                  setEditScore(false);
                  return result;
                }, "Đã lưu đánh giá và lịch sử điểm")
              }
            />
          )}
          {editable && !editScore && (
            <div className="form-actions">
              <Button variant="secondary" onClick={onSchedule}>
                <Phone size={16} />
                Lên lịch phone interview
              </Button>
              <Button
                variant="secondary"
                disabled={!detail.resume?.confirmed}
                onClick={() => setEditScore(true)}
              >
                <Pencil size={16} />
                {ev ? "Điều chỉnh điểm" : "Chấm thủ công"}
              </Button>
              <Button
                disabled={
                  busy ||
                  !!task ||
                  !state.ai.configured ||
                  !detail.resume?.confirmed
                }
                onClick={() =>
                  act(
                    () =>
                      api("/ai", {
                        method: "POST",
                        body: {
                          kind: "evaluate",
                          jobId: detail.jobId,
                          applicationId: detail.id,
                        },
                      }),
                    "AI đang đánh giá. Làm mới hồ sơ khi hoàn tất.",
                  )
                }
              >
                <Sparkles size={16} />
                {task ? "Đang đánh giá…" : "Đánh giá bằng AI"}
              </Button>
            </div>
          )}
        </>
      )}
      {tab === "profile" && (
        <>
          <div className="source-layout">
            <div>
              <h3 className="subheading">CV nguồn</h3>
              {detail.resume?.file && (
                <>
                  <a
                    className="download-link"
                    href={"/api/resumes/" + detail.resume.id + "/file"}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Download size={16} />
                    {detail.resume.file.name}
                  </a>
                  {detail.resume.file.kind === "pdf" && (
                    <iframe
                      className="pdf-preview"
                      title="CV gốc"
                      src={"/api/resumes/" + detail.resume.id + "/file"}
                    />
                  )}
                </>
              )}
              <Field
                label="Văn bản CV"
                hint="Sửa lỗi trích xuất tại đây. Thay đổi văn bản sẽ yêu cầu chấm lại."
              >
                <textarea
                  className="cv-source"
                  rows="17"
                  value={text}
                  readOnly={
                    !editable ||
                    ["running", "queued"].includes(detail.resume?.status)
                  }
                  onChange={(e) => {
                    setText(e.target.value);
                    setConfirmed(false);
                  }}
                />
              </Field>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                act(
                  () =>
                    api("/applications/" + detail.id + "/profile", {
                      method: "PUT",
                      body: {
                        profile: Object.fromEntries(
                          Object.keys(blankProfile).map((k) => [
                            k,
                            profile[k] || "",
                          ]),
                        ),
                        text,
                        confirmed,
                      },
                    }),
                  "Đã lưu dữ liệu CV",
                );
              }}
            >
              <div className="profile-heading">
                <h3 className="subheading">Thông tin ứng viên</h3>
                {editable && (
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={
                      busy ||
                      !state.ai.configured ||
                      detail.resume?.status !== "done"
                    }
                    onClick={() =>
                      act(
                        () =>
                          api("/ai", {
                            method: "POST",
                            body: {
                              kind: "profile",
                              jobId: detail.jobId,
                              applicationId: detail.id,
                            },
                          }),
                        "AI đang trích thông tin. Làm mới hồ sơ khi hoàn tất.",
                      )
                    }
                  >
                    <Sparkles size={14} />
                    Trích thông tin AI
                  </Button>
                )}
              </div>
              <fieldset disabled={!editable || busy}>
                <ProfileFields profile={profile} setProfile={setProfile} />
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                  />
                  Tôi đã kiểm tra thông tin với CV nguồn
                </label>
              </fieldset>
              {editable && (
                <Button
                  className="full"
                  disabled={
                    busy ||
                    text.length < 20 ||
                    ["queued", "running"].includes(detail.resume?.status)
                  }
                >
                  <Check size={16} />
                  Lưu thông tin & xác nhận
                </Button>
              )}
            </form>
          </div>
          {editable && (
            <div className="link-job">
              <h3>Ứng tuyển vị trí khác</h3>
              <div>
                <select
                  aria-label="Vị trí ứng tuyển bổ sung"
                  value={linkJob}
                  onChange={(e) => setLinkJob(e.target.value)}
                >
                  <option value="">Chọn vị trí…</option>
                  {state.jobs
                    .filter((j) => j.id !== detail.jobId)
                    .map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.title}
                      </option>
                    ))}
                </select>
                <Button
                  variant="secondary"
                  disabled={!linkJob || busy}
                  onClick={() =>
                    act(
                      () =>
                        api("/applications/" + detail.id + "/link", {
                          method: "POST",
                          body: { jobId: linkJob },
                        }),
                      "Đã tạo lần ứng tuyển mới, điểm và trạng thái được quản lý riêng",
                    )
                  }
                >
                  Thêm lần ứng tuyển
                </Button>
              </div>
            </div>
          )}
          {state.user.role === "Admin" && (
            <div className="delete-zone">
              {deleteConfirm ? (
                <>
                  <p>
                    Xóa ứng viên, tất cả CV, điểm và phỏng vấn ở mọi vị trí?
                    Thao tác này không thể hoàn tác.
                  </p>
                  <Button
                    variant="danger"
                    disabled={busy}
                    onClick={() =>
                      act(async () => {
                        const result = await api(
                          "/candidates/" + detail.candidateId,
                          { method: "DELETE" },
                        );
                        onDeleted();
                        return result;
                      }, "Đã xóa dữ liệu ứng viên")
                    }
                  >
                    Xác nhận xóa
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setDeleteConfirm(false)}
                  >
                    Hủy
                  </Button>
                </>
              ) : (
                <Button variant="ghost" onClick={() => setDeleteConfirm(true)}>
                  <Trash2 size={16} />
                  Xóa toàn bộ dữ liệu ứng viên
                </Button>
              )}
            </div>
          )}
        </>
      )}
      {tab === "history" && (
        <>
          {detail.evaluations.map((e) => (
            <div className="history-evaluation" key={e.id}>
              <div>
                <strong>{e.score}/100</strong>
                <Badge>
                  Tiêu chí v{e.rubricVersion} · CV v{e.resumeVersion}
                </Badge>
                <Badge color={e.source === "demo" ? "amber" : "green"}>
                  {e.source === "demo"
                    ? "Demo"
                    : e.source === "ai"
                      ? "AI"
                      : "HR"}
                </Badge>
                <small>
                  {date(e.at)} · {e.actor || e.model || "Thủ công"}
                </small>
              </div>
              <p>{e.reason || e.recommendation}</p>
              {e.originalScore !== null && e.originalScore !== undefined && (
                <small>
                  Điểm trước: {e.originalScore} → {e.score}
                </small>
              )}
              <div className="history-score-list">
                {e.criteria.map((c, i) => (
                  <span key={i}>
                    {criteria[i]}: {c.score}
                  </span>
                ))}
              </div>
              <small>
                Prompt: {e.promptVersion || "Không dùng AI"} · Model:{" "}
                {e.model || "—"}
              </small>
            </div>
          ))}
          {!detail.evaluations.length && (
            <Empty icon={Clock} title="Chưa có lịch sử đánh giá" />
          )}
        </>
      )}
      {tab === "comments" && (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              act(async () => {
                const r = await api(
                  "/applications/" + detail.id + "/comments",
                  { method: "POST", body: { content: comment } },
                );
                setComment("");
                return r;
              }, "Đã lưu nhận xét");
            }}
          >
            <Field label="Nhận xét cho đội tuyển dụng">
              <textarea
                rows="3"
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ghi nhận xét và các điểm cần xác minh…"
              />
            </Field>
            <Button disabled={busy || !comment.trim()}>
              <MessageSquare size={16} />
              Lưu nhận xét
            </Button>
          </form>
          {detail.comments.map((c) => (
            <div className="comment" key={c.id}>
              <Avatar name={c.actor} small />
              <div>
                <strong>
                  {c.actor}
                  <small>{date(c.at)}</small>
                </strong>
                <p>{c.content}</p>
              </div>
            </div>
          ))}
        </>
      )}
    </Modal>
  );
}
function EvaluationForm({
  evaluation,
  job: initialJob,
  resumeVersion,
  onSave,
  onCancel,
  busy,
}) {
  const [job] = useState(() => structuredClone(initialJob));
  const versions = useRef({
    rubricVersion: initialJob.rubricVersion,
    resumeVersion,
  });
  const [data, setData] = useState(() => ({
    criteria:
      evaluation?.criteria.map((c) => ({ ...c })) ||
      criteria.map(() => ({
        score: 0,
        evidence: "",
        explanation: "Chưa đủ thông tin",
        source: "",
      })),
    mandatory: job.required
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((requirement) => ({
        requirement,
        status: "Chưa đủ thông tin",
        evidence: "",
      })),
    strengths: evaluation?.strengths || [],
    gaps: evaluation?.gaps || [],
    verify: evaluation?.verify || [],
    questions: evaluation?.questions || [],
    recommendation: evaluation?.recommendation || "HR xác minh thêm thông tin.",
    coverage: evaluation?.coverage || 0,
    reason: "",
  }));
  const update = (i, k, value) =>
    setData((d) => ({
      ...d,
      criteria: d.criteria.map((c, index) =>
        index === i ? { ...c, [k]: value } : c,
      ),
    }));
  const score =
    Math.round(
      data.criteria.reduce(
        (sum, c, i) => sum + (c.score * job.weights[i]) / 100,
        0,
      ) * 10,
    ) / 10;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ ...data, ...versions.current });
      }}
    >
      <div className="notice">
        <Pencil size={17} />
        <p>
          Điểm được tính ở backend. Lưu đánh giá mới cùng lý do; điểm cũ vẫn có
          trong lịch sử.
        </p>
        <strong>{score}/100</strong>
      </div>
      {criteria.map((label, i) => (
        <div className="manual-criterion" key={label}>
          <h4>
            {label} · {job.weights[i]}%
          </h4>
          <div className="form-grid">
            <Field label="Điểm (0–100)">
              <input
                required
                type="number"
                min="0"
                max="100"
                value={data.criteria[i].score}
                onChange={(e) => update(i, "score", Number(e.target.value))}
              />
            </Field>
            <Field label="Trang / đoạn nguồn">
              <input
                value={data.criteria[i].source}
                onChange={(e) => update(i, "source", e.target.value)}
              />
            </Field>
            <Field label="Bằng chứng nguyên văn">
              <textarea
                rows="2"
                value={data.criteria[i].evidence}
                onChange={(e) => update(i, "evidence", e.target.value)}
              />
            </Field>
            <Field label="Giải thích">
              <textarea
                rows="2"
                value={data.criteria[i].explanation}
                onChange={(e) => update(i, "explanation", e.target.value)}
              />
            </Field>
          </div>
        </div>
      ))}
      <h3 className="subheading">Yêu cầu bắt buộc</h3>
      {data.mandatory.map((r, i) => (
        <div className="mandatory-edit" key={i}>
          <strong>{r.requirement}</strong>
          <select
            aria-label={"Đánh giá " + r.requirement}
            value={r.status}
            onChange={(e) =>
              setData((d) => ({
                ...d,
                mandatory: d.mandatory.map((x, k) =>
                  k === i ? { ...x, status: e.target.value } : x,
                ),
              }))
            }
          >
            {["Đáp ứng", "Chưa đáp ứng", "Chưa đủ thông tin"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <input
            placeholder="Bằng chứng / thông tin cần xác minh"
            value={r.evidence}
            onChange={(e) =>
              setData((d) => ({
                ...d,
                mandatory: d.mandatory.map((x, k) =>
                  k === i ? { ...x, evidence: e.target.value } : x,
                ),
              }))
            }
          />
        </div>
      ))}
      <div className="form-grid">
        {[
          ["strengths", "Điểm mạnh"],
          ["gaps", "Khoảng trống"],
          ["verify", "Cần xác minh"],
          ["questions", "Câu hỏi phỏng vấn"],
        ].map(([k, label]) => (
          <Field label={label + " (mỗi dòng một ý)"} key={k}>
            <textarea
              rows="3"
              value={data[k].join("\n")}
              onChange={(e) =>
                setData((d) => ({ ...d, [k]: e.target.value.split("\n") }))
              }
            />
          </Field>
        ))}
      </div>
      <Field label="Mức độ đầy đủ của bằng chứng (%)">
        <input
          type="number"
          min="0"
          max="100"
          value={data.coverage}
          onChange={(e) =>
            setData((d) => ({ ...d, coverage: Number(e.target.value) }))
          }
        />
      </Field>
      <Field label="Đề xuất bước tiếp theo">
        <textarea
          rows="2"
          value={data.recommendation}
          onChange={(e) =>
            setData((d) => ({ ...d, recommendation: e.target.value }))
          }
        />
      </Field>
      <Field label="Lý do chấm / điều chỉnh điểm *">
        <textarea
          rows="2"
          required
          minLength="3"
          value={data.reason}
          onChange={(e) => setData((d) => ({ ...d, reason: e.target.value }))}
        />
      </Field>
      <div className="form-actions">
        <Button variant="secondary" type="button" onClick={onCancel}>
          Hủy
        </Button>
        <Button disabled={busy}>Lưu đánh giá · {score}/100</Button>
      </div>
    </form>
  );
}
function ScheduleModal({
  applications,
  initialApplicationId,
  onClose,
  onSave,
  busy,
}) {
  const [applicationId, setApplicationId] = useState(
      initialApplicationId || applications[0]?.id || "",
    ),
    [scheduledAt, setScheduledAt] = useState(
      localDate(new Date(Date.now() + 86400000)),
    ),
    [duration, setDuration] = useState(20);
  return (
    <Modal
      title="Lên lịch phone interview"
      subtitle="Một cuộc trò chuyện ngắn để hiểu ứng viên tốt hơn."
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(applicationId, {
            scheduledAt: new Date(scheduledAt).toISOString(),
            duration,
          });
        }}
      >
        <Field label="Ứng viên & vị trí">
          <select
            required
            value={applicationId}
            onChange={(e) => setApplicationId(e.target.value)}
          >
            {applications.map((a) => (
              <option key={a.id} value={a.id}>
                {a.candidate.name} · {a.jobTitle}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Ngày và giờ (giờ trên máy của bạn)">
          <input
            required
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />
        </Field>
        <Field label="Thời lượng">
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          >
            {[15, 20, 25, 30].map((t) => (
              <option value={t} key={t}>
                {t} phút
              </option>
            ))}
          </select>
        </Field>
        <div className="notice">
          <Phone size={17} />
          <p>
            Lưu lịch và kịch bản nội bộ. HR thực hiện cuộc gọi bằng điện thoại
            của mình.
          </p>
        </div>
        <div className="form-actions">
          <Button variant="secondary" type="button" onClick={onClose}>
            Hủy
          </Button>
          <Button disabled={busy || !applicationId}>Lưu lịch phỏng vấn</Button>
        </div>
      </form>
    </Modal>
  );
}
function Interviews({ state, act, notify, editable, openCandidate, busy }) {
  const list = [...state.interviews].sort((a, b) =>
    a.scheduledAt.localeCompare(b.scheduledAt),
  );
  const [selectedId, setSelectedId] = useState(list[0]?.id || ""),
    [data, setData] = useState(null),
    [dirty, setDirty] = useState(false);
  const source = list.find((i) => i.id === selectedId);
  useEffect(() => {
    if (!list.some((i) => i.id === selectedId))
      setSelectedId(list[0]?.id || "");
  }, [state.interviews]);
  useEffect(() => {
    setData(source ? structuredClone(source) : null);
    setDirty(false);
  }, [selectedId]);
  useEffect(() => {
    if (!dirty) setData(source ? structuredClone(source) : null);
  }, [JSON.stringify(source)]);
  const update = (key, value) => {
    setData((d) => ({ ...d, [key]: value, state: "Nháp", summary: null }));
    setDirty(true);
  };
  const application = state.applications.find(
    (a) => a.id === data?.applicationId,
  );
  const save = async () => {
    const result = await act(
      () =>
        api("/interviews/" + data.id, {
          method: "PUT",
          body: {
            scheduledAt: data.scheduledAt,
            duration: data.duration,
            questions: data.questions,
            notes: data.notes,
            scores: data.scores,
            state: data.state,
            summary: data.summary,
          },
        }),
      "Đã lưu phỏng vấn",
    );
    if (result) {
      setData(result);
      setDirty(false);
    }
    return result;
  };
  const ai = (kind) =>
    act(
      () =>
        api("/ai", {
          method: "POST",
          body: {
            kind,
            jobId: application.jobId,
            applicationId: application.id,
            interviewId: data.id,
          },
        }),
      "AI đang xử lý. Kết quả sẽ xuất hiện khi hoàn tất.",
    );
  return !list.length ? (
    <section className="card">
      <Empty
        icon={Phone}
        title="Bắt đầu cuộc trò chuyện đầu tiên"
        text="Lên lịch phỏng vấn và chuẩn bị câu hỏi từ hồ sơ ứng viên."
      />
    </section>
  ) : (
    <div className="interview-workspace">
      <aside className="card interview-sidebar">
        <div className="section-head">
          <h2>Cuộc phỏng vấn</h2>
          <Badge>{list.length}</Badge>
        </div>
        {list.map((i) => {
          const a = state.applications.find((a) => a.id === i.applicationId);
          return (
            <button
              key={i.id}
              className={`interview-select ${i.id === selectedId ? "active" : ""}`}
              onClick={() => {
                if (
                  dirty &&
                  !window.confirm(
                    "Bạn có ghi chú chưa lưu. Chuyển cuộc phỏng vấn và bỏ thay đổi?",
                  )
                )
                  return;
                setSelectedId(i.id);
              }}
            >
              <div className="person-cell">
                <Avatar name={a?.candidate.name} small />
                <div>
                  <strong>{a?.candidate.name}</strong>
                  <small>{a?.jobTitle}</small>
                </div>
              </div>
              <div>
                <span>
                  <Clock size={12} />
                  {time(i.scheduledAt)} ·{" "}
                  {date(i.scheduledAt, { day: "2-digit", month: "2-digit" })}
                </span>
                <Badge color={i.state === "Đã duyệt" ? "green" : "blue"}>
                  {i.state}
                </Badge>
              </div>
            </button>
          );
        })}
      </aside>
      {data && application && (
        <section className="card interview-main">
          <div className="section-head">
            <div>
              <span className="eyebrow">
                PHONE INTERVIEW · {data.duration} PHÚT
              </span>
              <h2>{application.candidate.name}</h2>
              <p>
                {application.jobTitle} ·{" "}
                {application.candidate.phone || "Chưa có số điện thoại"}
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => openCandidate(application.id)}
            >
              <FileText size={16} />
              Xem CV
            </Button>
          </div>
          <div className="interview-context">
            <span>
              <CalendarDays size={16} />
              {date(data.scheduledAt)} · {time(data.scheduledAt)} (UTC+7)
            </span>
            <Badge color={data.state === "Đã duyệt" ? "green" : "amber"}>
              {dirty ? "Có thay đổi chưa lưu" : data.state}
            </Badge>
          </div>
          <div className="interview-tools">
            <h3>Kịch bản & câu trả lời</h3>
            {editable && (
              <Button
                variant="secondary"
                disabled={dirty || busy || !state.ai.configured}
                onClick={() => ai("questions")}
              >
                <Sparkles size={15} />
                Gợi ý câu hỏi AI
              </Button>
            )}
          </div>
          <fieldset disabled={!editable || busy}>
            <div className="question-list">
              {data.questions.map((q, i) => (
                <div className="question" key={i}>
                  <div>
                    <label>
                      <input
                        type="checkbox"
                        checked={q.asked}
                        onChange={(e) =>
                          update(
                            "questions",
                            data.questions.map((x, k) =>
                              i === k ? { ...x, asked: e.target.checked } : x,
                            ),
                          )
                        }
                      />
                      <span>{String(i + 1).padStart(2, "0")}</span>
                      <input
                        className="question-text"
                        aria-label={"Câu hỏi " + (i + 1)}
                        value={q.text}
                        onChange={(e) =>
                          update(
                            "questions",
                            data.questions.map((x, k) =>
                              i === k ? { ...x, text: e.target.value } : x,
                            ),
                          )
                        }
                      />
                    </label>
                    {editable && (
                      <button
                        className="icon-btn"
                        aria-label="Xóa câu hỏi"
                        disabled={data.questions.length <= 1}
                        onClick={() =>
                          update(
                            "questions",
                            data.questions.filter((_, k) => k !== i),
                          )
                        }
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <textarea
                    aria-label={"Câu trả lời " + (i + 1)}
                    rows="2"
                    placeholder="Ghi lại câu trả lời của ứng viên…"
                    value={q.answer}
                    onChange={(e) =>
                      update(
                        "questions",
                        data.questions.map((x, k) =>
                          i === k ? { ...x, answer: e.target.value } : x,
                        ),
                      )
                    }
                  />
                </div>
              ))}
            </div>
            {editable && (
              <Button
                variant="ghost"
                disabled={data.questions.length >= 20}
                onClick={() =>
                  update("questions", [
                    ...data.questions,
                    { text: "Câu hỏi mới", answer: "", asked: false },
                  ])
                }
              >
                <Plus size={15} />
                Thêm câu hỏi
              </Button>
            )}
            <Field label="Ghi chú hoặc transcript">
              <textarea
                rows="4"
                value={data.notes}
                onChange={(e) => update("notes", e.target.value)}
                placeholder="Nhập ghi chú cuộc gọi hoặc transcript để AI tóm tắt…"
              />
            </Field>
            <h3 className="subheading">Scorecard phỏng vấn</h3>
            <div className="interview-scores">
              {[
                "Kinh nghiệm liên quan",
                "Làm rõ kỹ năng",
                "Động lực ứng tuyển",
              ].map((label, i) => (
                <Field key={label} label={label}>
                  <select
                    value={data.scores[i]}
                    onChange={(e) =>
                      update(
                        "scores",
                        data.scores.map((s, k) =>
                          i === k ? Number(e.target.value) : s,
                        ),
                      )
                    }
                  >
                    <option value="0">Chưa đánh giá</option>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <option key={s} value={s}>
                        {s}/5
                      </option>
                    ))}
                  </select>
                </Field>
              ))}
            </div>
          </fieldset>
          <div className="summary-panel">
            <div>
              <h3>
                <Sparkles size={17} />
                Tóm tắt cuộc trò chuyện
              </h3>
              {editable && (
                <Button
                  variant="secondary"
                  disabled={
                    dirty ||
                    busy ||
                    !state.ai.configured ||
                    (!data.notes.trim() &&
                      !data.questions.some((q) => q.answer.trim()))
                  }
                  onClick={() => ai("summary")}
                >
                  Tóm tắt bằng AI
                </Button>
              )}
            </div>
            {data.summary ? (
              <>
                <div className="summary-columns">
                  {[
                    ["Thông tin đã trả lời", data.summary.answered],
                    ["Suy luận của AI", data.summary.inferences],
                    ["Cần xác minh", data.summary.verify],
                  ].map(([title, items]) => (
                    <div key={title}>
                      <h4>{title}</h4>
                      <ul>
                        {items.map((v, i) => (
                          <li key={i}>{v}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <p>
                  <strong>Bước tiếp theo: </strong>
                  {data.summary.nextStep}
                </p>
              </>
            ) : (
              <p className="muted">
                Lưu câu trả lời và ghi chú trước khi tạo tóm tắt. HR kiểm duyệt
                trước khi lưu kết quả chính thức.
              </p>
            )}
          </div>
          {editable && (
            <div className="form-actions">
              <span className="muted">
                {dirty ? "Nhớ lưu những thay đổi của bạn." : "Ghi chú đã lưu."}
              </span>
              <Button variant="secondary" disabled={busy} onClick={save}>
                <Check size={16} />
                Lưu nháp
              </Button>
              <Button
                disabled={busy || dirty}
                onClick={async () => {
                  const result = await act(
                    () =>
                      api("/interviews/" + data.id, {
                        method: "PUT",
                        body: {
                          scheduledAt: data.scheduledAt,
                          duration: data.duration,
                          questions: data.questions,
                          notes: data.notes,
                          scores: data.scores,
                          summary: data.summary,
                          state: "Đã duyệt",
                        },
                      }),
                    "Đã duyệt kết quả phỏng vấn",
                  );
                  if (result) {
                    setData(result);
                    setDirty(false);
                  }
                }}
              >
                <ShieldCheck size={16} />
                Duyệt kết quả
              </Button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
function SettingsView({ state, act, notify, busy }) {
  const isAdmin = state.user.role === "Admin";
  const [form, setForm] = useState({
      name: "",
      email: "",
      password: "",
      role: "Recruiter",
    }),
    [days, setDays] = useState(state.settings.retentionDays),
    [audit, setAudit] = useState(null),
    [purgeConfirm, setPurgeConfirm] = useState(false),
    [password, setPassword] = useState({
      currentPassword: "",
      newPassword: "",
    });
  return (
    <div className="settings-grid">
      <section className="card settings-card">
        <div className="section-head">
          <div>
            <h2>
              <Sparkles size={19} />
              Kết nối AI
            </h2>
            <p>Thông tin cấu hình backend</p>
          </div>
          <Badge color={state.ai.configured ? "green" : "amber"}>
            {state.ai.configured ? "Đã cấu hình" : "Chưa cấu hình"}
          </Badge>
        </div>
        <div className="settings-content">
          <p>
            API key được đọc từ biến môi trường của server; không gửi về trình
            duyệt.
          </p>
          <div className="config-line">
            <span>Nhà cung cấp</span>
            <strong>Responses API</strong>
          </div>
          <div className="config-line">
            <span>Model</span>
            <strong>{state.ai.model || "Chưa thiết lập"}</strong>
          </div>
          {isAdmin && (
            <div className="code-note">
              Trong file .env, đặt <code>OPENAI_API_KEY</code> và{" "}
              <code>OPENAI_MODEL</code>, sau đó khởi động lại server.
            </div>
          )}
          <div className="notice">
            <ShieldCheck size={18} />
            <p>
              AI trích bằng chứng từ CV. Backend kiểm tra dữ liệu và tính điểm.
              Chỉ HR quyết định kết quả tuyển dụng.
            </p>
          </div>
        </div>
      </section>
      <section className="card settings-card">
        <div className="section-head">
          <h2>Tài khoản của bạn</h2>
        </div>
        <div className="settings-content">
          <div className="person-cell">
            <Avatar name={state.user.name} />
            <div>
              <strong>{state.user.name}</strong>
              <small>
                {state.user.email} · {state.user.role}
              </small>
            </div>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              act(async () => {
                const result = await api("/password", {
                  method: "POST",
                  body: password,
                });
                setPassword({ currentPassword: "", newPassword: "" });
                return result;
              }, "Đã đổi mật khẩu");
            }}
          >
            <Field label="Mật khẩu hiện tại">
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password.currentPassword}
                onChange={(e) =>
                  setPassword((p) => ({
                    ...p,
                    currentPassword: e.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Mật khẩu mới (ít nhất 12 ký tự)">
              <input
                type="password"
                required
                minLength="12"
                autoComplete="new-password"
                value={password.newPassword}
                onChange={(e) =>
                  setPassword((p) => ({ ...p, newPassword: e.target.value }))
                }
              />
            </Field>
            <Button variant="secondary" disabled={busy}>
              Đổi mật khẩu
            </Button>
          </form>
        </div>
      </section>
      {isAdmin && (
        <>
          <section className="card settings-card span-2">
            <div className="section-head">
              <div>
                <h2>Thành viên workspace</h2>
                <p>
                  Phân công quyền theo từng vị trí trong màn hình Vị trí tuyển
                  dụng.
                </p>
              </div>
              <Badge>{state.users.length} thành viên</Badge>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Thành viên</th>
                    <th>Email</th>
                    <th>Vai trò</th>
                    <th>Hoạt động</th>
                  </tr>
                </thead>
                <tbody>
                  {state.users.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="person-cell">
                          <Avatar name={u.name} small />
                          <strong>{u.name}</strong>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <select
                          aria-label={"Vai trò " + u.name}
                          value={u.role}
                          disabled={busy || u.id === state.user.id}
                          onChange={(e) =>
                            act(
                              () =>
                                api("/users/" + u.id, {
                                  method: "PATCH",
                                  body: {
                                    role: e.target.value,
                                    active: u.active,
                                  },
                                }),
                              "Đã cập nhật vai trò",
                            )
                          }
                        >
                          {["Admin", "Recruiter", "Hiring Manager"].map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          aria-label={"Kích hoạt " + u.name}
                          checked={u.active}
                          disabled={busy || u.id === state.user.id}
                          onChange={(e) =>
                            act(
                              () =>
                                api("/users/" + u.id, {
                                  method: "PATCH",
                                  body: {
                                    role: u.role,
                                    active: e.target.checked,
                                  },
                                }),
                              "Đã cập nhật trạng thái",
                            )
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <form
              className="new-user-form"
              onSubmit={(e) => {
                e.preventDefault();
                act(async () => {
                  const r = await api("/users", { method: "POST", body: form });
                  setForm({
                    name: "",
                    email: "",
                    password: "",
                    role: "Recruiter",
                  });
                  return r;
                }, "Đã thêm thành viên");
              }}
            >
              <h3>Thêm thành viên</h3>
              <div className="form-grid">
                <Field label="Họ tên">
                  <input
                    required
                    minLength="2"
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                  />
                </Field>
                <Field label="Email">
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, email: e.target.value }))
                    }
                  />
                </Field>
                <Field label="Mật khẩu (ít nhất 12 ký tự)">
                  <input
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength="12"
                    value={form.password}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, password: e.target.value }))
                    }
                  />
                </Field>
                <Field label="Vai trò">
                  <select
                    value={form.role}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, role: e.target.value }))
                    }
                  >
                    {["Admin", "Recruiter", "Hiring Manager"].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <Button disabled={busy}>
                <Plus size={16} />
                Thêm thành viên
              </Button>
            </form>
          </section>
          <section className="card settings-card">
            <div className="section-head">
              <h2>Lưu trữ & quyền riêng tư</h2>
            </div>
            <div className="settings-content">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  act(
                    () =>
                      api("/settings", {
                        method: "PUT",
                        body: { retentionDays: days },
                      }),
                    "Đã lưu thời hạn",
                  );
                }}
              >
                <Field
                  label="Thời hạn lưu dữ liệu ứng viên (ngày)"
                  hint="Tính từ lần ứng tuyển gần nhất. Server kiểm tra mỗi giờ."
                >
                  <input
                    required
                    type="number"
                    min="1"
                    max="3650"
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                  />
                </Field>
                <Button variant="secondary" disabled={busy}>
                  Lưu thời hạn
                </Button>
              </form>
              <div className="delete-zone">
                {purgeConfirm ? (
                  <>
                    <p>
                      Xóa vĩnh viễn các hồ sơ đã hết hạn theo cấu hình đang lưu?
                    </p>
                    <Button
                      variant="danger"
                      disabled={busy}
                      onClick={() =>
                        act(async () => {
                          const r = await api("/purge", { method: "POST" });
                          setPurgeConfirm(false);
                          notify(`Đã xóa ${r.count} hồ sơ hết hạn`);
                          return r;
                        })
                      }
                    >
                      Xác nhận xóa
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setPurgeConfirm(false)}
                    >
                      Hủy
                    </Button>
                  </>
                ) : (
                  <Button variant="ghost" onClick={() => setPurgeConfirm(true)}>
                    <Trash2 size={16} />
                    Dọn hồ sơ hết hạn ngay
                  </Button>
                )}
              </div>
            </div>
          </section>
          <section className="card settings-card">
            <div className="section-head">
              <h2>Nhật ký thao tác</h2>
              <Button
                variant="secondary"
                onClick={async () => {
                  try {
                    setAudit(await api("/audit"));
                  } catch (e) {
                    notify(e.message, true);
                  }
                }}
              >
                <RotateCcw size={15} />
                Tải nhật ký
              </Button>
            </div>
            <div className="settings-content audit-list">
              {audit?.map((a) => (
                <div key={a.id}>
                  <strong>{a.action}</strong>
                  <small>
                    {a.actor} · {date(a.at)} · {time(a.at)}
                  </small>
                </div>
              ))}
              {!audit?.length && (
                <p className="muted">Tải để xem tối đa 100 thao tác gần đây.</p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App />);
