import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Icon, ICONS } from '../ui/Icon';

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const isRegister = mode === 'register';

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const res = isRegister ? await register(name, email, password) : await login(email, password);
    if (res.ok) navigate('/');
    else setError(res.error ?? 'Xatolik yuz berdi.');
  };

  const field =
    'w-full h-11 pl-10 pr-3 rounded-xl bg-paper border border-line text-[15px] focus:border-accent/60 focus:ring-2 focus:ring-accentsoft/40 outline-none transition';

  return (
    <div className="min-h-screen grain flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        {/* brand */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="h-10 w-10 rounded-xl bg-ink text-paper grid place-items-center font-display font-semibold text-xl leading-none">
            M
          </div>
          <div className="leading-tight">
            <div className="font-display font-semibold text-xl">Muslihun</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted">yozuvchi muhiti</div>
          </div>
        </div>

        <div className="bg-panel rounded-2xl border border-line shadow-sm p-6 sm:p-7">
          <h1 className="font-display text-2xl font-semibold mb-1">
            {isRegister ? 'Ro`yxatdan o`tish' : 'Xush kelibsiz'}
          </h1>
          <p className="text-[13px] text-muted mb-6">
            {isRegister ? 'Kitoblaringizni yozishni boshlang.' : 'Davom etish uchun kiring.'}
          </p>

          <form onSubmit={submit} className="space-y-3">
            {isRegister && (
              <label className="block relative">
                <Icon d={ICONS.user} className="w-4 h-4 absolute left-3 top-3.5 text-muted" />
                <input
                  className={field}
                  placeholder="Ism"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
            )}
            <label className="block relative">
              <Icon d={ICONS.mail} className="w-4 h-4 absolute left-3 top-3.5 text-muted" />
              <input
                type="email"
                className={field}
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="block relative">
              <Icon d={ICONS.lock} className="w-4 h-4 absolute left-3 top-3.5 text-muted" />
              <input
                type="password"
                className={field}
                placeholder="Parol"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            {error && (
              <div className="text-[12px] text-accent bg-accentsoft/30 border border-accentsoft rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-ink text-paper font-medium text-[15px] hover:bg-ink/90 transition"
            >
              {isRegister ? 'Ro`yxatdan o`tish' : 'Kirish'}
            </button>
          </form>

          <div className="text-center text-[13px] text-muted mt-5">
            {isRegister ? (
              <>
                Hisobingiz bormi?{' '}
                <Link to="/login" className="text-accent font-medium hover:underline">
                  Kirish
                </Link>
              </>
            ) : (
              <>
                Hisobingiz yo`qmi?{' '}
                <Link to="/register" className="text-accent font-medium hover:underline">
                  Ro`yxatdan o`tish
                </Link>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
