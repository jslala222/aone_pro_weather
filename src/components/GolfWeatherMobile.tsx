// Path: src/components/GolfWeatherMobile.tsx
// Description: 통합 검색 및 다중 날씨 소스(골프장/지역/좌표)를 지원하는 프리미엄 날씨 대시보드

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sun, Moon, Cloud, CloudRain, Wind, MapPin, Navigation, Search, Star, X, Loader2, LocateFixed, Droplets, Activity } from 'lucide-react';
import DetailedWeatherTable from './DetailedWeatherTable';

interface WeatherItem {
  time: string;
  date?: string;
  status: string;
  temp: string;
  feelsLike?: string;
  rain: string;
  wind: string;
  humidity?: string;
  golfIndex?: string;
}

interface DetailedData {
    locationName: string;
    forecasts: WeatherItem[];
    sunriseSunset: string[];
}

interface SearchResult {
  type: 'golf' | 'region' | 'address';
  name: string;
  id: string;
  region: string;
  lat?: number;
  lon?: number;
}

export default function GolfWeatherMobile({ 
  activeTab = 'monitor', 
  setActiveTab = () => {},
  initialGid,
  initialName
}: { 
  activeTab?: 'monitor' | 'analysis' | 'system',
  setActiveTab?: (tab: 'monitor' | 'analysis' | 'system') => void,
  initialGid?: string,
  initialName?: string
}) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<SearchResult | null>(null);
  const [weatherData, setWeatherData] = useState<DetailedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [favorites, setFavorites] = useState<SearchResult[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTab, setSearchTab] = useState<'all' | 'golf' | 'region'>('all');
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{title: string, message: string}>({ title: '', message: '' });

  // 초기 데이터 로드 (즐겨찾기 + 마지막 검색 위치)
  useEffect(() => {
    const savedFavs = localStorage.getItem('aone_fav_locations');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));

    const lastLoc = localStorage.getItem('aone_last_location');
    
    // GID가 Props로 넘어온 경우 (상세 페이지 접근) 우선 처리
    if (initialGid) {
      const loc: SearchResult = { type: 'golf', name: initialName || '골프장', id: initialGid, region: '상세' };
      setSelectedLocation(loc);
      fetchWeather(loc);
    } else if (lastLoc) {
      const parsed = JSON.parse(lastLoc);
      setSelectedLocation(parsed);
      fetchWeather(parsed);
    } else {
      // 기본값: 안양CC
      const defaultLoc: SearchResult = { type: 'golf', name: '안양CC', id: 'LS04022100', region: '경기' };
      setSelectedLocation(defaultLoc);
      fetchWeather(defaultLoc);
    }
  }, [initialGid, initialName]);

  // 날씨 데이터 가져오기
  const fetchWeather = async (loc: SearchResult) => {
    setLoading(true);
    try {
      let url = '';
      if (loc.type === 'golf') url = `/api/weather?type=golf&gid=${loc.id}`;
      else if (loc.type === 'region') url = `/api/weather?type=region&rid=${loc.id}&name=${loc.name}`;
      else if (loc.type === 'address' && loc.lat && loc.lon) url = `/api/weather?type=address&lat=${loc.lat}&lon=${loc.lon}&name=${loc.name}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data && data.forecasts) {
        setWeatherData(data);
        localStorage.setItem('aone_last_location', JSON.stringify(loc));
      }
    } catch (err) {
      console.error('Weather Fetch Error:', err);
    } finally {
      setLoading(false);
      setIsSearchOpen(false);
    }
  };

  // 검색 실행
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setSearching(true);
        try {
          const res = await fetch(`/api/weather?type=search&q=${encodeURIComponent(query)}&tab=${searchTab}`);
          const data = await res.json();
          setSearchResults(data.results || []);
        } catch (err) {
          console.error('Search Error:', err);
        } finally {
          setSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, searchTab]);

  // 즐겨찾기 토글
  const toggleFavorite = (loc: SearchResult) => {
    let newFavs;
    if (favorites.some(f => f.id === loc.id)) {
      newFavs = favorites.filter(f => f.id !== loc.id);
    } else {
      // 최대 9개 제한 및 중복 방지
      if (favorites.length >= 9) {
        setAlertConfig({
          title: "즐겨찾기 한도 초과",
          message: "즐겨찾기는 최대 9개까지만 등록 가능합니다.\n기존 장소를 삭제하고 다시 시도해주세요."
        });
        setIsAlertOpen(true);
        return;
      }
      newFavs = [...favorites, loc];
    }
    setFavorites(newFavs);
    localStorage.setItem('aone_fav_locations', JSON.stringify(newFavs));
  };

  // 현재 위치 기반 검색
  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const loc: SearchResult = { type: 'address', name: '내 주변', id: 'current', lat: latitude, lon: longitude, region: '현재 위치' };
        setSelectedLocation(loc);
        fetchWeather(loc);
      },
      () => {
        alert('위치 정보를 가져올 수 없습니다.');
        setLoading(false);
      }
    );
  };

  return (
    <div className={`w-full min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-24 ${isSearchOpen ? 'overflow-hidden h-screen' : ''}`}>
      {/* [MONITOR 헤더] - 모니터 탭에서만 상시 노출 */}
      {!isSearchOpen && activeTab === 'monitor' && (
        <div className="sticky top-0 z-50 p-4 bg-[var(--background)]/90 backdrop-blur-xl border-b border-[var(--card-border)] shadow-sm">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Activity className="w-6 h-6 text-emerald-500 animate-pulse" />
              <div className="flex flex-col -space-y-1">
                <h2 className="text-xl font-black text-[var(--foreground)] tracking-tighter italic">AIR-VIEW</h2>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">기상 관제 데스크</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="hidden xs:flex gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                실시간 관측 중
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 독립형 전체화면 검색 모달 (z-index 최상위) */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-[var(--background)] z-[9999] animate-in fade-in zoom-in-95 duration-200 flex flex-col overflow-hidden">
          {/* 모달 헤더 (검색 컨트롤) */}
          <div className="p-4 border-b border-[var(--card-border)] space-y-4 bg-[var(--background)] shadow-md">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">장소 검색</h3>
              <button 
                onClick={() => { setIsSearchOpen(false); setQuery(''); }} 
                className="p-3 bg-slate-100 hover:bg-slate-200 rounded-full transition-all active:scale-90"
              >
                <X className="w-6 h-6 text-slate-600" />
              </button>
            </div>

            {/* 내부 탭 */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
              {[
                { id: 'all', label: '전체', icon: <Search className="w-3.5 h-3.5" /> },
                { id: 'golf', label: '골프장', icon: <Navigation className="w-3.5 h-3.5" /> },
                { id: 'region', label: '지역', icon: <MapPin className="w-3.5 h-3.5" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSearchTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-black transition-all ${
                    searchTab === tab.id 
                    ? 'bg-emerald-500 text-white shadow-lg' 
                    : 'text-slate-500'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 내부 입력창 */}
            <div className="relative">
              <input
                autoFocus
                type="text"
                placeholder="어디의 날씨가 궁금하신가요?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-[var(--background)] border-2 border-[var(--card-border)] rounded-full py-5 pl-16 pr-14 text-base font-black text-[var(--foreground)] focus:border-emerald-500 outline-none transition-all shadow-inner"
              />
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-emerald-500" />
              {query && (
                <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-slate-200 rounded-full">
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              )}
            </div>
          </div>

          {/* 스크롤 가능한 결과 영역 */}
          <div className="flex-1 overflow-y-auto px-6 py-8 space-y-10 custom-scrollbar bg-[var(--background)]">
              
              {/* 즐겨찾는 장소 퀵 칩 */}
              {favorites.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">빠른 선택</h4>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {favorites.map((fav) => (
                      <button
                        key={fav.id}
                        onClick={() => { setSelectedLocation(fav); fetchWeather(fav); }}
                        className="px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-sm font-bold text-slate-700 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all"
                      >
                        {fav.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 검색 결과 리스트 */}
              <div className="space-y-2">
                {query.length >= 2 ? (
                  <>
                    {searching ? (
                      <div className="py-20 flex flex-col items-center justify-center gap-4 text-emerald-500">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-50">분석 중...</span>
                      </div>
                    ) : (
                      <>
                        {searchResults.length > 0 ? (
                          searchResults.map((res) => (
                            <div key={res.id} className="flex items-center justify-between p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2.5rem] hover:bg-emerald-500/5 transition-all group shadow-md active:scale-95 mb-4">
                              <button onClick={() => { setSelectedLocation(res); fetchWeather(res); }} className="flex-1 flex items-center gap-6 text-left">
                                <div className={`w-14 h-14 flex items-center justify-center rounded-[1.25rem] shadow-md transition-transform group-hover:rotate-12 ${
                                  res.type === 'golf' ? 'bg-emerald-500 text-white' : 
                                  res.type === 'address' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
                                }`}>
                                  {res.type === 'golf' ? <Navigation className="w-6 h-6" /> : <MapPin className="w-6 h-6" />}
                                </div>
                                <div className="space-y-1.5 flex-1">
                                  <div className="text-lg font-black text-[var(--foreground)] group-hover:text-emerald-600 transition-colors line-clamp-1 leading-tight">{res.name}</div>
                                  <div className="text-sm font-bold text-slate-500">{res.region}</div>
                                </div>
                              </button>
                              <button 
                                onClick={() => toggleFavorite(res)} 
                                className={`p-4 rounded-2xl transition-all ${favorites.some(f => f.id === res.id) ? 'text-yellow-500 bg-[var(--background)] shadow-sm' : 'text-slate-300 hover:bg-[var(--background)]'}`}
                              >
                                <Star className={`w-6 h-6 ${favorites.some(f => f.id === res.id) ? 'fill-current' : ''}`} />
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="py-32 text-center space-y-4 px-10">
                            <Search className="w-12 h-12 text-slate-200 mx-auto" />
                            <p className="text-[var(--foreground)] font-bold text-lg leading-relaxed">
                              '{query}'와(과) 일치하는<br/>결과를 찾지 못했습니다.
                            </p>
                            <p className="text-sm text-slate-500 font-medium tracking-tight">검색어를 다시 한번 확인하거나 상세 주소(읍/면/리)를 입력해 보세요.</p>
                          </div>
                        )}
                        
                        {/* 현재 위치 버튼 */}
                        <button 
                          onClick={useCurrentLocation}
                          className="w-full mt-4 p-5 flex items-center justify-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-[1.5rem] text-emerald-400 font-black text-xs uppercase tracking-widest hover:bg-emerald-500/20 transition-all"
                        >
                          <LocateFixed className="w-4 h-4" />
                          현재 내 위치 날씨보기
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  /* 초기 상태 (데이터 단위 강조 가이드) */
                  <div className="py-28 flex flex-col items-center justify-center text-center space-y-8">
                    <div className="relative">
                      <div className="absolute inset-0 bg-yellow-400/10 blur-3xl rounded-full scale-150"></div>
                      <Sun className="w-28 h-28 text-yellow-500 fill-current drop-shadow-[0_10px_40px_rgba(234,179,8,0.4)] animate-pulse" />
                    </div>
                    <div className="space-y-3 relative">
                      <h3 className="text-xl font-black text-slate-800 tracking-tight">전국 읍/면/동/리 검색 가능</h3>
                      <p className="text-xs font-bold text-slate-400 leading-relaxed px-12">
                        이제 카카오 API 연동으로 <span className="text-orange-500">상세 주소</span> 단위까지 정밀 검색이 가능합니다.<br/>
                        예: 가남읍 심석리, 서울 서초동 123, 안양CC
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      <div className="px-4 py-4 max-w-lg mx-auto space-y-6">
        {/* [MONITOR TAB] */}
        {activeTab === 'monitor' && !isSearchOpen && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            {/* 검색바 (모니터 탭 상단) */}
            <div className="py-2">
              <div 
                onClick={() => setIsSearchOpen(true)}
                className="w-full bg-[var(--card-bg)] border-2 border-[var(--card-border)] rounded-full py-4 pl-14 pr-12 text-sm font-bold text-slate-400 shadow-sm cursor-pointer flex items-center relative"
              >
                <Search className="absolute left-6 w-5 h-5 text-slate-400" />
                골프장 / 지역 / 읍면동 검색...
              </div>
            </div>
            {/* 즐겨찾기 퀵 칩 (모니터 탭에서는 상위 5개만 콤팩트하게) */}
            {favorites.length > 0 && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">즐겨찾는 장소</h4>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {favorites.slice(0, 5).map((fav) => (
                    <button
                      key={fav.id}
                      onClick={() => { setSelectedLocation(fav); fetchWeather(fav); }}
                      className={`px-5 py-3 rounded-full border-2 transition-all duration-300 flex items-center gap-2.5 shadow-sm active:scale-95 ${
                        selectedLocation?.id === fav.id 
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-emerald-200' 
                        : 'bg-white border-slate-100 text-slate-800 hover:border-emerald-200'
                      }`}
                    >
                      <span className="text-sm font-black">{fav.name}</span>
                    </button>
                  ))}
                  {favorites.length > 5 && (
                    <button 
                      onClick={() => setActiveTab('analysis')}
                      className="px-5 py-3 rounded-full border-2 border-dashed border-slate-200 text-slate-400 text-sm font-black active:scale-95 transition-all"
                    >
                      더보기 ({favorites.length - 5})
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 현재 날씨 요약 카드 */}
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4 text-emerald-500">
                <Loader2 className="w-12 h-12 animate-spin opacity-50" />
                <p className="font-bold text-[10px] tracking-widest animate-pulse">최신 기상 분석 중...</p>
              </div>
            ) : weatherData ? (
              <>
                <div className="relative overflow-hidden bg-white border border-slate-200 rounded-[3rem] p-10 shadow-xl shadow-slate-200/50">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 blur-[80px] rounded-full -mr-20 -mt-20"></div>
                  <div className="flex items-start justify-between mb-10">
                    <div className="flex flex-col gap-2">
                      <div className="px-5 py-2 bg-emerald-50 border border-emerald-100 rounded-full w-fit">
                        <div className="flex items-center gap-2.5">
                          <MapPin className="w-4 h-4 text-emerald-500" />
                          <span className="text-sm font-black text-emerald-600 uppercase tracking-widest">{selectedLocation?.name}</span>
                        </div>
                      </div>
                    </div>
                    {weatherData.forecasts[0]?.golfIndex && (
                      <div className="flex flex-col items-end">
                        <div className="text-[9px] font-black text-slate-500 tracking-tighter uppercase mb-1">골프지수</div>
                        <div className={`text-4xl font-black ${Number(weatherData.forecasts[0].golfIndex) >= 8 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                          {weatherData.forecasts[0].golfIndex}<span className="text-lg opacity-30">/10</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="relative">
                      {weatherData.forecasts[0].status.includes('비') ? (
                        <CloudRain className="w-20 h-20 text-blue-500 drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]" />
                      ) : weatherData.forecasts[0].status.includes('구름') || weatherData.forecasts[0].status.includes('흐림') ? (
                        <Cloud className="w-20 h-20 text-slate-600 shadow-slate-300/20" />
                      ) : (
                        <Sun className="w-20 h-20 text-yellow-500 drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="text-6xl font-black text-slate-900 tracking-tighter">
                        {weatherData.forecasts[0].temp}<span className="text-2xl text-emerald-600">°</span>
                      </div>
                      <div className="text-lg font-bold flex items-center gap-2">
                        <span className="text-slate-900">{weatherData.forecasts[0].status}</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-900"></div>
                        <span className="text-slate-600 text-[10px] font-black uppercase text-right leading-none">{weatherData.forecasts[0].time} <br/>기준</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-slate-50 rounded-2xl"><Wind className="w-4 h-4 text-slate-600" /></div>
                      <div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">풍속 / 체감</div>
                        <div className="text-lg font-black text-slate-900 tracking-tight">
                          {weatherData.forecasts[0].wind}m/s • <span className="text-emerald-500">{weatherData.forecasts[0].feelsLike}°</span>
                        </div>
                      </div>
                    </div>
                    {weatherData.forecasts[0].humidity && (
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-cyan-50 rounded-2xl"><Droplets className="w-4 h-4 text-cyan-600" /></div>
                        <div>
                          <div className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">정밀 습도</div>
                          <div className="text-lg font-black text-slate-900 tracking-tight">{weatherData.forecasts[0].humidity}%</div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-50 rounded-2xl"><CloudRain className="w-4 h-4 text-blue-600" /></div>
                      <div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">강수 확률</div>
                        <div className="text-lg font-black text-slate-900 tracking-tight">{weatherData.forecasts[0].rain}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                   <DetailedWeatherTable
                      data={weatherData.forecasts.slice(0, 48)}
                      sunriseSunset={weatherData.sunriseSunset}
                      title="단기 기상 예보 (홈)"
                      compact={true}
                   />
                </div>

                {/* [NEW] 홈 화면 정밀 분석 리포트 카드 */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                  <div className="bg-slate-900 rounded-[2.5rem] p-8 border-2 border-emerald-500/20 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                      <Activity className="w-20 h-20 text-emerald-500" />
                    </div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <h4 className="text-sm font-black text-emerald-400 uppercase tracking-widest">AI 기상 분석 리포트</h4>
                    </div>

                    <div className="space-y-6 relative z-10">
                      <p className="text-white/90 text-lg font-bold leading-relaxed tracking-tight">
                        {Number(weatherData.forecasts[0].temp) > 25 ? (
                          <>현재 <span className="text-emerald-400">덥고 습한 기상 조건</span>입니다. 풍속이 {weatherData.forecasts[0].wind}m/s로 불어오니 라운딩 시 클럽 선택에 유의하세요.</>
                        ) : Number(weatherData.forecasts[0].temp) < 10 ? (
                          <>현재 <span className="text-blue-400">쌀쌀한 기온</span>이 유지되고 있습니다. 체감 온도가 {weatherData.forecasts[0].feelsLike}도까지 내려가니 방한 대책이 필요합니다.</>
                        ) : (
                          <>현재 <span className="text-emerald-400">라운딩하기 최적인 상태</span>입니다. 시정 거리가 확보되어 관제가 원활할 것으로 보입니다.</>
                        )}
                      </p>

                      <div className="flex gap-4">
                        <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/10">
                           <div className="text-[10px] font-black text-slate-400 uppercase mb-1">체감 기온</div>
                           <div className="text-xl font-black text-white">{weatherData.forecasts[0].feelsLike}°C</div>
                        </div>
                        <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/10">
                           <div className="text-[10px] font-black text-slate-400 uppercase mb-1">특이 사항</div>
                           <div className="text-xl font-black text-emerald-400">{Number(weatherData.forecasts[0].wind) > 3 ? '강풍 주의' : '기류 안정'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-20 text-center space-y-6">
                <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner border border-slate-100">
                   <Search className="w-10 h-10 text-slate-200" />
                </div>
                <p className="text-sm font-black text-slate-300 uppercase tracking-widest">No Active Station Data</p>
                <button onClick={() => setIsSearchOpen(true)} className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20">데이터 검색 시작</button>
              </div>
            )}
          </div>
        )}

        {/* [ANALYSIS TAB CONTENT] */}
        {activeTab === 'analysis' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6 pb-20">
            <div className="flex items-center justify-between mb-8 px-2 pt-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                <h4 className="text-3xl font-black text-slate-900 italic tracking-tighter leading-none">기상 데이터<br/>정밀 분석</h4>
              </div>
            </div>
            
            {weatherData ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-xl mb-8 flex items-center justify-between border-2 border-emerald-500/30">
                   <div className="space-y-1">
                      <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                         <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active Station</span>
                      </div>
                       <h5 className="text-lg font-black text-white">{selectedLocation?.name}</h5>
                   </div>
                   <div className="text-right">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Source</div>
                      <div className="text-xs font-bold text-slate-400 capitalize">{selectedLocation?.type} Center</div>
                   </div>
                </div>
                {/* [NEW] 분석 탭 전용 전문 기상 브리핑 섹션 */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 px-2">
                    <Activity className="w-5 h-5 text-emerald-500" />
                    <h5 className="text-lg font-black text-[var(--foreground)]">정밀 관제 리포트</h5>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">라운딩 적합도</span>
                        <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">최상 (92%)</span>
                      </div>
                      <p className="text-sm font-bold text-[var(--foreground)] leading-relaxed">
                        현재 기압 배치가 안정적이며, 가시거리가 {Number(weatherData.forecasts[0].wind) < 2 ? '20km 이상' : '15km 내외'}로 확보되어 매우 쾌적한 라운딩이 예상됩니다.
                        오후 {weatherData.sunriseSunset[1]} 이전까지는 일사량이 풍부하여 기온이 유지될 것으로 분석됩니다.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] p-6 text-center shadow-sm">
                        <Wind className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                        <div className="text-[10px] font-black text-slate-400 uppercase mb-1">기류 안정성</div>
                        <div className="text-lg font-black text-[var(--foreground)]">{Number(weatherData.forecasts[0].wind) < 4 ? '안정' : '불안정'}</div>
                      </div>
                      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] p-6 text-center shadow-sm">
                        <Activity className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                        <div className="text-[10px] font-black text-slate-400 uppercase mb-1">체감 지수</div>
                        <div className="text-lg font-black text-emerald-500">{weatherData.forecasts[0].feelsLike}°C</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10">
                  <DetailedWeatherTable
                    data={weatherData.forecasts}
                    sunriseSunset={weatherData.sunriseSunset}
                    title="전문 기상 데이터 분석 (FULL)"
                  />
                </div>
              </div>
            ) : (
              <div className="py-40 text-center space-y-4">
                 <Loader2 className="w-10 h-10 animate-spin text-slate-300 mx-auto" />
                 <p className="text-xs font-black text-slate-400 tracking-widest uppercase">분석할 날씨 데이터가 부족합니다.</p>
              </div>
            )}
          </div>
        )}

        {/* [SYSTEM TAB CONTENT] */}
        {activeTab === 'system' && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-500 space-y-8 pb-20 pt-4">
            <div className="flex items-center justify-between mb-8 px-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 bg-slate-900 rounded-full"></div>
                <h4 className="text-3xl font-black text-slate-900 italic tracking-tighter leading-none">SYSTEM <br/>CONTROL</h4>
              </div>
            </div>

            {/* 즐겨찾기 관리 섹션 */}
            <div className="space-y-4">
               <div className="flex items-center justify-between px-2">
                  <h5 className="text-lg font-black text-slate-900 uppercase tracking-tight">즐겨찾기 목록 <span className="text-emerald-500 ml-1">({favorites.length}/9)</span></h5>
               </div>
               
               {favorites.length > 0 ? (
                 <div className="space-y-3">
                   {favorites.map((fav) => (
                     <div key={fav.id} className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:border-emerald-200 transition-colors">
                        <div className="flex items-center gap-5">
                           <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center text-white shadow-md ${fav.type === 'golf' ? 'bg-emerald-500' : 'bg-blue-500'}`}>
                              {fav.type === 'golf' ? <Navigation className="w-6 h-6" /> : <MapPin className="w-6 h-6" />}
                           </div>
                           <div className="space-y-1">
                              <div className="text-lg font-black text-slate-900 leading-none">{fav.name}</div>
                              <div className="text-[10px] font-bold text-slate-400 capitalize tracking-widest">{fav.region} • {fav.type}</div>
                           </div>
                        </div>
                        <button 
                          onClick={() => toggleFavorite(fav)}
                          className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-[1.25rem] transition-all active:scale-90"
                        >
                           <X className="w-6 h-6" />
                        </button>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="py-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100 text-center space-y-4">
                    <Star className="w-10 h-10 text-slate-200 mx-auto" strokeWidth={1.5} />
                    <div className="space-y-1">
                       <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No Favorites Saved</p>
                       <p className="text-[10px] font-bold text-slate-300">자주 방문하는 장소를 별표로 등록하세요.</p>
                    </div>
                 </div>
               )}
            </div>

             <div className="bg-white border-2 border-slate-100 rounded-[3rem] p-10 space-y-4 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                   <h5 className="text-xl font-black text-slate-900">SYSTEM INFO</h5>
                </div>
                <p className="text-xs font-bold text-slate-400 tracking-tight leading-relaxed">
                   에이원프로 웨더 모니터링 시스템 v2.0<br/>
                   모든 데이터는 실시간 위성 관측 자료를 기반으로 합니다.
                </p>
             </div>

            {/* 개발 정보 */}
            <div className="pt-16 border-t border-slate-100 space-y-6 px-4 pb-10">
               <div className="flex justify-between items-end">
                  <div className="space-y-1">
                     <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Built by</div>
                     <div className="text-lg font-black text-slate-900 tracking-tighter">A-ONE PRO <span className="text-emerald-500 italic">Labs.</span></div>
                  </div>
                  <div className="text-right">
                     <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Architecture</div>
                     <div className="text-xs font-bold text-slate-500">B-Kit Native v2.0</div>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>

        {/* 하단 푸터 */}
        <div className="py-10 text-center space-y-4">
          <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.5em]">AONE PRO WEATHER MONITORING SYSTEM</p>
          <div className="flex items-center justify-center gap-4 opacity-20">
            <div className="w-8 h-[1px] bg-slate-500"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
          </div>
        </div>

      {/* 안내 메시지 팝업 모달 */}
      {isAlertOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAlertOpen(false)} />
          <div className="relative w-full max-w-xs bg-white rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mb-6">
                <Star className="w-8 h-8 text-yellow-500 fill-current animate-bounce" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">{alertConfig.title}</h3>
              <p className="text-sm font-bold text-slate-500 leading-relaxed whitespace-pre-wrap mb-8">
                {alertConfig.message}
              </p>
              <button
                onClick={() => setIsAlertOpen(false)}
                className="w-full py-4 bg-emerald-500 text-black rounded-2xl font-black text-sm active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
              >
                확인했습니다
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// 테마 토글 컴포넌트 (인라인 정의)
function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('aone_theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('aone_theme', newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center gap-2.5 px-4 py-2 rounded-full transition-all active:scale-95 border-2 shadow-sm ${
        theme === 'light' 
        ? 'bg-white border-slate-200 text-black' 
        : 'bg-black border-slate-800 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]'
      }`}
    >
      {theme === 'light' ? (
        <>
          <Moon className="w-4 h-4 text-slate-500" />
          <span className="text-[11px] font-black uppercase tracking-tight">야간모드</span>
        </>
      ) : (
        <>
          <Sun className="w-4 h-4 text-yellow-400 fill-current animate-pulse" />
          <span className="text-[11px] font-black uppercase tracking-tight">주간모드</span>
        </>
      )}
    </button>
  );
}
