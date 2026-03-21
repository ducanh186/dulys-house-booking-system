import React from 'react';

export function WhyChooseUs() {
  return (
    <section className="py-24 px-8 max-w-7xl mx-auto">
      <div className="bg-surface-container-highest rounded-[48px] p-12 md:p-20 relative overflow-hidden">
        <div className="grid md:grid-cols-2 gap-16 relative z-10">
          <div>
            <h2 className="font-headline text-4xl md:text-5xl font-extrabold mb-8">Vì sao chọn Duly's House</h2>
            <div className="space-y-10">
              <div className="flex gap-6">
                <div className="bg-[#fbd12d] h-14 w-14 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-on-primary-container text-3xl" data-icon="verified_user">
                    verified_user
                  </span>
                </div>
                <div>
                  <h4 className="font-headline text-xl font-bold mb-2">Kiểm định chất lượng</h4>
                  <p className="text-on-surface-variant leading-relaxed font-body">
                    Mỗi cơ sở đều được kiểm tra kỹ lưỡng về tiện nghi, phong cách và chất lượng dịch vụ.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="bg-[#cffdf8] h-14 w-14 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-tertiary text-3xl" data-icon="concierge">
                    concierge
                  </span>
                </div>
                <div>
                  <h4 className="font-headline text-xl font-bold mb-2">Hỗ trợ 24/7</h4>
                  <p className="text-on-surface-variant leading-relaxed font-body">
                    Đội ngũ hỗ trợ luôn sẵn sàng giúp bạn đặt dịch vụ, trải nghiệm và xử lý mọi yêu cầu trong thời gian lưu trú.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="bg-[#fec1d6] h-14 w-14 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-on-secondary-container text-3xl" data-icon="loyalty">
                    loyalty
                  </span>
                </div>
                <div>
                  <h4 className="font-headline text-xl font-bold mb-2">Trải nghiệm địa phương</h4>
                  <p className="text-on-surface-variant leading-relaxed font-body">
                    Khám phá những điểm đến độc đáo do chính chủ nhà địa phương gợi ý.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="grid grid-cols-2 gap-4">
              <img
                className="rounded-[32px] h-48 w-full object-cover"
                alt="Professional hotel bed with plush pillows"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCu8UgXamezcAS0CDPbXYSP51xB1elcB9Cyuiyb_0XwcpZd2Kj-61z1pTU0OsCOQ6ZJ2XpafXqeUJH7dzMdRUUoAWO4gHA1epNMPg5U4SWvVf9SY87ru4lgzir309mrV-iRqOT_6cl5LagGYXzVY3Q7voqy3zG8HvKuDGWUIz18Uaft3CY_m5h6m6B47O4kGuA1B9--UmBnTj2AXuZ7L_2VhSuzyoCEhxBC4eouNUftmQkKcPccwTT_BdepwmZmREXKRpqKCC6fWsw9"
              />
              <img
                className="rounded-[32px] h-48 w-full object-cover mt-8"
                alt="High-end organic bathroom amenities"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8Ugf9d2jc-lNn4AHlM9YnxmM3YE1MSJcY6v5KrpoAJQAYKPQe7srIubaDlN-CJx0egGnR8cj3sLFjUyu7BMcvqyzNy-8snZ72rqRwMAt3TwkxqEtGuWWLisqtVppHLSFFT8WFC76g41GiBOF0T3RLV_rK9XRs035qHp0q5Mq9UfKQIWimirBajAd25nfQsFcPNUFCRE3NSW_J_K3eVIe36ApIaWlq4eoqWB3qG6z-pyKdz6AmnfWTrHQmeqdwWD4dEZISfjB0sD5l"
              />
              <img
                className="rounded-[32px] h-48 w-full object-cover -mt-8"
                alt="Curated breakfast platter with fresh fruits"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfhjnXJ7S801uD01hYRVYavcrQFYPnfpQbHlimVRi2ETG9wNK8O05Gs9RP9Upp6IdOKjDTCp0NCGz6j7fYeuWIsneME8_5s1eyyHmIpajVZFhB0lXCScxPwVycwaOc44GPDXVOArJJ-rRwOvRFH0CABO0Nv-66EqkPFOeJ9-x4MjTqGrVJHXO3zxhsl6qbtLkP7wP-B105GF0p_w1Mg9gnQaVP6J8Pc0vmOGoyCHseENqNKJRUIxNWd0i0l1vEVjkGnof5jZn51KWC"
              />
              <img
                className="rounded-[32px] h-48 w-full object-cover"
                alt="Warm interior lighting of a living room"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdtnqUKHTLiQJIYX4VGNZnB0WXHOi1IMzbtNuvxjcpVUTqoqeEwNMzp4rTw5b1s2koRF-2WfJj_c9Q8fPJbrIzHFVKbGR8z_hYhyfpXCIAzq19Ca9qZqaUd8RVeoMJM3rwbO-ZE8etlzr0g0s4enSfeMFkkdnhQhQOIccHl8qIhLiRnWkzOxFPw_1vH6fF3_Te2AaPPNkgkltKX0ifTJOuLVXHjn5xkbe2oO9P9J0yrzU9W1_j8u7rGF_z0DC4a4mV12czboehVhrq"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
