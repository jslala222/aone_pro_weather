// Path: src/lib/supabase.ts
// Description: Supabase 클라이언트 설정 (A-One Pro Weather 전용)

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 클라이언트 사이드용 Supabase (Public)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ====== 테이블 이름 상수 (접두어 포함) ======
export const TABLE_GOLF_COURSES = 'aone_pro_weather_golf_courses';
export const TABLE_WEATHER_DATA = 'aone_pro_weather_data';

// ====== 타입 정의 ======
export interface GolfCourse {
    id: string;
    name: string;
    weatheri_gid: string;
    location: string;
    created_at: string;
}

export interface WeatherData {
    id: string;
    golf_course_id: string;
    temp: number;
    humidity: number;
    condition: string;
    wind_speed: number;
    observed_at: string;
}
