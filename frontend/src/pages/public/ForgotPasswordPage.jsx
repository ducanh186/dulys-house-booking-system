import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { requestPasswordReset } from '../../api/auth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    setFieldErrors({});

    try {
      const res = await requestPasswordReset(email);
      setMessage(res?.message || 'Nếu email hợp lệ, bạn sẽ nhận được mã OTP trong ít phút.');
      navigate('/forgot-password/verify', {
        replace: true,
        state: { email, message: res?.message },
      });
    } catch (err) {
      if (err?.errors) {
        setFieldErrors(err.errors);
      } else {
        setError(err?.message || 'Không thể gửi mã OTP. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(91,192,235,0.2),_transparent_32%),linear-gradient(135deg,_#fffdf6_0%,_#edf7ff_100%)] px-4 py-10">
      <div className="absolute -top-24 left-0 h-80 w-80 rounded-full bg-amber-200/30 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-sky-200/30 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center justify-center">
        <div className="w-full space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
            <img src="/logo.png" alt="Duly's House" className="h-12 w-auto" />
          </div>

          {/* Card */}
          <div className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.12)] backdrop-blur-2xl sm:p-8">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary/70">Quên mật khẩu</p>
              <h1 className="mt-3 font-headline text-3xl font-bold text-on-surface">Nhận mã OTP qua email</h1>
              <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                Nhập email để nhận mã khôi phục 6 chữ số.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {message && <Notice tone="success" text={message} />}
              {error && <Notice tone="error" text={error} />}

              <div className="space-y-2">
                <label htmlFor="reset-email" className="text-sm font-semibold text-on-surface">
                  Email
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-outline-variant">
                    <span className="material-symbols-outlined text-lg">mail</span>
                  </span>
                  <Input
                    id="reset-email"
                    type="email"
                    autoComplete="email"
                    placeholder="ban@dulyshouse.vn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className={`pl-11 py-3.5 h-auto ${fieldErrors.email ? 'ring-2 ring-red-400' : ''}`}
                  />
                </div>
                {fieldErrors.email?.[0] && <p className="text-xs text-red-500">{fieldErrors.email[0]}</p>}
              </div>

              <Button type="submit" className="w-full py-4 text-base" disabled={loading || !email}>
                {loading ? 'Đang gửi OTP...' : 'Gửi mã OTP'}
              </Button>

              <p className="text-center text-sm text-on-surface-variant">
                Quay lại{' '}
                <Link to="/login" className="font-semibold text-primary hover:underline">
                  đăng nhập
                </Link>
              </p>
            </form>
          </div>

          {/* Security hints */}
          <div className="grid grid-cols-3 gap-3">
            <SecurityHint icon="shield" text="OTP hạn dùng 10 phút" />
            <SecurityHint icon="visibility_off" text="Không lộ email" />
            <SecurityHint icon="bolt" text="Đổi xong đăng nhập ngay" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SecurityHint({ icon, text }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/50 bg-white/70 px-3 py-3 text-center backdrop-blur-sm">
      <span className="material-symbols-outlined text-lg text-primary/70">{icon}</span>
      <p className="text-[11px] leading-tight text-on-surface-variant">{text}</p>
    </div>
  );
}

function Notice({ tone, text }) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm ${
        tone === 'success'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-red-200 bg-red-50 text-red-700'
      }`}
    >
      {text}
    </div>
  );
}
