import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import PasswordInput from '../../components/common/PasswordInput';

const ICON_MAP = {
  name: 'person',
  email: 'alternate_email',
  password: 'lock',
  password_confirmation: 'lock',
};

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setGeneralError('');
    setFieldErrors({});
    setLoading(true);

    try {
      await register(form);
      navigate('/', { replace: true });
    } catch (err) {
      if (err.errors) {
        setFieldErrors(err.errors);
      } else {
        setGeneralError(err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { id: 'name', label: 'Họ và tên', type: 'text', placeholder: 'Nguyen Van A', autoComplete: 'name' },
    { id: 'email', label: 'Email', type: 'email', placeholder: 'ban@dulyshouse.vn', autoComplete: 'email' },
    { id: 'password', label: 'Mật khẩu', type: 'password', placeholder: 'Tối thiểu 8 ký tự', autoComplete: 'new-password' },
    { id: 'password_confirmation', label: 'Xác nhận mật khẩu', type: 'password', placeholder: 'Nhập lại mật khẩu', autoComplete: 'new-password' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #fbd12d 0%, #ebc31a 30%, #d6ebf7 70%, #e0f4ff 100%)',
      }}
    >
      {/* Decorative blurred circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary-fixed/30 blur-3xl" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-surface-container/40 blur-3xl" />

      {/* Glassmorphism card */}
      <div className="relative w-full max-w-[480px] rounded-2xl shadow-2xl overflow-hidden border border-white/40"
        style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        <div className="p-8 md:p-12">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <img src="/logo.png" alt="Duly's House" className="h-14 w-14 object-contain" />
            </div>
            <h1 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-2">
              Tạo tài khoản
            </h1>
            <p className="text-on-surface-variant/80 text-sm">
              Đăng ký để đặt phòng tại Duly's House
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {generalError && (
              <div className="rounded-lg bg-red-50/80 border border-red-200 px-4 py-3 text-sm text-error">
                {generalError}
              </div>
            )}

            {fields.map((field) => {
              const isPassword = field.type === 'password';
              const InputComponent = isPassword ? PasswordInput : Input;
              const icon = ICON_MAP[field.id];
              return (
                <div key={field.id} className="space-y-2">
                  <label htmlFor={field.id} className="block text-sm font-semibold text-on-surface ml-1">
                    {field.label}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                      <span className="material-symbols-outlined text-outline-variant text-lg">{icon}</span>
                    </div>
                    <InputComponent
                      id={field.id}
                      name={field.id}
                      {...(!isPassword ? { type: field.type } : {})}
                      autoComplete={field.autoComplete}
                      placeholder={field.placeholder}
                      value={form[field.id]}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className={`pl-11 py-4 h-auto bg-surface-container-highest/50 border-0 focus-visible:ring-primary/20 ${fieldErrors[field.id] ? 'ring-2 ring-error' : ''}`}
                    />
                  </div>
                  {fieldErrors[field.id] && (
                    <p className="text-xs text-error ml-1">{fieldErrors[field.id][0]}</p>
                  )}
                </div>
              );
            })}

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full py-4 h-auto text-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] gap-2"
                disabled={loading || !form.name || !form.email || !form.password || !form.password_confirmation}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Đang xử lý...
                  </span>
                ) : (
                  <>
                    Đăng ký
                    <span className="material-symbols-outlined text-lg">person_add</span>
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-on-surface-variant text-sm">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-bold text-primary hover:underline ml-1">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
