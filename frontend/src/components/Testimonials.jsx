import React from 'react';

export function Testimonials() {
  return (
    <section className="py-24 px-8 max-w-7xl mx-auto overflow-hidden">
      <h2 className="font-headline text-3xl md:text-4xl font-extrabold mb-16 text-center italic">Khách hàng nói gì</h2>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[48px] shadow-sm border border-[rgba(159,176,185,0.1)]">
          <p className="font-body text-[16px] leading-[24px] text-on-surface-variant mb-8">
            "Duly's House không chỉ là nơi nghỉ chân, mà còn là trải nghiệm đáng nhớ. Sự chu đáo trong từng chi tiết thật sự ấn tượng."
          </p>
          <div className="flex items-center gap-4">
            <img
              className="w-12 h-12 rounded-full object-cover"
              alt="Portrait of a smiling young woman"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBeGiib9MrEs50H13Rnq6Q81j43ArxBhEHNKm3Yk8k_bxTXGEK0VSxu3Ia2HwX4ad1wJ4VJKldeF5QzBp666423RMrS4yBkc1eR-8gDVMFTGgAh9IErBuQsMaya9IcyY3fIVEbSX1YC3cbhX-iFbamb_KaCXqj5h0XAkiTt-PunHzbdnefZ-oPOUQDyMS2W2dZozWMfqlPeGhiS7hvnUjmUmWD558CSNXTPs5JYroY0YfoZlujE5mzFYzS45upSR6xnUurPcV_BApDv"
              loading="lazy"
              decoding="async"
            />
            <div>
              <h5 className="font-bold font-headline text-sm">Nguyễn Thị Mai</h5>
              <p className="text-xs text-outline font-body">Đà Nẵng, Việt Nam</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[48px] shadow-sm border border-[rgba(159,176,185,0.1)] translate-y-4">
          <p className="font-body text-[16px] leading-[24px] text-on-surface-variant mb-8">
            "Tôi đã dùng nhiều nền tảng đặt phòng, nhưng dịch vụ ở đây khác biệt. Có thể cảm nhận được sự quan tâm thực sự đến từng vị khách."
          </p>
          <div className="flex items-center gap-4">
            <img
              className="w-12 h-12 rounded-full object-cover"
              alt="Portrait of a mature man with glasses"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGi0dBc3MPiKQ2NzHUK_b3klojVYkXtsMv5FaF3NvSIhyRiYGf3ww11xRsct0GYZalsKWWBDJ64FpThRgoLD_0lPVgVVxPxeJgrPZRxhm7vJfBat0THPcRUTy40foO5_BtuYptlLz1qmpLMkeUHIeJsWieiruva2n4N5VE7K9-ZDycQq8dMV1yogCIaeDeQeUXMWbFn34Or5nrz9qS8Too1B2CZ21JEgUEM-NHIGS32_f_fYz53VxaY4jM2BPpu75XClA0khj6Sfn6"
              loading="lazy"
              decoding="async"
            />
            <div>
              <h5 className="font-bold font-headline text-sm">Trần Văn Hùng</h5>
              <p className="text-xs text-outline font-body">Hội An, Việt Nam</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[48px] shadow-sm border border-[rgba(159,176,185,0.1)]">
          <p className="font-body text-[16px] leading-[24px] text-on-surface-variant mb-8">
            "Nhờ gợi ý của chủ nhà, chúng tôi đã khám phá được một quán cà phê tuyệt vời mà không guidebook nào đề cập. Trải nghiệm tuyệt vời!"
          </p>
          <div className="flex items-center gap-4">
            <img
              className="w-12 h-12 rounded-full object-cover"
              alt="Portrait of a stylish young man"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAS6FFhJGZ82Mbu6N15wmZQuR2YOV0SrlC38Cjvm1Hrz0Y-40_k4zKiyBfmB4S3ZBX8T2rie12gN6Guzv5OfiS0WRJUJyV_8wMW9ECIJ5qSYD9v3v3EP-GG3ICV2o01pdntwYkmixnMPIerG4-YZVuMrIjNqZSbTWa2CRJi-4w27d4BM5K-3NpYAuDvkcXc6Fy2Ipl5lfhYDIHK1q4C9VQDAzxs3YRGfXm9Cl8ibgQQumIlF7THtYo6BxMWkrJMAhzgiw9OmEjVIInB"
              loading="lazy"
              decoding="async"
            />
            <div>
              <h5 className="font-bold font-headline text-sm">Lê Hoàng Anh</h5>
              <p className="text-xs text-outline font-body">Huế, Việt Nam</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
