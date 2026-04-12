// Path: src/lib/region-data.ts
// Description: 전국 시/군/구의 이름 ↔ 웨더아이 RID 코드 매핑

export interface RegionInfo {
  name: string;   // 지역 이름 (예: "서울")
  rid: string;    // 웨더아이 RID 코드
  area: string;   // 상위 권역 (예: "수도권", "강원")
}

export const REGIONS: RegionInfo[] = [
  // === 수도권 ===
  { name: '서울', rid: '0101010000', area: '수도권' },
  { name: '인천', rid: '0201010100', area: '수도권' },
  { name: '수원', rid: '0203010201', area: '수도권' },
  { name: '성남', rid: '0203020101', area: '수도권' },
  { name: '고양', rid: '0202020102', area: '수도권' },
  { name: '용인', rid: '0203020106', area: '수도권' },
  { name: '부천', rid: '0203010101', area: '수도권' },
  { name: '안산', rid: '0203010102', area: '수도권' },
  { name: '안양', rid: '0201010205', area: '수도권' },
  { name: '남양주', rid: '0202040102', area: '수도권' },
  { name: '화성', rid: '0203010104', area: '수도권' },
  { name: '평택', rid: '0203010203', area: '수도권' },
  { name: '의정부', rid: '0202020101', area: '수도권' },
  { name: '시흥', rid: '0203010103', area: '수도권' },
  { name: '파주', rid: '0202020103', area: '수도권' },
  { name: '김포', rid: '0202010101', area: '수도권' },
  { name: '광명', rid: '0201010201', area: '수도권' },
  { name: '광주', rid: '0203020105', area: '수도권' },
  { name: '군포', rid: '0201010204', area: '수도권' },
  { name: '이천', rid: '0203020103', area: '수도권' },
  { name: '오산', rid: '0203010202', area: '수도권' },
  { name: '하남', rid: '0203020102', area: '수도권' },
  { name: '양주', rid: '0202020104', area: '수도권' },
  { name: '구리', rid: '0202040101', area: '수도권' },
  { name: '안성', rid: '0203020107', area: '수도권' },
  { name: '포천', rid: '0202030103', area: '수도권' },
  { name: '의왕', rid: '0201010203', area: '수도권' },
  { name: '여주', rid: '0203020104', area: '수도권' },
  { name: '양평', rid: '0202040104', area: '수도권' },
  { name: '동두천', rid: '0202030101', area: '수도권' },
  { name: '과천', rid: '0201010202', area: '수도권' },
  { name: '가평', rid: '0202040103', area: '수도권' },
  { name: '연천', rid: '0202030102', area: '수도권' },
  { name: '강화', rid: '0201010109', area: '수도권' },

  // === 강원 ===
  { name: '춘천', rid: '0301030101', area: '강원' },
  { name: '원주', rid: '0301050101', area: '강원' },
  { name: '강릉', rid: '0401020101', area: '강원' },
  { name: '속초', rid: '0401010101', area: '강원' },
  { name: '동해', rid: '0401050101', area: '강원' },
  { name: '삼척', rid: '0401050102', area: '강원' },
  { name: '태백', rid: '0401040101', area: '강원' },
  { name: '철원', rid: '0301010101', area: '강원' },

  // === 충청 ===
  { name: '청주', rid: '0601030101', area: '충북' },
  { name: '충주', rid: '0601010101', area: '충북' },
  { name: '제천', rid: '0601020101', area: '충북' },
  { name: '대전', rid: '0701010100', area: '충남' },
  { name: '세종', rid: '0702040102', area: '충남' },
  { name: '천안', rid: '0702030101', area: '충남' },
  { name: '서산', rid: '0702010101', area: '충남' },
  { name: '당진', rid: '0702010104', area: '충남' },

  // === 전라 ===
  { name: '전주', rid: '0801030101', area: '전북' },
  { name: '군산', rid: '0801010101', area: '전북' },
  { name: '광주', rid: '0901010100', area: '전남' },
  { name: '목포', rid: '0901020101', area: '전남' },
  { name: '여수', rid: '0901060101', area: '전남' },
  { name: '순천', rid: '0901080101', area: '전남' },

  // === 경상 ===
  { name: '대구', rid: '1001010100', area: '경북' },
  { name: '포항', rid: '1002030101', area: '경북' },
  { name: '경주', rid: '1002030102', area: '경북' },
  { name: '안동', rid: '1002070101', area: '경북' },
  { name: '구미', rid: '1002090102', area: '경북' },
  { name: '부산', rid: '1101010100', area: '경남' },
  { name: '울산', rid: '1201010100', area: '경남' },
  { name: '창원', rid: '1202010101', area: '경남' },
  { name: '김해', rid: '1202010104', area: '경남' },
  { name: '진주', rid: '1202060101', area: '경남' },

  // === 제주 ===
  { name: '제주', rid: '1301030101', area: '제주' },
  { name: '서귀포', rid: '1301020101', area: '제주' },
];

/**
 * 지역 이름으로 검색 (부분 일치)
 */
export function searchRegions(query: string): RegionInfo[] {
  if (!query || query.length < 1) return [];
  const q = query.trim().toLowerCase();
  return REGIONS.filter(r =>
    r.name.toLowerCase().includes(q) ||
    r.area.toLowerCase().includes(q)
  ).slice(0, 10);
}
