import { Badge } from '../ui/badge';

const STATUS_MAP = {
  pending: { label: 'Chờ xác nhận', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  confirmed: { label: 'Đã xác nhận', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  checked_in: { label: 'Đã nhận phòng', className: 'bg-green-100 text-green-800 border-green-200' },
  checked_out: { label: 'Đã trả phòng', className: 'bg-gray-100 text-gray-800 border-gray-200' },
  cancelled: { label: 'Đã huỷ', className: 'bg-red-100 text-red-800 border-red-200' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_MAP[status] || { label: status, className: '' };
  return <Badge className={config.className}>{config.label}</Badge>;
}
