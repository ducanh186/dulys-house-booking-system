import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, RotateCcw } from 'lucide-react';
import {
  getAdminHomestays,
  createHomestay,
  updateHomestay,
  deleteHomestay,
  restoreHomestay,
} from '../../api/admin';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const EMPTY_FORM = {
  name: '',
  address: '',
  description: '',
  hotline: '',
  email: '',
  thumbnail: '',
  is_active: true,
};

function HomestayForm({ initial, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(initial ? {
    name: initial.name || '',
    address: initial.address || '',
    description: initial.description || '',
    hotline: initial.hotline || '',
    email: initial.email || '',
    thumbnail: initial.thumbnail || '',
    is_active: initial.is_active ?? true,
  } : EMPTY_FORM);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-on-surface font-body">
            Tên cơ sở <span className="text-error">*</span>
          </label>
          <Input
            required
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Nhập tên cơ sở..."
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-on-surface font-body">Số điện thoại</label>
          <Input
            value={form.hotline}
            onChange={(e) => set('hotline', e.target.value)}
            placeholder="0xxx xxx xxx"
          />
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium text-on-surface font-body">
            Địa chỉ <span className="text-error">*</span>
          </label>
          <Input
            required
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
            placeholder="Nhập địa chỉ..."
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-on-surface font-body">Email</label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="email@example.com"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-on-surface font-body">Trạng thái</label>
          <select
            value={form.is_active ? 'active' : 'inactive'}
            onChange={(e) => set('is_active', e.target.value === 'active')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-body"
          >
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium text-on-surface font-body">URL hình ảnh</label>
          <Input
            value={form.thumbnail}
            onChange={(e) => set('thumbnail', e.target.value)}
            placeholder="https://..."
          />
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium text-on-surface font-body">Mô tả</label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={3}
            placeholder="Mô tả về cơ sở..."
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-body"
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Huỷ bỏ
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Đang lưu...' : initial ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      </div>
    </form>
  );
}

function isSuspended(item) {
  return !!item?.is_suspended || !!item?.deleted_at;
}

function statusLabel(item) {
  if (isSuspended(item)) return 'Đình chỉ';
  return item?.is_active ? 'Hoạt động' : 'Ngừng hoạt động';
}

function statusClass(item) {
  if (isSuspended(item)) return 'bg-amber-100 text-amber-800 border-amber-200';
  return item?.is_active
    ? 'bg-green-100 text-green-800 border-green-200'
    : 'bg-gray-100 text-gray-700 border-gray-200';
}

export default function HomestayManagementPage() {
  const [homestays, setHomestays] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = ['admin', 'owner'].includes(user?.role);

  const fetchHomestays = useCallback(() => {
    setLoading(true);
    setError(null);
    getAdminHomestays(page, { include_suspended: 1 })
      .then((res) => {
        setHomestays(res.data || []);
        setMeta(res.meta || null);
      })
      .catch(() => setError('Không thể tải danh sách cơ sở.'))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    fetchHomestays();
  }, [fetchHomestays]);

  function openCreate() {
    setEditingItem(null);
    setFormError(null);
    setShowForm(true);
  }

  function openEdit(item) {
    setEditingItem(item);
    setFormError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingItem(null);
    setFormError(null);
  }

  async function handleSubmit(data) {
    setSubmitting(true);
    setFormError(null);
    try {
      if (editingItem) {
        await updateHomestay(editingItem.id, data);
      } else {
        await createHomestay(data);
      }
      closeForm();
      fetchHomestays();
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      await deleteHomestay(deleteDialog.item.id);
      setDeleteDialog({ open: false, item: null });
      fetchHomestays();
    } catch {
      showToast('Không thể đình chỉ cơ sở này.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleRestore(id) {
    try {
      await restoreHomestay(id);
      fetchHomestays();
    } catch {
      showToast('Không thể khôi phục cơ sở này.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline text-on-surface">Quản lý cơ sở</h1>
          <p className="text-sm text-on-surface-variant mt-1 font-body">
            Thêm, sửa, đình chỉ thông tin các cơ sở lưu trú.
          </p>
        </div>
        {!showForm && isAdmin && (
          <Button onClick={openCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            Thêm cơ sở
          </Button>
        )}
      </div>

      {/* Inline Form */}
      {showForm && (
        <Card>
          <CardHeader className="pb-4 flex flex-row items-center justify-between">
            <CardTitle className="font-headline text-on-surface">
              {editingItem ? 'Cập nhật cơ sở' : 'Thêm cơ sở mới'}
            </CardTitle>
            <button
              onClick={closeForm}
              className="text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </CardHeader>
          <CardContent>
            {formError && (
              <p className="text-sm text-error mb-4 font-body">{formError}</p>
            )}
            <HomestayForm
              initial={editingItem}
              onSubmit={handleSubmit}
              onCancel={closeForm}
              submitting={submitting}
            />
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-on-surface">Danh sách cơ sở</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <p className="text-sm text-error p-6 font-body">{error}</p>
          ) : homestays.length === 0 ? (
            <p className="text-sm text-on-surface-variant text-center py-10 font-body">
              Chưa có cơ sở nào. Nhấn "Thêm cơ sở" để bắt đầu.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-container-low">
                    <th className="text-left px-4 py-3 font-semibold text-on-surface-variant font-body">
                      Tên cơ sở
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-on-surface-variant font-body">
                      Địa chỉ
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-on-surface-variant font-body">
                      Số điện thoại
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-on-surface-variant font-body">
                      Trạng thái
                    </th>
                    {isAdmin && (
                      <th className="text-center px-4 py-3 font-semibold text-on-surface-variant font-body">
                        Hành động
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {homestays.map((h) => (
                    <tr
                      key={h.id}
                      className="border-b border-border hover:bg-surface-container transition-colors"
                    >
                      <td className="px-4 py-4 font-medium text-on-surface font-body">{h.name}</td>
                      <td className="px-4 py-4 text-on-surface-variant font-body max-w-xs truncate">
                        {h.address}
                      </td>
                      <td className="px-4 py-4 text-on-surface-variant font-body">
                      {h.hotline || '—'}
                      </td>
                      <td className="px-4 py-4">
                        <Badge className={statusClass(h)}>{statusLabel(h)}</Badge>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEdit(h)}
                              className="gap-1"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              Sửa
                            </Button>
                            {isSuspended(h) ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRestore(h.id)}
                                className="gap-1"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Khôi phục
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setDeleteDialog({ open: true, item: h })}
                                className="gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Đình chỉ
                              </Button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!loading && !error && meta && (
            <div className="p-4 border-t border-border">
              <Pagination meta={meta} onPageChange={setPage} />
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialog.open}
        title="Đình chỉ cơ sở"
        message={`Bạn có chắc chắn muốn đình chỉ cơ sở "${deleteDialog.item?.name}"? Bạn có thể khôi phục lại sau.`}
        confirmLabel={deleteLoading ? 'Đang đình chỉ...' : 'Đình chỉ'}
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ open: false, item: null })}
      />
    </div>
  );
}
