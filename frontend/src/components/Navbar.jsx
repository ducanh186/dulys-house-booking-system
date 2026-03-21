import React from 'react';

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm dark:shadow-none">
      <div className="flex justify-between items-center px-8 h-20 w-full max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <img
              alt="Logo Duly's House"
              className="h-10 w-auto"
              src="https://lh3.googleusercontent.com/aida/ADBb0ug6_4KSGsMk3phuTN1ZaqjNYaCANOPltcyiDbJ-NtYjy50qWxxcusgz6f9mUSpbf0gC-lL5IlioRm0_xRSzBJviFQpzGoQrmGjFG1czfgXIKJNJTT0t_4QMMv6EXgr_hFDSTDCQ1eOe7kZMp1JgqjvcGasoXRcmksGZulH7cQNDq-bX_Bxive-nlDBA0fi8brb1Jrv6Cil7-4hmYQurjpEg3GpVPuDKcmS5RzZ93w8PmS97dfuoLhdFrmf3LjcWoI_nt1eLhAx1og"
            />
          </div>
          <div className="hidden md:flex items-center gap-6 ml-4">
            <a className="text-yellow-700 dark:text-yellow-300 font-bold border-b-2 border-yellow-500 font-label" href="#">
              Khám phá
            </a>
            <a className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-label transition-colors" href="#">
              Trải nghiệm
            </a>
            <a className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-label transition-colors" href="#">
              Chủ nhà
            </a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-label px-4 py-2 transition-colors">
            Đăng ký chủ nhà
          </button>
          <button className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-bold transition-all hover:opacity-90 active:scale-[0.99] sunlight-gradient">
            Đăng nhập
          </button>
        </div>
      </div>
    </nav>
  );
}
