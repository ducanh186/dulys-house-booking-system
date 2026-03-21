import React from 'react';

export function Destinations() {
  return (
    <section className="py-24 px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-headline text-3xl md:text-4xl font-extrabold mb-12">Điểm đến phổ biến</h2>
        <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar -mx-4 px-4">
          <div className="min-w-[280px] group cursor-pointer">
            <div className="relative h-96 rounded-[48px] overflow-hidden">
              <img
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                alt="Aerial view of Paris city streets"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVuIiSINnxHqazQcMmIcf9eWGdXKBI3OGFA9tzB7qcCODSlnRFQox6rydFWzu0-Y4EYAiXZ0vAHC3QAV-5xXom_23KX2NKm8T_uNtGjkQ-tE-5Jg9oUqJ5lfUC6-ksJZuprKPLb5tU9WRsXANVW8HPfNgsxXfTqadS4G42n-fPWLOtB3zvvdMB_v4bCWqCr8fLo57oYf5mOWjKv40z6B3j2Ez6d2LnE71JCDpPGZAEv2TReupG7Gf6VWg8yZnypecpTA7cUcWsd-k5"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <h4 className="font-headline text-[24px] font-bold">Đà Nẵng</h4>
                <p className="text-white/80 font-body">342 chỗ nghỉ</p>
              </div>
            </div>
          </div>
          <div className="min-w-[280px] group cursor-pointer">
            <div className="relative h-96 rounded-[48px] overflow-hidden">
              <img
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                alt="Tulum beach club with turquoise water"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJH0HGlfXNjlLSeoP0Fh2_qO4cwxC0Xyu8C5NxlwYEK0MYNM1T2gyLVoK85dyZixRG3tyVp7HIRTVhMiuCJnPAJHgEwkFLGRfvrze9jtxWn8pJngGwdJjyWA7oonm5w7fF2M-edoc-bh-Fqx1ME0AyaGyvtzwObTAgqqJTtHywim_iGRtvsWx6K2cexPIZdr03WPliD67NFJdvTc6LOFrZUkBYmDNIlabSxf1hHfYVhEb6aXPrNlX1g2abx8yQ-JQSIBEn81bChC4r"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <h4 className="font-headline text-[24px] font-bold">Hội An</h4>
                <p className="text-white/80 font-body">128 chỗ nghỉ</p>
              </div>
            </div>
          </div>
          <div className="min-w-[280px] group cursor-pointer">
            <div className="relative h-96 rounded-[48px] overflow-hidden">
              <img
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                alt="Bali jungle with infinity pool"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9Z9FC2q7deWq1jEtlIaZg9H_4O6KYnpyroEfAPQqWsK2tjnuHlc4uDdP_bnmFc2H1mge1AuTHWZDrser9IpwRQoWvuYagufmvC6vOKr_h3vwSyqgrGUXOY_yXUfzNH72HnD9aiKYN4CFhunP4eUZpGBREI-zfFyx2LHpFbHgwqvfCRAufK-49oIdFFvu7W3UWOvX1taIDGSGbw5OgKOdd2lc9YX39Bh8uXvJTTf2uSX1uE0FlEhpgianpboEvOyJqws1uGHekVAo9"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <h4 className="font-headline text-[24px] font-bold">Huế</h4>
                <p className="text-white/80 font-body">512 chỗ nghỉ</p>
              </div>
            </div>
          </div>
          <div className="min-w-[280px] group cursor-pointer">
            <div className="relative h-96 rounded-[48px] overflow-hidden">
              <img
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                alt="Rome colosseum and cobblestone street"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAyK8kp_ekfQnRvlC9wUXCjl2ZQmNlIyppRod32luXVDuI5zAROnOYWvP6_AxrBBl5CCgwwCTr4PIVD6QPFLtxAPxfJhMPgoJyzwUZbrxDPHHHCr8XntaHBFOYewoqB_2aSw-GCBzqr7zAg_0KUkdZ7TtHpf3c_6PDWm7UA6D3_SCnPVSXWUns18k85jXRw77zIpovuZY7u7UOYZl2SoipLrgiqwlGy6E047kmxzfZxdPZSlT-nlwrnlb_3SzTfcI9xFog1dnr1Jtm"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <h4 className="font-headline text-[24px] font-bold">Phú Quốc</h4>
                <p className="text-white/80 font-body">215 chỗ nghỉ</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
