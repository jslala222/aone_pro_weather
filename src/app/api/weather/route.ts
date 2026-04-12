// Path: src/app/api/weather/route.ts
// Description: 통합 날씨 API — 골프장/지역/주소검색/좌표날씨 지원

import { NextResponse } from 'next/server';
import { scrapeGolfWeather, scrapeRegionWeather } from '@/lib/weather-engine';
import { searchRegions } from '@/lib/region-data';
import golfCourses from '@/lib/all_golf_courses.json';

// 골프장 검색 함수
function searchGolfCourses(query: string) {
  if (!query || query.length < 1) return [];
  const q = query.trim().toLowerCase();
  return (golfCourses as any[])
    .filter(c => 
      c.name.toLowerCase().includes(q) || 
      (c.region && c.region.toLowerCase().includes(q)) ||
      (q === '서울' && c.region?.includes('서울')) ||
      (q === '경기' && c.region?.includes('경기'))
    )
    .slice(0, 15)
    .map(c => ({ type: 'golf' as const, name: c.name, id: c.gid, region: c.region }));
}

// 카카오 / Open-Meteo 주소 검색 (읍/면/동/리 단위까지 지원)
const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_API_KEY || '';

async function searchAddresses(query: string) {
  try {
    // 배포 환경 자동 감지
    const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5588';

    const kakaoRes = await fetch(
      `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: `KakaoAK ${KAKAO_KEY}`,
          'Origin': origin,
          'Referer': origin
        }
      }
    );
    const kakaoJson = await kakaoRes.json();
    
    if (kakaoJson.documents && kakaoJson.documents.length > 0) {
      return kakaoJson.documents.map((d: any) => {
        const addr = d.address;
        const road = d.road_address;
        
        // 읍/면/동/리 포함 상세 지역명 조합
        const regionDetail = [
          addr?.region_1depth_name, // 시/도
          addr?.region_2depth_name, // 구/군
          addr?.region_3depth_name, // 읍/면/동
          addr?.region_3depth_h_name !== addr?.region_3depth_name ? addr?.region_3depth_h_name : '', // 행정동 (다를 경우만)
          addr?.main_address_no ? `${addr.main_address_no}${addr.sub_address_no ? '-' + addr.sub_address_no : ''}` : '' // 지번
        ].filter(Boolean).join(' ');

        return {
          type: 'address' as const,
          name: d.address_name, // 전체 주소
          id: `${d.y},${d.x}`,
          region: regionDetail || d.address_name,
          lat: parseFloat(d.y),
          lon: parseFloat(d.x),
        };
      });
    }

    const kakaoKeyRes = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: `KakaoAK ${KAKAO_KEY}`,
          'Origin': origin,
          'Referer': origin
        }
      }
    );
    const kakaoKeyJson = await kakaoKeyRes.json();
    if (kakaoKeyJson.documents && kakaoKeyJson.documents.length > 0) {
        return kakaoKeyJson.documents.map((d: any) => ({
          type: 'address' as const,
          name: d.place_name,
          id: `${d.y},${d.x}`,
          region: d.address_name,
          lat: parseFloat(d.y),
          lon: parseFloat(d.x),
        }));
    }

    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=ko&country_code=KR`
    );
    const json = await res.json();
    if (!json.results) return [];
    return json.results.map((r: any) => ({
      type: 'address' as const,
      name: r.name,
      id: `${r.latitude},${r.longitude}`,
      region: [r.admin1, r.admin2, r.admin3].filter(Boolean).join(' '),
      lat: r.latitude,
      lon: r.longitude,
    }));
  } catch {
    return [];
  }
}

// Open-Meteo 좌표 기반 날씨
async function fetchAddressWeather(lat: number, lon: number, name: string) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
      + `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m`
      + `&hourly=temperature_2m,weather_code,wind_speed_10m,precipitation_probability`
      + `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset`
      + `&timezone=Asia/Seoul&forecast_days=3`;

    const res = await fetch(url);
    const json = await res.json();

    const wmoToKo = (code: number): string => {
      if (code === 0) return '맑음';
      if (code <= 3) return '구름조금';
      if (code <= 48) return '흐림';
      if (code <= 57) return '이슬비';
      if (code <= 67) return '비';
      if (code <= 77) return '눈';
      if (code <= 82) return '소나기';
      if (code <= 86) return '눈';
      if (code >= 95) return '뇌우';
      return '흐림';
    };

    const current = json.current;
    const daily = json.daily;
    const hourly = json.hourly;

    const now = new Date();
    const currentHour = now.getHours();
    const forecasts: any[] = [];

    for (let i = 0; i < hourly.time.length && forecasts.length < 12; i++) {
        const fTime = new Date(hourly.time[i]);
        if (fTime >= now || (fTime.getHours() === currentHour && fTime.toDateString() === now.toDateString())) {
            const h = fTime.getHours();
            forecasts.push({
                time: `${h}시`,
                temp: `${Math.round(hourly.temperature_2m[i])}`,
                status: wmoToKo(hourly.weather_code[i]),
                wind: `${hourly.wind_speed_10m[i]}`,
                rain: `${hourly.precipitation_probability[i] || 0}%`, // 비 확률로 대체
            });
        }
    }

    return {
      type: 'region', 
      locationName: name, // 카카오에서 전달된 상세 명칭 사용
      id: `${lat},${lon}`, // 좌표 ID 유지
      current: {
        temp: `${Math.round(current.temperature_2m)}`,
        status: wmoToKo(current.weather_code),
        wind: `${current.wind_speed_10m}m/s`,
        rain: `${current.precipitation}mm`,
      },
      sunriseSunset: [
        daily.sunrise?.[0]?.split('T')[1] || '06:00',
        daily.sunset?.[0]?.split('T')[1] || '19:00'
      ],
      forecasts: forecasts,
    };
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'golf';

  if (type === 'search') {
    const q = searchParams.get('q') || '';
    const tab = searchParams.get('tab') || 'all'; // all, golf, region
    if (!q) return NextResponse.json({ error: '검색어 필수' }, { status: 400 });

    let golfResults: any[] = [];
    let regionResults: any[] = [];
    let addressResults: any[] = [];

    if (tab === 'all' || tab === 'golf') {
      golfResults = searchGolfCourses(q);
    }

    if (tab === 'all' || tab === 'region') {
      regionResults = searchRegions(q).map(r => ({
        type: 'region' as const,
        name: r.name,
        id: r.rid,
        region: r.area,
      }));
      addressResults = await searchAddresses(q);
    }

    return NextResponse.json({
      query: q,
      tab: tab,
      results: [...golfResults, ...regionResults, ...addressResults],
    });
  }

  if (type === 'golf') {
    const gid = searchParams.get('gid');
    if (!gid) return NextResponse.json({ error: 'GID 필수' }, { status: 400 });
    const data = await scrapeGolfWeather(gid);
    if (!data) return NextResponse.json({ error: '데이터 없음' }, { status: 404 });
    return NextResponse.json(data);
  }

  if (type === 'region') {
    const rid = searchParams.get('rid');
    const name = searchParams.get('name') || '지역';
    if (!rid) return NextResponse.json({ error: 'RID 필수' }, { status: 400 });
    const data = await scrapeRegionWeather(rid, name);
    if (!data) return NextResponse.json({ error: '데이터 없음' }, { status: 404 });
    return NextResponse.json(data);
  }

  if (type === 'address') {
    const lat = parseFloat(searchParams.get('lat') || '');
    const lon = parseFloat(searchParams.get('lon') || '');
    const name = searchParams.get('name') || '주소';
    if (isNaN(lat) || isNaN(lon)) return NextResponse.json({ error: '좌표 필수' }, { status: 400 });
    const data = await fetchAddressWeather(lat, lon, name);
    if (!data) return NextResponse.json({ error: '데이터 없음' }, { status: 404 });
    return NextResponse.json(data);
  }

  return NextResponse.json({ error: '잘못된 타입' }, { status: 400 });
}
