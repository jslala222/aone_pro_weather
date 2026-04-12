// Path: src/app/page.tsx
// Description: 에이원프로 웨더 메인 대시보드 - 프리미엄 통합 날씨 정보

'use client';

import { useState } from 'react';
import GolfWeatherMobile from '@/components/GolfWeatherMobile';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'monitor' | 'analysis' | 'system'>('monitor');

  return (
    <main className="min-h-screen bg-[var(--background)] flex flex-col pt-4 overflow-hidden">
      {/* 고정 브랜드 헤더 (선택 사항) */}
      {/* 고정 브랜드 헤더 (선택 사항) */}
      <div className="px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-black font-black text-xs italic">A1</span>
          </div>
          <span className="text-sm font-black text-[var(--foreground)] tracking-tighter uppercase">A-ONE Pro <span className="text-emerald-500">Weather</span></span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">실시간 관제</span>
        </div>
      </div>

      {/* 날씨 통합 모듈 (검색 + 상세 예보 포함) */}
      <div className="flex-1 w-full max-w-lg mx-auto overflow-y-auto pb-32">
        <GolfWeatherMobile activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* 하단 퀵 내비게이션 (데스크톱/모바일 앱 느낌용) */}
      <nav className="fixed bottom-0 left-0 right-0 p-4 pb-8 bg-[var(--background)]/80 backdrop-blur-xl border-t border-[var(--card-border)] z-[200]">
        <div className="max-w-md mx-auto flex items-center justify-around">
          <button 
            onClick={() => setActiveTab('monitor')}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'monitor' ? 'scale-110' : 'opacity-40'}`}
          >
             <div className={`p-2.5 rounded-2xl shadow-lg transition-all ${activeTab === 'monitor' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-white/5'}`}>
                <svg className={`w-5 h-5 ${activeTab === 'monitor' ? 'text-black' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
             </div>
             <span className={`text-[10px] font-black ${activeTab === 'monitor' ? 'text-emerald-500' : 'text-slate-500'}`}>기상 관제</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('analysis')}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'analysis' ? 'scale-110' : 'opacity-40'}`}
          >
             <div className={`p-2.5 rounded-2xl shadow-lg transition-all ${activeTab === 'analysis' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-white/5'}`}>
                <svg className={`w-5 h-5 ${activeTab === 'analysis' ? 'text-black' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
             </div>
             <span className={`text-[10px] font-black ${activeTab === 'analysis' ? 'text-emerald-500' : 'text-slate-500'}`}>정밀 분석</span>
          </button>

          <button 
            onClick={() => setActiveTab('system')}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'system' ? 'scale-110' : 'opacity-40'}`}
          >
             <div className={`p-2.5 rounded-2xl shadow-lg transition-all ${activeTab === 'system' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-white/5'}`}>
                <svg className={`w-5 h-5 ${activeTab === 'system' ? 'text-black' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
             </div>
             <span className={`text-[10px] font-black ${activeTab === 'system' ? 'text-emerald-500' : 'text-slate-500'}`}>설정</span>
          </button>
        </div>
      </nav>
    </main>
  );
}
