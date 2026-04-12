# 카카오 API 연동 가이드 (2026 최신)

## 📌 목표
A-One Pro Weather 앱에서 카카오 Local API를 사용하여 **읍/면/동/리 수준의 상세 주소 검색** 기능 구현

---

## 🔑 Step 1: 카카오 개발자 센터 앱 등록

### 1-1. 카카오 개발자 센터 접속
https://developers.kakao.com 접속

### 1-2. 내 애플리케이션 메뉴
1. **상단 우측 프로필 아이콘** 클릭
2. **[내 애플리케이션]** 선택
3. **[앱 만들기]** 버튼 클릭

### 1-3. 앱 정보 입력
```
앱 이름: A-One Pro Weather
또는: aone_weather
```

**[만들기]** 클릭 → 앱 생성 완료

---

## 🌐 Step 2: Web 플랫폼 설정

### 2-1. 설정 페이지 이동
1. 생성된 앱 선택
2. **좌측 메뉴 → [앱 설정] → [플랫폼]**

### 2-2. Web 플랫폼 추가
```
현재 화면에서 "Web 플랫폼 등록" 버튼이 있거나
[플랫폼] 섹션에서 [Web] 클릭
```

### 2-3. 사이트 도메인 등록 (중요!)
다음 도메인들을 **모두 등록**하세요:

```
https://aoneproweather.vercel.app
https://www.aoneproweather.vercel.app
http://localhost:5588
```

**형식 주의:**
- http:// 또는 https:// 포함
- 도메인이 여러 개면 **줄바꿈**으로 분리
- 마지막 경로 슬래시(/) 제외

**[저장]** 클릭

---

## 🔐 Step 3: REST API 키 발급

### 3-1. 앱 키 확인 위치
앱 설정 페이지의 **[앱 키]** 섹션에서 확인

### 3-2. 필요한 키
```
REST API 키: xxxxxxxxxxxxxxxxxxxxxxxx (이것을 사용)
JavaScript 키
Admin 키
```

**REST API 키를 복사** (나중에 필요)

### 3-3. 키 관리
- REST API 키는 **절대 노출하지 마세요**
- Vercel 환경 변수로만 관리

---

## 📍 Step 4: 카카오 Local API 설정

### 4-1. 제품 추가
앱 관리 페이지에서:
1. **[제품]** 메뉴 탐색
2. **[로컬]** 또는 **[Map/Local]** 찾기
3. **[동의]** 또는 **[추가]** 클릭

### 4-2. 로컬 API 승인
- 주소 검색 API 사용 동의
- 좌표 변환 API 사용 동의

---

## 🚀 Step 5: Vercel 환경 변수 설정

### 5-1. Vercel 대시보드
https://vercel.com/dashboard → `aoneproweather` 프로젝트

### 5-2. 환경 변수 추가
**[Settings] → [Environment Variables]** 이동

### 5-3. 새 환경 변수 추가

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `NEXT_PUBLIC_KAKAO_API_KEY` | REST API 키 복사 | 카카오 로컬 API 사용 |
| `NEXT_PUBLIC_APP_URL` | `https://aoneproweather.vercel.app` | 배포 도메인 |

**각 환경**에 설정:
- ✅ Production
- ✅ Preview
- ✅ Development

---

## 💻 Step 6: 코드 확인 및 테스트

### 6-1. 환경 변수 사용 확인
파일: `src/app/api/weather/route.ts`

```typescript
const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_API_KEY || '';

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
```

### 6-2. 주소 검색 테스트
앱 접속 후:
1. 검색창에 "강남구 역삼동" 입력
2. 읍/면/동/리까지 표시되는지 확인
3. 또는 "서울시 강남구 강남대로" 입력 (도로명 주소)

### 6-3. 응답 형식 확인
카카오 API 응답:

```json
{
  "meta": {
    "is_end": true,
    "pageable_count": 1,
    "total_count": 1
  },
  "documents": [
    {
      "address": {
        "address_name": "서울 강남구 역삼동 456-78",
        "region_1depth_name": "서울",
        "region_2depth_name": "강남구",
        "region_3depth_name": "역삼동",
        "mountain_yn": "N",
        "main_address_no": "456",
        "sub_address_no": "78",
        "zip_code": "06260"
      },
      "road_address": {
        "address_name": "서울 강남구 강남대로 10길 5",
        "region_1depth_name": "서울",
        "region_2depth_name": "강남구",
        "region_3depth_name": "역삼동",
        "road_name": "강남대로",
        "underground_yn": "N",
        "main_building_no": "5",
        "sub_building_no": "",
        "building_name": "",
        "zone_no": "06260"
      }
    }
  ]
}
```

### 6-4. 읍/면/동/리 추출
응답에서 다음 필드들로 상세 주소 추출:

```
region_1depth_name: 시/도 (예: 서울)
region_2depth_name: 구/군 (예: 강남구)
region_3depth_name: 읍/면/동/리 (예: 역삼동)
```

---

## ⚠️ 주의사항 & 트러블슈팅

### 문제 1: 401 Unauthorized 에러
```
"개인 REST API 키로는 사용할 수 없습니다"
```
**해결:**
- REST API 키가 맞는지 확인
- Vercel 환경 변수가 제대로 설정되었는지 확인
- 배포 후 **재시작** (Vercel 대시보드에서 Redeploy)

### 문제 2: CORS 에러
```
"Access to XMLHttpRequest has been blocked by CORS policy"
```
**해결:**
- 도메인이 카카오 개발자 센터에 등록되었는지 확인
- http:// vs https:// 정확히 확인
- Origin 헤더가 올바르게 설정되었는지 확인

### 문제 3: 빈 검색 결과
**해결:**
- 정확한 주소명 입력 확인
- 띄어쓰기 확인 (예: "강남 역삼동" vs "강남구 역삼동")
- 검색 파라미터 확인

### 문제 4: 환경 변수 적용 안 됨
**해결:**
```bash
# 로컬 개발 시
npm run dev  # 자동 재로드

# Vercel 배포
# Settings → Environment Variables에서 변수 수정 후
# [Redeploy] 버튼 클릭하거나
# 새로운 커밋으로 자동 배포
```

---

## 📚 카카오 로컬 API 공식 문서

- [Kakao Developers - 로컬 API](https://developers.kakao.com/docs/latest/ko/local/dev-guide)
- [Kakao Developers - 공통 가이드](https://developers.kakao.com/docs/latest/ko/local/common)
- [Kakao Developers - 앱 설정](https://developers.kakao.com/docs/latest/ko/app-setting/app)

---

## 🎯 체크리스트

- [ ] 카카오 개발자 센터 가입
- [ ] 앱 등록 완료
- [ ] Web 플랫폼 추가
- [ ] 도메인 등록 (https://aoneproweather.vercel.app 등)
- [ ] REST API 키 발급 및 복사
- [ ] Vercel 환경 변수 설정 (NEXT_PUBLIC_KAKAO_API_KEY)
- [ ] 코드 확인 및 배포
- [ ] 주소 검색 기능 테스트
- [ ] 읍/면/동/리 표시 확인

---

## 📞 추가 지원

카카오 개발자 커뮤니티:
- [카카오 데브톡](https://devtalk.kakao.com/)
- 주소 검색 관련 질문 가능

---

**최종 수정**: 2026-04-12
**버전**: 2.0 (최신 카카오 개발자 센터)
