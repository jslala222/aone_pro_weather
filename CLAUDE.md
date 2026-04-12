# A-One Pro Weather (골프장 날씨 관리 시스템) - 규칙

## 포트 규칙
- **개발 서버는 항상 5588 포트 사용** (`npm run dev` → `next dev -p 5588`)
- 다른 프로젝트(BMS: 3333, MSG: 4444, Farm: 5555)와 충돌 방지

## 개발 서버 시작
```bash
npm run dev  # 자동으로 5588 포트 사용
```

## 프로젝트 스택
- Next.js 15 (App Router)
- Supabase (데이터베이스) - 접두어 `aone_pro_weather_` 필수
- TypeScript
- TailwindCSS v4
- Cheerio (날씨 정보 크롤링)

## 작업 규칙
- 모든 테이블 및 Storage 경로에는 `aone_pro_weather_` 접두어 사용
- 시간은 항상 한국 시간(KST) 기준

## 프로젝트 구분
- ⛳ **A-One Pro Weather** (포트: 5588) - 골프장 날씨 실시간 모니터링 시스템
