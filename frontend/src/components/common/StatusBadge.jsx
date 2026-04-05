import { Badge } from '../ui/badge';

const STATUS_MAP = {
  pending: { label: 'Chờ xác nhận', className: 'bg-yellow-100 text-yellow-800 border-yellow-200', pulse: true },
  pending_payment: { label: 'Chờ thanh toán', className: 'bg-orange-100 text-orange-800 border-orange-200', pulse: true },
  payment_review: { label: 'Chờ xác nhận', className: 'bg-purple-100 text-purple-800 border-purple-200', pulse: true },
  confirmed: { label: 'Đã xác nhận', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  checked_in: { label: 'Đã nhận phòng', className: 'bg-green-100 text-green-800 border-green-200' },
  checked_out: { label: 'Đã trả phòng', className: 'bg-gray-100 text-gray-800 border-gray-200' },
  cancelled: { label: 'Đã huỷ', className: 'bg-red-100 text-red-800 border-red-200' },
  expired: { label: 'Hết hạn', className: 'bg-gray-100 text-gray-500 border-gray-200' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_MAP[status] || { label: status, className: '' };
  return (
    <Badge className={`${config.className} inline-flex items-center gap-1.5`}>
      {config.pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500" />
        </span>
      )}
      {config.label}
    </Badge>
  );
}
