import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

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
    {
      id: 'name',
      label: 'Họ và tên',
      type: 'text',
      placeholder: 'Nguyen Van A',
      autoComplete: 'name',
    },
    {
      id: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'ban@email.com',
      autoComplete: 'email',
    },
    {
      id: 'password',
      label: 'Mật khẩu',
      type: 'password',
      placeholder: 'Tối thiểu 8 ký tự',
      autoComplete: 'new-password',
    },
    {
      id: 'password_confirmation',
      label: 'Xác nhận mật khẩu',
      type: 'password',
      placeholder: 'Nhập lại mật khẩu',
      autoComplete: 'new-password',
    },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-container mb-4">
            <UserPlus className="w-7 h-7 text-on-primary-container" />
          </div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">Tạo tài khoản mới</h1>
          <p className="text-on-surface-variant text-sm mt-1">Đăng ký để đặt phòng tại Duly's House</p>
        </div>

        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-headline text-on-surface">Đăng ký</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {generalError && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-error">
                  {generalError}
                </div>
              )}

              {fields.map((field) => (
                <div key={field.id} className="space-y-1.5">
                  <label htmlFor={field.id} className="block text-sm font-medium text-on-surface">
                    {field.label}
                  </label>
                  <Input
                    id={field.id}
                    name={field.id}
                    type={field.type}
                    autoComplete={field.autoComplete}
                    placeholder={field.placeholder}
                    value={form[field.id]}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className={fieldErrors[field.id] ? 'border-error focus-visible:ring-error' : ''}
                  />
                  {fieldErrors[field.id] && (
                    <p className="text-xs text-error mt-1">{fieldErrors[field.id][0]}</p>
                  )}
                </div>
              ))}

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !form.name || !form.email || !form.password || !form.password_confirmation}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Đang xử lý...
                  </span>
                ) : (
                  'Đăng ký'
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-on-surface-variant">
              Đã có tài khoản?{' '}
              <Link
                to="/login"
                className="font-semibold text-primary hover:underline"
              >
                Đăng nhập
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
