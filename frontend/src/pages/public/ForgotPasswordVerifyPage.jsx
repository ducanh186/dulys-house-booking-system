import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { resendPasswordReset, verifyPasswordReset } from '../../api/auth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import PasswordInput from '../../components/common/PasswordInput';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { isElevatedRole } from '../../contexts/AuthContext';

const RESEND_SECONDS = 60;
const SUCCESS_MESSAGE =
  "A new verification code has been sent. Please check your inbox.";

export default function ForgotPasswordVerifyPage() {
  const { loading, user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const emailRef = useRef(null);
  const otpRef = useRef(null);
  const passwordRef = useRef(null);
  const passwordConfirmationRef = useRef(null);
  const firstErrorRef = useRef(null);

  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingResend, setLoadingResend] = useState(false);
  const [message, setMessage] = useState(location.state?.message || '');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(location.state?.email ? RESEND_SECONDS : 0);

  const canResend = secondsLeft === 0 && !!email;
  const redirectTo = useMemo(() => (isElevatedRole(user?.role) ? '/admin' : '/login'), [user?.role]);

  useEffect(() => {
    if (!secondsLeft) return undefined;
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  useEffect(() => {
    if (!firstErrorRef.current) return;
    window.requestAnimationFrame(() => {
      firstErrorRef.current?.focus?.();
      firstErrorRef.current = null;
    });
  }, [fieldErrors, error]);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (isAuthenticated && isElevatedRole(user?.role)) {
    return <Navigate to="/admin" replace />;
  }

  function setFocusForField(field) {
    const map = {
      email: emailRef,
      otp: otpRef,
      password: passwordRef,
      password_confirmation: passwordConfirmationRef,
    };
    firstErrorRef.current = map[field]?.current || null;
  }

  function buildLocalErrors() {
    const errors = {};
    const required = (value) => !String(value || '').trim();

    if (required(email)) errors.email = ['Email is required.'];
    if (required(otp)) errors.otp = ['Verification code is required.'];
    if (required(password)) errors.password = ['New password is required.'];
    if (required(passwordConfirmation)) {
      errors.password_confirmation = ['Confirm password is required.'];
    }

    if (!errors.password && !errors.password_confirmation && password !== passwordConfirmation) {
      errors.password = ['Mật khẩu mới và xác thực mật khẩu phải trùng khớp.'];
      errors.password_confirmation = ['Mật khẩu mới và xác thực mật khẩu phải trùng khớp.'];
    }

    return errors;
  }

  function focusFirstError(errors) {
    const priority = ['email', 'otp', 'password', 'password_confirmation'];
    for (const field of priority) {
      if (errors[field]) {
        setFocusForField(field);
        return;
      }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoadingSubmit(true);
    setError('');
    setMessage('');
    setFieldErrors({});

    const localErrors = buildLocalErrors();
    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      focusFirstError(localErrors);
      setLoadingSubmit(false);
      return;
    }

    try {
      const res = await verifyPasswordReset({
        email,
        otp,
        password,
        password_confirmation: passwordConfirmation,
      });

      navigate('/login', {
        replace: true,
        state: { message: res?.message || 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.' },
      });
    } catch (err) {
      if (err?.errors) {
        setFieldErrors(err.errors);
        focusFirstError(err.errors);
      } else {
        setError(err?.message || 'Mã xác minh không hợp lệ hoặc đã hết hạn.');
      }
    } finally {
      setLoadingSubmit(false);
    }
  }

  async function handleResend() {
    if (!canResend) return;
    setLoadingResend(true);
    setError('');
    setMessage('');
    setFieldErrors({});

    try {
      const res = await resendPasswordReset(email);
      setMessage(res?.message || SUCCESS_MESSAGE);
      setSecondsLeft(RESEND_SECONDS);
    } catch (err) {
      if (err?.errors) {
        setFieldErrors(err.errors);
        focusFirstError(err.errors);
      } else {
        setError(err?.message || 'Không thể gửi lại mã xác minh.');
      }
    } finally {
      setLoadingResend(false);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(91,192,235,0.2),_transparent_32%),linear-gradient(135deg,_#fffdf6_0%,_#edf7ff_100%)] px-4 py-10">
      <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-cyan-200/30 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-amber-200/30 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center justify-center">
        <div className="w-full space-y-6">
          <div className="flex justify-center">
            <img src="/logo.png" alt="Duly's House" className="h-12 w-auto" />
          </div>

          <div className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.12)] backdrop-blur-2xl sm:p-8">
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-on-surface transition-colors mb-4"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Quay lại bước 1
            </Link>

            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary/70">Xác minh OTP</p>
              <h1 className="mt-3 font-headline text-3xl font-bold text-on-surface">Nhập mã 6 chữ số</h1>
              <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                Mã xác minh được gửi đến email của bạn và có hiệu lực trong 5 phút.
              </p>
            </div>

            {message && <Notice tone="success" text={message} />}
            {error && <Notice tone="error" text={error} />}

            <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-5">
              <div className="space-y-2">
                <label htmlFor="reset-email" className="text-sm font-semibold text-on-surface">
                  Email *
                </label>
                <Input
                  ref={emailRef}
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) {
                      setFieldErrors((prev) => ({ ...prev, email: undefined }));
                    }
                  }}
                  disabled={loadingSubmit || loadingResend}
                  className={fieldErrors.email ? 'ring-2 ring-red-400' : ''}
                />
                {fieldErrors.email?.[0] && <p className="text-xs text-red-500">{fieldErrors.email[0]}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="otp" className="text-sm font-semibold text-on-surface">
                  Mã xác minh *
                </label>
                <Input
                  ref={otpRef}
                  id="otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\s+/g, '').slice(0, 6));
                    if (fieldErrors.otp) {
                      setFieldErrors((prev) => ({ ...prev, otp: undefined }));
                    }
                  }}
                  disabled={loadingSubmit || loadingResend}
                  className={fieldErrors.otp ? 'ring-2 ring-red-400' : ''}
                />
                {fieldErrors.otp?.[0] && <p className="text-xs text-red-500">{fieldErrors.otp[0]}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="new-password" className="text-sm font-semibold text-on-surface">
                  Mật khẩu mới *
                </label>
                <PasswordInput
                  ref={passwordRef}
                  id="new-password"
                  placeholder="Tối thiểu 8 ký tự"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors((prev) => ({ ...prev, password: undefined }));
                    }
                  }}
                  disabled={loadingSubmit || loadingResend}
                  className={fieldErrors.password ? 'ring-2 ring-red-400' : ''}
                />
                {fieldErrors.password?.[0] && <p className="text-xs text-red-500">{fieldErrors.password[0]}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirm-password" className="text-sm font-semibold text-on-surface">
                  Xác nhận mật khẩu mới *
                </label>
                <PasswordInput
                  ref={passwordConfirmationRef}
                  id="confirm-password"
                  placeholder="Nhập lại mật khẩu mới"
                  value={passwordConfirmation}
                  onChange={(e) => {
                    setPasswordConfirmation(e.target.value);
                    if (fieldErrors.password_confirmation) {
                      setFieldErrors((prev) => ({ ...prev, password_confirmation: undefined }));
                    }
                  }}
                  disabled={loadingSubmit || loadingResend}
                  className={fieldErrors.password_confirmation ? 'ring-2 ring-red-400' : ''}
                />
                {fieldErrors.password_confirmation?.[0] && (
                  <p className="text-xs text-red-500">{fieldErrors.password_confirmation[0]}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full py-4 text-base"
                disabled={loadingSubmit || loadingResend}
              >
                {loadingSubmit ? 'Đang xác minh...' : 'Đổi mật khẩu'}
              </Button>

              <div className="text-center">
                {loadingResend ? (
                  <span className="text-sm text-on-surface-variant">Đang gửi lại...</span>
                ) : secondsLeft > 0 ? (
                  <span className="text-sm text-on-surface-variant">Gửi lại mã sau {secondsLeft}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={!canResend}
                    className="text-sm font-semibold text-primary hover:underline disabled:opacity-50"
                  >
                    Gửi lại mã xác minh
                  </button>
                )}
              </div>

              <p className="text-center text-sm text-on-surface-variant">
                <Link to={redirectTo} className="font-semibold text-primary hover:underline">
                  Quay lại đăng nhập
                </Link>
              </p>
            </form>
          </div>

          <div className="flex items-center justify-center gap-3">
            <StepDot active label="1" />
            <div className="h-px w-8 bg-primary/30" />
            <StepDot active={false} label="2" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StepDot({ active, label }) {
  return (
    <div
      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
        active ? 'sunlight-gradient text-white' : 'border border-border bg-white/70 text-on-surface-variant'
      }`}
    >
      {label}
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
