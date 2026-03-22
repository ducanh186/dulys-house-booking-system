import { Link } from 'react-router-dom';
import { Send } from 'lucide-react';

const aboutLinks = [
  { label: 'Giới thiệu', to: '/about' },
  { label: 'Tuyển dụng', to: '/careers' },
  { label: 'Bản tin', to: '/news' },
];

const supportLinks = [
  { label: 'Liên hệ hỗ trợ', to: '/support/contact' },
  { label: 'Chính sách bảo mật', to: '/privacy-policy' },
  { label: 'Điều khoản dịch vụ', to: '/terms-of-service' },
];

export function Footer() {
  return (
    <footer className="w-full mt-20 border-t border-border bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef4fb_100%)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 xl:grid-cols-[1.1fr_0.8fr_0.8fr_1.1fr]">
        <div className="space-y-4">
          <p className="text-lg font-bold text-on-surface font-headline">Duly's House</p>
          <p className="max-w-sm text-sm leading-6 text-on-surface-variant">
            Nâng tầm trải nghiệm lưu trú với dịch vụ chuyên nghiệp và tận tâm.
          </p>
        </div>

        <div className="space-y-4">
          <h5 className="text-sm font-bold text-on-surface font-headline">Về chúng tôi</h5>
          <ul className="space-y-2">
            {aboutLinks.map((item) => (
              <li key={item.to}>
                <Link className="inline-block text-sm text-on-surface-variant transition-colors hover:text-primary" to={item.to}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h5 className="text-sm font-bold text-on-surface font-headline">Hỗ trợ</h5>
          <ul className="space-y-2">
            {supportLinks.map((item) => (
              <li key={item.to}>
                <Link className="inline-block text-sm text-on-surface-variant transition-colors hover:text-primary" to={item.to}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h5 className="text-sm font-bold text-on-surface font-headline">Bản tin</h5>
          <p className="text-sm leading-6 text-on-surface-variant">
            Đăng ký nhận thông tin ưu đãi và gợi ý lưu trú hấp dẫn.
          </p>
          <form
            className="flex overflow-hidden rounded-full border border-border bg-white shadow-sm"
            onSubmit={(event) => event.preventDefault()}
          >
            <input
              className="w-full border-0 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-on-surface-variant"
              placeholder="Địa chỉ email"
              type="email"
            />
            <button
              className="inline-flex items-center justify-center px-4 text-white sunlight-gradient transition-opacity hover:opacity-90"
              type="submit"
              aria-label="Gửi email"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-border px-4 py-6 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-on-surface-variant">
          © 2026 Duly's House. Bản quyền thuộc về Duly's House.
        </p>
      </div>
    </footer>
  );
}
