export default function PriceDisplay({ amount, className = '' }) {
  const formatted = Number(amount).toLocaleString('vi-VN');
  return <span className={className}>{formatted}&#8363;</span>;
}
