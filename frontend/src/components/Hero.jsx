import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function Hero() {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (checkIn) params.set('check_in', checkIn);
    if (checkOut) params.set('check_out', checkOut);
    if (guests) params.set('guests', guests);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <section className="relative px-8 pt-12 pb-24 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="z-10">
          <h1 className="font-headline text-[72px] leading-[72px] font-extrabold text-on-surface mb-6 tracking-[-1.8px]">
            Tìm chỗ nghỉ <br /> <span className="text-primary italic">lý tưởng.</span>
          </h1>
          <p className="font-body text-[20px] leading-[28px] text-on-surface-variant max-w-md mb-10">
            Homestay được tuyển chọn, mang cảm giác như nhà với dịch vụ chuyên nghiệp.
          </p>
          <div className="bg-white p-4 rounded-full shadow-2xl shadow-on-surface/10 flex flex-col md:flex-row items-center gap-0 max-w-2xl">
            <div className="flex-1 w-full space-y-1 px-6">
              <span className="text-[10px] uppercase tracking-widest font-bold text-outline">Nhận phòng</span>
              <input
                className="bg-transparent border-none focus:ring-0 p-0 w-full text-on-surface font-semibold outline-none font-body"
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>
            <div className="w-px h-12 bg-surface-container hidden md:block" />
            <div className="flex-1 w-full space-y-1 px-6">
              <span className="text-[10px] uppercase tracking-widest font-bold text-outline">Trả phòng</span>
              <input
                className="bg-transparent border-none focus:ring-0 p-0 w-full text-on-surface font-semibold outline-none font-body"
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>
            <div className="w-px h-12 bg-surface-container hidden md:block" />
            <div className="flex-1 w-full space-y-1 px-6">
              <span className="text-[10px] uppercase tracking-widest font-bold text-outline">Số khách</span>
              <input
                className="bg-transparent border-none focus:ring-0 p-0 w-full text-on-surface font-semibold placeholder:text-outline-variant outline-none font-body"
                placeholder="Nhập số khách"
                type="number"
                min="1"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
              />
            </div>
            <button
              onClick={handleSearch}
              className="sunlight-gradient text-white h-12 w-12 rounded-full flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                search
              </span>
            </button>
          </div>
        </div>
        <div className="relative">
          <div className="aspect-[4/5] rounded-[48px] overflow-hidden shadow-2xl">
            <img
              className="w-full h-full object-cover"
              alt="Modern cabin in a forest with large windows"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJ8XW5EDxtdcRZgSyyd6SkF3F0zMse4z6zIGhEMaCXwJJiK4TQNF2IsGh3VtL4R651hGtQlw-lhPuOlBTR2DVIyPkz_Y8Ss0LD9CItPLFt4lhw51w-L__VccPTYcNyj4rwkFTXFDF7q74GUxdYThqAkP4WfnfUWRVVmgxRizDjmhPV0ICDj4gR4CX8rOeZwrrF6F8MjD7KEwhGIEdXJiv_4yzp1a0xUUtWy3c92-KDrmM_6jR6pfBlIhFse_BrKoWz_G1a5kCP3VsB"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 bg-tertiary-container p-6 rounded-[32px] shadow-xl max-w-[200px]">
            <div className="flex gap-1 text-primary mb-2">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            </div>
            <p className="font-headline text-on-tertiary-container font-bold text-sm">"Chỗ nghỉ tuyệt vời nhất tôi từng đặt."</p>
          </div>
        </div>
      </div>
    </section>
  );
}
