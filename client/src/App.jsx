import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  BrainCircuit,
  CalendarDays,
  ClipboardCheck,
  CreditCard,
  Edit3,
  Flame,
  Gauge,
  KeyRound,
  LayoutDashboard,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Landmark,
  Mail,
  Moon,
  Plus,
  RefreshCw,
  Receipt,
  Save,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
  TriangleAlert,
  Trophy,
  Trash2,
  UserPlus,
  UserRound,
  UserRoundCog,
  Users,
  Wallet,
  WalletCards,
  X,
  Youtube
} from "lucide-react";
import { api } from "./lib/api.js";

const APP_NAME = "GETFIT GYM";
const LOGO_SRC = "/getfit-logo.svg";
const BRAND_QUOTE = "Train smarter. Get stronger.";

const roleLabels = {
  ADMIN: "Administrateur",
  COACH: "Coach",
  MEMBER: "Membre"
};

const navByRole = {
  ADMIN: [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "members", label: "Membres", icon: Users },
    { id: "subscriptions", label: "Abonnements", icon: BadgeCheck },
    { id: "courses", label: "Cours", icon: CalendarDays },
    { id: "attendance", label: "Presences", icon: ClipboardCheck },
    { id: "payments", label: "Paiements", icon: CreditCard },
    { id: "recommendations", label: "IA training", icon: BrainCircuit },
    { id: "coaches", label: "Coachs", icon: UserRoundCog },
    { id: "plans", label: "Offres", icon: WalletCards }
  ],
  COACH: [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "coachPortal", label: "Planning", icon: UserRoundCog },
    { id: "members", label: "Membres", icon: Users },
    { id: "courses", label: "Cours", icon: CalendarDays },
    { id: "attendance", label: "Presences", icon: ClipboardCheck },
    { id: "recommendations", label: "IA training", icon: BrainCircuit }
  ],
  MEMBER: [
    { id: "dashboard", label: "Mon espace", icon: UserRound },
    { id: "courses", label: "Cours", icon: CalendarDays },
    { id: "payments", label: "Paiements", icon: CreditCard },
    { id: "recommendations", label: "Programme IA", icon: BrainCircuit }
  ]
};

const objectives = ["Perte de poids", "Prise de masse", "Condition physique"];
const levels = ["Debutant", "Intermediaire", "Avance"];

const pad = (value) => String(value).padStart(2, "0");

const toDateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const toDateTimeInput = (value) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const nextDateTime = (days, hour) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return toDateTimeInput(date);
};

const formatDate = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(value));
};

const formatDateTime = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
};

const formatMoney = (value) =>
  new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD" }).format(Number(value || 0));

const cleanPayload = (payload) =>
  Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== "" && value !== undefined));

const fullName = (person) => (person ? `${person.firstName} ${person.lastName}` : "-");

const parsePlan = (plan) => {
  if (!plan || typeof plan !== "string") return plan || {};
  try {
    return JSON.parse(plan);
  } catch {
    return {};
  }
};

function App() {
  const [auth, setAuth] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("gym-ai-auth")) || null;
    } catch {
      return null;
    }
  });
  const [view, setView] = useState("dashboard");
  const [data, setData] = useState({
    dashboard: null,
    members: [],
    coaches: [],
    plans: [],
    subscriptions: [],
    courses: [],
    attendance: [],
    payments: [],
    recommendations: [],
    portal: null
  });
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [theme, setTheme] = useState(() => localStorage.getItem("gym-ai-theme") || "light");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("gym-ai-theme", theme);
  }, [theme]);

  const request = useCallback(
    (path, options = {}) => api(path, { ...options, token: auth?.token }),
    [auth?.token]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("gym-ai-auth");
    setAuth(null);
    setView("dashboard");
  }, []);

  const loadData = useCallback(async () => {
    if (!auth?.token) return;
    setLoading(true);
    setError("");

    try {
      const jobs = {
        dashboard: request("/dashboard/stats"),
        courses: request("/courses"),
        payments: request("/payments"),
        recommendations: request("/recommendations"),
        plans: request("/plans")
      };

      if (auth.user.role === "ADMIN" || auth.user.role === "COACH") {
        jobs.members = request("/members");
        jobs.coaches = request("/coaches");
        jobs.subscriptions = request("/subscriptions");
        jobs.attendance = request("/attendance");
      }

      if (auth.user.role === "MEMBER") {
        jobs.portal = request("/portal/member");
      }

      if (auth.user.role === "COACH") {
        jobs.portal = request("/portal/coach");
      }

      const entries = await Promise.all(
        Object.entries(jobs).map(async ([key, promise]) => [key, await promise])
      );
      setData((current) => ({ ...current, ...Object.fromEntries(entries) }));
    } catch (err) {
      if (err.message?.toLowerCase().includes("session")) logout();
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [auth, logout, request]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const mutate = async (action, successMessage = "Operation effectuee.") => {
    setWorking(true);
    setError("");
    setNotice("");
    try {
      await action();
      setNotice(successMessage);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setWorking(false);
    }
  };

  const handleLogin = async (credentials) => {
    setWorking(true);
    setError("");
    try {
      const response = await api("/auth/login", {
        method: "POST",
        body: credentials
      });
      localStorage.setItem("gym-ai-auth", JSON.stringify(response));
      setAuth(response);
      setView("dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setWorking(false);
    }
  };

  const activeNav = useMemo(() => navByRole[auth?.user?.role] || [], [auth?.user?.role]);

  if (!auth) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        working={working}
        error={error}
        theme={theme}
        onToggleTheme={() => setTheme(theme === "light" ? "dark" : "light")}
      />
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <LogoMark />
          <div>
            <strong>{APP_NAME}</strong>
            <span>{BRAND_QUOTE}</span>
          </div>
        </div>

        <nav className="nav-list">
          {activeNav.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={view === item.id ? "nav-item active" : "nav-item"}
                type="button"
                onClick={() => setView(item.id)}
                title={item.label}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <ShieldCheck size={18} />
            <div>
              <strong>{auth.user.name}</strong>
              <span>{roleLabels[auth.user.role]}</span>
            </div>
          </div>
          <button className="ghost-button" type="button" onClick={logout}>
            <LogOut size={17} />
            Deconnexion
          </button>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Gestion salle de sport</p>
            <h1>{activeNav.find((item) => item.id === view)?.label || "Dashboard"}</h1>
          </div>
          <div className="topbar-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              title={theme === "light" ? "Activer le mode sombre" : "Activer le mode clair"}
            >
              {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
              {theme === "light" ? "Mode sombre" : "Mode clair"}
            </button>
            <button className="icon-button" type="button" onClick={loadData} title="Actualiser les donnees">
              <RefreshCw size={18} className={loading ? "spin" : ""} />
            </button>
          </div>
        </header>

        {error && <Alert tone="danger" message={error} />}
        {notice && <Alert tone="success" message={notice} />}

        <section className="content-area">
          {view === "dashboard" && (
            <Dashboard
              data={data}
              user={auth.user}
              onNavigate={setView}
              onGenerate={(memberId) => mutate(() => request(`/recommendations/generate/${memberId}`, { method: "POST" }), "Programme IA genere.")}
            />
          )}
          {view === "members" && (
            <MembersPage data={data} mutate={mutate} request={request} working={working} />
          )}
          {view === "coaches" && (
            <CoachesPage data={data} mutate={mutate} request={request} working={working} />
          )}
          {view === "plans" && (
            <PlansPage data={data} mutate={mutate} request={request} working={working} />
          )}
          {view === "subscriptions" && (
            <SubscriptionsPage data={data} mutate={mutate} request={request} working={working} />
          )}
          {view === "courses" && (
            <CoursesPage data={data} user={auth.user} mutate={mutate} request={request} working={working} />
          )}
          {view === "attendance" && (
            <AttendancePage data={data} mutate={mutate} request={request} working={working} />
          )}
          {view === "payments" && (
            <PaymentsPage data={data} user={auth.user} mutate={mutate} request={request} working={working} />
          )}
          {view === "recommendations" && (
            <RecommendationsPage data={data} user={auth.user} mutate={mutate} request={request} working={working} />
          )}
          {view === "coachPortal" && <CoachPortalPage data={data} />}
        </section>
      </main>
    </div>
  );
}

function LoginScreen({ onLogin, working, error, theme, onToggleTheme }) {
  const [form, setForm] = useState({ email: "", password: "" });

  return (
    <main className="login-screen">
      <div className="login-bg-grid" aria-hidden="true" />
      <div className="login-beam one" aria-hidden="true" />
      <div className="login-beam two" aria-hidden="true" />

      <section className="login-stage">
        <div className="login-visual" aria-hidden="true">
          <div className="visual-kicker">
            <Sparkles size={18} />
            Performance club
          </div>
          <h2>{APP_NAME}</h2>
          <p>Coaching, planning et programmes IA dans un seul espace.</p>

          <div className="pulse-arena">
            <div className="pulse-ring ring-one" />
            <div className="pulse-ring ring-two" />
            <div className="pulse-core">
              <img className="pulse-logo" src={LOGO_SRC} alt="" />
              <span>GETFIT</span>
            </div>
            <div className="float-chip chip-top">
              <Flame size={17} />
              742 kcal
            </div>
            <div className="float-chip chip-right">
              <Target size={17} />
              92%
            </div>
            <div className="float-chip chip-bottom">
              <Gauge size={17} />
              HIIT 18:30
            </div>
          </div>

          <div className="login-metrics">
            <div>
              <strong>24/7</strong>
              <span>Access</span>
            </div>
            <div>
              <strong>AI</strong>
              <span>Plans</span>
            </div>
            <div>
              <strong>3</strong>
              <span>Roles</span>
            </div>
          </div>
        </div>

        <div className="login-panel">
          <div className="login-actions">
            <button
              className="secondary-button theme-pill"
              type="button"
              onClick={onToggleTheme}
              title={theme === "light" ? "Activer le mode sombre" : "Activer le mode clair"}
            >
              {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
              {theme === "light" ? "Mode sombre" : "Mode clair"}
            </button>
          </div>

          <div className="login-brand">
            <LogoMark large />
            <div>
              <p className="eyebrow">{BRAND_QUOTE}</p>
              <h1>{APP_NAME}</h1>
            </div>
          </div>

          <div className="login-copy">
            <span className="secure-badge">
              <LockKeyhole size={15} />
              Espace securise
            </span>
            <p>Connectez-vous pour gerer les membres, les cours et les recommandations sportives.</p>
          </div>

          <form
            className="auth-form"
            onSubmit={(event) => {
              event.preventDefault();
              onLogin(form);
            }}
          >
            <label className="login-field">
              <span>Email</span>
              <div className="input-shell">
                <Mail size={18} />
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  placeholder="email@domain.com"
                  required
                />
              </div>
            </label>
            <label className="login-field">
              <span>Mot de passe</span>
              <div className="input-shell">
                <KeyRound size={18} />
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  placeholder="Votre mot de passe"
                  required
                />
              </div>
            </label>
            {error && <Alert tone="danger" message={error} />}
            <button className={working ? "primary-button login-submit is-loading" : "primary-button login-submit"} type="submit" disabled={working}>
              {working ? <LoaderCircle size={18} className="loading-icon" /> : <ShieldCheck size={18} />}
              <span>{working ? "Connexion..." : "Connexion"}</span>
            </button>
          </form>

          <div className="login-footnote">
            <span />
            Powered by GETFIT AI
          </div>
        </div>
      </section>
    </main>
  );
}

function LogoMark({ large = false }) {
  return (
    <div className={large ? "brand-mark logo-mark large" : "brand-mark logo-mark"}>
      <img src={LOGO_SRC} alt={`${APP_NAME} logo`} />
    </div>
  );
}

function Alert({ tone, message }) {
  return <div className={`alert ${tone}`}>{message}</div>;
}

function Dashboard({ data, user, onNavigate, onGenerate }) {
  if (user.role === "MEMBER") {
    const member = data.portal || data.dashboard?.member;
    return <MemberHome member={member} onGenerate={onGenerate} />;
  }

  const counts = data.dashboard?.counts || {};
  const upcomingCourses = data.dashboard?.upcomingCourses || [];
  const expiringSubscriptions = data.dashboard?.expiringSubscriptions || [];
  const recentPayments = data.dashboard?.recentPayments || [];
  const allCourses = data.courses?.length ? data.courses : upcomingCourses;
  const bestCourse = [...allCourses].sort((a, b) => (b.enrollments?.length || 0) - (a.enrollments?.length || 0))[0];
  const revenueSeries = buildSeries(Number(counts.revenue || 0), [0.52, 0.58, 0.7, 0.64, 0.82, 1], ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]);
  const attendanceSeries = buildSeries(Number(counts.attendanceToday || 4) * 12, [0.42, 0.66, 0.5, 0.86, 0.74, 1], ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
  const subscriptionSeries = buildSeries(Number(counts.activeSubscriptions || 3) * 8, [0.4, 0.55, 0.68, 0.76, 0.88, 1], ["W1", "W2", "W3", "W4", "W5", "W6"]);
  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric"
  }).format(new Date());
  const welcomeRole = user.role === "ADMIN" ? "Admin" : roleLabels[user.role] || "Admin";
  const quickActions = [
    { label: "Add Member", icon: UserPlus, view: "members" },
    { label: "New Payment", icon: Receipt, view: "payments" },
    { label: "Create Course", icon: CalendarDays, view: "courses" }
  ];

  return (
    <div className="dashboard-layout">
      <section className="dashboard-hero animate-in" style={{ "--delay": "0ms" }}>
        <div>
          <p className="eyebrow">GETFIT command center</p>
          <h2>Welcome back, {welcomeRole} 👋</h2>
          <span>{today}</span>
          <p>
            {counts.members || 0} active profiles, {counts.activeSubscriptions || 0} running subscriptions,
            and {formatMoney(counts.revenue || 0)} collected revenue are ready to review.
          </p>
        </div>
        <div className="hero-actions">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button className="hero-action-button" type="button" key={action.view} onClick={() => onNavigate(action.view)}>
                <Icon size={17} />
                {action.label}
              </button>
            );
          })}
        </div>
      </section>

      <div className="metric-grid">
        <Metric icon={Users} label="Membres" value={counts.members || 0} trend="+12% this month" delay={80} />
        <Metric icon={UserRoundCog} label="Coachs" value={counts.coaches || 0} trend="+2 this month" delay={160} />
        <Metric icon={BadgeCheck} label="Abonnements actifs" value={counts.activeSubscriptions || 0} trend="+18% growth" delay={240} />
        <Metric icon={CreditCard} label="Revenus encaisses" value={counts.revenue || 0} formatter={formatMoney} trend="+9% this week" delay={320} />
        <Metric icon={ClipboardCheck} label="Presences aujourd'hui" value={counts.attendanceToday || 0} trend="+6% vs yesterday" delay={400} />
      </div>

      <section className="chart-grid animate-in" style={{ "--delay": "180ms" }}>
        <DashboardChart title="Revenue Trend" subtitle="Monthly income" type="line" data={revenueSeries} formatter={formatMoney} />
        <DashboardChart title="Attendance" subtitle="Weekly check-ins" type="bar" data={attendanceSeries} />
        <DashboardChart title="Subscription Growth" subtitle="Active memberships" type="area" data={subscriptionSeries} />
      </section>

      <section className="ai-insights animate-in" style={{ "--delay": "260ms" }}>
        <InsightCard icon={TriangleAlert} title={`${expiringSubscriptions.length || 3} members may cancel soon`} text="Subscriptions ending soon need renewal attention." tone="warning" />
        <InsightCard icon={Trophy} title={`Best performing course: ${bestCourse?.title || "Cardio Boxing"}`} text={`${bestCourse?.enrollments?.length || 8} members are engaged in this class.`} tone="success" />
        <InsightCard icon={TrendingUp} title="Revenue increased this week" text="Paid transactions are trending above the previous period." tone="growth" />
      </section>

      <div className="split-grid animate-in" style={{ "--delay": "340ms" }}>
        <Panel title="Prochains cours" icon={CalendarDays}>
          <SimpleList
            items={upcomingCourses}
            empty="Aucun cours planifie."
            render={(course) => (
              <>
                <strong>{course.title}</strong>
                <span>{formatDateTime(course.startsAt)} · {fullName(course.coach)} · {course.enrollments?.length || 0}/{course.capacity}</span>
              </>
            )}
          />
        </Panel>

        <Panel title="Abonnements a renouveler" icon={BadgeCheck}>
          <SimpleList
            items={expiringSubscriptions}
            empty="Aucune expiration proche."
            render={(subscription) => (
              <>
                <strong>{fullName(subscription.member)}</strong>
                <span>{subscription.plan.name} · fin le {formatDate(subscription.endDate)}</span>
              </>
            )}
          />
        </Panel>
      </div>

      <section className="animate-in" style={{ "--delay": "420ms" }}>
        <Panel title="Derniers paiements" icon={CreditCard}>
          <PremiumPaymentsTable payments={recentPayments} empty="Aucun paiement enregistre." />
        </Panel>
      </section>
    </div>
  );
}

function buildSeries(base, multipliers, labels) {
  const safeBase = Math.max(Number(base) || 1, 1);
  return labels.map((label, index) => ({
    label,
    value: Math.round(safeBase * multipliers[index])
  }));
}

function DashboardChart({ title, subtitle, type, data, formatter = (value) => value }) {
  const values = data.map((item) => item.value);
  const max = Math.max(...values, 1);
  const points = data.map((item, index) => {
    const x = 20 + (index * 260) / Math.max(data.length - 1, 1);
    const y = 130 - (item.value / max) * 92;
    return { ...item, x, y };
  });
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const areaPath = `${path} L ${points.at(-1).x} 142 L ${points[0].x} 142 Z`;

  return (
    <article className="dashboard-chart">
      <div className="chart-head">
        <div>
          <strong>{title}</strong>
          <span>{subtitle}</span>
        </div>
        <span className="chart-value">{formatter(values.at(-1) || 0)}</span>
      </div>

      {type === "bar" ? (
        <div className="bar-chart">
          {data.map((item) => (
            <div key={item.label} className="bar-item">
              <span style={{ height: `${Math.max(18, (item.value / max) * 100)}%` }} />
              <small>{item.label}</small>
            </div>
          ))}
        </div>
      ) : (
        <svg className="line-chart" viewBox="0 0 300 160" role="img" aria-label={title}>
          <defs>
            <linearGradient id={`chartGradient-${type}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#b6ff00" stopOpacity="0.34" />
              <stop offset="100%" stopColor="#b6ff00" stopOpacity="0" />
            </linearGradient>
          </defs>
          {type === "area" && <path d={areaPath} fill={`url(#chartGradient-${type})`} />}
          <path d={path} fill="none" stroke="#b6ff00" strokeWidth="4" strokeLinecap="round" />
          {points.map((point) => (
            <circle key={point.label} cx={point.x} cy={point.y} r="4.5" />
          ))}
        </svg>
      )}
    </article>
  );
}

function InsightCard({ icon: Icon, title, text, tone }) {
  return (
    <article className={`insight-card ${tone}`}>
      <div className="insight-icon">
        <Icon size={20} />
      </div>
      <div>
        <strong>{title}</strong>
        <span>{text}</span>
      </div>
    </article>
  );
}

function MemberHome({ member, onGenerate }) {
  const subscription = member?.subscriptions?.[0];
  const recommendation = member?.recommendations?.[0];

  if (!member) {
    return <EmptyState icon={UserRound} title="Profil indisponible" text="Connectez un compte membre a un profil." />;
  }

  return (
    <div className="stack">
      <div className="profile-band">
        <div>
          <p className="eyebrow">Objectif: {member.objective}</p>
          <h2>{fullName(member)}</h2>
          <span>Niveau {member.level} · progression {member.progressScore}%</span>
        </div>
        <button className="primary-button" type="button" onClick={() => onGenerate(member.id)}>
          <BrainCircuit size={18} />
          Generer mon programme
        </button>
      </div>

      <div className="metric-grid">
        <Metric icon={BadgeCheck} label="Abonnement" value={subscription?.status || "N/A"} />
        <Metric icon={CalendarDays} label="Cours inscrits" value={member.enrollments?.length || 0} />
        <Metric icon={ClipboardCheck} label="Presences" value={member.attendance?.length || 0} />
        <Metric icon={Activity} label="Score progression" value={`${member.progressScore || 0}%`} />
      </div>

      <Panel title="Programme recommande" icon={BrainCircuit}>
        {recommendation ? <RecommendationCard recommendation={recommendation} /> : <EmptyState icon={BrainCircuit} title="Aucun programme" text="Generez une recommandation personnalisee." />}
      </Panel>

      <Panel title="Mes prochains cours" icon={CalendarDays}>
        <SimpleList
          items={member.enrollments || []}
          empty="Aucune inscription pour le moment."
          render={(enrollment) => (
            <>
              <strong>{enrollment.course.title}</strong>
              <span>{formatDateTime(enrollment.course.startsAt)} · {fullName(enrollment.course.coach)}</span>
            </>
          )}
        />
      </Panel>
    </div>
  );
}

function MembersPage({ data, mutate, request, working }) {
  const emptyForm = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    birthDate: "",
    objective: "Perte de poids",
    level: "Debutant",
    weightKg: "",
    heightCm: "",
    progressScore: 0,
    notes: "",
    password: ""
  };
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const submit = (event) => {
    event.preventDefault();
    const payload = cleanPayload(form);
    if (editingId) delete payload.password;
    mutate(
      () =>
        request(editingId ? `/members/${editingId}` : "/members", {
          method: editingId ? "PUT" : "POST",
          body: payload
        }),
      editingId ? "Membre mis a jour." : "Membre ajoute."
    ).then(() => {
      setForm(emptyForm);
      setEditingId(null);
    });
  };

  const edit = (member) => {
    setEditingId(member.id);
    setForm({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone || "",
      gender: member.gender || "",
      birthDate: toDateInput(member.birthDate),
      objective: member.objective,
      level: member.level,
      weightKg: member.weightKg || "",
      heightCm: member.heightCm || "",
      progressScore: member.progressScore || 0,
      notes: member.notes || "",
      password: ""
    });
  };

  return (
    <div className="management-grid">
      <Panel title={editingId ? "Modifier membre" : "Nouveau membre"} icon={Users}>
        <form className="form-grid" onSubmit={submit}>
          <TextField label="Prenom" value={form.firstName} onChange={(value) => setForm({ ...form, firstName: value })} required />
          <TextField label="Nom" value={form.lastName} onChange={(value) => setForm({ ...form, lastName: value })} required />
          <TextField label="Email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} required />
          <TextField label="Telephone" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />
          <SelectField label="Objectif" value={form.objective} onChange={(value) => setForm({ ...form, objective: value })} options={objectives} />
          <SelectField label="Niveau" value={form.level} onChange={(value) => setForm({ ...form, level: value })} options={levels} />
          <TextField label="Poids kg" type="number" value={form.weightKg} onChange={(value) => setForm({ ...form, weightKg: value })} />
          <TextField label="Taille cm" type="number" value={form.heightCm} onChange={(value) => setForm({ ...form, heightCm: value })} />
          <TextField label="Progression %" type="number" value={form.progressScore} onChange={(value) => setForm({ ...form, progressScore: value })} />
          <TextField label="Date naissance" type="date" value={form.birthDate} onChange={(value) => setForm({ ...form, birthDate: value })} />
          <TextArea label="Notes" value={form.notes} onChange={(value) => setForm({ ...form, notes: value })} />
          {!editingId && <TextField label="Mot de passe portail" type="password" value={form.password} onChange={(value) => setForm({ ...form, password: value })} />}
          <FormActions editing={editingId} working={working} onCancel={() => { setEditingId(null); setForm(emptyForm); }} />
        </form>
      </Panel>

      <Panel title="Liste des membres" icon={Users}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Membre</th>
                <th>Objectif</th>
                <th>Abonnement</th>
                <th>Progression</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.members.map((member) => {
                const subscription = member.subscriptions?.[0];
                return (
                  <tr key={member.id}>
                    <td>
                      <strong>{fullName(member)}</strong>
                      <span>{member.email}</span>
                    </td>
                    <td>{member.objective}</td>
                    <td>{subscription ? `${subscription.plan.name} · ${formatDate(subscription.endDate)}` : "Aucun"}</td>
                    <td>{member.progressScore}%</td>
                    <td className="row-actions">
                      <button type="button" className="icon-button" onClick={() => edit(member)} title="Modifier">
                        <Edit3 size={16} />
                      </button>
                      <button
                        type="button"
                        className="icon-button danger"
                        onClick={() => window.confirm("Supprimer ce membre ?") && mutate(() => request(`/members/${member.id}`, { method: "DELETE" }), "Membre supprime.")}
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function CoachesPage({ data, mutate, request, working }) {
  const emptyForm = { firstName: "", lastName: "", email: "", phone: "", specialty: "", bio: "", password: "" };
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const submit = (event) => {
    event.preventDefault();
    const payload = cleanPayload(form);
    if (editingId) delete payload.password;
    mutate(
      () =>
        request(editingId ? `/coaches/${editingId}` : "/coaches", {
          method: editingId ? "PUT" : "POST",
          body: payload
        }),
      editingId ? "Coach mis a jour." : "Coach ajoute."
    ).then(() => {
      setForm(emptyForm);
      setEditingId(null);
    });
  };

  const edit = (coach) => {
    setEditingId(coach.id);
    setForm({
      firstName: coach.firstName,
      lastName: coach.lastName,
      email: coach.email,
      phone: coach.phone || "",
      specialty: coach.specialty,
      bio: coach.bio || "",
      password: ""
    });
  };

  return (
    <div className="management-grid">
      <Panel title={editingId ? "Modifier coach" : "Nouveau coach"} icon={UserRoundCog}>
        <form className="form-grid" onSubmit={submit}>
          <TextField label="Prenom" value={form.firstName} onChange={(value) => setForm({ ...form, firstName: value })} required />
          <TextField label="Nom" value={form.lastName} onChange={(value) => setForm({ ...form, lastName: value })} required />
          <TextField label="Email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} required />
          <TextField label="Telephone" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />
          <TextField label="Specialite" value={form.specialty} onChange={(value) => setForm({ ...form, specialty: value })} required />
          <TextArea label="Bio" value={form.bio} onChange={(value) => setForm({ ...form, bio: value })} />
          {!editingId && <TextField label="Mot de passe portail" type="password" value={form.password} onChange={(value) => setForm({ ...form, password: value })} />}
          <FormActions editing={editingId} working={working} onCancel={() => { setEditingId(null); setForm(emptyForm); }} />
        </form>
      </Panel>

      <Panel title="Equipe coaching" icon={UserRoundCog}>
        <div className="card-list">
          {data.coaches.map((coach) => (
            <article className="list-card" key={coach.id}>
              <div>
                <strong>{fullName(coach)}</strong>
                <span>{coach.specialty}</span>
                <small>{coach.email}</small>
              </div>
              <div className="row-actions">
                <button type="button" className="icon-button" onClick={() => edit(coach)} title="Modifier">
                  <Edit3 size={16} />
                </button>
                <button
                  type="button"
                  className="icon-button danger"
                  onClick={() => window.confirm("Supprimer ce coach ?") && mutate(() => request(`/coaches/${coach.id}`, { method: "DELETE" }), "Coach supprime.")}
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function PlansPage({ data, mutate, request, working }) {
  const emptyForm = { name: "", durationDays: 30, price: "", benefits: "" };
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const submit = (event) => {
    event.preventDefault();
    mutate(
      () =>
        request(editingId ? `/plans/${editingId}` : "/plans", {
          method: editingId ? "PUT" : "POST",
          body: cleanPayload(form)
        }),
      editingId ? "Offre mise a jour." : "Offre ajoutee."
    ).then(() => {
      setForm(emptyForm);
      setEditingId(null);
    });
  };

  return (
    <div className="management-grid">
      <Panel title={editingId ? "Modifier offre" : "Nouvelle offre"} icon={WalletCards}>
        <form className="form-grid" onSubmit={submit}>
          <TextField label="Nom" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required />
          <TextField label="Duree jours" type="number" value={form.durationDays} onChange={(value) => setForm({ ...form, durationDays: value })} required />
          <TextField label="Prix MAD" type="number" value={form.price} onChange={(value) => setForm({ ...form, price: value })} required />
          <TextArea label="Avantages" value={form.benefits} onChange={(value) => setForm({ ...form, benefits: value })} />
          <FormActions editing={editingId} working={working} onCancel={() => { setEditingId(null); setForm(emptyForm); }} />
        </form>
      </Panel>

      <Panel title="Offres disponibles" icon={WalletCards}>
        <div className="price-grid">
          {data.plans.map((plan) => (
            <article className="price-card" key={plan.id}>
              <div>
                <strong>{plan.name}</strong>
                <span>{plan.durationDays} jours</span>
              </div>
              <h3>{formatMoney(plan.price)}</h3>
              <p>{plan.benefits || "Acces salle de sport"}</p>
              <div className="row-actions">
                <button type="button" className="icon-button" onClick={() => { setEditingId(plan.id); setForm(plan); }} title="Modifier">
                  <Edit3 size={16} />
                </button>
                <button
                  type="button"
                  className="icon-button danger"
                  onClick={() => window.confirm("Supprimer cette offre ?") && mutate(() => request(`/plans/${plan.id}`, { method: "DELETE" }), "Offre supprimee.")}
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function SubscriptionsPage({ data, mutate, request, working }) {
  const [form, setForm] = useState({ memberId: "", planId: "", startDate: toDateInput(new Date()), createPayment: true, method: "Especes", reference: "" });

  const submit = (event) => {
    event.preventDefault();
    mutate(
      () =>
        request("/subscriptions", {
          method: "POST",
          body: cleanPayload(form)
        }),
      "Abonnement cree."
    ).then(() => setForm({ memberId: "", planId: "", startDate: toDateInput(new Date()), createPayment: true, method: "Especes", reference: "" }));
  };

  return (
    <div className="management-grid">
      <Panel title="Renouveler / creer" icon={BadgeCheck}>
        <form className="form-grid" onSubmit={submit}>
          <SelectField label="Membre" value={form.memberId} onChange={(value) => setForm({ ...form, memberId: value })} options={data.members.map((member) => ({ value: member.id, label: fullName(member) }))} required />
          <SelectField label="Offre" value={form.planId} onChange={(value) => setForm({ ...form, planId: value })} options={data.plans.map((plan) => ({ value: plan.id, label: `${plan.name} - ${formatMoney(plan.price)}` }))} required />
          <TextField label="Date debut" type="date" value={form.startDate} onChange={(value) => setForm({ ...form, startDate: value })} />
          <TextField label="Methode paiement" value={form.method} onChange={(value) => setForm({ ...form, method: value })} />
          <TextField label="Reference" value={form.reference} onChange={(value) => setForm({ ...form, reference: value })} />
          <label className="check-row">
            <input type="checkbox" checked={form.createPayment} onChange={(event) => setForm({ ...form, createPayment: event.target.checked })} />
            Creer le paiement automatiquement
          </label>
          <FormActions working={working} />
        </form>
      </Panel>

      <Panel title="Historique abonnements" icon={BadgeCheck}>
        <DataTable
          headers={["Membre", "Offre", "Periode", "Statut", "Actions"]}
          rows={data.subscriptions.map((subscription) => [
            fullName(subscription.member),
            subscription.plan.name,
            `${formatDate(subscription.startDate)} → ${formatDate(subscription.endDate)}`,
            <StatusBadge key="status" status={subscription.status} />,
            <div className="row-actions" key="actions">
              {["ACTIVE", "EXPIRED", "SUSPENDED"].map((status) => (
                <button
                  key={status}
                  type="button"
                  className="tiny-button"
                  onClick={() => mutate(() => request(`/subscriptions/${subscription.id}/status`, { method: "PUT", body: { status } }), "Statut modifie.")}
                >
                  {status}
                </button>
              ))}
            </div>
          ])}
          empty="Aucun abonnement."
        />
      </Panel>
    </div>
  );
}

function CoursesPage({ data, user, mutate, request, working }) {
  const emptyForm = {
    title: "",
    activity: "",
    description: "",
    startsAt: nextDateTime(1, 18),
    endsAt: nextDateTime(1, 19),
    capacity: 12,
    room: "",
    coachId: ""
  };
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [selectedMemberId, setSelectedMemberId] = useState("");

  const canManage = user.role === "ADMIN" || user.role === "COACH";

  const submit = (event) => {
    event.preventDefault();
    mutate(
      () =>
        request(editingId ? `/courses/${editingId}` : "/courses", {
          method: editingId ? "PUT" : "POST",
          body: cleanPayload(form)
        }),
      editingId ? "Cours mis a jour." : "Cours cree."
    ).then(() => {
      setForm(emptyForm);
      setEditingId(null);
    });
  };

  const edit = (course) => {
    setEditingId(course.id);
    setForm({
      title: course.title,
      activity: course.activity,
      description: course.description || "",
      startsAt: toDateTimeInput(course.startsAt),
      endsAt: toDateTimeInput(course.endsAt),
      capacity: course.capacity,
      room: course.room || "",
      coachId: course.coachId || ""
    });
  };

  return (
    <div className="stack">
      {canManage && (
        <Panel title={editingId ? "Modifier cours" : "Planifier un cours"} icon={CalendarDays}>
          <form className="form-grid wide" onSubmit={submit}>
            <TextField label="Titre" value={form.title} onChange={(value) => setForm({ ...form, title: value })} required />
            <TextField label="Activite" value={form.activity} onChange={(value) => setForm({ ...form, activity: value })} required />
            {user.role === "ADMIN" && <SelectField label="Coach" value={form.coachId} onChange={(value) => setForm({ ...form, coachId: value })} options={data.coaches.map((coach) => ({ value: coach.id, label: fullName(coach) }))} required />}
            <TextField label="Salle" value={form.room} onChange={(value) => setForm({ ...form, room: value })} />
            <TextField label="Debut" type="datetime-local" value={form.startsAt} onChange={(value) => setForm({ ...form, startsAt: value })} required />
            <TextField label="Fin" type="datetime-local" value={form.endsAt} onChange={(value) => setForm({ ...form, endsAt: value })} required />
            <TextField label="Capacite" type="number" value={form.capacity} onChange={(value) => setForm({ ...form, capacity: value })} required />
            <TextArea label="Description" value={form.description} onChange={(value) => setForm({ ...form, description: value })} />
            <FormActions editing={editingId} working={working} onCancel={() => { setEditingId(null); setForm(emptyForm); }} />
          </form>
        </Panel>
      )}

      {canManage && (
        <div className="toolbar-line">
          <SelectField
            label="Membre a inscrire"
            value={selectedMemberId}
            onChange={setSelectedMemberId}
            options={data.members.map((member) => ({ value: member.id, label: fullName(member) }))}
          />
        </div>
      )}

      <div className="course-grid">
        {data.courses.map((course) => {
          const enrolled = course.enrollments?.some((item) => item.memberId === user.memberId);
          return (
            <article className="course-card" key={course.id}>
              <div className="course-head">
                <div>
                  <p className="eyebrow">{course.activity}</p>
                  <h3>{course.title}</h3>
                </div>
                <StatusBadge status={course.status} />
              </div>
              <p>{course.description || "Cours collectif encadre par un coach."}</p>
              <div className="course-meta">
                <span>{formatDateTime(course.startsAt)}</span>
                <span>{course.room || "Salle principale"}</span>
                <span>{course.enrollments?.length || 0}/{course.capacity} inscrits</span>
                <span>{fullName(course.coach)}</span>
              </div>
              <div className="row-actions">
                {user.role === "MEMBER" && (
                  enrolled ? (
                    <button type="button" className="secondary-button" onClick={() => mutate(() => request(`/courses/${course.id}/enrollments/${user.memberId}`, { method: "DELETE" }), "Inscription annulee.")}>
                      <X size={16} />
                      Annuler
                    </button>
                  ) : (
                    <button type="button" className="primary-button" onClick={() => mutate(() => request(`/courses/${course.id}/enroll`, { method: "POST" }), "Inscription effectuee.")}>
                      <Plus size={16} />
                      S'inscrire
                    </button>
                  )
                )}
                {canManage && (
                  <>
                    <button type="button" className="secondary-button" onClick={() => selectedMemberId && mutate(() => request(`/courses/${course.id}/enroll`, { method: "POST", body: { memberId: selectedMemberId } }), "Membre inscrit.")}>
                      <Plus size={16} />
                      Inscrire
                    </button>
                    <button type="button" className="icon-button" onClick={() => edit(course)} title="Modifier">
                      <Edit3 size={16} />
                    </button>
                    {user.role === "ADMIN" && (
                      <button type="button" className="icon-button danger" onClick={() => window.confirm("Supprimer ce cours ?") && mutate(() => request(`/courses/${course.id}`, { method: "DELETE" }), "Cours supprime.")} title="Supprimer">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function AttendancePage({ data, mutate, request, working }) {
  const [form, setForm] = useState({ memberId: "", courseId: "", checkInAt: toDateTimeInput(new Date()), status: "PRESENT", notes: "" });

  const submit = (event) => {
    event.preventDefault();
    mutate(
      () =>
        request("/attendance", {
          method: "POST",
          body: cleanPayload(form)
        }),
      "Presence enregistree."
    ).then(() => setForm({ memberId: "", courseId: "", checkInAt: toDateTimeInput(new Date()), status: "PRESENT", notes: "" }));
  };

  return (
    <div className="management-grid">
      <Panel title="Enregistrer presence" icon={ClipboardCheck}>
        <form className="form-grid" onSubmit={submit}>
          <SelectField label="Membre" value={form.memberId} onChange={(value) => setForm({ ...form, memberId: value })} options={data.members.map((member) => ({ value: member.id, label: fullName(member) }))} required />
          <SelectField label="Cours" value={form.courseId} onChange={(value) => setForm({ ...form, courseId: value })} options={data.courses.map((course) => ({ value: course.id, label: `${course.title} - ${formatDateTime(course.startsAt)}` }))} />
          <SelectField label="Statut" value={form.status} onChange={(value) => setForm({ ...form, status: value })} options={["PRESENT", "LATE", "ABSENT"]} />
          <TextField label="Date" type="datetime-local" value={form.checkInAt} onChange={(value) => setForm({ ...form, checkInAt: value })} />
          <TextArea label="Notes" value={form.notes} onChange={(value) => setForm({ ...form, notes: value })} />
          <FormActions working={working} />
        </form>
      </Panel>

      <Panel title="Historique des presences" icon={ClipboardCheck}>
        <DataTable
          headers={["Membre", "Cours", "Statut", "Date"]}
          rows={data.attendance.map((item) => [
            fullName(item.member),
            item.course?.title || "Acces libre",
            <StatusBadge key="status" status={item.status} />,
            formatDateTime(item.checkInAt)
          ])}
          empty="Aucune presence."
        />
      </Panel>
    </div>
  );
}

function PaymentsPage({ data, user, mutate, request, working }) {
  const [form, setForm] = useState({ memberId: "", subscriptionId: "", amount: "", method: "Especes", status: "PAID", paidAt: toDateInput(new Date()), reference: "" });

  const submit = (event) => {
    event.preventDefault();
    mutate(
      () =>
        request("/payments", {
          method: "POST",
          body: cleanPayload(form)
        }),
      "Paiement ajoute."
    ).then(() => setForm({ memberId: "", subscriptionId: "", amount: "", method: "Especes", status: "PAID", paidAt: toDateInput(new Date()), reference: "" }));
  };

  return (
    <div className="management-grid">
      {user.role === "ADMIN" && (
        <Panel title="Nouveau paiement" icon={CreditCard}>
          <form className="form-grid" onSubmit={submit}>
            <SelectField label="Membre" value={form.memberId} onChange={(value) => setForm({ ...form, memberId: value })} options={data.members.map((member) => ({ value: member.id, label: fullName(member) }))} required />
            <SelectField label="Abonnement" value={form.subscriptionId} onChange={(value) => setForm({ ...form, subscriptionId: value })} options={data.subscriptions.map((subscription) => ({ value: subscription.id, label: `${fullName(subscription.member)} - ${subscription.plan.name}` }))} />
            <TextField label="Montant MAD" type="number" value={form.amount} onChange={(value) => setForm({ ...form, amount: value })} required />
            <TextField label="Methode" value={form.method} onChange={(value) => setForm({ ...form, method: value })} required />
            <SelectField label="Statut" value={form.status} onChange={(value) => setForm({ ...form, status: value })} options={["PAID", "PENDING", "FAILED"]} />
            <TextField label="Date paiement" type="date" value={form.paidAt} onChange={(value) => setForm({ ...form, paidAt: value })} />
            <TextField label="Reference" value={form.reference} onChange={(value) => setForm({ ...form, reference: value })} />
            <FormActions working={working} />
          </form>
        </Panel>
      )}

      <Panel title={user.role === "MEMBER" ? "Mes paiements" : "Historique paiements"} icon={CreditCard}>
        <PremiumPaymentsTable payments={data.payments} fallbackName={user.name} empty="Aucun paiement." />
      </Panel>
    </div>
  );
}

function PremiumPaymentsTable({ payments, fallbackName, empty }) {
  if (!payments?.length) return <EmptyState icon={CreditCard} title={empty} />;

  return (
    <div className="premium-table-wrap">
      <table className="premium-table payments-table">
        <thead>
          <tr>
            <th>Membre</th>
            <th>Montant</th>
            <th>Methode</th>
            <th>Statut</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => {
            const MethodIcon = getPaymentMethodIcon(payment.method);
            return (
              <tr key={payment.id}>
                <td>
                  <div className="member-cell">
                    <span>{payment.member ? fullName(payment.member) : fallbackName || "Membre"}</span>
                    <small>{payment.reference || "GETFIT transaction"}</small>
                  </div>
                </td>
                <td className="amount-cell">{formatMoney(payment.amount)}</td>
                <td>
                  <span className="method-chip">
                    <MethodIcon size={16} />
                    {payment.method}
                  </span>
                </td>
                <td><StatusBadge status={payment.status} /></td>
                <td>{formatDate(payment.paidAt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function getPaymentMethodIcon(method = "") {
  const normalized = method.toLowerCase();
  if (normalized.includes("carte") || normalized.includes("card")) return CreditCard;
  if (normalized.includes("virement") || normalized.includes("bank")) return Landmark;
  if (normalized.includes("espece") || normalized.includes("cash")) return Banknote;
  if (normalized.includes("wallet")) return Wallet;
  return Receipt;
}

function RecommendationsPage({ data, user, mutate, request, working }) {
  const defaultMember = user.role === "MEMBER" ? user.memberId : "";
  const [memberId, setMemberId] = useState(defaultMember);

  const generate = () => {
    const target = user.role === "MEMBER" ? user.memberId : memberId;
    if (!target) return;
    mutate(
      () => request(`/recommendations/generate/${target}`, { method: "POST" }),
      "Programme IA genere."
    );
  };

  return (
    <div className="stack">
      <Panel title="Generateur de programme" icon={BrainCircuit}>
        <div className="toolbar-line">
          {user.role !== "MEMBER" && (
            <SelectField
              label="Membre"
              value={memberId}
              onChange={setMemberId}
              options={data.members.map((member) => ({ value: member.id, label: `${fullName(member)} - ${member.objective}` }))}
            />
          )}
          <button className="primary-button" type="button" onClick={generate} disabled={working}>
            <BrainCircuit size={18} />
            Generer recommandation
          </button>
        </div>
      </Panel>

      <div className="recommendation-grid">
        {data.recommendations.map((recommendation) => (
          <RecommendationCard key={recommendation.id} recommendation={recommendation} showMember={user.role !== "MEMBER"} />
        ))}
      </div>
    </div>
  );
}

function CoachPortalPage({ data }) {
  const coach = data.portal;
  return (
    <div className="stack">
      <div className="profile-band">
        <div>
          <p className="eyebrow">{coach?.specialty || "Planning coach"}</p>
          <h2>{coach ? fullName(coach) : "Coach"}</h2>
          <span>{coach?.courses?.length || 0} cours planifies</span>
        </div>
      </div>
      <div className="course-grid">
        {(coach?.courses || []).map((course) => (
          <article className="course-card" key={course.id}>
            <div className="course-head">
              <div>
                <p className="eyebrow">{formatDateTime(course.startsAt)}</p>
                <h3>{course.title}</h3>
              </div>
              <StatusBadge status={course.status} />
            </div>
            <div className="course-meta">
              <span>{course.room || "Salle principale"}</span>
              <span>{course.enrollments?.length || 0}/{course.capacity} membres</span>
              <span>{course.attendance?.length || 0} presences</span>
            </div>
            <SimpleList
              items={course.enrollments || []}
              empty="Aucun membre inscrit."
              render={(enrollment) => (
                <>
                  <strong>{fullName(enrollment.member)}</strong>
                  <span>{enrollment.member.objective}</span>
                </>
              )}
            />
          </article>
        ))}
      </div>
    </div>
  );
}

function RecommendationCard({ recommendation, showMember = false }) {
  const plan = parsePlan(recommendation.plan);
  const videoRecommendations = plan.youtubeVideos || plan.videos || [];
  return (
    <article className="recommendation-card">
      <div className="course-head">
        <div>
          {showMember && <p className="eyebrow">{fullName(recommendation.member)}</p>}
          <h3>{recommendation.goal}</h3>
        </div>
        <StatusBadge status={recommendation.intensity} />
      </div>
      <p>{recommendation.summary}</p>
      <div className="course-meta">
        <span>{recommendation.weeklyFrequency} seances/semaine</span>
        <span>{formatDate(recommendation.generatedAt)}</span>
        {plan.focusTag && <span>Focus {plan.focusTag}</span>}
      </div>
      <div className="week-plan">
        {(plan.weeklyStructure || []).map((session) => (
          <div key={`${recommendation.id}-${session.day}`}>
            <strong>{session.day} · {session.title}</strong>
            <span>{session.duration}</span>
            <small>{session.exercises?.join(" · ")}</small>
          </div>
        ))}
      </div>
      {videoRecommendations.length > 0 && (
        <div className="video-recommendations">
          <div className="video-recommendations-title">
            <Youtube size={17} />
            Videos YouTube recommandees
          </div>
          <div className="video-grid">
            {videoRecommendations.map((video, index) => (
              <a
                className="video-card"
                href={video.url}
                key={`${recommendation.id}-video-${index}`}
                rel="noreferrer"
                target="_blank"
              >
                <span className="video-play">
                  <Youtube size={16} />
                </span>
                <span>
                  <strong>{video.title || video.query}</strong>
                  <small>{video.reason || video.query}</small>
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

function Metric({ icon: Icon, label, value, trend, formatter, delay = 0 }) {
  const numericValue = typeof value === "number" ? value : Number(value);
  const isNumeric = Number.isFinite(numericValue);

  return (
    <article className="metric-card animate-in" style={{ "--delay": `${delay}ms` }}>
      <div className="metric-icon">
        <Icon size={20} />
      </div>
      <div>
        <span>{label}</span>
        <strong>
          {isNumeric ? (
            <CountUp value={numericValue} formatter={formatter} />
          ) : (
            value
          )}
        </strong>
        {trend && (
          <small className="trend-chip">
            <ArrowUpRight size={13} />
            {trend}
          </small>
        )}
      </div>
    </article>
  );
}

function CountUp({ value, formatter = (number) => Math.round(number).toLocaleString("fr-FR") }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 900;
    let frame = 0;

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(value * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return formatter(display);
}

function Panel({ title, icon: Icon, children }) {
  return (
    <section className="panel">
      <div className="panel-title">
        <Icon size={18} />
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function SimpleList({ items, render, empty }) {
  if (!items?.length) return <EmptyState icon={Activity} title={empty} />;
  return (
    <div className="simple-list">
      {items.map((item, index) => (
        <div key={item.id || index}>{render(item)}</div>
      ))}
    </div>
  );
}

function DataTable({ headers, rows, empty }) {
  if (!rows.length) return <EmptyState icon={Activity} title={empty} />;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState({ icon: Icon, title, text }) {
  return (
    <div className="empty-state">
      <Icon size={22} />
      <strong>{title}</strong>
      {text && <span>{text}</span>}
    </div>
  );
}

function TextField({ label, value, onChange, type = "text", required = false }) {
  return (
    <label>
      {label}
      <input type={type} value={value ?? ""} onChange={(event) => onChange(event.target.value)} required={required} />
    </label>
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <label className="full-span">
      {label}
      <textarea value={value ?? ""} onChange={(event) => onChange(event.target.value)} rows={3} />
    </label>
  );
}

function SelectField({ label, value, onChange, options, required = false }) {
  const normalizedOptions = options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option
  );

  return (
    <label>
      {label}
      <select value={value ?? ""} onChange={(event) => onChange(event.target.value)} required={required}>
        <option value="">Choisir</option>
        {normalizedOptions.map((option) => (
          <option value={option.value} key={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function FormActions({ editing, working, onCancel }) {
  return (
    <div className="form-actions full-span">
      {editing && (
        <button className="secondary-button" type="button" onClick={onCancel}>
          <X size={16} />
          Annuler
        </button>
      )}
      <button className="primary-button" type="submit" disabled={working}>
        {editing ? <Save size={16} /> : <Plus size={16} />}
        {editing ? "Enregistrer" : "Ajouter"}
      </button>
    </div>
  );
}

function StatusBadge({ status }) {
  return <span className={`status ${String(status || "INFO").toLowerCase()}`}>{status}</span>;
}

export default App;
