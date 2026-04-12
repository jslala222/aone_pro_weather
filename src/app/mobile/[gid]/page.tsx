// Path: src/app/mobile/[gid]/page.tsx
// Description: 캐디용 모바일 날씨 상세 페이지

import { supabase, TABLE_GOLF_COURSES } from '@/lib/supabase';
import GolfWeatherMobile from '@/components/GolfWeatherMobile';
import { notFound } from 'next/navigation';

export default async function MobilePage({ params }: { params: Promise<{ gid: string }> }) {
  const resolvedParams = await params;
  const { gid } = resolvedParams;

  // GID를 통해 골프장 이름 조회
  const { data: course } = await supabase
    .from(TABLE_GOLF_COURSES)
    .select('name')
    .eq('weatheri_gid', gid)
    .single();

  if (!course) {
    // DB에 없더라도 GID가 있으면 기본값으로라도 보여줍니다.
    return <GolfWeatherMobile initialGid={gid} initialName="골프장" activeTab="monitor" />;
  }

  return <GolfWeatherMobile initialGid={gid} initialName={course.name} activeTab="monitor" />;
}
