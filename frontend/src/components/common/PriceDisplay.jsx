export default function PriceDisplay({ amount, className = '', compact = false }) {
  const num = Number(amount);

  if (compact && num >= 1_000_000_000) {
    const val = num / 1_000_000_000;
    return <span className={className}>{val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)} tỷ₫</span>;
  }

  if (compact && num >= 1_000_000) {
    const val = num / 1_000_000;
    return <span className={className}>{val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)} tr₫</span>;
  }

  const formatted = num.toLocaleString('vi-VN');
  return <span className={className}>{formatted}&#8363;</span>;
}
