// Path: src/components/WeatheriAnalysisView.tsx
// Description: 웨더아이 공식 홈페이지의 '정밀분석' 데이터를 그대로 재현한 레이아웃

'use client';

import React from 'react';
import { ChevronRight, Sun, Cloud, CloudRain, CloudLightning, Snowflake, Minus } from 'lucide-react';

interface WeatherItem {
  time: string;
  date?: string;
  status: string;
  temp: string;
  golfIndex?: string;
  rain: string;
  wind: string;
}

interface LivingIndexItem {
  label: string;
  value: string;
  descText: string;
}

interface WeeklyItem {
  date: string;
  golfIndex: string;
  status: string;
  tempLow: string;
  tempHigh: string;
  sunriseSunset: string;
}

interface AnalysisProps {
  locationName: string;
  hourlyData: WeatherItem[];
  weeklyData: WeeklyItem[];
  livingIndices?: LivingIndexItem[];
  sunriseSunset: string[];
}

const getWeatherIcon = (status: string) => {
  if (status.includes('맑음')) return <Sun className="w-5 h-5 text-orange-400 fill-current" />;
  if (status.includes('구름많음') || status.includes('흐림')) return <Cloud className="w-5 h-5 text-slate-400 fill-current" />;
  if (status.includes('비')) return <CloudRain className="w-5 h-5 text-blue-400" />;
  if (status.includes('뇌우')) return <CloudLightning className="w-5 h-5 text-yellow-500" />;
  if (status.includes('눈')) return <Snowflake className="w-5 h-5 text-blue-200" />;
  return <Minus className="w-4 h-4 text-slate-300" />;
};

const getLivingIndexColor = (value: string) => {
  const val = parseInt(value);
  if (val >= 80) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (val >= 60) return 'bg-blue-100 text-blue-700 border-blue-200';
  if (val >= 40) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  return 'bg-orange-100 text-orange-700 border-orange-200';
};

export default function WeatheriAnalysisView({ locationName, hourlyData, weeklyData, livingIndices = [], sunriseSunset }: AnalysisProps) {
  // 날짜 그룹화 (상세예보 헤더용)
  const dateGroups: { date: string; count: number }[] = [];
  if (hourlyData.length > 0) {
    hourlyData.forEach((item) => {
      const d = item.date || '오늘';
      if (dateGroups.length > 0 && dateGroups[dateGroups.length - 1].date === d) {
        dateGroups[dateGroups.length - 1].count++;
      } else {
        dateGroups.push({ date: d, count: 1 });
      }
    });
  }

  // 기온 그래프 데이터
  const temps = hourlyData.map(d => Number(d.temp) || 0);
  const minTemp = temps.length > 0 ? Math.min(...temps) : 0;
  const maxTemp = temps.length > 0 ? Math.max(...temps) : 0;
  const range = (maxTemp - minTemp) || 2;
  const getTop = (t: number) => 70 - ((t - minTemp) / range) * 50;

  // 지역 검색 여부 (주간 예보가 비어있고 생활 지수가 있는 경우)
  const isRegion = weeklyData.length === 0 && livingIndices.length > 0;

  return (
    <div className="w-full bg-white text-slate-800 font-sans p-2 select-none">
      {/* 1. 상세예보 타이틀 */}
      <div className="flex items-center gap-2 mb-3 mt-4">
        <div className="bg-[#0070bc] p-0.5 rounded-sm shadow-sm">
           <ChevronRight className="w-4 h-4 text-white font-bold" />
        </div>
        <span className="text-lg font-bold text-[#333] tracking-tighter">상세예보</span>
        <span className="text-sm md:text-base font-bold text-slate-400">{locationName}</span>
      </div>

      {/* 2. 상세예보 테이블 */}
      <div className="overflow-x-auto no-scrollbar border-t-2 border-[#0070bc] shadow-sm rounded-t-sm">
        <table className="min-w-[1200px] w-full border-collapse border border-[#d1dce7] text-center text-xs">
          <thead>
            <tr className="bg-[#eff5f9] h-11">
              <th className="border border-[#d1dce7] w-24 font-bold text-[#004b93]">날짜</th>
              {dateGroups.map((g, i) => (
                <th key={i} colSpan={g.count} className="border border-[#d1dce7] font-bold text-[#004b93] px-2 bg-[#f8fbfe]">
                  {g.date}
                </th>
              ))}
            </tr>
            <tr className="bg-white h-10">
              <th className="border border-[#d1dce7] bg-[#eff5f9] font-bold text-[#004b93]">시간</th>
              {hourlyData.map((item, i) => (
                <td key={i} className="border border-[#d1dce7] text-[#333] font-bold whitespace-nowrap">{item.time.replace('시', '')}</td>
              ))}
            </tr>
          </thead>
          <tbody>
            {!isRegion && (
              <tr className="h-10">
                <td className="border border-[#d1dce7] bg-[#eff5f9] font-bold text-[#004b93]">골프지수</td>
                {hourlyData.map((item, i) => {
                  const val = Number(item.golfIndex);
                  const bgColor = val >= 9 ? '#00ff00' : val >= 7 ? '#99ff33' : val >= 5 ? '#ffff00' : '#ff9900';
                  return <td key={i} className="border border-[#d1dce7] font-bold text-[13px]" style={{ backgroundColor: bgColor }}>{item.golfIndex || '-'}</td>
                })}
              </tr>
            )}
            <tr className="h-14">
              <td className="border border-[#d1dce7] bg-[#eff5f9] font-bold text-[#004b93]">날씨</td>
              {hourlyData.map((item, i) => (
                <td key={i} className="border border-[#d1dce7] px-1">
                  <div className="flex flex-col items-center justify-center gap-1">
                    {getWeatherIcon(item.status)}
                    <span className="text-[9px] font-bold text-slate-500 whitespace-nowrap">{item.status}</span>
                  </div>
                </td>
              ))}
            </tr>
            <tr className="h-36">
              <td className="border border-[#d1dce7] bg-[#eff5f9] font-bold text-[#004b93] relative">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap text-[10px] text-slate-400 font-black">기온 (°C)</div>
              </td>
              <td colSpan={hourlyData.length} className="border border-[#d1dce7] p-0 relative bg-white">
                 <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none opacity-20">
                    <div className="h-full flex flex-col justify-between">
                       {[...Array(5)].map((_, i) => <div key={i} className="w-full border-t border-slate-200" />)}
                    </div>
                 </div>
                 <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none">
                    <svg className="w-full h-full" viewBox={`0 0 ${hourlyData.length * 100} 100`} preserveAspectRatio="none">
                       <path 
                          d={hourlyData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${i * 100 + 50} ${getTop(Number(d.temp))}`).join(' ')}
                          fill="none" stroke="#2c89f2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                       />
                       {hourlyData.map((d, i) => (
                          <circle key={i} cx={i * 100 + 50} cy={getTop(Number(d.temp))} r="4" fill="white" stroke="#2c89f2" strokeWidth="2" />
                       ))}
                    </svg>
                 </div>
                 <div className="flex h-full items-start">
                    {hourlyData.map((item, i) => (
                       <div key={i} className="flex-1 relative h-full">
                          <span className="absolute left-1/2 -translate-x-1/2 font-black text-[#2c89f2] text-sm" style={{ top: `${getTop(Number(item.temp)) - 30}%` }}>{item.temp}</span>
                       </div>
                    ))}
                 </div>
              </td>
            </tr>
            {!isRegion && (
              <tr className="h-10">
                <td className="border border-[#d1dce7] bg-[#eff5f9] font-bold text-[#004b93]">최고최저</td>
                {dateGroups.map((g, i) => {
                  const dayMatch = weeklyData.find(w => w.date.includes(g.date.split('(')[0]));
                  return (
                    <td key={i} colSpan={g.count} className="border border-[#d1dce7] text-[#004b93] font-bold whitespace-nowrap">
                      <span className="text-blue-500">{dayMatch?.tempLow || '-'}</span>
                      <span className="mx-1 text-slate-300">/</span>
                      <span className="text-red-500">{dayMatch?.tempHigh || '-'}</span>
                    </td>
                  );
                })}
              </tr>
            )}
            <tr className="h-10">
              <td className="border border-[#d1dce7] bg-[#eff5f9] font-bold text-[#004b93]">강수량</td>
              {hourlyData.map((item, i) => (
                <td key={i} className="border border-[#d1dce7] text-blue-600 font-bold">{item.rain !== '0' && item.rain !== '0.0' ? item.rain : ''}</td>
              ))}
            </tr>
            <tr className="h-10">
              <td className="border border-[#d1dce7] bg-[#eff5f9] font-bold text-[#004b93]">풍속</td>
              {hourlyData.map((item, i) => (
                <td key={i} className="border border-[#d1dce7] text-slate-600 font-medium">{item.wind}</td>
              ))}
            </tr>
            {!isRegion && (
              <tr className="h-10">
                <td className="border border-[#d1dce7] bg-[#eff5f9] font-bold text-[#004b93]">일출일몰</td>
                {dateGroups.map((g, i) => {
                  const dayMatch = weeklyData.find(w => w.date.includes(g.date.split('(')[0]));
                  return (
                    <td key={i} colSpan={g.count} className="border border-[#d1dce7] text-[#ff4400] font-bold text-[10px] whitespace-nowrap">
                      {dayMatch?.sunriseSunset || (sunriseSunset[0] ? `${sunriseSunset[0]}/${sunriseSunset[1]}` : '-')}
                    </td>
                  );
                })}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 3. 섹션 타이틀 (조건부) */}
      <div className="flex items-center gap-2 mb-4 mt-10">
        <div className="bg-[#0070bc] p-0.5 rounded-sm shadow-sm">
           <ChevronRight className="w-4 h-4 text-white font-bold" />
        </div>
        <span className="text-lg font-bold text-[#333] tracking-tighter">
           {isRegion ? '생활기상지수 (Analysis)' : '주간예보 (Weekly)'}
        </span>
        <span className="text-base font-bold text-slate-400">{locationName}</span>
      </div>

      {/* 4. 주간예보 vs 생활지수 (조건부) */}
      {isRegion ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {livingIndices.map((idx, i) => (
            <div key={i} className="bg-white border-y border-x border-slate-200 rounded-lg overflow-hidden shadow-sm flex flex-col">
              <div className="bg-[#eff5f9] px-3 py-2 flex justify-between items-center border-b border-slate-200">
                <span className="text-[13px] font-bold text-[#004b93]">{idx.label}</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full border font-bold ${getLivingIndexColor(idx.value)}`}>
                  {idx.value}
                </span>
              </div>
              <div className="p-3 flex-1">
                <p className="text-[11px] leading-relaxed text-slate-500 font-medium">
                  {idx.descText}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto no-scrollbar border-t-2 border-[#0070bc] shadow-sm rounded-t-sm">
          <table className="w-full border-collapse border border-[#d1dce7] text-center text-xs">
            <thead>
              <tr className="bg-[#eff5f9] h-10">
                <th className="border border-[#d1dce7] font-bold text-[#004b93] w-24">날짜</th>
                {weeklyData.map((item, i) => (
                  <th key={i} className="border border-[#d1dce7] font-bold text-[#004b93] px-2 whitespace-nowrap">{item.date}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="h-10">
                <td className="border border-[#d1dce7] bg-[#eff5f9] font-bold text-[#004b93]">골프지수</td>
                {weeklyData.map((item, i) => {
                  const val = Number(item.golfIndex);
                  const bgColor = val >= 9 ? '#00ff00' : val >= 7 ? '#99ff33' : val >= 5 ? '#ffff00' : '#ff9900';
                  return <td key={i} className="border border-[#d1dce7] font-bold text-[13px]" style={{ backgroundColor: bgColor }}>{item.golfIndex}</td>
                })}
              </tr>
              <tr className="h-20">
                <td className="border border-[#d1dce7] bg-[#eff5f9] font-bold text-[#004b93]">날씨</td>
                {weeklyData.map((item, i) => (
                  <td key={i} className="border border-[#d1dce7]">
                    <div className="flex flex-col items-center gap-1.5 p-1">
                      {getWeatherIcon(item.status)}
                      <span className="text-[9px] font-bold text-slate-500">{item.status}</span>
                    </div>
                  </td>
                ))}
              </tr>
              <tr className="h-10">
                <td className="border border-[#d1dce7] bg-[#eff5f9] font-bold text-[#004b93]">최저/최고기온</td>
                {weeklyData.map((item, i) => (
                  <td key={i} className="border border-[#d1dce7] text-[#004b93] font-bold whitespace-nowrap text-[11px]">
                    <span className="text-blue-500">{item.tempLow}</span>
                    <span className="mx-0.5 text-slate-300">/</span>
                    <span className="text-red-500">{item.tempHigh}</span>
                  </td>
                ))}
              </tr>
              <tr className="h-10">
                <td className="border border-[#d1dce7] bg-[#eff5f9] font-bold text-[#004b93]">일출일몰</td>
                {weeklyData.map((item, i) => (
                  <td key={i} className="border border-[#d1dce7] text-[#ff4400] font-bold text-[10px] whitespace-nowrap">{item.sunriseSunset}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* 5. 하단 범례 */}
      <div className="mt-8 flex flex-col items-center gap-3 py-4 border-t border-slate-100">
        <div className="flex w-full max-w-[500px] h-7 border border-slate-200 rounded-sm overflow-hidden shadow-inner">
          <div className="flex-[1] bg-[#ff0000] flex items-center justify-center text-[10px] font-black text-white">경보</div>
          <div className="flex-[1.5] bg-[#ff6600] flex items-center justify-center text-[10px] font-black text-white">경계</div>
          <div className="flex-[2] bg-[#ffff00] flex items-center justify-center text-[10px] font-black text-slate-700">유의</div>
          <div className="flex-[2.5] bg-[#ccff66] flex items-center justify-center text-[10px] font-black text-slate-700">안전</div>
          <div className="flex-[3] bg-[#00ff00] flex items-center justify-center text-[10px] font-black text-slate-700">쾌적</div>
        </div>
        <div className="flex w-full max-w-[500px] justify-between px-1 text-[11px] font-black text-slate-300 tracking-tighter">
           <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span><span>10</span>
        </div>
      </div>
    </div>
  );
}
