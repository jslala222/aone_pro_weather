// Path: src/lib/weather-engine.ts
// Description: 웨더아이(Weatheri) 스크래핑 엔진 - 골프장 상세 및 지역 생활지수 지원

import * as cheerio from 'cheerio';

/** 시간별 날씨 데이터 행 */
export interface WeatherRow {
  time: string;
  date: string;
  status: string;
  temp: string;
  feelsLike?: string;
  rain: string;
  wind: string;
  humidity?: string;
  golfIndex?: string;
}

/** 주간 예보 데이터 행 */
export interface WeeklyForecast {
  date: string;
  golfIndex: string;
  status: string;
  tempLow: string;
  tempHigh: string;
  sunriseSunset: string;
}

/** 체감 온도 계산 (간이 공식) */
function calculateFeelsLike(temp: number, wind: number, humidity: number): string {
  let feels = temp;
  if (temp <= 10) {
    feels = 13.12 + 0.6215 * temp - 11.37 * Math.pow(wind, 0.16) + 0.3965 * temp * Math.pow(wind, 0.16);
  } else if (temp >= 25) {
    feels = temp - (wind * 0.5) + (humidity > 70 ? 1 : 0);
  }
  return Math.round(feels).toString();
}

/** 생활 지수 데이터 행 */
export interface LivingIndex {
  label: string;      // 예: "세차지수"
  value: string;      // 예: "100"
  descText: string;   // 예: "세차 후의 상쾌함을..."
}

/** 날씨 응답 공통 구조 */
export interface WeatherResult {
  type: 'golf' | 'region';          // 데이터 종류
  locationName: string;              // 장소 이름
  forecasts: WeatherRow[];           // 시간별 예보
  weeklyForecasts?: WeeklyForecast[]; // 주간 예보
  livingIndices?: LivingIndex[];     // 생활 지수 (지역 전용)
  sunriseSunset: string[];           // [일출, 일몰]
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
      next: { revalidate: 0 }
    });
    
    if (!res.ok) return null;
    const html = await res.text();
    const $ = cheerio.load(html);
    
    let locationName = '';
    $('td.tcolor01 b').each((_, el) => {
      const text = $(el).text().trim();
      if (text && !locationName) locationName = text;
    });

    const forecasts: WeatherRow[] = [];
    const weeklyForecasts: WeeklyForecast[] = [];
    const sunriseSunset: string[] = [];

    // ─────────────────────────────────────────────────────────
    // graph.htm에서 웨더아이 실제 기온 데이터 추출
    // (기온 그래프는 iframe으로 분리된 별도 파일에 존재)
    // ─────────────────────────────────────────────────────────
    let graphTemps: number[] = [];
    try {
      const graphRes = await fetch(
        `https://www.weatheri.co.kr/leisure/graph.htm?rid=${gid}&dd=0`,
        { headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.weatheri.co.kr/' }, next: { revalidate: 0 } }
      );
      if (graphRes.ok) {
        const graphHtml = await graphRes.text();
        // Highcharts data: [15,21,23,...] 패턴 추출
        const m = graphHtml.match(/data:\s*\[([\d,\s\-\.\r\n]+)\]/);
        if (m) {
          graphTemps = m[1].split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
        }
      }
    } catch { /* graph.htm 실패 시 무시 */ }

    $('table').each((_, tbl) => {
      // 중첩 테이블(외부 레이아웃 래퍼)은 건너뜀 — 리프 테이블만 데이터 파싱
      if ($(tbl).find('table').length > 0) return;

      const rows = $(tbl).find('tr');

      // 각 행의 첫 번째 셀 레이블 목록 추출 (th 또는 td 모두 허용)
      const rowLabels = rows.toArray().map(tr =>
        $(tr).find('th, td').first().text().trim()
      );

      // 시간별(단기) 예보 테이블 판별
      // ※ 골프 페이지의 기온은 graph.htm(iframe)에서 추출
      const hasTimeRow    = rowLabels.some(l => l === '시간' || l.includes('시간(시)') || l === '예보시간');
      const hasGolfIdxRow = rowLabels.some(l => l.includes('지수'));

      if (hasTimeRow && hasGolfIdxRow && forecasts.length === 0) {
        const d_h_raw: string[] = [];
        const t_h: string[] = [];
        const i_h: string[] = [];
        const s_h: string[] = [];
        const r_h: string[] = [];
        const w_h: string[] = [];

        rows.each((_, tr) => {
          const allCells = $(tr).find('th, td');
          const label = allCells.first().text().trim();
          const datas = allCells.slice(1);

          if (label.includes('날짜')) {
            datas.each((_, td) => {
              const dateText = $(td).text().trim();
              const colspanVal = parseInt($(td).attr('colspan') || '1', 10);
              for (let c = 0; c < colspanVal; c++) d_h_raw.push(dateText);
            });
          } else if (label.includes('시간')) {
            datas.each((_, td) => { t_h.push($(td).text().trim()); });
          } else if (label.includes('지수')) {
            datas.each((_, td) => {
              const m = $(td).text().trim().match(/\d+/);
              i_h.push(m ? m[0] : '0');
            });
          } else if (label.includes('날씨') || label.includes('하늘')) {
            datas.each((_, td) => {
              const img = $(td).find('img').first();
              const fn = img.attr('src')?.split('/').pop() || '';
              s_h.push(weatherMap[fn] || img.attr('alt') || '맑음');
            });
          } else if (label.includes('강수')) {
            datas.each((_, td) => { r_h.push($(td).text().trim() || '0'); });
          } else if (label.includes('풍속')) {
            datas.each((_, td) => { w_h.push($(td).text().trim()); });
          }
        });

        let lastD = '';
        for (let j = 0; j < t_h.length; j++) {
          if (d_h_raw[j]) lastD = d_h_raw[j];
          // graph.htm에서 가져온 실제 기온 사용 (없으면 '-')
          const temp = graphTemps[j] !== undefined ? String(graphTemps[j]) : '-';

          forecasts.push({
            time:      t_h[j]    || '',
            date:      lastD     || '오늘',
            status:    s_h[j]    || '맑음',
            temp,
            golfIndex: i_h[j]    || '0',
            rain:      r_h[j]    || '0',
            wind:      w_h[j]    || '0'
          });
        }

        // 골프지수 0인 후미 슬롯 제거
        let cutoff = forecasts.length;
        while (cutoff > 0 && forecasts[cutoff - 1].golfIndex === '0') cutoff--;
        if (cutoff < forecasts.length) forecasts.splice(cutoff);
      }

      // 주간 예보 테이블 판별: '일출' 또는 '주간예보' 키워드, 단 시간별 행이 없는 테이블
      const hasSunRow = rowLabels.some(l => l.includes('일출'));
      const hasWeeklyHdr = $(tbl).text().includes('주간예보');

      if ((hasSunRow || hasWeeklyHdr) && !hasTimeRow && weeklyForecasts.length === 0) {
        const d_w: string[] = [];
        const i_w: string[] = [];
        const s_w: string[] = [];
        const temp_w: string[] = [];
        const sun_w: string[] = [];

        rows.each((_, tr) => {
          const tds = $(tr).find('td');
          const label = tds.first().text().trim();
          const datas = tds.slice(1);

          if (label.includes('날짜')) datas.each((_, td) => { d_w.push($(td).text().trim()); });
          else if (label.includes('지수')) datas.each((_, td) => { i_w.push($(td).text().trim()); });
          else if (label.includes('날씨')) datas.each((_, td) => {
            const img = $(td).find('img').first();
            const fn = img.attr('src')?.split('/').pop() || '';
            s_w.push(weatherMap[fn] || img.attr('alt') || '맑음');
          });
          else if (label.includes('기온')) datas.each((_, td) => {
            const raw = $(td).text().trim();
            if (raw.includes('/')) {
              temp_w.push(raw);
            } else {
              const m = raw.match(/-?\d+(\.\d+)?/);
              temp_w.push(m ? m[0] : '0');
            }
          });
          else if (label.includes('일출')) datas.each((_, td) => { sun_w.push($(td).text().trim()); });
        });

        d_w.forEach((date, di) => {
          if (!date) return;
          const tp = (temp_w[di] || '0/0').split('/');
          weeklyForecasts.push({
            date,
            golfIndex: i_w[di] || '0',
            status: s_w[di] || '맑음',
            tempLow: tp[0]?.trim() || '0',
            tempHigh: tp[1]?.trim() || '0',
            sunriseSunset: sun_w[di] || ''
          });
        });
      }
    });

    return { type: 'golf', locationName: locationName || '골프장', forecasts, weeklyForecasts, sunriseSunset };
  } catch (err) {
    return null;
  }
}

/**
 * 2. 지역별 날씨 스크래퍼 (RID 기반)
 */
export async function scrapeRegionWeather(rid: string, name: string): Promise<WeatherResult | null> {
  const url = `https://www.weatheri.co.kr/forecast/forecast01.php?rid=${rid}`;
  const livingUrl = `https://www.weatheri.co.kr/forecast/forecast08.php?rid=${rid}`;

  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 0 } });
    if (!res.ok) return null;
    const $ = cheerio.load(await res.text());

    const times: string[] = [];
    const dates: string[] = [];
    const statuses: string[] = [];
    const temps: string[] = [];
    const rains: string[] = [];
    const winds: string[] = [];
    const humidities: string[] = [];
    const sunriseSunset: string[] = [];

    $('tr').each((_, tr) => {
      const tds = $(tr).find('td');
      const label = tds.first().text().trim();
      const datas = tds.slice(1);

      if (label === '시간') {
        let curD = '';
        datas.each((_, td) => {
          const t = $(td).text().trim();
          if (t.includes('.') || t.includes('월')) curD = t.replace(/\s+/g, '');
          else if (t && times.length < 48) {
            times.push(t.includes('시') ? t : t + '시');
            dates.push(curD || '오늘');
          }
        });
      } else if (label.includes('날씨')) {
        datas.each((_, td) => {
          const img = $(td).find('img').first();
          const fn = img.attr('src')?.split('/').pop() || '';
          statuses.push(weatherMap[fn] || img.attr('alt') || '맑음');
        });
      } else if (label.includes('기온') && !label.includes('최고')) {
        datas.each((_, td) => {
          const m = $(td).text().trim().match(/-?\d+/);
          if (m) temps.push(m[0]);
        });
      } else if (label.includes('강수')) datas.each((_, td) => { rains.push($(td).text().trim() || '0'); });
      else if (label.includes('풍속')) datas.each((_, td) => { winds.push($(td).text().trim()); });
      else if (label.includes('습도')) datas.each((_, td) => { humidities.push($(td).text().trim()); });
      else if (label.includes('일출일몰')) datas.each((_, td) => {
        const v = $(td).text().trim();
        if (v && sunriseSunset.length < 2) sunriseSunset.push(v);
      });
    });

    const forecasts: WeatherRow[] = times.map((t, i) => {
        const tempVal = parseFloat(temps[i] || '0');
        const windVal = parseFloat(winds[i] || '0');
        const humVal = parseFloat(humidities[i] || '50');
        return {
            time: t,
            date: dates[i],
            status: statuses[i] || '맑음',
            temp: temps[i] || '0',
            feelsLike: calculateFeelsLike(tempVal, windVal, humVal),
            rain: rains[i] || '0',
            wind: winds[i] || '0'
        };
    });

    const livingIndices: LivingIndex[] = [];
    try {
      const lRes = await fetch(livingUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (lRes.ok) {
        const $l = cheerio.load(await lRes.text());
        $l('strong').each((_, el) => {
          const text = $l(el).text().trim();
          if (text.includes(':')) {
            const parts = text.split(':');
            livingIndices.push({
              label: parts[0].trim(),
              value: parts[1].trim(),
              descText: $l(el).parent().text().replace(text, '').trim()
            });
          }
        });
      }
    } catch (e) {}

    return { type: 'region', locationName: name, forecasts, livingIndices: livingIndices.slice(0, 8), sunriseSunset };
  } catch (err) {
    return null;
  }
}

export async function fetchWeatherDatai(location: { type: 'golf' | 'region'; id: string; name: string }): Promise<WeatherResult | null> {
  if (location.type === 'golf') return scrapeGolfWeather(location.id);
  return scrapeRegionWeather(location.id, location.name);
}
