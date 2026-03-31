import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '../ui/Input';

const PasswordInput = forwardRef(function PasswordInput({ className = '', ...props }, ref) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <Input
        ref={ref}
        {...props}
        type={show ? 'text' : 'password'}
        className={`pr-10 ${className}`}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
        tabIndex={-1}
        aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
});

export default PasswordInput;
