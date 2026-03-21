import React from 'react';

export function Featured() {
  return (
    <section className="bg-surface-container-low py-24 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="font-headline text-3xl md:text-4xl font-extrabold mb-4">Homestay nổi bật</h2>
            <p className="text-on-surface-variant font-body">Những cơ sở lưu trú được tuyển chọn với dịch vụ xuất sắc.</p>
          </div>
          <button className="text-primary font-bold flex items-center gap-2 hover:gap-3 transition-all font-body">
            Xem tất cả <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="group cursor-pointer">
            <div className="aspect-[4/3] rounded-[32px] overflow-hidden mb-4 relative">
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                alt="Minimalist white beach house with pool"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxKNjwLsyTIcx7Yz_2MXiefDh8dGDpa8f4peVpDo5SdTviyIgnCLbvQY6I_C0BtA4fqNiRit_-EKBb6DWaHGlCO2RoXbaziPjuZ8gpGn-RBQADlAleFxAjpfQgLas4zN7DT0EMS1fiHlga5C1XPenLDGdq5ieqaVAN9q5pE0kntfUFMOVy3KtTc1YNg2n6z7dKEkymnwobLPHe2RQe550btIteXJE0LDpXfu51oNZAdiI_cTdauzo0qrIkanh7anivnRj_3Vj00TJ1"
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-primary">
                NỔI BẬT
              </div>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-headline font-bold text-[20px] mb-1">Duly's House Đà Nẵng</h3>
                <p className="text-on-surface-variant text-sm font-body mb-2">Đà Nẵng, Việt Nam</p>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="font-bold text-sm">4.92</span>
                  <span className="text-outline text-sm">(124 đánh giá)</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[20px] font-bold text-primary">850.000₫</p>
                <p className="text-[10px] text-outline uppercase font-bold">/ đêm</p>
              </div>
            </div>
          </div>
          <div className="group cursor-pointer">
            <div className="aspect-[4/3] rounded-[32px] overflow-hidden mb-4 relative">
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                alt="Traditional Japanese ryokan with garden view"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEl50xsnywIjEKviDPKcNgFmxtZwgKeqZFf7V6RxlYm4hL5ilHQrjGbWDo1EI0dCd7N_IkvFDXJEZ4axHOufLYyqkCisF1OGKuyEKvmo4Qg9z-eXrVQeShpH_22ISXCzDj65ls_JxYdledL1AhGlRXAdgvjhWOr5QV5dr8h2slzUXX-q9lchYF39Tpw5jKJ6iFNhIWZa6uzXefrODRF598h7Z_F1kDIIRwManSq9WNVk8fy49JbbD7cCe8DXeZDp21ooDc5sTDhn7y"
              />
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-headline font-bold text-[20px] mb-1">Duly's House Hội An</h3>
                <p className="text-on-surface-variant text-sm font-body mb-2">Hội An, Việt Nam</p>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="font-bold text-sm">4.98</span>
                  <span className="text-outline text-sm">(86 đánh giá)</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[20px] font-bold text-primary">650.000₫</p>
                <p className="text-[10px] text-outline uppercase font-bold">/ đêm</p>
              </div>
            </div>
          </div>
          <div className="group cursor-pointer">
            <div className="aspect-[4/3] rounded-[32px] overflow-hidden mb-4 relative">
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                alt="Modern glass house in the snowy mountains"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0KJf_6k0KebEq4Bx7tUUpfRxdiTojn0CHc9G03t4xpjzWsP71JIo_7ZVeTCR5ui_ZnM9-4TJfXOY0kX4TVOzEc_FM2vu8x23vA5UXB3auZfSuhr7JiM965xMmj8wkl0XynavBg5IH8xBN4PlK1ygyUDUYfI2FacHg3b5kSTzQlDIqspROq2f8ZDaIkSCgSkaxg74FUWKhLeiNpVlf0Zl66V2oPKO1XBkTyKvY9htZVQeHOwHb_ws0ul1xLRcqmDyngFp3HOAZ6PJP"
              />
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-headline font-bold text-[20px] mb-1">Duly's House Phú Quốc</h3>
                <p className="text-on-surface-variant text-sm font-body mb-2">Phú Quốc, Việt Nam</p>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="font-bold text-sm">4.95</span>
                  <span className="text-outline text-sm">(67 đánh giá)</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[20px] font-bold text-primary">750.000₫</p>
                <p className="text-[10px] text-outline uppercase font-bold">/ đêm</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
