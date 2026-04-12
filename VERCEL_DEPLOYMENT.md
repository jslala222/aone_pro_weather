# Vercel 배포 가이드

## 📋 사전 준비사항

- ✅ GitHub 계정 및 `aone_pro_weather` 레포지토리
- ✅ Vercel 계정 (https://vercel.com)
- ✅ Supabase 환경 변수
- ✅ 카카오 API 키

---

## 🚀 배포 절차

### 1단계: Vercel 프로젝트 설정 확인

```bash
# 현재 Vercel 설정 확인
vercel projects list
```

### 2단계: 환경 변수 설정 (중요!)

Vercel 대시보드에서 다음 환경 변수를 설정하세요:

**Production 환경:**
```
NEXT_PUBLIC_SUPABASE_URL=https://lajjbrrysvkaxzrchanp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[Supabase Anon Key]
NEXT_PUBLIC_KAKAO_API_KEY=[카카오 API 키]
NEXT_PUBLIC_APP_URL=https://aone-pro-weather.vercel.app
```

**Preview/Development 환경:**
```
NEXT_PUBLIC_SUPABASE_URL=https://lajjbrrysvkaxzrchanp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[Supabase Anon Key]
NEXT_PUBLIC_KAKAO_API_KEY=[카카오 API 키]
NEXT_PUBLIC_APP_URL=http://localhost:5588
```

### 3단계: 환경 변수 설정 방법

#### 옵션 A: Vercel 대시보드 (웹 UI)

1. https://vercel.com/dashboard 접속
2. `aone_pro_weather` 프로젝트 선택
3. **Settings** → **Environment Variables** 이동
4. 위의 환경 변수 추가
5. 각 환경(Production, Preview, Development)에 맞게 설정

#### 옵션 B: Vercel CLI

```bash
# Vercel CLI 설치 (필요시)
npm install -g vercel

# 환경 변수 설정
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_KAKAO_API_KEY
vercel env add NEXT_PUBLIC_APP_URL
```

### 4단계: GitHub에 코드 푸시

```bash
git add .
git commit -m "fix: 배포 환경 변수 설정 및 보안 개선"
git push origin master
```

### 5단계: Vercel 자동 배포

Vercel은 GitHub에 푸시되면 자동으로 배포를 시작합니다.

- **Master 브랜치** → Production 배포
- **다른 브랜치** → Preview 배포

배포 진행 상황:
```bash
vercel logs
```

---

## ✅ 배포 후 확인사항

### 배포 성공 확인
```bash
# 배포 상태 확인
vercel projects ls
vercel logs --follow
```

### 기능 테스트
1. 앱 접속: https://aone-pro-weather.vercel.app
2. 골프장 검색 기능 테스트
3. 날씨 데이터 로드 테스트
4. 브라우저 콘솔에서 에러 확인

### 환경 변수 확인
```bash
# 환경 변수 목록 확인
vercel env list
```

---

## 🐛 배포 실패 시 해결 방법

### 빌드 실패
```bash
# 로컬에서 빌드 테스트
npm run build

# 에러 메시지 확인
vercel logs --failed
```

### 환경 변수 에러
- ✅ NEXT_PUBLIC_* 환경 변수 확인
- ✅ Vercel 대시보드에서 올바른 값 설정 확인
- ✅ 배포 후 캐시 초기화 (`vercel --prod --force`)

### CORS/Origin 에러
- ✅ `NEXT_PUBLIC_APP_URL` 확인 (https://aone-pro-weather.vercel.app)
- ✅ 카카오 API 대시보드에서 도메인 화이트리스트 확인
- ✅ 브라우저 개발자 도구 → Network 탭에서 요청 확인

---

## 📊 배포 후 모니터링

### Vercel Analytics
```
Dashboard → Analytics → 방문 통계, 성능 메트릭 확인
```

### 환경 변수 업데이트
```bash
# 환경 변수 변경 후
git push origin master  # 자동 재배포
```

### 롤백 (필요시)
```bash
vercel rollback
```

---

## 🔗 유용한 링크

- [Vercel 공식 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Supabase 연동 가이드](https://supabase.com/docs)
- [카카오 API 문서](https://developers.kakao.com/docs/latest/ko/local/common)

---

## 💡 팁

- Vercel은 커밋할 때마다 자동으로 배포됨
- `[skip ci]` 커밋 메시지로 배포 건너뛸 수 있음
- 환경 변수 변경 후 재배포 필요 (코드 변경 없이도)
- Production 배포 전에 Preview 배포로 테스트 권장

---

**최종 수정**: 2026-04-12
**배포 상태**: 준비 완료
