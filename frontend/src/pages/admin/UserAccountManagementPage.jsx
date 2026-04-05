import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Copy,
  Pencil,
  Plus,
  Power,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react';
import {
  createAdminAccount,
  getAdminAccounts,
  updateAdminAccount,
  updateAdminAccountStatus,
} from '../../api/admin';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Quản trị' },
  { value: 'owner', label: 'Quản lý' },
  { value: 'staff', label: 'Lễ tân' },
];

const ROLE_FILTERS = [
  { value: 'all', label: 'Tất cả' },
  ...ROLE_OPTIONS,
];

const EMPTY_FORM = {
  full_name: '',
  email: '',
  phone: '',
  role: 'staff',
  is_active: true,
};

function buildAccountForm(account) {
  if (!account) {
    return { ...EMPTY_FORM };
  }

  return {
    full_name: account.full_name || '',
    email: account.email || '',
    phone: account.phone || '',
    role: account.role || 'staff',
    is_active: account.is_active ?? true,
  };
}

function roleBadgeClass(role) {
  switch (role) {
    case 'admin':
      return 'bg-amber-100 text-amber-900 border-amber-200';
    case 'owner':
      return 'bg-violet-100 text-violet-800 border-violet-200';
    default:
      return 'bg-sky-100 text-sky-800 border-sky-200';
  }
}

function statusBadgeClass(isActive) {
  return isActive
    ? 'bg-green-100 text-green-800 border-green-200'
    : 'bg-gray-100 text-gray-700 border-gray-200';
}

function AccountModal({ open, initialAccount, submitting, error, onClose, onSubmit }) {
  const [form, setForm] = useState(() => buildAccountForm(initialAccount));

  if (!open) return null;

  const isEditing = !!initialAccount;
  const isCurrentUser = !!initialAccount?.is_current_user;

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      ...form,
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-xl rounded-[28px] border border-border bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold font-headline text-on-surface">
              {isEditing ? 'Cập nhật tài khoản' : 'Thêm tài khoản mới'}
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant font-body">
              Tạo tài khoản cho nhân viên hoặc quản lý nội bộ.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border p-2 text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-body">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-on-surface font-body">
              Họ tên <span className="text-error">*</span>
            </label>
            <Input
              required
              value={form.full_name}
              onChange={(event) => setField('full_name', event.target.value)}
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-on-surface font-body">
                Email <span className="text-error">*</span>
              </label>
              <Input
                required
                type="email"
                value={form.email}
                onChange={(event) => setField('email', event.target.value)}
                placeholder="email@lahouse.vn"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-on-surface font-body">
                Số điện thoại
              </label>
              <Input
                value={form.phone}
                onChange={(event) => setField('phone', event.target.value)}
                placeholder="0912345678"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-on-surface font-body">
                Vai trò <span className="text-error">*</span>
              </label>
              <select
                value={form.role}
                onChange={(event) => setField('role', event.target.value)}
                disabled={isCurrentUser}
                className="flex h-10 w-full rounded-full border border-input bg-background px-4 py-2 text-sm font-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-3 self-end rounded-2xl border border-border bg-surface-container-low px-4 py-3 text-sm font-medium text-on-surface font-body">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) => setField('is_active', event.target.checked)}
                disabled={isCurrentUser}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <span>Tài khoản hoạt động</span>
            </label>
          </div>

          {isCurrentUser && (
            <p className="text-xs text-on-surface-variant font-body">
              Tài khoản đang đăng nhập không thể tự đổi vai trò hoặc tự khóa.
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Đang lưu...' : isEditing ? 'Cập nhật' : 'Thêm tài khoản'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TemporaryPasswordModal({ payload, onClose, onCopy }) {
  if (!payload) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-[28px] border border-border bg-white p-6 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-green-100 p-3 text-green-700">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold font-headline text-on-surface">Tạo tài khoản thành công</h2>
            <p className="mt-1 text-sm text-on-surface-variant font-body">
              Mật khẩu tạm thời chỉ hiển thị một lần. Hãy lưu lại và gửi cho nhân sự.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3 rounded-3xl border border-border bg-surface-container-low p-4">
          <div className="text-sm text-on-surface-variant font-body">
            {payload.account?.full_name} · {payload.account?.email}
          </div>
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-border bg-white px-4 py-3">
            <span className="font-mono text-lg font-semibold tracking-[0.2em] text-on-surface">
              {payload.temporary_password}
            </span>
            <Button type="button" variant="outline" size="sm" onClick={() => onCopy(payload.temporary_password)} className="gap-2">
              <Copy className="h-4 w-4" />
              Sao chép
            </Button>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="button" onClick={onClose}>
            Đã hiểu
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function UserAccountManagementPage() {
  const { showToast } = useToast();
  const [accounts, setAccounts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [refreshSeed, setRefreshSeed] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const [statusDialog, setStatusDialog] = useState({ open: false, account: null, nextActive: true });
  const [statusSubmitting, setStatusSubmitting] = useState(false);
  const [passwordPayload, setPasswordPayload] = useState(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const requestParams = useMemo(() => ({
    ...(searchQuery ? { search: searchQuery } : {}),
    ...(roleFilter !== 'all' ? { role: roleFilter } : {}),
  }), [roleFilter, searchQuery]);

  const fetchAccounts = useCallback(() => {
    setLoading(true);
    setError(null);

    getAdminAccounts(page, requestParams)
      .then((res) => {
        setAccounts(res.data || []);
        setMeta(res.meta || null);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Không thể tải danh sách tài khoản.');
      })
      .finally(() => setLoading(false));
  }, [page, requestParams]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts, refreshSeed]);

  function openCreateModal() {
    setEditingAccount(null);
    setFormError(null);
    setModalOpen(true);
  }

  function openEditModal(account) {
    setEditingAccount(account);
    setFormError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingAccount(null);
    setFormError(null);
  }

  function normalizeErrorMessage(err, fallback) {
    const fieldErrors = err?.response?.data?.errors;
    if (fieldErrors && typeof fieldErrors === 'object') {
      const firstField = Object.values(fieldErrors).find((messages) => Array.isArray(messages) && messages.length > 0);
      if (firstField) return firstField[0];
    }

    return err?.response?.data?.message || fallback;
  }

  async function handleSubmit(formData) {
    setFormSubmitting(true);
    setFormError(null);

    try {
      if (editingAccount) {
        await updateAdminAccount(editingAccount.id, formData);
        showToast('Cập nhật tài khoản thành công.', 'success');
      } else {
        const res = await createAdminAccount(formData);
        setPasswordPayload(res.data || null);
        showToast('Đã tạo tài khoản mới.', 'success');
      }

      closeModal();
      fetchAccounts();
    } catch (err) {
      setFormError(normalizeErrorMessage(err, 'Không thể lưu tài khoản. Vui lòng thử lại.'));
    } finally {
      setFormSubmitting(false);
    }
  }

  async function handleStatusChange() {
    const target = statusDialog.account;
    if (!target) return;

    setStatusSubmitting(true);

    try {
      await updateAdminAccountStatus(target.id, statusDialog.nextActive);
      showToast(
        statusDialog.nextActive ? 'Đã kích hoạt tài khoản.' : 'Đã vô hiệu hóa tài khoản.',
        'success'
      );
      setStatusDialog({ open: false, account: null, nextActive: true });
      fetchAccounts();
    } catch (err) {
      showToast(normalizeErrorMessage(err, 'Không thể cập nhật trạng thái tài khoản.'), 'error');
    } finally {
      setStatusSubmitting(false);
    }
  }

  async function copyTemporaryPassword(password) {
    try {
      await navigator.clipboard.writeText(password);
      showToast('Đã sao chép mật khẩu tạm.', 'success');
    } catch {
      showToast('Không thể sao chép mật khẩu tạm.', 'error');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline text-on-surface">Quản lý tài khoản</h1>
          <p className="mt-1 text-sm text-on-surface-variant font-body">
            Quản lý tài khoản người dùng nội bộ và phân quyền vận hành.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" variant="outline" onClick={() => setRefreshSeed((seed) => seed + 1)} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Button type="button" onClick={openCreateModal} className="gap-2">
            <Plus className="h-4 w-4" />
            Thêm tài khoản
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-1">
            <CardTitle className="font-headline text-on-surface">Danh sách tài khoản</CardTitle>
            <p className="text-sm text-on-surface-variant font-body">
              Tổng số: {meta?.total ?? accounts.length} tài khoản
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Tìm kiếm theo tên, email, SDT..."
                className="pl-11"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(event) => {
                setRoleFilter(event.target.value);
                setPage(1);
              }}
              className="flex h-10 w-full rounded-full border border-input bg-background px-4 py-2 text-sm font-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {ROLE_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
              <p className="text-sm text-error font-body">{error}</p>
              <Button type="button" variant="outline" onClick={fetchAccounts}>
                Thử lại
              </Button>
            </div>
          ) : accounts.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
              <div className="rounded-full bg-surface-container-low p-4 text-on-surface-variant">
                <UserRound className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-on-surface font-body">Không tìm thấy tài khoản phù hợp.</p>
                <p className="mt-1 text-sm text-on-surface-variant font-body">
                  Điều chỉnh từ khóa tìm kiếm hoặc bộ lọc vai trò để xem dữ liệu.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-container-low">
                    <th className="px-4 py-3 text-left font-semibold text-on-surface-variant font-body">Họ tên</th>
                    <th className="px-4 py-3 text-left font-semibold text-on-surface-variant font-body">Email</th>
                    <th className="px-4 py-3 text-left font-semibold text-on-surface-variant font-body">SĐT</th>
                    <th className="px-4 py-3 text-left font-semibold text-on-surface-variant font-body">Vai trò</th>
                    <th className="px-4 py-3 text-left font-semibold text-on-surface-variant font-body">Trạng thái</th>
                    <th className="px-4 py-3 text-left font-semibold text-on-surface-variant font-body">Ngày tạo</th>
                    <th className="px-4 py-3 text-center font-semibold text-on-surface-variant font-body">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account) => {
                    const nextActive = !account.is_active;

                    return (
                      <tr key={account.id} className="border-b border-border transition-colors hover:bg-surface-container-low">
                        <td className="px-4 py-4 font-medium text-on-surface font-body">
                          <div className="flex items-center gap-3">
                            <div className="rounded-full bg-surface-container px-2.5 py-2 text-on-surface-variant">
                              <UserRound className="h-4 w-4" />
                            </div>
                            <div>
                              <div>{account.full_name}</div>
                              {account.is_current_user && (
                                <div className="text-xs text-primary-dim font-medium">Tài khoản hiện tại</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-on-surface-variant font-body">{account.email}</td>
                        <td className="px-4 py-4 text-on-surface-variant font-body">{account.phone || '—'}</td>
                        <td className="px-4 py-4">
                          <Badge className={roleBadgeClass(account.role)}>
                            {account.role_label}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <Badge className={statusBadgeClass(account.is_active)}>
                            {account.status_label}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-on-surface-variant font-body">
                          {account.created_date_label || '—'}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button type="button" size="sm" variant="outline" className="gap-1" onClick={() => openEditModal(account)}>
                              <Pencil className="h-3.5 w-3.5" />
                              Sửa
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant={nextActive ? 'outline' : 'destructive'}
                              className="gap-1"
                              onClick={() => setStatusDialog({ open: true, account, nextActive })}
                              disabled={statusSubmitting}
                            >
                              <Power className="h-3.5 w-3.5" />
                              {nextActive ? 'Kích hoạt' : 'Vô hiệu hóa'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && meta && (
            <div className="border-t border-border p-4">
              <Pagination meta={meta} onPageChange={setPage} />
            </div>
          )}
        </CardContent>
      </Card>

      <AccountModal
        key={`${modalOpen ? 'open' : 'closed'}-${editingAccount?.id ?? 'new'}`}
        open={modalOpen}
        initialAccount={editingAccount}
        submitting={formSubmitting}
        error={formError}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />

      <TemporaryPasswordModal
        payload={passwordPayload}
        onClose={() => setPasswordPayload(null)}
        onCopy={copyTemporaryPassword}
      />

      <ConfirmDialog
        open={statusDialog.open}
        title={statusDialog.nextActive ? 'Kích hoạt tài khoản' : 'Vô hiệu hóa tài khoản'}
        message={
          statusDialog.nextActive
            ? `Kích hoạt lại tài khoản "${statusDialog.account?.full_name}" để có thể đăng nhập và sử dụng hệ thống?`
            : `Vô hiệu hóa tài khoản "${statusDialog.account?.full_name}"? Tài khoản sẽ không thể đăng nhập hoặc gọi API cho đến khi được kích hoạt lại.`
        }
        confirmLabel={statusSubmitting ? 'Đang xử lý...' : statusDialog.nextActive ? 'Kích hoạt' : 'Vô hiệu hóa'}
        destructive={!statusDialog.nextActive}
        onConfirm={handleStatusChange}
        onCancel={() => !statusSubmitting && setStatusDialog({ open: false, account: null, nextActive: true })}
      />
    </div>
  );
}
