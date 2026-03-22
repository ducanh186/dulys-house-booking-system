const GRADIENTS = [
  'from-primary/60 to-primary/30',
  'from-secondary/60 to-secondary/30',
  'from-tertiary/60 to-tertiary/30',
  'from-primary/40 to-secondary/40',
  'from-secondary/40 to-tertiary/40',
];

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export default function ImagePlaceholder({ name = '', className = '', size = 'md' }) {
  const index = hashCode(name) % GRADIENTS.length;
  const gradient = GRADIENTS[index];
  const initial = (name || '?').charAt(0).toUpperCase();

  const textSize = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
  }[size] || 'text-3xl';

  return (
    <div
      className={`bg-gradient-to-br ${gradient} flex items-center justify-center ${className}`}
    >
      <span className={`${textSize} font-bold font-headline text-white/80 select-none`}>
        {initial}
      </span>
    </div>
  );
}
