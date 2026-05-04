import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  BarChart3,
  Bell,
  BrainCircuit,
  CalendarDays,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  Crown,
  Dumbbell,
  Edit3,
  Flame,
  Gauge,
  HeartPulse,
  KeyRound,
  LayoutDashboard,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Landmark,
  Mail,
  Medal,
  MessageCircle,
  Moon,
  PlayCircle,
  Plus,
  RefreshCw,
  Receipt,
  Save,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Target,
  Timer,
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
    { id: "dashboard", label: "Statistiques", icon: LayoutDashboard },
    { id: "members", label: "Membres", icon: Users },
    { id: "subscriptions", label: "Abonnements", icon: BadgeCheck },
    { id: "payments", label: "Paiements", icon: CreditCard },
    { id: "coaches", label: "Coachs", icon: UserRoundCog }
  ],
  COACH: [
    { id: "dashboard", label: "Suivi coach", icon: LayoutDashboard },
    { id: "coachPortal", label: "Planning", icon: UserRoundCog },
    { id: "courses", label: "Cours", icon: CalendarDays },
    { id: "members", label: "Membres", icon: Users },
    { id: "attendance", label: "Presences", icon: ClipboardCheck }
  ],
  MEMBER: [
    { id: "dashboard", label: "Mon espace", icon: UserRound },
    { id: "subscription", label: "Abonnement", icon: CreditCard },
    { id: "calendar", label: "Cours collectifs", icon: CalendarDays },
    { id: "recommendations", label: "Programme", icon: BrainCircuit }
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

const formatTime = (value) => {
  if (!value) return "--:--";
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
};

const formatShortDay = (value) =>
  new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "2-digit" }).format(new Date(value));

const dateKey = (value) => toDateInput(value);

const getNextDays = (count = 7) =>
  Array.from({ length: count }, (_, index) => {
    const day = new Date();
    day.setDate(day.getDate() + index);
    day.setHours(0, 0, 0, 0);
    return day;
  });

const daysUntil = (value) => {
  if (!value) return 0;
  const diff = new Date(value).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
};

const useStoredState = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};

const getMemberProfile = (data) => data.portal || data.dashboard?.member || null;

const getMemberCourses = (member, data, user) => {
  const fromEnrollments = (member?.enrollments || []).map((enrollment) => enrollment.course).filter(Boolean);
  const memberId = user?.memberId || member?.id;
  const fromCourses = (data.courses || []).filter((course) =>
    course.enrollments?.some((enrollment) => enrollment.memberId === memberId)
  );
  return [...fromEnrollments, ...fromCourses].filter(
    (course, index, courses) => course?.id && courses.findIndex((item) => item.id === course.id) === index
  );
};

const getMemberStats = (member, data, user) => {
  const subscription = member?.subscriptions?.[0];
  const bookedCourses = getMemberCourses(member, data, user);
  const attendanceCount = member?.attendance?.length || 0;
  const nextCourse = [...bookedCourses].sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt))[0];

  return {
    subscription,
    bookedCourses,
    attendanceCount,
    nextCourse,
    activeDays: daysUntil(subscription?.endDate),
    progress: Number(member?.progressScore || 0)
  };
};

const getMemberBadges = (member, stats) => [
  {
    title: "Starter",
    text: "Profil active",
    icon: Star,
    unlocked: Boolean(member),
    accent: "sunset"
  },
  {
    title: "Assidu",
    text: "5 presences validees",
    icon: CheckCircle2,
    unlocked: stats.attendanceCount >= 5,
    accent: "mint"
  },
  {
    title: "Objectif 75",
    text: "Progression superieure a 75%",
    icon: Target,
    unlocked: stats.progress >= 75,
    accent: "violet"
  },
  {
    title: "Club Elite",
    text: "Abonnement actif",
    icon: Crown,
    unlocked: stats.subscription?.status === "ACTIVE",
    accent: "gold"
  }
];

const buildLeaderboard = (member) => {
  const currentScore = Number(member?.progressScore || 0);
  return [
    { name: "Sara Benali", score: 96, streak: 18 },
    { name: fullName(member), score: currentScore || 74, streak: Math.max(3, member?.attendance?.length || 0), current: true },
    { name: "Yassine Amrani", score: 82, streak: 11 },
    { name: "Nadia Fit", score: 78, streak: 9 },
    { name: "Omar Coach", score: 69, streak: 7 }
  ].sort((a, b) => b.score - a.score);
};

const defaultVideos = [
  {
    title: "HIIT full body",
    level: "Intermediaire",
    minutes: 18,
    accent: "sunset",
    url: "https://www.youtube.com/results?search_query=hiit+full+body+workout"
  },
  {
    title: "Mobilite et stretching",
    level: "Debutant",
    minutes: 12,
    accent: "mint",
    url: "https://www.youtube.com/results?search_query=mobility+stretching+routine"
  },
  {
    title: "Force haut du corps",
    level: "Avance",
    minutes: 24,
    accent: "violet",
    url: "https://www.youtube.com/results?search_query=upper+body+strength+workout"
  },
  {
    title: "Core training",
    level: "Tous niveaux",
    minutes: 15,
    accent: "gold",
    url: "https://www.youtube.com/results?search_query=core+training+fitness"
  }
];

const getCoachProfile = (data) => data.portal || null;

const getCoachCourses = (data) => getCoachProfile(data)?.courses || [];

const getCoachMembers = (data) => {
  const fromCourses = getCoachCourses(data)
    .flatMap((course) => course.enrollments || [])
    .map((enrollment) => enrollment.member)
    .filter(Boolean);
  const allMembers = data.members || [];
  const combined = [...fromCourses, ...allMembers];
  return combined.filter((member, index, members) => member?.id && members.findIndex((item) => item.id === member.id) === index);
};

const getCoachStats = (data) => {
  const courses = getCoachCourses(data);
  const members = getCoachMembers(data);
  const today = dateKey(new Date());
  const todayCourses = courses.filter((course) => dateKey(course.startsAt) === today);
  const attendanceCount = courses.reduce((total, course) => total + (course.attendance?.length || 0), 0);
  const nextCourse = [...courses]
    .filter((course) => new Date(course.startsAt).getTime() >= Date.now() - 3600000)
    .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt))[0];

  return {
    courses,
    members,
    todayCourses,
    attendanceCount,
    nextCourse,
    fillRate: Math.round(
      courses.reduce((total, course) => total + ((course.enrollments?.length || 0) / Math.max(Number(course.capacity || 1), 1)), 0) /
        Math.max(courses.length, 1) *
        100
    )
  };
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

  useEffect(() => {
    if (!auth || !activeNav.length) return;
    if (!activeNav.some((item) => item.id === view)) {
      setView(activeNav[0].id);
    }
  }, [activeNav, auth, view]);

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
          {view === "calendar" && (
            <MemberCalendarPage data={data} user={auth.user} mutate={mutate} request={request} working={working} />
          )}
          {view === "progress" && (
            <MemberProgressPage member={getMemberProfile(data)} user={auth.user} data={data} />
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
          {view === "community" && <MemberCommunityPage member={getMemberProfile(data)} data={data} user={auth.user} />}
          {view === "chat" && <MemberChatPage member={getMemberProfile(data)} user={auth.user} />}
          {view === "subscription" && <MemberSubscriptionPage member={getMemberProfile(data)} data={data} user={auth.user} />}
          {view === "notifications" && <MemberNotificationsPage member={getMemberProfile(data)} data={data} user={auth.user} />}
          {view === "videos" && <MemberVideosPage recommendations={data.recommendations} />}
          {view === "coachMessages" && <CoachMessagesPage data={data} user={auth.user} />}
          {view === "coachNotifications" && <CoachNotificationsPage data={data} user={auth.user} />}
          {view === "coachVideos" && <CoachVideosPage data={data} />}
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
    const member = getMemberProfile(data);
    return <MemberHomeV2 member={member} data={data} user={user} onGenerate={onGenerate} />;
  }

  if (user.role === "COACH") {
    return <CoachHomeV2 data={data} user={user} onNavigate={onNavigate} />;
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
    { label: "Ajouter membre", icon: UserPlus, view: "members" },
    { label: "Nouveau paiement", icon: Receipt, view: "payments" },
    { label: "Gerer coachs", icon: UserRoundCog, view: "coaches" }
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

function MemberHomeV2({ member, data, user, onGenerate }) {
  const stats = getMemberStats(member, data, user);
  const subscription = stats.subscription;
  const recommendation = member?.recommendations?.[0] || data.recommendations?.[0];
  const badges = getMemberBadges(member, stats);
  const leaderboard = buildLeaderboard(member);
  const currentRank = leaderboard.findIndex((item) => item.current) + 1;
  const upcomingCourses = stats.bookedCourses
    .filter((course) => new Date(course.startsAt).getTime() >= Date.now() - 3600000)
    .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt))
    .slice(0, 3);

  if (!member) {
    return <EmptyState icon={UserRound} title="Profil indisponible" text="Connectez un compte membre a un profil." />;
  }

  return (
    <div className="member-app">
      <section className="mobile-hero">
        <div>
          <p className="eyebrow">Portail membre</p>
          <h2>{fullName(member)}</h2>
          <span>{member.objective} - Niveau {member.level}</span>
          <p>
            {stats.nextCourse
              ? `Prochain cours: ${stats.nextCourse.title} a ${formatTime(stats.nextCourse.startsAt)}`
              : "Planifie ta prochaine seance depuis le calendrier."}
          </p>
        </div>
        <ProgressRing value={stats.progress} label="Progression" />
      </section>

      <div className="member-stat-grid">
        <MemberDashboardStat icon={BadgeCheck} label="Abonnement" value={subscription?.status || "N/A"} caption={`${stats.activeDays} jours restants`} accent="mint" />
        <MemberDashboardStat icon={CalendarCheck} label="Reservations" value={stats.bookedCourses.length} caption="Cours reserves" accent="blue" />
        <MemberDashboardStat icon={Flame} label="Presences" value={stats.attendanceCount} caption="Historique sportif" accent="sunset" />
        <MemberDashboardStat icon={Trophy} label="Classement" value={`#${currentRank || "-"}`} caption="Leaderboard club" accent="violet" />
      </div>

      <div className="mobile-section-grid">
        <article className="mobile-panel wide">
          <div className="mobile-panel-head">
            <div>
              <p className="eyebrow">Programme IA</p>
              <h3>{recommendation?.goal || "Plan personnalise"}</h3>
            </div>
            <button className="icon-button" type="button" onClick={() => onGenerate(member.id)} title="Generer mon programme">
              <BrainCircuit size={18} />
            </button>
          </div>
          <p>{recommendation?.summary || "Genere un programme adapte a ton niveau, ton objectif et ton historique."}</p>
          <div className="training-focus-row">
            <span><Dumbbell size={15} /> {recommendation?.weeklyFrequency || 3} seances</span>
            <span><Timer size={15} /> 45 min</span>
            <span><Target size={15} /> {member.objective}</span>
          </div>
        </article>

        <article className="mobile-panel">
          <div className="mobile-panel-head">
            <div>
              <p className="eyebrow">Badges</p>
              <h3>{badges.filter((badge) => badge.unlocked).length}/{badges.length} debloques</h3>
            </div>
            <Medal size={22} />
          </div>
          <div className="badge-row">
            {badges.map((badge) => {
              const Icon = badge.icon;
              return (
                <span className={badge.unlocked ? `mini-badge ${badge.accent}` : "mini-badge locked"} key={badge.title} title={badge.text}>
                  <Icon size={16} />
                </span>
              );
            })}
          </div>
        </article>
      </div>

      <div className="mobile-two-col">
        <article className="mobile-panel">
          <div className="mobile-panel-head">
            <div>
              <p className="eyebrow">Performance</p>
              <h3>Suivi rapide</h3>
            </div>
            <BarChart3 size={22} />
          </div>
          <MiniBars values={[42, 64, 55, 78, stats.progress || 68]} />
          <div className="training-focus-row">
            <span><HeartPulse size={15} /> {member.weightKg || "--"} kg</span>
            <span><Gauge size={15} /> {stats.progress}%</span>
          </div>
        </article>

        <article className="mobile-panel">
          <div className="mobile-panel-head">
            <div>
              <p className="eyebrow">Prochains cours</p>
              <h3>Reservations</h3>
            </div>
            <CalendarDays size={22} />
          </div>
          <div className="compact-course-list">
            {upcomingCourses.length ? (
              upcomingCourses.map((course) => (
                <div key={course.id}>
                  <strong>{course.title}</strong>
                  <span>{formatDateTime(course.startsAt)} - {fullName(course.coach)}</span>
                </div>
              ))
            ) : (
              <span>Aucun cours reserve.</span>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}

function MemberDashboardStat({ icon: Icon, label, value, caption, accent }) {
  return (
    <article className={`member-stat-card ${accent}`}>
      <div>
        <Icon size={20} />
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{caption}</small>
    </article>
  );
}

function ProgressRing({ value, label }) {
  const safeValue = Math.max(0, Math.min(100, Number(value || 0)));
  return (
    <div className="progress-ring" style={{ "--value": `${safeValue * 3.6}deg` }}>
      <strong>{safeValue}%</strong>
      <span>{label}</span>
    </div>
  );
}

function MiniBars({ values }) {
  const max = Math.max(...values, 1);
  return (
    <div className="mini-bars">
      {values.map((value, index) => (
        <span key={`${value}-${index}`} style={{ "--height": `${Math.max(16, (value / max) * 100)}%` }} />
      ))}
    </div>
  );
}

function MemberCalendarPage({ data, user, mutate, request, working }) {
  const [selectedDay, setSelectedDay] = useState(dateKey(new Date()));
  const days = getNextDays(7);
  const courses = data.courses || [];
  const selectedCourses = courses
    .filter((course) => dateKey(course.startsAt) === selectedDay)
    .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
  const visibleCourses = selectedCourses.length ? selectedCourses : courses.slice(0, 6);

  const toggleEnrollment = (course, enrolled) => {
    const memberId = user.memberId;
    if (!memberId && enrolled) return;
    mutate(
      () =>
        enrolled
          ? request(`/courses/${course.id}/enrollments/${memberId}`, { method: "DELETE" })
          : request(`/courses/${course.id}/enroll`, { method: "POST" }),
      enrolled ? "Reservation annulee." : "Cours reserve."
    );
  };

  return (
    <div className="member-app">
      <section className="mobile-panel">
        <div className="mobile-panel-head">
          <div>
            <p className="eyebrow">Calendrier interactif</p>
            <h3>Reserver un cours</h3>
          </div>
          <CalendarDays size={22} />
        </div>
        <div className="calendar-strip">
          {days.map((day) => {
            const key = dateKey(day);
            const count = courses.filter((course) => dateKey(course.startsAt) === key).length;
            return (
              <button className={selectedDay === key ? "calendar-day active" : "calendar-day"} type="button" key={key} onClick={() => setSelectedDay(key)}>
                <span>{formatShortDay(day)}</span>
                <strong>{count}</strong>
              </button>
            );
          })}
        </div>
      </section>

      <div className="course-grid mobile-course-grid">
        {visibleCourses.map((course) => {
          const enrolled = course.enrollments?.some((item) => item.memberId === user.memberId);
          return (
            <article className="mobile-course-card" key={course.id}>
              <div className="mobile-course-time">
                <strong>{formatTime(course.startsAt)}</strong>
                <span>{course.room || "Studio"}</span>
              </div>
              <div>
                <p className="eyebrow">{course.activity}</p>
                <h3>{course.title}</h3>
                <p>{course.description || "Session guidee par un coach GETFIT."}</p>
                <div className="training-focus-row">
                  <span><Users size={15} /> {course.enrollments?.length || 0}/{course.capacity}</span>
                  <span><UserRoundCog size={15} /> {fullName(course.coach)}</span>
                </div>
              </div>
              <button className={enrolled ? "secondary-button" : "primary-button"} type="button" disabled={working} onClick={() => toggleEnrollment(course, enrolled)}>
                {enrolled ? <X size={16} /> : <Plus size={16} />}
                {enrolled ? "Annuler" : "Reserver"}
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function MemberProgressPage({ member, user, data }) {
  const initialWeight = Number(member?.weightKg || 76);
  const [history, setHistory] = useStoredState(`gym-progress-${user.id || user.memberId || "member"}`, [
    { date: dateKey(new Date(Date.now() - 21 * 86400000)), weight: initialWeight + 2, objective: member?.objective || "Condition physique" },
    { date: dateKey(new Date(Date.now() - 14 * 86400000)), weight: initialWeight + 1, objective: member?.objective || "Condition physique" },
    { date: dateKey(new Date(Date.now() - 7 * 86400000)), weight: initialWeight, objective: member?.objective || "Condition physique" }
  ]);
  const [form, setForm] = useState({ weight: "", objective: member?.objective || "Condition physique" });

  if (!member) return <EmptyState icon={TrendingUp} title="Profil indisponible" />;

  const latest = history[history.length - 1] || {};
  const heightM = Number(member.heightCm || 170) / 100;
  const bmi = latest.weight && heightM ? latest.weight / (heightM * heightM) : 0;
  const stats = getMemberStats(member, data, user);

  const submit = (event) => {
    event.preventDefault();
    if (!form.weight) return;
    setHistory([...history, { date: dateKey(new Date()), weight: Number(form.weight), objective: form.objective }]);
    setForm({ weight: "", objective: form.objective });
  };

  return (
    <div className="member-app">
      <div className="member-stat-grid">
        <MemberDashboardStat icon={HeartPulse} label="Poids actuel" value={`${latest.weight || member.weightKg || "--"} kg`} caption="Derniere mesure" accent="sunset" />
        <MemberDashboardStat icon={Target} label="Objectif" value={latest.objective || member.objective} caption="Plan actif" accent="mint" />
        <MemberDashboardStat icon={Gauge} label="IMC" value={bmi ? bmi.toFixed(1) : "--"} caption={`${member.heightCm || "--"} cm`} accent="blue" />
        <MemberDashboardStat icon={Activity} label="Score" value={`${stats.progress}%`} caption="Progression globale" accent="violet" />
      </div>

      <div className="mobile-two-col">
        <article className="mobile-panel">
          <div className="mobile-panel-head">
            <div>
              <p className="eyebrow">Historique</p>
              <h3>Evolution du poids</h3>
            </div>
            <TrendingUp size={22} />
          </div>
          <PerformanceHistoryChart history={history} />
        </article>

        <article className="mobile-panel">
          <div className="mobile-panel-head">
            <div>
              <p className="eyebrow">Nouvelle mesure</p>
              <h3>Suivi performances</h3>
            </div>
            <Save size={22} />
          </div>
          <form className="form-grid" onSubmit={submit}>
            <TextField label="Poids kg" type="number" value={form.weight} onChange={(value) => setForm({ ...form, weight: value })} required />
            <SelectField label="Objectif" value={form.objective} onChange={(value) => setForm({ ...form, objective: value })} options={objectives} />
            <div className="form-actions full-span">
              <button className="primary-button" type="submit">
                <Plus size={16} />
                Ajouter mesure
              </button>
            </div>
          </form>
        </article>
      </div>
    </div>
  );
}

function PerformanceHistoryChart({ history }) {
  const values = history.map((item) => Number(item.weight || 0));
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);

  return (
    <div className="performance-chart">
      {history.map((item) => {
        const height = max === min ? 50 : ((Number(item.weight) - min) / (max - min)) * 70 + 20;
        return (
          <div key={`${item.date}-${item.weight}`}>
            <span style={{ "--height": `${height}%` }} />
            <strong>{item.weight}</strong>
            <small>{formatDate(item.date)}</small>
          </div>
        );
      })}
    </div>
  );
}

function MemberCommunityPage({ member, data, user }) {
  const stats = getMemberStats(member, data, user);
  const badges = getMemberBadges(member, stats);
  const leaderboard = buildLeaderboard(member);

  return (
    <div className="member-app">
      <div className="badge-grid">
        {badges.map((badge) => {
          const Icon = badge.icon;
          return (
            <article className={badge.unlocked ? `badge-card ${badge.accent}` : "badge-card locked"} key={badge.title}>
              <div><Icon size={24} /></div>
              <h3>{badge.title}</h3>
              <p>{badge.text}</p>
              <span>{badge.unlocked ? "Debloque" : "A progresser"}</span>
            </article>
          );
        })}
      </div>

      <article className="mobile-panel">
        <div className="mobile-panel-head">
          <div>
            <p className="eyebrow">Leaderboard</p>
            <h3>Classement du club</h3>
          </div>
          <Trophy size={22} />
        </div>
        <div className="leaderboard-list">
          {leaderboard.map((item, index) => (
            <div className={item.current ? "leaderboard-row current" : "leaderboard-row"} key={item.name}>
              <strong>#{index + 1}</strong>
              <span>{item.name}</span>
              <small>{item.streak} jours</small>
              <b>{item.score}%</b>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

function MemberChatPage({ member, user }) {
  const [messages, setMessages] = useStoredState(`gym-chat-${user.id || user.memberId || "member"}`, [
    { from: "coach", text: "Salut, j'ai ajuste ta prochaine seance selon ton objectif.", at: "09:10" },
    { from: "member", text: "Parfait, je veux aussi travailler le cardio cette semaine.", at: "09:14" }
  ]);
  const [text, setText] = useState("");

  const send = (event) => {
    event.preventDefault();
    if (!text.trim()) return;
    setMessages([...messages, { from: "member", text: text.trim(), at: formatTime(new Date()) }]);
    setText("");
  };

  return (
    <div className="chat-shell">
      <section className="chat-header">
        <div className="coach-avatar"><UserRoundCog size={24} /></div>
        <div>
          <p className="eyebrow">Chat membre / coach</p>
          <h3>Coach GETFIT</h3>
          <span>{member?.objective || "Programme fitness"} - reponse rapide</span>
        </div>
      </section>

      <div className="chat-thread">
        {messages.map((message, index) => (
          <div className={message.from === "member" ? "chat-message mine" : "chat-message"} key={`${message.at}-${index}`}>
            <p>{message.text}</p>
            <span>{message.at}</span>
          </div>
        ))}
      </div>

      <form className="chat-compose" onSubmit={send}>
        <input value={text} onChange={(event) => setText(event.target.value)} placeholder="Ecrire au coach..." />
        <button className="primary-button" type="submit">
          <Send size={16} />
          Envoyer
        </button>
      </form>
    </div>
  );
}

function MemberSubscriptionPage({ member, data, user }) {
  const subscription = member?.subscriptions?.[0];
  const payments = data.payments || [];
  const plans = data.plans || [];

  return (
    <div className="member-app">
      <section className="subscription-hero">
        <div>
          <p className="eyebrow">Abonnement + paiement</p>
          <h2>{subscription?.plan?.name || "Aucun abonnement actif"}</h2>
          <span>{subscription ? `${formatDate(subscription.startDate)} - ${formatDate(subscription.endDate)}` : "Choisis une offre pour continuer"}</span>
        </div>
        <ProgressRing value={subscription ? Math.max(8, 100 - daysUntil(subscription.endDate)) : 0} label={`${daysUntil(subscription?.endDate)} jours`} />
      </section>

      <div className="price-grid">
        {plans.map((plan) => (
          <article className="price-card modern-plan-card" key={plan.id}>
            <p className="eyebrow">{plan.durationDays} jours</p>
            <h3>{plan.name}</h3>
            <strong>{formatMoney(plan.price)}</strong>
            <p>{plan.description || "Acces club, cours collectifs et suivi digital."}</p>
            <button className="secondary-button" type="button">
              <CreditCard size={16} />
              Selectionner
            </button>
          </article>
        ))}
      </div>

      <Panel title="Historique paiement" icon={Receipt}>
        <PremiumPaymentsTable payments={payments} fallbackName={user.name} empty="Aucun paiement." />
      </Panel>
    </div>
  );
}

function MemberNotificationsPage({ member, data, user }) {
  const [settings, setSettings] = useStoredState(`gym-notifications-${user.id || user.memberId || "member"}`, {
    courseReminder: true,
    paymentReminder: true,
    aiReminder: true
  });
  const courses = getMemberCourses(member, data, user).slice(0, 4);
  const subscription = member?.subscriptions?.[0];
  const reminders = [
    ...courses.map((course) => ({
      title: `Rappel cours: ${course.title}`,
      text: `${formatDateTime(course.startsAt)} - ${course.room || "Studio"}`,
      icon: CalendarCheck
    })),
    {
      title: "Abonnement",
      text: subscription ? `Expire dans ${daysUntil(subscription.endDate)} jours` : "Aucun abonnement actif",
      icon: CreditCard
    },
    {
      title: "Programme IA",
      text: "Mise a jour recommandee chaque semaine",
      icon: BrainCircuit
    }
  ];

  const toggle = (key) => setSettings({ ...settings, [key]: !settings[key] });

  return (
    <div className="member-app">
      <div className="notification-settings">
        {[
          ["courseReminder", "Rappel avant les cours", CalendarDays],
          ["paymentReminder", "Alerte abonnement", CreditCard],
          ["aiReminder", "Programme IA hebdo", BrainCircuit]
        ].map(([key, label, Icon]) => (
          <button className={settings[key] ? "toggle-row active" : "toggle-row"} type="button" key={key} onClick={() => toggle(key)}>
            <Icon size={18} />
            <span>{label}</span>
            <strong>{settings[key] ? "ON" : "OFF"}</strong>
          </button>
        ))}
      </div>

      <article className="mobile-panel">
        <div className="mobile-panel-head">
          <div>
            <p className="eyebrow">Notifications</p>
            <h3>Rappels importants</h3>
          </div>
          <Bell size={22} />
        </div>
        <div className="reminder-list">
          {reminders.map((reminder) => {
            const Icon = reminder.icon;
            return (
              <div key={reminder.title}>
                <Icon size={18} />
                <span>
                  <strong>{reminder.title}</strong>
                  <small>{reminder.text}</small>
                </span>
              </div>
            );
          })}
        </div>
      </article>
    </div>
  );
}

function MemberVideosPage({ recommendations }) {
  const aiVideos = recommendations
    .flatMap((recommendation) => {
      const plan = parsePlan(recommendation.plan);
      return plan.youtubeVideos || plan.videos || [];
    })
    .map((video) => ({
      title: video.title || video.query || "Video recommandee",
      level: video.reason || "Recommande IA",
      minutes: 12,
      accent: "blue",
      url: video.url || "https://www.youtube.com/results?search_query=fitness+workout"
    }));
  const videos = [...aiVideos, ...defaultVideos].slice(0, 8);

  return (
    <div className="member-app">
      <section className="video-hero">
        <div>
          <p className="eyebrow">Videos fitness</p>
          <h2>Bibliotheque entrainement</h2>
          <span>HIIT, mobilite, force et core training</span>
        </div>
        <PlayCircle size={54} />
      </section>

      <div className="fitness-video-grid">
        {videos.map((video) => (
          <a className={`fitness-video-card ${video.accent}`} href={video.url} key={video.title} rel="noreferrer" target="_blank">
            <div className="video-thumb">
              <Youtube size={30} />
              <span>{video.minutes} min</span>
            </div>
            <h3>{video.title}</h3>
            <p>{video.level}</p>
          </a>
        ))}
      </div>
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

function CoachHomeV2({ data, user, onNavigate }) {
  const coach = getCoachProfile(data);
  const stats = getCoachStats(data);
  const nextCourse = stats.nextCourse;
  const topMembers = [...stats.members]
    .sort((a, b) => Number(b.progressScore || 0) - Number(a.progressScore || 0))
    .slice(0, 4);

  return (
    <div className="coach-app">
      <section className="coach-hero">
        <div>
          <p className="eyebrow">Espace coach</p>
          <h2>{coach ? fullName(coach) : user.name}</h2>
          <span>{coach?.specialty || "Coaching fitness"} - {stats.todayCourses.length} cours aujourd'hui</span>
          <p>
            {nextCourse
              ? `Prochaine session: ${nextCourse.title} a ${formatTime(nextCourse.startsAt)} avec ${nextCourse.enrollments?.length || 0} eleves.`
              : "Ton planning est pret pour accueillir les prochains cours."}
          </p>
        </div>
        <div className="coach-hero-actions">
          <button className="primary-button" type="button" onClick={() => onNavigate("coachPortal")}>
            <CalendarDays size={16} />
            Voir planning
          </button>
          <button className="secondary-button" type="button" onClick={() => onNavigate("courses")}>
            <Dumbbell size={16} />
            Organiser seance
          </button>
        </div>
      </section>

      <div className="member-stat-grid">
        <MemberDashboardStat icon={CalendarCheck} label="Cours planifies" value={stats.courses.length} caption={`${stats.todayCourses.length} aujourd'hui`} accent="blue" />
        <MemberDashboardStat icon={Users} label="Eleves suivis" value={stats.members.length} caption="Profils actifs" accent="mint" />
        <MemberDashboardStat icon={ClipboardCheck} label="Presences" value={stats.attendanceCount} caption="Total valide" accent="sunset" />
        <MemberDashboardStat icon={Gauge} label="Remplissage" value={`${stats.fillRate}%`} caption="Moyenne cours" accent="violet" />
      </div>

      <div className="coach-command-grid">
        <article className="coach-panel wide">
          <div className="mobile-panel-head">
            <div>
              <p className="eyebrow">Planning live</p>
              <h3>{nextCourse?.title || "Aucun cours proche"}</h3>
            </div>
            <Timer size={22} />
          </div>
          {nextCourse ? (
            <>
              <div className="coach-session-card">
                <strong>{formatDateTime(nextCourse.startsAt)}</strong>
                <span>{nextCourse.room || "Salle principale"} - {nextCourse.enrollments?.length || 0}/{nextCourse.capacity} eleves</span>
                <ProgressLine value={Math.round(((nextCourse.enrollments?.length || 0) / Math.max(nextCourse.capacity || 1, 1)) * 100)} />
              </div>
              <div className="training-focus-row">
                <span><Dumbbell size={15} /> {nextCourse.activity}</span>
                <span><ClipboardCheck size={15} /> {nextCourse.attendance?.length || 0} presences</span>
                <span><Users size={15} /> {nextCourse.enrollments?.length || 0} inscrits</span>
              </div>
            </>
          ) : (
            <p>Aucun cours imminent pour le moment.</p>
          )}
        </article>

        <article className="coach-panel">
          <div className="mobile-panel-head">
            <div>
              <p className="eyebrow">Coach tools</p>
              <h3>Actions rapides</h3>
            </div>
            <Sparkles size={22} />
          </div>
          <div className="coach-tool-list">
            {[
              ["Planning", CalendarDays, "coachPortal"],
              ["Cours", Dumbbell, "courses"],
              ["Membres", Users, "members"],
              ["Presences", ClipboardCheck, "attendance"]
            ].map(([label, Icon, view]) => (
              <button type="button" key={view} onClick={() => onNavigate(view)}>
                <Icon size={17} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </article>
      </div>

      <div className="mobile-two-col">
        <article className="coach-panel">
          <div className="mobile-panel-head">
            <div>
              <p className="eyebrow">Eleves a suivre</p>
              <h3>Progression</h3>
            </div>
            <TrendingUp size={22} />
          </div>
          <div className="coach-member-list">
            {topMembers.length ? (
              topMembers.map((member) => (
                <div key={member.id}>
                  <span>
                    <strong>{fullName(member)}</strong>
                    <small>{member.objective} - {member.level}</small>
                  </span>
                  <b>{member.progressScore || 0}%</b>
                </div>
              ))
            ) : (
              <p>Aucun eleve assigne.</p>
            )}
          </div>
        </article>

        <article className="coach-panel">
          <div className="mobile-panel-head">
            <div>
              <p className="eyebrow">Suivi membres</p>
              <h3>Objectifs a surveiller</h3>
            </div>
            <Target size={22} />
          </div>
          <div className="coach-ai-queue">
            {stats.members.slice(0, 4).map((member) => (
              <button type="button" key={member.id} onClick={() => onNavigate("members")}>
                <Target size={16} />
                <span>{fullName(member)}</span>
                <small>{member.objective}</small>
              </button>
            ))}
            {!stats.members.length && <p>Aucun membre a suivre.</p>}
          </div>
        </article>
      </div>
    </div>
  );
}

function ProgressLine({ value }) {
  const safeValue = Math.max(0, Math.min(100, Number(value || 0)));
  return (
    <div className="progress-line">
      <span style={{ width: `${safeValue}%` }} />
      <strong>{safeValue}%</strong>
    </div>
  );
}

function CoachPortalPage({ data }) {
  const coach = data.portal;
  const courses = getCoachCourses(data);
  const [selectedDay, setSelectedDay] = useState(dateKey(new Date()));
  const days = getNextDays(7);
  const selectedCourses = courses.filter((course) => dateKey(course.startsAt) === selectedDay);

  return (
    <div className="coach-app">
      <section className="coach-hero compact">
        <div>
          <p className="eyebrow">{coach?.specialty || "Planning coach"}</p>
          <h2>{coach ? fullName(coach) : "Coach"}</h2>
          <span>{courses.length} cours planifies - calendrier interactif</span>
        </div>
      </section>

      <section className="coach-panel">
        <div className="calendar-strip">
          {days.map((day) => {
            const key = dateKey(day);
            const count = courses.filter((course) => dateKey(course.startsAt) === key).length;
            return (
              <button className={selectedDay === key ? "calendar-day active" : "calendar-day"} type="button" key={key} onClick={() => setSelectedDay(key)}>
                <span>{formatShortDay(day)}</span>
                <strong>{count}</strong>
              </button>
            );
          })}
        </div>
      </section>

      <div className="coach-course-list">
        {(selectedCourses.length ? selectedCourses : courses).map((course) => (
          <article className="coach-course-card" key={course.id}>
            <div className="mobile-course-time">
              <strong>{formatTime(course.startsAt)}</strong>
              <span>{course.room || "Studio"}</span>
            </div>
            <div className="coach-course-main">
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
              <div className="coach-roster">
                {(course.enrollments || []).map((enrollment) => (
                  <span key={enrollment.id || enrollment.memberId}>
                    <UserRound size={14} />
                    {fullName(enrollment.member)}
                  </span>
                ))}
                {!course.enrollments?.length && <small>Aucun membre inscrit.</small>}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function CoachMessagesPage({ data, user }) {
  const members = getCoachMembers(data);
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id || "");
  const selectedMember = members.find((member) => member.id === selectedMemberId) || members[0];
  const [messages, setMessages] = useStoredState(`gym-coach-chat-${user.id || user.coachId || "coach"}`, [
    { from: "member", memberId: selectedMember?.id || "demo", text: "Coach, je peux remplacer cardio par musculation aujourd'hui ?", at: "10:20" },
    { from: "coach", memberId: selectedMember?.id || "demo", text: "Oui, garde 10 minutes d'echauffement puis passe au circuit force.", at: "10:24" }
  ]);
  const [text, setText] = useState("");
  const thread = messages.filter((message) => !selectedMember || message.memberId === selectedMember.id);

  const send = (event) => {
    event.preventDefault();
    if (!text.trim() || !selectedMember) return;
    setMessages([...messages, { from: "coach", memberId: selectedMember.id, text: text.trim(), at: formatTime(new Date()) }]);
    setText("");
  };

  return (
    <div className="coach-messaging-layout">
      <aside className="coach-inbox">
        <p className="eyebrow">Messages eleves</p>
        <h3>Inbox coach</h3>
        <div>
          {members.map((member) => (
            <button className={selectedMember?.id === member.id ? "active" : ""} type="button" key={member.id} onClick={() => setSelectedMemberId(member.id)}>
              <UserRound size={16} />
              <span>{fullName(member)}</span>
              <small>{member.objective}</small>
            </button>
          ))}
        </div>
      </aside>

      <section className="chat-shell coach-chat-shell">
        <div className="chat-header">
          <div className="coach-avatar"><MessageCircle size={24} /></div>
          <div>
            <p className="eyebrow">Conversation</p>
            <h3>{selectedMember ? fullName(selectedMember) : "Aucun eleve"}</h3>
            <span>{selectedMember?.objective || "Selectionne un eleve"}</span>
          </div>
        </div>
        <div className="chat-thread">
          {thread.map((message, index) => (
            <div className={message.from === "coach" ? "chat-message mine" : "chat-message"} key={`${message.at}-${index}`}>
              <p>{message.text}</p>
              <span>{message.at}</span>
            </div>
          ))}
        </div>
        <form className="chat-compose" onSubmit={send}>
          <input value={text} onChange={(event) => setText(event.target.value)} placeholder="Repondre a l'eleve..." />
          <button className="primary-button" type="submit" disabled={!selectedMember}>
            <Send size={16} />
            Envoyer
          </button>
        </form>
      </section>
    </div>
  );
}

function CoachNotificationsPage({ data, user }) {
  const stats = getCoachStats(data);
  const [settings, setSettings] = useStoredState(`gym-coach-rappels-${user.id || user.coachId || "coach"}`, {
    courseStart: true,
    absentMembers: true,
    aiPrograms: true
  });
  const reminders = [
    ...stats.todayCourses.map((course) => ({
      title: `Cours aujourd'hui: ${course.title}`,
      text: `${formatTime(course.startsAt)} - ${course.enrollments?.length || 0} eleves inscrits`,
      icon: CalendarCheck
    })),
    {
      title: "Suivi presences",
      text: `${stats.attendanceCount} presences deja validees dans ton historique`,
      icon: ClipboardCheck
    },
    {
      title: "Programmes IA",
      text: `${stats.members.length} eleves peuvent recevoir un plan personnalise`,
      icon: BrainCircuit
    }
  ];

  const toggle = (key) => setSettings({ ...settings, [key]: !settings[key] });

  return (
    <div className="coach-app">
      <div className="notification-settings">
        {[
          ["courseStart", "Rappel avant cours", Timer],
          ["absentMembers", "Eleves absents", ClipboardCheck],
          ["aiPrograms", "Plans IA a generer", BrainCircuit]
        ].map(([key, label, Icon]) => (
          <button className={settings[key] ? "toggle-row active" : "toggle-row"} type="button" key={key} onClick={() => toggle(key)}>
            <Icon size={18} />
            <span>{label}</span>
            <strong>{settings[key] ? "ON" : "OFF"}</strong>
          </button>
        ))}
      </div>

      <article className="coach-panel">
        <div className="mobile-panel-head">
          <div>
            <p className="eyebrow">Rappels coach</p>
            <h3>Notifications importantes</h3>
          </div>
          <Bell size={22} />
        </div>
        <div className="reminder-list">
          {reminders.map((reminder) => {
            const Icon = reminder.icon;
            return (
              <div key={reminder.title}>
                <Icon size={18} />
                <span>
                  <strong>{reminder.title}</strong>
                  <small>{reminder.text}</small>
                </span>
              </div>
            );
          })}
        </div>
      </article>
    </div>
  );
}

function CoachVideosPage({ data }) {
  const members = getCoachMembers(data);
  const videos = defaultVideos;

  return (
    <div className="coach-app">
      <section className="video-hero coach-video-hero">
        <div>
          <p className="eyebrow">Videos coach</p>
          <h2>Bibliotheque a recommander</h2>
          <span>Prepare des supports rapides pour les eleves selon objectif et niveau.</span>
        </div>
        <Youtube size={54} />
      </section>

      <div className="fitness-video-grid">
        {videos.map((video, index) => {
          const member = members[index % Math.max(members.length, 1)];
          return (
            <a className={`fitness-video-card ${video.accent}`} href={video.url} key={video.title} rel="noreferrer" target="_blank">
              <div className="video-thumb">
                <Youtube size={30} />
                <span>{video.minutes} min</span>
              </div>
              <h3>{video.title}</h3>
              <p>{member ? `Recommande pour ${fullName(member)}` : video.level}</p>
            </a>
          );
        })}
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
