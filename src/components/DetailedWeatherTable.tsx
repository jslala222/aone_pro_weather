// Path: src/components/DetailedWeatherTable.tsx
// Description: 웨더아이 스타일의 전용 상세 예보 테이블 (에이원프로 웨더 통합 대응 버전)

'use client';

import { Sun, Cloud, CloudRain, Wind, Moon } from 'lucide-react';

interface WeatherRow {
  time: string;
  status: string;
  temp: string;
  feelsLike?: string; // [NEW]
  rain: string;
  wind: string;
  humidity?: string;
  golfIndex?: string;
  date?: string;
}

interface DetailedTableProps {
  data: WeatherRow[];
  sunriseSunset: string[];
  title?: string;
  compact?: boolean;
}

export default function DetailedWeatherTable({ data, sunriseSunset, title = "기상 관제 상세 테이블", compact = false }: DetailedTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full p-10 text-center text-slate-500 font-bold bg-[var(--card-bg)] rounded-3xl border border-[var(--card-border)]">
        날씨 상세 정보를 불러올 수 없습니다.
      </div>
    );
  }

  // 기온 데이터만 추출하여 그래프용으로 가공
  const temps = data.map(d => {
    const n = Number(d.temp);
    return isNaN(n) ? 0 : n;
  });
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const tempRange = (maxTemp - minTemp) || 1;

  // 그래프 좌표 계산 (0 ~ 100% 범위)
  const getPointY = (temp: number) => {
    const t = isNaN(temp) ? 0 : temp;
    // 상하 여백 확보 (15~85% 사이로 조정하여 더 다이내믹한 곡선 표현)
    return 85 - ((t - minTemp) / tempRange) * 70;
  };

  return (
    <div className="w-full bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--card-border)] rounded-3xl overflow-hidden shadow-2xl">
      <div className="p-5 border-b border-[var(--card-border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            <span className="text-xs font-black text-[var(--foreground)] tracking-tight uppercase">{title}</span>
        </div>
        <div className="flex items-center gap-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><Sun className="w-3 h-3 text-orange-400" /> 일출 {sunriseSunset[0] || '06:00'}</span>
            <span className="flex items-center gap-1.5"><Moon className="w-3 h-3 text-blue-400" /> 일몰 {sunriseSunset[1] || '19:00'}</span>
        </div>
      </div>

      <div className="overflow-x-auto no-scrollbar scroll-smooth">
        <div className="min-w-[max(1100px,200%)] relative pb-4">
          <table className="w-full border-collapse">
            <thead>
              {/* 날짜 분기 헤더 */}
              <tr className="bg-white/5 border-b border-[var(--card-border)]">
                <th className="py-2.5 px-1 text-[10px] w-20 sticky left-0 bg-[var(--background)] z-20 border-r border-[var(--card-border)] text-slate-500 font-black uppercase tracking-tighter shadow-xl">날짜</th>
                {(() => {
                  const groups: { date: string; count: number }[] = [];
                  data.forEach((item) => {
                    const d = item.date || '오늘';
                    if (groups.length > 0 && groups[groups.length - 1].date === d) {
                      groups[groups.length - 1].count++;
                    } else {
                      groups.push({ date: d, count: 1 });
                    }
                  });
                  return groups.map((g, i) => (
                    <th key={i} colSpan={g.count} className="py-2.5 text-[11px] font-black text-emerald-500 border-r border-white/5 px-2 tracking-widest">
                      {g.date}
                    </th>
                  ));
                })()}
              </tr>
              {/* 시간 헤더 */}
              <tr className="border-b border-[var(--card-border)] bg-white/5">
                <th className="py-3 px-1 text-center w-20 sticky left-0 bg-[var(--background)] z-20 border-r border-[var(--card-border)] text-[10px] font-black text-slate-500 uppercase tracking-tighter shadow-xl">시간</th>
                {data.map((item, i) => (
                  <th key={i} className="py-3 px-2 min-w-[70px] text-center border-r border-white/5">
                    <div className="text-[11px] font-black text-[var(--foreground)]">{item.time}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* 날씨 상태 */}
              <tr className="border-b border-[var(--card-border)]">
                <td className="py-5 px-1 text-[10px] font-black text-slate-500 sticky left-0 bg-[var(--background)] z-20 border-r border-[var(--card-border)] text-center shadow-xl uppercase">날씨</td>
                {data.map((item, i) => (
                  <td key={i} className="text-center py-5">
                    <div className="flex flex-col items-center gap-1.5 animate-in fade-in zoom-in-50 duration-500">
                        {item.status.includes('비') || item.status.includes('소나기') ? (
                            <CloudRain className="text-blue-500 w-8 h-8 drop-shadow-[0_4px_12px_rgba(59,130,246,0.6)]" fill="currentColor" fillOpacity="0.2" />
                        ) : item.status.includes('구름많음') || item.status.includes('흐림') ? (
                            <Cloud className="text-slate-400 w-8 h-8 drop-shadow-[0_4px_8px_rgba(148,163,184,0.4)]" fill="currentColor" fillOpacity="0.2" />
                        ) : item.status.includes('구름조금') ? (
                            <div className="relative">
                                <Sun className="text-yellow-400 w-8 h-8 drop-shadow-[0_4px_12px_rgba(250,204,21,0.5)]" />
                                <Cloud className="text-slate-300 w-5 h-5 absolute -bottom-1 -right-1" fill="currentColor" />
                            </div>
                        ) : (
                            <Sun className="text-yellow-500 w-8 h-8 drop-shadow-[0_10px_20px_rgba(234,179,8,0.5)]" fill="currentColor" fillOpacity="0.2" />
                        )}
                        <span className="text-[10px] font-black text-[var(--foreground)] mt-1">{item.status}</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* 기온 트렌드 그래프 (SVG) */}
              <tr className="border-b border-[var(--card-border)] relative h-24 bg-gradient-to-b from-transparent to-white/5">
                <td className="py-4 px-1 text-[10px] font-black text-slate-500 sticky left-0 bg-[var(--background)] z-20 border-r border-[var(--card-border)] text-center shadow-xl uppercase">기온(°C)</td>
                <td colSpan={data.length} className="p-0 relative h-full">
                  <div className="absolute inset-0 flex items-center pointer-events-none">
                    <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${data.length * 100} 100`} preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="tempGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#ef4444" />
                          <stop offset="50%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                        <filter id="glow">
                          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      <path
                        d={data.map((item, i) => {
                          const x = (i * 100) + 50;
                          const y = getPointY(Number(item.temp));
                          return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="url(#tempGradient)"
                        strokeWidth="4"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        filter="url(#glow)"
                      />
                    </svg>
                  </div>
                  {/* 기온 숫자 정보 - Grid처럼 정확히 칸마다 배치 */}
                  <div className="absolute inset-0 flex pointer-events-none">
                    {data.map((item, i) => {
                        const y = getPointY(Number(item.temp));
                        const val = Number(item.temp);
                        return (
                            <div key={i} className="flex-1 relative">
                                {/* 기온 점 */}
                                <div 
                                    className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full border-2 border-[var(--background)] shadow-md z-20 ${
                                        val >= 25 ? 'bg-orange-500' : val <= 10 ? 'bg-blue-500' : 'bg-emerald-500'
                                    }`}
                                    style={{ top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                                />
                                {/* 기온 텍스트 */}
                                <span 
                                    className={`absolute left-1/2 -translate-x-1/2 text-[13px] font-black tracking-tighter drop-shadow-md z-30 ${
                                        val >= 25 ? 'text-orange-500' : val <= 10 ? 'text-blue-500' : 'text-slate-800 dark:text-slate-100'
                                    }`}
                                    style={{ top: `${y - 25}%` }}
                                >
                                    {item.temp}°
                                </span>
                            </div>
                        );
                    })}
                  </div>
                </td>
              </tr>

              {/* 강수량 */}
              <tr className="border-b border-[var(--card-border)] bg-white/2">
                <td className="py-4 px-1 text-[10px] font-black text-slate-500 sticky left-0 bg-[var(--background)] z-20 border-r border-[var(--card-border)] text-center shadow-xl uppercase">강수량(mm)</td>
                {data.map((item, i) => (
                  <td key={i} className="text-center py-4">
                    <div className="flex flex-col items-center gap-1">
                        <span className={`text-sm font-black ${Number(item.rain.replace('%', '').replace('mm', '')) > 0 ? 'text-blue-500' : 'text-slate-400'}`}>
                          {item.rain === '0' || item.rain === '0mm' ? '-' : item.rain}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">강수량</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* 풍속 */}
              <tr className="border-b border-[var(--card-border)] bg-white/5">
                <td className="py-4 px-1 text-[10px] font-black text-slate-500 sticky left-0 bg-[var(--background)] z-20 border-r border-[var(--card-border)] text-center shadow-xl uppercase">풍속(m/s)</td>
                {data.map((item, i) => (
                   <td key={i} className="text-center py-4">
                     <div className="flex flex-col items-center gap-1">
                        <Wind className={`w-5 h-5 mb-1 ${Number(item.wind) > 5 ? 'text-red-500 animate-bounce' : Number(item.wind) > 3 ? 'text-orange-500' : 'text-emerald-500 font-bold'}`} />
                        <span className="text-[11px] font-black text-[var(--foreground)] tracking-tighter">{item.wind}<span className="text-[8px] ml-0.5 opacity-50">m/s</span></span>
                     </div>
                   </td>
                ))}
              </tr>

              {/* 습도 [NEW] */}
              {data.some(d => d.humidity) && (
                <tr className="border-b border-[var(--card-border)] bg-white/2">
                  <td className="py-4 px-1 text-[10px] font-black text-slate-500 sticky left-0 bg-[var(--background)] z-20 border-r border-[var(--card-border)] text-center shadow-xl uppercase">습도(%)</td>
                  {data.map((item, i) => (
                    <td key={i} className="text-center py-4">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-10 h-1.5 bg-black/40 rounded-full relative overflow-hidden backdrop-blur-sm">
                          <div className="absolute top-0 left-0 h-full bg-cyan-500 transition-all duration-1000" style={{ width: `${item.humidity}%` }}></div>
                        </div>
                        <span className="text-[10px] font-black text-cyan-500">{item.humidity}%</span>
                      </div>
                    </td>
                  ))}
                </tr>
              )}

              {/* 골프지수 [맨 아래로 이동] */}
              {data.some(d => d.golfIndex) && (
                <tr className="bg-emerald-500/10">
                  <td className="py-5 px-1 text-[10px] font-black text-emerald-600 sticky left-0 bg-[var(--background)] z-20 border-r border-[var(--card-border)] text-center shadow-xl">골프지수</td>
                  {data.map((item, i) => {
                    const val = Number(item.golfIndex);
                    if (!item.golfIndex) return <td key={i} className="text-center py-4 text-slate-700">-</td>;
                    const color = val >= 9 ? 'bg-[#00ff22] text-black shadow-[0_0_20px_rgba(0,255,0,0.5)]' : 
                                  val >= 7 ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 
                                  val >= 5 ? 'bg-yellow-400 text-black' : 'bg-red-500 text-white';
                    return (
                      <td key={i} className="text-center py-4">
                        <div className={`mx-auto w-10 h-10 rounded-xl flex flex-col items-center justify-center transition-all hover:scale-125 hover:z-30 cursor-help ${color}`}>
                          <span className="text-xs font-black leading-none">{item.golfIndex}</span>
                          <span className="text-[7px] font-bold mt-0.5 opacity-60 uppercase">pts</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-4 bg-[var(--background)]/50 border-t border-[var(--card-border)] flex flex-wrap gap-4 text-[9px] font-black text-slate-500 uppercase tracking-widest items-center">
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#00ff00] shadow-[0_0_8px_rgba(0,255,0,0.4)]"></div> 최상</div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]"></div> 좋음</div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div> 보통</div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> 나쁨</div>
        <div className="ml-auto italic opacity-40">에이원프로 기상 관제 시스템 실시간 모니터링</div>
      </div>
    </div>
  );
}
