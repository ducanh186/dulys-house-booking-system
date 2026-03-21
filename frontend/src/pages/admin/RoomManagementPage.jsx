import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import {
  getRoomTypes,
  createRoomType,
  updateRoomType,
  deleteRoomType,
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  updateRoomStatus,
  getAdminHomestays,
} from '../../api/admin';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import PriceDisplay from '../../components/common/PriceDisplay';
import ConfirmDialog from '../../components/common/ConfirmDialog';

// ─── Room Status config ────────────────────────────────────────────────────────
const ROOM_STATUS_OPTIONS = [
  { value: 'available', label: 'Sẵn sàng' },
  { value: 'occupied', label: 'Đang sử dụng' },
  { value: 'maintenance', label: 'Bảo trì' },
];

const CLEANLINESS_OPTIONS = [
  { value: 'clean', label: 'Sạch' },
  { value: 'dirty', label: 'Cần dọn dẹp' },
  { value: 'cleaning', label: 'Đang dọn' },
];

function roomStatusClass(status) {
  const map = {
    available: 'bg-green-100 text-green-800 border-green-200',
    occupied: 'bg-blue-100 text-blue-800 border-blue-200',
    maintenance: 'bg-orange-100 text-orange-800 border-orange-200',
  };
  return map[status] || 'bg-gray-100 text-gray-700 border-gray-200';
}

function roomStatusLabel(status) {
  return ROOM_STATUS_OPTIONS.find((o) => o.value === status)?.label || status;
}

function cleanlinessLabel(val) {
  return CLEANLINESS_OPTIONS.find((o) => o.value === val)?.label || val;
}

// ─── RoomType Form ─────────────────────────────────────────────────────────────
const EMPTY_ROOM_TYPE_FORM = {
  homestay_id: '',
  name: '',
  description: '',
  max_guests: '',
  nightly_rate: '',
  hourly_rate: '',
};

function RoomTypeForm({ initial, homestays, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(
    initial
      ? {
          homestay_id: initial.homestay_id || '',
          name: initial.name || '',
          description: initial.description || '',
          max_guests: initial.max_guests || '',
          nightly_rate: initial.nightly_rate || '',
          hourly_rate: initial.hourly_rate || '',
        }
      : EMPTY_ROOM_TYPE_FORM
  );

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      ...form,
      max_guests: parseInt(form.max_guests, 10) || 0,
      nightly_rate: parseFloat(form.nightly_rate) || 0,
      hourly_rate: form.hourly_rate ? parseFloat(form.hourly_rate) : undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-on-surface font-body">
            Cơ sở <span className="text-error">*</span>
          </label>
          <select
            required
            value={form.homestay_id}
            onChange={(e) => set('homestay_id', e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-body"
          >
            <option value="">-- Chọn cơ sở --</option>
            {homestays.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-on-surface font-body">
            Tên loại phòng <span className="text-error">*</span>
          </label>
          <Input
            required
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Phòng Standard, Deluxe..."
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-on-surface font-body">
            Sức chứa (người) <span className="text-error">*</span>
          </label>
          <Input
            required
            type="number"
            min={1}
            value={form.max_guests}
            onChange={(e) => set('max_guests', e.target.value)}
            placeholder="2"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-on-surface font-body">
            Giá theo đêm (VND) <span className="text-error">*</span>
          </label>
          <Input
            required
            type="number"
            min={0}
            value={form.nightly_rate}
            onChange={(e) => set('nightly_rate', e.target.value)}
            placeholder="500000"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-on-surface font-body">
            Giá theo giờ (VND)
          </label>
          <Input
            type="number"
            min={0}
            value={form.hourly_rate}
            onChange={(e) => set('hourly_rate', e.target.value)}
            placeholder="100000"
          />
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium text-on-surface font-body">Mô tả</label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={2}
            placeholder="Mô tả loại phòng..."
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

// ─── Room Form ─────────────────────────────────────────────────────────────────
const EMPTY_ROOM_FORM = {
  room_type_id: '',
  room_code: '',
  status: 'available',
  cleanliness: 'clean',
  notes: '',
};

function RoomForm({ initial, roomTypes, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(
    initial
      ? {
          room_type_id: initial.room_type_id || '',
          room_code: initial.room_code || '',
          status: initial.status || 'available',
          cleanliness: initial.cleanliness || 'clean',
          notes: initial.notes || '',
        }
      : EMPTY_ROOM_FORM
  );

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
            Loại phòng <span className="text-error">*</span>
          </label>
          <select
            required
            value={form.room_type_id}
            onChange={(e) => set('room_type_id', e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-body"
          >
            <option value="">-- Chọn loại phòng --</option>
            {roomTypes.map((rt) => (
              <option key={rt.id} value={rt.id}>
                {rt.name} ({rt.homestay?.name})
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-on-surface font-body">
            Mã phòng <span className="text-error">*</span>
          </label>
          <Input
            required
            value={form.room_code}
            onChange={(e) => set('room_code', e.target.value)}
            placeholder="P101, A201..."
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-on-surface font-body">Trạng thái</label>
          <select
            value={form.status}
            onChange={(e) => set('status', e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-body"
          >
            {ROOM_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-on-surface font-body">Vệ sinh</label>
          <select
            value={form.cleanliness}
            onChange={(e) => set('cleanliness', e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-body"
          >
            {CLEANLINESS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium text-on-surface font-body">Ghi chú</label>
          <textarea
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            rows={2}
            placeholder="Ghi chú về phòng..."
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

// ─── RoomTypes Tab ─────────────────────────────────────────────────────────────
function RoomTypesTab() {
  const [roomTypes, setRoomTypes] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [homestays, setHomestays] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetch = useCallback(() => {
    setLoading(true);
    setError(null);
    getRoomTypes(page)
      .then((res) => {
        setRoomTypes(res.data || []);
        setMeta(res.meta || null);
      })
      .catch(() => setError('Không thể tải danh sách loại phòng.'))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  useEffect(() => {
    getAdminHomestays(1)
      .then((res) => setHomestays(res.data || []))
      .catch(() => {});
  }, []);

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
        await updateRoomType(editingItem.id, data);
      } else {
        await createRoomType(data);
      }
      closeForm();
      fetch();
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      await deleteRoomType(deleteDialog.item.id);
      setDeleteDialog({ open: false, item: null });
      fetch();
    } catch {
      alert('Không thể xoá loại phòng này.');
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-on-surface-variant font-body">
          Quản lý các loại phòng và giá phòng.
        </p>
        {!showForm && (
          <Button onClick={openCreate} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Thêm loại phòng
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardHeader className="pb-4 flex flex-row items-center justify-between">
            <CardTitle className="font-headline text-on-surface text-base">
              {editingItem ? 'Cập nhật loại phòng' : 'Thêm loại phòng mới'}
            </CardTitle>
            <button
              onClick={closeForm}
              className="text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </CardHeader>
          <CardContent>
            {formError && <p className="text-sm text-error mb-4 font-body">{formError}</p>}
            <RoomTypeForm
              initial={editingItem}
              homestays={homestays}
              onSubmit={handleSubmit}
              onCancel={closeForm}
              submitting={submitting}
            />
          </CardContent>
        </Card>
      )}

      <div className="overflow-x-auto rounded-lg border border-border">
        {loading ? (
          <div className="p-6">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <p className="text-sm text-error p-6 font-body">{error}</p>
        ) : roomTypes.length === 0 ? (
          <p className="text-sm text-on-surface-variant text-center py-10 font-body">
            Chưa có loại phòng nào.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-container-low">
                <th className="text-left px-4 py-3 font-semibold text-on-surface-variant font-body">
                  Tên loại phòng
                </th>
                <th className="text-left px-4 py-3 font-semibold text-on-surface-variant font-body">
                  Cơ sở
                </th>
                <th className="text-left px-4 py-3 font-semibold text-on-surface-variant font-body">
                  Sức chứa
                </th>
                <th className="text-right px-4 py-3 font-semibold text-on-surface-variant font-body">
                  Giá/đêm
                </th>
                <th className="text-center px-4 py-3 font-semibold text-on-surface-variant font-body">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {roomTypes.map((rt) => (
                <tr
                  key={rt.id}
                  className="border-b border-border hover:bg-surface-container transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-on-surface font-body">{rt.name}</td>
                  <td className="px-4 py-3 text-on-surface-variant font-body">
                    {rt.homestay?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant font-body">
                    {rt.max_guests} người
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-primary font-body">
                    <PriceDisplay amount={rt.nightly_rate} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(rt)} className="gap-1">
                        <Pencil className="w-3.5 h-3.5" />
                        Sửa
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteDialog({ open: true, item: rt })}
                        className="gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Xoá
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && !error && meta && (
        <Pagination meta={meta} onPageChange={setPage} />
      )}

      <ConfirmDialog
        open={deleteDialog.open}
        title="Xoá loại phòng"
        message={`Bạn có chắc chắn muốn xoá loại phòng "${deleteDialog.item?.name}"?`}
        confirmLabel={deleteLoading ? 'Đang xoá...' : 'Xoá'}
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ open: false, item: null })}
      />
    </div>
  );
}

// ─── Rooms Tab ─────────────────────────────────────────────────────────────────
function RoomsTab() {
  const [rooms, setRooms] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(null);

  const fetch = useCallback(() => {
    setLoading(true);
    setError(null);
    getRooms(page)
      .then((res) => {
        setRooms(res.data || []);
        setMeta(res.meta || null);
      })
      .catch(() => setError('Không thể tải danh sách phòng.'))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  useEffect(() => {
    getRoomTypes(1)
      .then((res) => setRoomTypes(res.data || []))
      .catch(() => {});
  }, []);

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
        await updateRoom(editingItem.id, data);
      } else {
        await createRoom(data);
      }
      closeForm();
      fetch();
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      await deleteRoom(deleteDialog.item.id);
      setDeleteDialog({ open: false, item: null });
      fetch();
    } catch {
      alert('Không thể xoá phòng này.');
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleStatusChange(id, status) {
    setStatusLoading(id);
    try {
      await updateRoomStatus(id, status);
      setRooms((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
    } catch {
      alert('Không thể cập nhật trạng thái phòng.');
    } finally {
      setStatusLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-on-surface-variant font-body">
          Quản lý các phòng cụ thể và trạng thái.
        </p>
        {!showForm && (
          <Button onClick={openCreate} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Thêm phòng
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardHeader className="pb-4 flex flex-row items-center justify-between">
            <CardTitle className="font-headline text-on-surface text-base">
              {editingItem ? 'Cập nhật phòng' : 'Thêm phòng mới'}
            </CardTitle>
            <button
              onClick={closeForm}
              className="text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </CardHeader>
          <CardContent>
            {formError && <p className="text-sm text-error mb-4 font-body">{formError}</p>}
            <RoomForm
              initial={editingItem}
              roomTypes={roomTypes}
              onSubmit={handleSubmit}
              onCancel={closeForm}
              submitting={submitting}
            />
          </CardContent>
        </Card>
      )}

      <div className="overflow-x-auto rounded-lg border border-border">
        {loading ? (
          <div className="p-6">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <p className="text-sm text-error p-6 font-body">{error}</p>
        ) : rooms.length === 0 ? (
          <p className="text-sm text-on-surface-variant text-center py-10 font-body">
            Chưa có phòng nào.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-container-low">
                <th className="text-left px-4 py-3 font-semibold text-on-surface-variant font-body">
                  Mã phòng
                </th>
                <th className="text-left px-4 py-3 font-semibold text-on-surface-variant font-body">
                  Loại phòng
                </th>
                <th className="text-left px-4 py-3 font-semibold text-on-surface-variant font-body">
                  Cơ sở
                </th>
                <th className="text-left px-4 py-3 font-semibold text-on-surface-variant font-body">
                  Trạng thái
                </th>
                <th className="text-left px-4 py-3 font-semibold text-on-surface-variant font-body">
                  Vệ sinh
                </th>
                <th className="text-center px-4 py-3 font-semibold text-on-surface-variant font-body">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-border hover:bg-surface-container transition-colors"
                >
                  <td className="px-4 py-3 font-semibold text-on-surface font-mono">
                    {r.room_code}
                  </td>
                  <td className="px-4 py-3 text-on-surface font-body">
                    {r.room_type?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant font-body">
                    {r.room_type?.homestay?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={r.status}
                      disabled={statusLoading === r.id}
                      onChange={(e) => handleStatusChange(r.id, e.target.value)}
                      className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-body"
                    >
                      {ROOM_STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={r.cleanliness === 'clean' ? 'bg-green-100 text-green-800 border-green-200' : r.cleanliness === 'cleaning' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-gray-100 text-gray-700 border-gray-200'}>
                      {cleanlinessLabel(r.cleanliness)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(r)} className="gap-1">
                        <Pencil className="w-3.5 h-3.5" />
                        Sửa
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteDialog({ open: true, item: r })}
                        className="gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Xoá
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && !error && meta && (
        <Pagination meta={meta} onPageChange={setPage} />
      )}

      <ConfirmDialog
        open={deleteDialog.open}
        title="Xoá phòng"
        message={`Bạn có chắc chắn muốn xoá phòng "${deleteDialog.item?.room_code}"?`}
        confirmLabel={deleteLoading ? 'Đang xoá...' : 'Xoá'}
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ open: false, item: null })}
      />
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function RoomManagementPage() {
  const [activeTab, setActiveTab] = useState('room-types');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-headline text-on-surface">Quản lý phòng</h1>
        <p className="text-sm text-on-surface-variant mt-1 font-body">
          Quản lý loại phòng và phòng cụ thể.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-0">
          {[
            { key: 'room-types', label: 'Loại phòng' },
            { key: 'rooms', label: 'Phòng' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 text-sm font-medium font-body transition-colors border-b-2 -mb-px ${
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'room-types' ? <RoomTypesTab /> : <RoomsTab />}
    </div>
  );
}
