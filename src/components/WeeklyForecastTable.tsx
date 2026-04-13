// Path: src/components/WeeklyForecastTable.tsx
// Description: 웨더아이 스타일의 주간 예보 테이블 (한 행에 하루 데이터 표시)

'use client';

import { Sun, Cloud, CloudRain, Wind, Moon, Activity } from 'lucide-react';

interface WeeklyForecast {
  date: string;
  golfIndex: string;
  status: string;
  tempLow: string;
  tempHigh: string;
  sunriseSunset: string;
}

interface WeeklyTableProps {
  data: WeeklyForecast[];
  sunriseSunset: string[];
}

export default function WeeklyForecastTable({ data, sunriseSunset }: WeeklyTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full p-10 text-center text-slate-500 font-bold bg-[var(--card-bg)] rounded-3xl border border-[var(--card-border)]">
        주간 예보 정보를 불러올 수 없습니다.
      </div>
    );
  }

  return (
    <div className="w-full bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--card-border)] rounded-3xl overflow-hidden shadow-2xl">
      <div className="p-5 border-b border-[var(--card-border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            <span className="text-xs font-black text-[var(--foreground)] tracking-tight uppercase">주간 기상 통계 (8일 예보)</span>
        </div>
      </div>

      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-[var(--card-border)]">
              <th className="py-4 px-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">날짜</th>
              <th className="py-4 px-2 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">지수</th>
              <th className="py-4 px-2 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">날씨</th>
              <th className="py-4 px-2 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">최저 / 최고</th>
              <th className="py-4 px-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">일출 / 일몰</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, i) => (
              <tr key={i} className="border-b border-[var(--card-border)] hover:bg-emerald-500/5 transition-colors group">
                <td className="py-5 px-4">
                  <div className="text-sm font-black text-[var(--foreground)] whitespace-nowrap">{item.date}</div>
                </td>
                <td className="py-5 px-2 text-center">
                  <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-black shadow-sm ${
                    Number(item.golfIndex) >= 8 ? 'bg-emerald-500 text-white' : 
                    Number(item.golfIndex) >= 5 ? 'bg-yellow-400 text-black' : 'bg-red-500 text-white'
                  }`}>
                    {item.golfIndex}
                  </div>
                </td>
                <td className="py-5 px-2">
                  <div className="flex flex-col items-center gap-1">
                    {item.status.includes('비') ? (
                      <CloudRain className="w-5 h-5 text-blue-500" />
                    ) : item.status.includes('구름') || item.status.includes('흐림') ? (
                      <Cloud className="w-5 h-5 text-slate-400" />
                    ) : (
                      <Sun className="w-5 h-5 text-yellow-500" />
                    )}
                    <span className="text-[10px] font-bold text-slate-500">{item.status}</span>
                  </div>
                </td>
                <td className="py-5 px-2 text-center">
                  <div className="flex items-center justify-center gap-2 whitespace-nowrap text-sm font-black">
                    <span className="text-blue-500">{item.tempLow}°</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-orange-500">{item.tempHigh}°</span>
                  </div>
                </td>
                <td className="py-5 px-4 text-right">
                  <div className="text-[11px] font-bold text-slate-400 whitespace-nowrap">
                    {item.sunriseSunset || '- / -'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-slate-50/50 flex items-center justify-between text-[10px] font-bold text-slate-400">
         <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span>기상청 및 웨더아이 데이터 교차 검증</span>
         </div>
         <div className="italic opacity-50">v2.0 Analytical Engine</div>
      </div>
    </div>
  );
}
