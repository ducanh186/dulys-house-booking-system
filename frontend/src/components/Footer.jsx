import React from 'react';

export function Footer() {
  return (
    <footer className="w-full mt-20 bg-[#f8fafc]">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-8 py-12 max-w-7xl mx-auto">
        <div className="col-span-2 md:col-span-1 space-y-4">
          <span className="text-lg font-bold text-on-surface font-headline">Duly's House</span>
          <p className="text-on-surface-variant font-body text-xs leading-relaxed">
            Nâng tầm trải nghiệm lưu trú với dịch vụ chuyên nghiệp và tận tâm.
          </p>
        </div>
        <div className="space-y-4">
          <h5 className="font-headline text-on-surface font-bold text-sm">Về chúng tôi</h5>
          <ul className="space-y-2">
            <li>
              <a className="text-on-surface-variant font-body text-xs hover:underline transition-all hover:translate-x-1 inline-block" href="#">
                Giới thiệu
              </a>
            </li>
            <li>
              <a className="text-on-surface-variant font-body text-xs hover:underline transition-all hover:translate-x-1 inline-block" href="#">
                Tuyển dụng
              </a>
            </li>
            <li>
              <a className="text-on-surface-variant font-body text-xs hover:underline transition-all hover:translate-x-1 inline-block" href="#">
                Bản tin
              </a>
            </li>
          </ul>
        </div>
        <div className="space-y-4">
          <h5 className="font-headline text-on-surface font-bold text-sm">Hỗ trợ</h5>
          <ul className="space-y-2">
            <li>
              <a className="text-on-surface-variant font-body text-xs hover:underline transition-all hover:translate-x-1 inline-block" href="#">
                Liên hệ hỗ trợ
              </a>
            </li>
            <li>
              <a className="text-on-surface-variant font-body text-xs hover:underline transition-all hover:translate-x-1 inline-block" href="#">
                Chính sách bảo mật
              </a>
            </li>
            <li>
              <a className="text-on-surface-variant font-body text-xs hover:underline transition-all hover:translate-x-1 inline-block" href="#">
                Điều khoản dịch vụ
              </a>
            </li>
          </ul>
        </div>
        <div className="space-y-4">
          <h5 className="font-headline text-on-surface font-bold text-sm">Bản tin</h5>
          <p className="text-on-surface-variant font-body text-xs">Đăng ký nhận thông tin ưu đãi và gợi ý lưu trú hấp dẫn.</p>
          <div className="flex">
            <input
              className="bg-white border-none rounded-l-full text-xs px-4 py-2 w-full focus:ring-1 focus:ring-primary outline-none font-body"
              placeholder="Địa chỉ email"
              type="email"
            />
            <button className="text-white rounded-r-full px-4 sunlight-gradient">
              <span className="material-symbols-outlined text-sm">send</span>
            </button>
          </div>
        </div>
      </div>
      <div className="px-8 py-6 max-w-7xl mx-auto border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-on-surface-variant font-body text-xs">&copy; 2026 Duly's House. Bản quyền thuộc về Duly's House.</p>
        <div className="flex gap-6">
          <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">
            <span className="material-symbols-outlined text-lg">public</span>
          </a>
          <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">
            <span className="material-symbols-outlined text-lg">share</span>
          </a>
          <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">
            <span className="material-symbols-outlined text-lg">favorite</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
