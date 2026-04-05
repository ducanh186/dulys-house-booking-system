import { useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import PasswordInput from '../../components/common/PasswordInput';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getPostLoginRedirectTarget } from '../../contexts/AuthContext';

const TEST_ACCOUNTS = [
  { label: 'Admin', email: 'admin@dulyshouse.vn', color: 'bg-red-100 text-red-700 hover:bg-red-200' },
  { label: 'Owner', email: 'owner@dulyshouse.vn', color: 'bg-amber-100 text-amber-800 hover:bg-amber-200' },
  { label: 'Staff', email: 'staff@dulyshouse.vn', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
  { label: 'Guest', email: 'guest@dulyshouse.vn', color: 'bg-green-100 text-green-700 hover:bg-green-200' },
];

export default function LoginPage() {
  return <AuthLoginScreen variant="modern" />;
}

export function AuthLoginScreen({ variant = 'modern' }) {
  const { login, isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const from = useMemo(() => location.state?.from || null, [location.state]);
  const postLoginTarget = useMemo(
    () => getPostLoginRedirectTarget(user, from),
    [user, from]
  );

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to={postLoginTarget} replace />;
  }

  async function handleLogin(nextEmail, nextPassword) {
    setGeneralError('');
    setFieldErrors({});
    setSubmitting(true);

    try {
      const me = await login(nextEmail, nextPassword);
      navigate(getPostLoginRedirectTarget(me, from), { replace: true });
    } catch (err) {
      if (err?.errors) {
        setFieldErrors(err.errors);
      } else {
        setGeneralError(err?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await handleLogin(email, password);
  }

  async function quickLogin(testEmail) {
    await handleLogin(testEmail, 'password');
  }

  const message = location.state?.message;

  return variant === 'video' ? (
    <VideoLoginShell
      email={email}
      password={password}
      setEmail={setEmail}
      setPassword={setPassword}
      submitting={submitting}
      generalError={generalError}
      fieldErrors={fieldErrors}
      message={message}
      onSubmit={handleSubmit}
      onQuickLogin={quickLogin}
    />
  ) : (
    <ModernLoginShell
      email={email}
      password={password}
      setEmail={setEmail}
      setPassword={setPassword}
      submitting={submitting}
      generalError={generalError}
      fieldErrors={fieldErrors}
      message={message}
      onSubmit={handleSubmit}
      onQuickLogin={quickLogin}
    />
  );
}

function ModernLoginShell({
  email,
  password,
  setEmail,
  setPassword,
  submitting,
  generalError,
  fieldErrors,
  message,
  onSubmit,
  onQuickLogin,
}) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(251,209,45,0.45),_transparent_34%),linear-gradient(135deg,_#fffaf0_0%,_#f7f2d4_34%,_#e8f4ff_68%,_#eff8ff_100%)]">
      <div className="absolute inset-0 opacity-60">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute top-1/4 -right-20 h-80 w-80 rounded-full bg-sky-200/35 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-teal-200/20 blur-3xl" />
      </div>
      <div className="relative mx-auto flex min-h-screen w-full max-w-md items-center justify-center px-4 py-10">
          <AuthCard
            eyebrow="Đăng nhập"
            title="Chào mừng trở lại"
            email={email}
            password={password}
            setEmail={setEmail}
            setPassword={setPassword}
            submitting={submitting}
            generalError={generalError}
            fieldErrors={fieldErrors}
            message={message}
            onSubmit={onSubmit}
            onQuickLogin={onQuickLogin}
          />
      </div>
    </div>
  );
}

function VideoLoginShell(props) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060a13] text-white">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(251,209,45,0.18),transparent_28%),radial-gradient(circle_at_80%_30%,rgba(91,192,235,0.16),transparent_24%),linear-gradient(135deg,rgba(7,10,19,0.98),rgba(17,24,39,0.94))]" />
        <div className="absolute inset-0 opacity-40 bg-[linear-gradient(120deg,rgba(255,255,255,0.05)_0%,transparent_20%,transparent_80%,rgba(255,255,255,0.04)_100%)]" />
        <div className="absolute -top-28 left-10 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl animate-pulse" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl animate-pulse" />
      </div>
      <div className="relative mx-auto grid min-h-screen w-full max-w-7xl items-center gap-8 px-4 py-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden lg:block">
          <div className="max-w-xl rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
            <div className="mb-8 flex items-center gap-4">
              <div className="rounded-2xl bg-white/10 p-3">
                <img src="/logo.png" alt="Duly's House" className="h-12 w-12" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.32em] text-white/50">Video Background</p>
                <h1 className="mt-1 font-headline text-4xl font-bold">Duly's House</h1>
              </div>
            </div>
            <p className="max-w-lg text-base leading-7 text-white/72">
              Một màn đăng nhập có nhịp thị giác đậm hơn, phù hợp cho Stitch V4, nhưng vẫn giữ
              nguyên dữ liệu và luồng auth hiện có.
            </p>
            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              <FeatureChip title="An toàn" text="Token-based" />
              <FeatureChip title="Nhanh" text="1 bước đăng nhập" />
              <FeatureChip title="Rõ ràng" text="Tách guest/admin" />
            </div>
          </div>
        </div>

        <AuthCard
          eyebrow="Đăng nhập"
          title="Video Background"
          subtitle="Phiên bản giàu tương phản, tối hơn, dùng cùng form logic."
          {...props}
          accentClassName="border-white/10 bg-white/10 text-white backdrop-blur-2xl shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
          labelClassName="text-white/80"
          inputClassName="border-white/10 bg-white/8 text-white placeholder:text-white/35"
          helperClassName="text-white/60"
          cardClassName="bg-white/[0.06] border-white/10"
          noteClassName="bg-white/5 border-white/10 text-white/75"
          buttonClassName="shadow-[0_16px_35px_rgba(251,209,45,0.18)]"
          linkClassName="text-amber-300"
          iconClassName="text-white/70"
        />
      </div>
    </div>
  );
}

function AuthCard({
  eyebrow,
  title,
  subtitle,
  email,
  password,
  setEmail,
  setPassword,
  submitting,
  generalError,
  fieldErrors,
  message,
  onSubmit,
  onQuickLogin,
  accentClassName = 'border-white/60 bg-white/80 text-on-surface',
  labelClassName = 'text-on-surface',
  inputClassName = 'bg-surface-container-highest/50 border-0',
  helperClassName = 'text-on-surface-variant',
  cardClassName = 'border-white/40 bg-white/70 backdrop-blur-2xl',
  noteClassName = 'bg-primary-container/60 border-primary/10 text-on-primary-container',
  buttonClassName = '',
  linkClassName = 'text-primary',
  iconClassName = 'text-outline-variant',
}) {
  return (
    <div className={`relative w-full overflow-hidden rounded-[2rem] border shadow-[0_24px_80px_rgba(15,23,42,0.16)] ${cardClassName}`}>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.15),transparent_20%)]" />
      <div className="relative p-6 sm:p-8 lg:p-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/70">{eyebrow}</p>
            <h1 className="mt-2 font-headline text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
            <p className={`mt-3 max-w-md text-sm leading-6 ${helperClassName}`}>{subtitle}</p>
          </div>
          <div className={`hidden h-16 w-16 rounded-2xl border p-3 lg:block ${accentClassName}`}>
            <img src="/logo.png" alt="Duly's House" className="h-full w-full object-contain" />
          </div>
        </div>

        <form onSubmit={onSubmit} noValidate className="space-y-5">
          {message && (
            <div className={`rounded-2xl border px-4 py-3 text-sm ${noteClassName}`}>
              {message}
            </div>
          )}
          {generalError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {generalError}
            </div>
          )}

          <Field
            id="email"
            label="Email hoặc tên đăng nhập *"
            icon="alternate_email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            placeholder="ban@dulyshouse.vn"
            error={fieldErrors.email?.[0]}
            disabled={submitting}
            labelClassName={labelClassName}
            inputClassName={inputClassName}
            iconClassName={iconClassName}
          />

          <div className="space-y-2">
            <label htmlFor="password" className={`text-sm font-semibold ${labelClassName}`}>
              Mật khẩu *
            </label>
            <div className="relative">
              <span className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-outline-variant ${helperClassName}`}>
                <span className="material-symbols-outlined text-lg">lock</span>
              </span>
              <PasswordInput
                id="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={submitting}
                className={`pl-11 ${inputClassName} ${fieldErrors.password ? 'ring-2 ring-red-400' : ''}`}
              />
            </div>
            {fieldErrors.password?.[0] && (
              <p className="text-xs text-red-500">{fieldErrors.password[0]}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className={`text-sm font-semibold hover:underline ${linkClassName}`}>
              Quên mật khẩu?
            </Link>
          </div>

          <Button
            type="submit"
            className={`w-full py-4 text-base ${buttonClassName}`}
            disabled={submitting || !email || !password}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Đang xử lý...
              </span>
            ) : (
              <>
                Đăng nhập
                <span className="material-symbols-outlined text-lg">login</span>
              </>
            )}
          </Button>

          <div className="relative py-2">
            <div className="absolute inset-x-0 top-1/2 h-px bg-border/50" />
            <div className="relative mx-auto w-fit rounded-full bg-white/70 px-3 text-xs font-medium text-on-surface-variant">
              Đăng nhập nhanh (test)
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TEST_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => onQuickLogin(acc.email)}
                disabled={submitting}
                className={`rounded-full px-3 py-2 text-xs font-semibold transition-all disabled:opacity-50 ${acc.color}`}
              >
                {acc.label}
              </button>
            ))}
          </div>
        </form>

        <p className={`mt-8 text-center text-sm ${helperClassName}`}>
          Chưa có tài khoản?{' '}
          <Link to="/register" className={`font-semibold hover:underline ${linkClassName}`}>
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}

function FeatureChip({ title, text }) {
  return (
    <div className="rounded-2xl border border-white/50 bg-white/65 px-4 py-3 shadow-sm">
      <p className="text-sm font-semibold text-on-surface">{title}</p>
      <p className="mt-1 text-xs text-on-surface-variant">{text}</p>
    </div>
  );
}

function Field({
  id,
  label,
  icon,
  error,
  labelClassName,
  inputClassName,
  iconClassName = 'text-outline-variant',
  ...inputProps
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className={`text-sm font-semibold ${labelClassName}`}>
        {label}
      </label>
      <div className="relative">
        <span className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 ${iconClassName}`}>
          <span className="material-symbols-outlined text-lg">{icon}</span>
        </span>
        <Input
          id={id}
          {...inputProps}
          className={`pl-11 py-3.5 h-auto ${inputClassName} ${error ? 'ring-2 ring-red-400' : ''}`}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
