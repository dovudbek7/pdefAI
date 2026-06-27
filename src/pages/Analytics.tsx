import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { Icon, ICONS } from '../components/ui/Icon';

interface LoginLog {
  timestamp: string;
}

interface ProjectStat {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  word_count: number;
}

interface UserStat {
  id: string;
  name: string;
  email: string;
  is_staff: boolean;
  date_joined: string;
  last_login: string | null;
  projects_count: number;
  projects: ProjectStat[];
  login_logs: LoginLog[];
}

interface AnalyticsData {
  summary: {
    total_users: number;
    total_projects: number;
    logins_today: number;
    active_users_week: number;
  };
  users: UserStat[];
}

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('uz-UZ', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

function fmtDateShort(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('uz-UZ', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(' ');
  const letters = parts.length >= 2
    ? parts[0][0] + parts[1][0]
    : (parts[0]?.[0] ?? '?');
  return (
    <div className="w-9 h-9 rounded-full bg-ink text-paper grid place-items-center font-display font-semibold text-[13px] shrink-0 select-none">
      {letters.toUpperCase()}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="bg-panel border border-line rounded-2xl px-5 py-4 flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-[0.14em] text-muted font-medium">{label}</span>
      <span className="font-display text-3xl font-semibold text-ink tnum">{value}</span>
      {sub && <span className="text-[11px] text-muted">{sub}</span>}
    </div>
  );
}

function UserRow({ user }: { user: UserStat }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'books' | 'logins'>('books');

  return (
    <div className={`border border-line rounded-xl overflow-hidden transition-all ${open ? 'shadow-md' : ''}`}>
      {/* Header row */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-panel hover:bg-line/30 transition text-left"
      >
        <Initials name={user.name} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-[14px] text-ink">{user.name}</span>
            {user.is_staff && (
              <span className="text-[10px] uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 font-medium">
                Admin
              </span>
            )}
          </div>
          <span className="text-[12px] text-muted truncate block">{user.email}</span>
        </div>
        <div className="hidden sm:flex items-center gap-6 text-[12px] text-muted shrink-0">
          <div className="text-center">
            <div className="font-semibold text-ink text-[15px]">{user.projects_count}</div>
            <div>kitob</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-ink text-[13px]">{fmtDateShort(user.date_joined)}</div>
            <div>qo'shilgan</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-ink text-[13px]">{user.last_login ? fmtDateShort(user.last_login) : '—'}</div>
            <div>oxirgi kirish</div>
          </div>
        </div>
        <Icon
          d={ICONS.chevron}
          className={`w-4 h-4 text-muted shrink-0 transition-transform ${open ? 'rotate-90' : ''}`}
        />
      </button>

      {/* Expanded panel */}
      {open && (
        <div className="border-t border-line bg-paper">
          {/* Mobile stats */}
          <div className="sm:hidden flex items-center gap-4 px-4 py-3 text-[12px] text-muted border-b border-line">
            <span><b className="text-ink">{user.projects_count}</b> kitob</span>
            <span>Qo'shilgan: <b className="text-ink">{fmtDateShort(user.date_joined)}</b></span>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-line">
            {(['books', 'logins'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2.5 text-[12px] font-medium border-b-2 transition ${
                  tab === t
                    ? 'border-ink text-ink'
                    : 'border-transparent text-muted hover:text-ink'
                }`}
              >
                {t === 'books' ? `Kitoblar (${user.projects_count})` : `Kirish tarixi (${user.login_logs.length})`}
              </button>
            ))}
          </div>

          {tab === 'books' && (
            <div className="p-4">
              {user.projects.length === 0 ? (
                <p className="text-[13px] text-muted italic">Hali kitob yo'q</p>
              ) : (
                <div className="space-y-2">
                  {user.projects.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 py-2 border-b border-line/50 last:border-0">
                      <div className="w-7 h-7 rounded-lg bg-line/50 grid place-items-center shrink-0">
                        <Icon d={ICONS.doc} className="w-3.5 h-3.5 text-muted" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-ink truncate">{p.name}</div>
                        <div className="text-[11px] text-muted">
                          {p.word_count.toLocaleString('ru')} so'z · Yangilangan: {fmtDateShort(p.updated_at)}
                        </div>
                      </div>
                      <div className="text-[11px] text-muted shrink-0 hidden sm:block">
                        Yaratilgan: {fmtDateShort(p.created_at)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'logins' && (
            <div className="p-4">
              {user.login_logs.length === 0 ? (
                <p className="text-[13px] text-muted italic">Kirish tarixi yo'q</p>
              ) : (
                <div className="space-y-1.5">
                  {user.login_logs.map((log, i) => (
                    <div key={i} className="flex items-center gap-2 text-[12px] py-1 border-b border-line/40 last:border-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                      <span className="text-ink">{fmtDate(log.timestamp)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Analytics() {
  const navigate = useNavigate();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiFetch('/api/dashboard/analytics/')
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json() as Promise<AnalyticsData>;
      })
      .then(setData)
      .catch(() => setError('Ma\'lumot yuklanmadi. Admin ekanligingizni tekshiring.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = data?.users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  ) ?? [];

  return (
    <div className="min-h-screen bg-[#f5f1ea]">
      {/* Header */}
      <header className="grain bg-ink text-paper">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="w-9 h-9 grid place-items-center rounded-lg hover:bg-paper/10 transition shrink-0"
            >
              <Icon d={ICONS.back} className="w-5 h-5" />
            </button>
            <div>
              <div className="font-display font-semibold text-[16px]">Analitika</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-paper/50">admin panel</div>
            </div>
          </div>
          {data && (
            <span className="text-[12px] text-paper/50">
              {new Date().toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          )}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {loading && (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-line border-t-ink rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-[13px]">
            {error}
          </div>
        )}

        {data && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <StatCard
                label="Foydalanuvchilar"
                value={data.summary.total_users}
                sub="jami ro'yxatdan o'tgan"
              />
              <StatCard
                label="Kitoblar"
                value={data.summary.total_projects}
                sub="jami yaratilgan"
              />
              <StatCard
                label="Bugungi kirish"
                value={data.summary.logins_today}
                sub="login soni"
              />
              <StatCard
                label="Faol (7 kun)"
                value={data.summary.active_users_week}
                sub="so'nggi haftada kirgan"
              />
            </div>

            {/* Users section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h2 className="font-display text-xl font-semibold text-ink">
                  Foydalanuvchilar
                </h2>
                <input
                  type="text"
                  placeholder="Qidirish (ism yoki email)…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 px-3 rounded-xl border border-line bg-panel text-[13px] w-full sm:w-64 focus:outline-none focus:border-muted/40 transition"
                />
              </div>

              {filtered.length === 0 ? (
                <p className="text-[13px] text-muted py-8 text-center">
                  {search ? 'Topilmadi' : 'Foydalanuvchilar yo\'q'}
                </p>
              ) : (
                <div className="space-y-2">
                  {filtered.map((u) => (
                    <UserRow key={u.id} user={u} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
