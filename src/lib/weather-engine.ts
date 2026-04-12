// Path: src/lib/weather-engine.ts
// Description: 웨더아이(Weatheri) 범용 날씨 스크래퍼 (에이원프로 웨더 통합 버전)

import * as cheerio from 'cheerio';

/** 시간별 날씨 데이터 한 행 */
export interface WeatherRow {
  time: string;       // 예: "09시"
  date?: string;      // 예: "04.11" 또는 "오늘"
  status: string;     // 예: "맑음", "구름많음", "비"
  temp: string;       // 기온 (°C)
  feelsLike?: string; // 체감온도 (°C) [NEW]
  rain: string;       // 강수량 (mm)
  wind: string;       // 풍속 (m/s)
  humidity?: string;  // 습도 (%) [NEW]
  golfIndex?: string; // 골프지수 (1~10, 골프장 전용)
}

/** 
 * 체감온도 계산 함수
 */
function calculateFeelsLike(temp: number, wind: number, humidity: number): string {
  let feels = temp;
  if (temp <= 10) {
    feels = 13.12 + 0.6215 * temp - 11.37 * Math.pow(wind * 3.6, 0.16) + 0.3965 * temp * Math.pow(wind * 3.6, 0.16);
  } else if (temp >= 25) {
    const h = humidity / 100;
    feels = 0.5 * (temp + 61.0 + ((temp - 68.0) * 1.2) + (h * 0.094));
  } else {
    feels = temp - (wind * 0.5) + (humidity > 70 ? 1 : 0);
  }
  return Math.round(feels).toString();
}

/** 날씨 응답 공통 구조 */
export interface WeatherResult {
  type: 'golf' | 'region';         // 데이터 종류
  locationName: string;             // 장소 이름
  forecasts: WeatherRow[];          // 시간별 예보
  sunriseSunset: string[];          // [일출, 일몰]
}

// 아이콘 파일명 → 한글 날씨 상태 매핑
const weatherMap: Record<string, string> = {
  '00_s.gif': '맑음',   '01_s.gif': '맑음',
  '02_s.gif': '구름조금', '03_s.gif': '구름많음',
  '22_s.gif': '구름많음', '33_s.gif': '흐림',
  '44_s.gif': '비',     '47_s.gif': '소나기',
  '48_s.gif': '소나기',  '55_s.gif': '눈',
  '66_s.gif': '비/눈',
};

/**
 * 1. 골프장 날씨 스크래퍼 (GID 기반)
 */
export async function scrapeGolfWeather(gid: string): Promise<WeatherResult | null> {
  const url = `https://www.weatheri.co.kr/leisure/leisure04.php?gid=${gid}`;
  
  try {
    const res = await fetch(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Cache-Control': 'no-cache'
      },
    });
    
    if (!res.ok) return null;

    const html = await res.text();
    const $ = cheerio.load(html);
    
    let locationName = '';
    $('td.tcolor01 b').each((_, el) => {
      const text = $(el).text().trim();
      if (text && !locationName) locationName = text;
    });
    if (!locationName) locationName = '골프장';

    const times: string[] = [];
    const dates: string[] = [];
    const statuses: string[] = [];
    const temps: string[] = [];
    const rains: string[] = [];
    const winds: string[] = [];
    const humidities: string[] = []; // [NEW]
    const golfIndexes: string[] = [];
    const sunriseSunset: string[] = [];

    $('tr').each((_, tr) => {
      const tds = $(tr).find('td');
      const label = tds.first().text().trim();

      if (label === '시간') {
        let currentDate = '';
        tds.each((i, td) => {
          if (i > 0) {
            const t = $(td).text().trim();
            if (t.includes('.') || t.includes('월')) {
              currentDate = t.replace(/\s+/g, '');
            } else if (t && times.length < 48) {
              times.push(t.includes('시') ? t : t + '시');
              dates.push(currentDate || '오늘');
            }
          }
        });
      } else if (label.includes('날씨')) {
        tds.each((i, td) => { if (i > 0 && statuses.length < times.length) {
          const img = $(td).find('img');
          if (img.length > 0) {
            const src = img.attr('src') || '';
            const alt = img.attr('alt') || '';
            const fileName = src.split('/').pop() || '';
            statuses.push(weatherMap[fileName] || alt || '맑음');
          }
        }});
      } else if (label.includes('골프지수')) {
        tds.each((i, td) => { if (i > 0 && golfIndexes.length < times.length) {
          const val = $(td).text().trim();
          if (val && !isNaN(Number(val))) golfIndexes.push(val);
        }});
      } else if (label.includes('기온') && !label.includes('최고/최저')) {
        tds.each((i, td) => { if (i > 0 && temps.length < times.length) {
          const match = $(td).text().trim().match(/-?\d+(\.\d+)?/);
          if (match) temps.push(Math.round(parseFloat(match[0])).toString());
        }});
      } else if (label.includes('강수량')) {
        tds.each((i, td) => { if (i > 0 && rains.length < times.length) {
          const match = $(td).text().trim().match(/\d+(\.\d+)?/);
          rains.push(match ? match[0] : '0');
        }});
      } else if (label.includes('풍속')) {
        tds.each((i, td) => { if (i > 0 && winds.length < times.length) {
          const match = $(td).text().trim().match(/\d+(\.\d+)?/);
          if (match) winds.push(match[0]);
        }});
      } else if (label.includes('습도')) {
        tds.each((i, td) => { if (i > 0 && humidities.length < times.length) {
          const match = $(td).text().trim().match(/\d+/);
          if (match) humidities.push(match[0]);
        }});
      } else if (label.includes('일출일몰')) {
        tds.each((i, td) => { if (i > 0) {
          const val = $(td).text().trim();
          if (val && sunriseSunset.length < 2) sunriseSunset.push(val);
        }});
      }
    });

    const forecasts: WeatherRow[] = [];
    for (let i = 0; i < times.length; i++) {
      const t = parseFloat(temps[i] || '0');
      const w = parseFloat(winds[i] || '0');
      const h = parseFloat(humidities[i] || '50');
      
      forecasts.push({
        time: times[i],
        date: dates[i],
        status: statuses[i] || '맑음',
        temp: temps[i] || '0',
        feelsLike: calculateFeelsLike(t, w, h),
        rain: rains[i] || '0',
        wind: winds[i] || '0',
        humidity: humidities[i] || undefined, 
        golfIndex: golfIndexes[i] || undefined,
      });
    }

    return { type: 'golf', locationName, forecasts, sunriseSunset };
  } catch (err) {
    console.error(`[골프 날씨 오류] GID=${gid}:`, err);
    return null;
  }
}

/**
 * 2. 지역별 날씨 스크래퍼 (RID 기반)
 */
export async function scrapeRegionWeather(rid: string, name: string): Promise<WeatherResult | null> {
  const url = `https://www.weatheri.co.kr/forecast/forecast01.php?rid=${rid}&k=1&a_name=${encodeURIComponent(name)}`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Cache-Control': 'no-cache'
      },
    });

    if (!res.ok) return null;

    const html = await res.text();
    const $ = cheerio.load(html);

    const times: string[] = [];
    const dates: string[] = [];
    const statuses: string[] = [];
    const temps: string[] = [];
    const rains: string[] = [];
    const winds: string[] = [];
    const humidities: string[] = []; // [NEW]
    const sunriseSunset: string[] = [];

    $('tr').each((_, tr) => {
      const tds = $(tr).find('td');
      const label = tds.first().text().trim();

      if (label === '시간') {
        let currentDate = '';
        tds.each((i, td) => {
          if (i > 0) {
            const t = $(td).text().trim();
            if (t.includes('.') || t.includes('월')) {
              currentDate = t.replace(/\s+/g, '');
            } else if (t && times.length < 48) {
              times.push(t.includes('시') ? t : t + '시');
              dates.push(currentDate || '오늘');
            }
          }
        });
      } else if (label.includes('날씨')) {
        tds.each((i, td) => { if (i > 0 && statuses.length < times.length) {
          const img = $(td).find('img');
          if (img.length > 0) {
            const src = img.attr('src') || '';
            const alt = img.attr('alt') || '';
            const fileName = src.split('/').pop() || '';
            statuses.push(weatherMap[fileName] || alt || '맑음');
          }
        }});
      } else if (label.includes('기온') && !label.includes('최고/최저')) {
        tds.each((i, td) => { if (i > 0 && temps.length < times.length) {
          const match = $(td).text().trim().match(/-?\d+(\.\d+)?/);
          if (match) temps.push(Math.round(parseFloat(match[0])).toString());
        }});
      } else if (label.includes('강수량')) {
        tds.each((i, td) => { if (i > 0 && rains.length < times.length) {
          const match = $(td).text().trim().match(/\d+(\.\d+)?/);
          rains.push(match ? match[0] : '0');
        }});
      } else if (label.includes('풍속')) {
        tds.each((i, td) => { if (i > 0 && winds.length < times.length) {
          const match = $(td).text().trim().match(/\d+(\.\d+)?/);
          if (match) winds.push(match[0]);
        }});
      } else if (label.includes('습도')) {
        tds.each((i, td) => { if (i > 0 && humidities.length < times.length) {
          const match = $(td).text().trim().match(/\d+/);
          if (match) humidities.push(match[0]);
        }});
      } else if (label.includes('일출일몰')) {
        tds.each((i, td) => { if (i > 0) {
          const val = $(td).text().trim();
          if (val && sunriseSunset.length < 2) sunriseSunset.push(val);
        }});
      }
    });

    const forecasts: WeatherRow[] = [];
    for (let i = 0; i < times.length; i++) {
      const t = parseFloat(temps[i] || '0');
      const w = parseFloat(winds[i] || '0');
      const h = parseFloat(humidities[i] || '50');

      forecasts.push({
        time: times[i],
        date: dates[i],
        status: statuses[i] || '맑음',
        temp: temps[i] || '0',
        feelsLike: calculateFeelsLike(t, w, h),
        rain: rains[i] || '0',
        wind: winds[i] || '0',
        humidity: humidities[i] || undefined,
      });
    }

    return { type: 'region', locationName: name, forecasts, sunriseSunset };
  } catch (err) {
    console.error(`[지역 날씨 오류] RID=${rid}:`, err);
    return null;
  }
}

/**
 * 3. 범용 날씨 스크래핑 함수 (GID 또는 RID 지원)
 */
export async function fetchWeatherDatai(location: { type: 'golf' | 'region'; id: string; name: string }): Promise<WeatherResult | null> {
  if (location.type === 'golf') {
    return scrapeGolfWeather(location.id);
  } else {
    return scrapeRegionWeather(location.id, location.name);
  }
}
