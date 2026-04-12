# 카카오 API 설정 완벽 가이드 (스크린샷 버전)

## 📸 UI 변화 안내

카카오 개발자 센터는 **2024년 이후로 UI가 개선**되었습니다. 이 가이드는 **최신 인터페이스**를 기준으로 작성되었습니다.

---

## 🔑 부분 1: 앱 등록

### 1-1. 개발자 센터 접속
```
URL: https://developers.kakao.com
```

**로그인** 버튼 클릭 후 카카오 계정 로그인

### 1-2. "내 애플리케이션" 이동
```
상단 우측 모서리에 프로필/닉네임 버튼 보임
↓
클릭하면 드롭다운 메뉴
↓
"내 애플리케이션" 선택
```

### 1-3. 앱 만들기
```
페이지 상단에 큰 [앱 만들기] 버튼 (보라색 또는 파란색)
↓
클릭
```

### 1-4. 앱 정보 입력
```
┌─────────────────────────────┐
│  앱 이름  │ A-One Pro Weather │
└─────────────────────────────┘

[만들기] 버튼 클릭
```

### 결과
```
✅ 앱 생성 완료
앱 ID 또는 앱 키 페이지로 이동
```

---

## 🌐 부분 2: Web 플랫폼 추가

### 2-1. 앱 설정 이동
```
생성된 앱 선택
↓
좌측 메뉴에서 [앱 설정] 또는 [Settings] 클릭
```

### 2-2. 플랫폼 메뉴 찾기
```
[앱 설정] → [플랫폼] (좌측 서브메뉴)
또는
[General] → [Platform]
```

### 2-3. Web 플랫폼 추가
```
화면에 보이는 플랫폼 목록:
- iOS
- Android  
- JavaScript (또는 Web)

"Web" 또는 "JavaScript" 카드에서
[등록] 또는 [추가] 버튼 클릭
```

### 2-4. 도메인 등록
```
┌─────────────────────────────────┐
│ 사이트 도메인 (또는 Web Domain)  │
│                                 │
│ https://aoneproweather.vercel.app
│ http://localhost:5588           │
│                                 │
│  [저장] 버튼                     │
└─────────────────────────────────┘
```

**중요:** 도메인은 **줄바꿈**으로 분리

### 저장 완료 표시
```
✅ "Web 플랫폼이 추가되었습니다"
또는 "Platform added successfully"
```

---

## 🔐 부분 3: REST API 키 복사

### 3-1. 앱 키 위치
```
[앱 설정] → [앱 키] (좌측 메뉴)
또는
[General] → [App Keys]
```

### 3-2. 키 확인
```
┌──────────────────────────────────────┐
│ REST API 키                          │
│ xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx     │ ← 이것!
│ [복사] 아이콘                        │
├──────────────────────────────────────┤
│ JavaScript 키                        │
│ xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx     │
├──────────────────────────────────────┤
│ Admin 키                             │
│ xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx     │
└──────────────────────────────────────┘
```

### 3-3. 복사 방법
```
방법 1: [복사] 버튼 클릭
방법 2: 키 텍스트 드래그 선택 후 Ctrl+C
```

**복사 확인:**
```
복사됨 알림 또는
클립보드에 텍스트 저장됨
```

---

## 📌 부분 4: Vercel 환경 변수 설정

### 4-1. Vercel 대시보드 접속
```
URL: https://vercel.com/dashboard
```

### 4-2. 프로젝트 선택
```
좌측 프로젝트 목록에서 "aoneproweather" 찾기
클릭
```

### 4-3. Settings 메뉴
```
상단 탭/메뉴에서 [Settings] 또는 [설정] 클릭
```

### 4-4. Environment Variables 찾기
```
좌측 메뉴:
- General
- Domains
- Environment Variables ← 여기!
- Git
- ...

[Environment Variables] 클릭
```

### 4-5. 환경 변수 추가 (첫 번째)
```
┌─────────────────────────────────────────┐
│ [Add Variable] 또는 [+ 추가] 버튼       │
└─────────────────────────────────────────┘

팝업 또는 입력 폼:

Variable Name:
┌────────────────────────────────────────┐
│ NEXT_PUBLIC_KAKAO_API_KEY              │
└────────────────────────────────────────┘

Value:
┌────────────────────────────────────────┐
│ xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx        │
│ (위에서 복사한 REST API 키 붙여넣기)    │
└────────────────────────────────────────┘

Environments (체크박스):
☑ Production
☑ Preview  
☑ Development

[Add] 또는 [저장] 클릭
```

### 4-6. 환경 변수 추가 (두 번째)
```
[Add Variable] 다시 클릭

Variable Name:
┌────────────────────────────────────────┐
│ NEXT_PUBLIC_APP_URL                    │
└────────────────────────────────────────┘

Value:
┌────────────────────────────────────────┐
│ https://aoneproweather.vercel.app      │
└────────────────────────────────────────┘

Environments:
☑ Production
☑ Preview
☑ Development

[Add] 또는 [저장] 클릭
```

### 결과 표시
```
✅ Environment Variables
   ├─ NEXT_PUBLIC_KAKAO_API_KEY: xxxxxxxxx...
   └─ NEXT_PUBLIC_APP_URL: https://...
```

---

## 🚀 부분 5: 자동 배포 또는 수동 배포

### 방법 A: 자동 배포 (권장)
```
Vercel 환경 변수 저장 후
↓
자동으로 프로젝트 재배포됨
↓
[Deployments] 탭에서 상태 확인
```

### 방법 B: 수동 배포
```
Vercel Dashboard → aoneproweather 프로젝트
↓
[Deployments] 탭 클릭
↓
최신 배포 항목에서 우측 [⋯] 메뉴 클릭
↓
[Redeploy] 선택
```

### 배포 상태 확인
```
배포 항목:
✅ aoneproweather.vercel.app
   Status: Ready ← 완료!
   
혹은 보라색 인디케이터로 "Building..." 표시 중
```

---

## 🧪 부분 6: 기능 테스트

### 6-1. 앱 접속
```
브라우저에서:
https://aoneproweather.vercel.app 열기
```

### 6-2. 주소 검색 시도
```
검색창 찾기 (앱 UI의 검색 입력 필드)

입력: "강남구 역삼동"

[검색] 또는 [Enter] 클릭
```

### 6-3. 결과 확인
```
검색 결과가 표시되어야 함:
✅ "서울 강남구 역삼동 456-78" 같은 주소
✅ 시/도, 구/군, 동까지 포함
✅ 에러 메시지 없음
```

### 6-4. 개발자 도구로 확인 (선택사항)
```
F12 또는 우클릭 → [검사] 클릭
↓
[Network] 탭 클릭
↓
다시 주소 검색
↓
"dapi.kakao.com" 요청 확인
  Status: 200 ← 성공!
```

---

## ⚠️ 자주 발생하는 문제 & 해결

### 문제 1: "401 Unauthorized" 또는 "Invalid API Key"

**원인:** 환경 변수가 제대로 설정되지 않음

**해결:**
```
1. REST API 키를 정확히 복사했는지 확인
2. Vercel 환경 변수에 정확히 붙여넣었는지 확인
3. 변수명이 정확한지 확인:
   ✅ NEXT_PUBLIC_KAKAO_API_KEY
   ❌ KAKAO_API_KEY (틀림)
   ❌ KAKAO_KEY (틀림)
4. Vercel [Redeploy] 버튼으로 재배포
5. 배포 완료 대기 (1-2분)
6. 앱 새로고침 (Ctrl+F5 또는 Cmd+Shift+R)
```

### 문제 2: CORS 오류 또는 도메인 오류

**원인:** 카카오 개발자 센터에 도메인이 등록되지 않음

**해결:**
```
1. 카카오 개발자 센터 접속
2. 앱 설정 → 플랫폼 → Web
3. 다음 도메인들이 모두 등록되었는지 확인:
   - https://aoneproweather.vercel.app
   - http://localhost:5588
4. http:// vs https:// 정확히 구분
5. 저장 후 5-10분 대기 (카카오 서버 반영)
6. 앱 새로고침
```

### 문제 3: 검색 결과가 비어있음

**원인:** 검색어가 부정확하거나 API 미승인

**해결:**
```
1. 정확한 주소명 입력:
   ✅ "강남구 역삼동"
   ❌ "강남 역삼동" (구 이름 생략)
2. 띄어쓰기 확인
3. 카카오 개발자 센터에서 [로컬 API 제품] 승인 확인
4. 브라우저 콘솔(F12) → Console 탭에서 에러 확인
```

### 문제 4: 로컬 개발(localhost)에서만 작동

**원인:** 환경 변수가 로컬과 배포 환경에서 다름

**해결:**
```
로컬: npm run dev
→ .env.local 파일 참조
→ NEXT_PUBLIC_APP_URL=http://localhost:5588

배포: Vercel
→ 환경 변수 설정 참조
→ NEXT_PUBLIC_APP_URL=https://aoneproweather.vercel.app

둘 다 제대로 설정되어 있는지 확인!
```

---

## ✅ 완료 체크리스트

- [ ] 카카오 개발자 센터 가입
- [ ] 앱 만들기 완료
- [ ] Web 플랫폼 등록 완료
- [ ] 도메인 추가 완료:
  - [ ] https://aoneproweather.vercel.app
  - [ ] http://localhost:5588
- [ ] REST API 키 복사
- [ ] Vercel 환경 변수 설정:
  - [ ] NEXT_PUBLIC_KAKAO_API_KEY
  - [ ] NEXT_PUBLIC_APP_URL
- [ ] 배포 완료 (상태 확인)
- [ ] 주소 검색 테스트 성공
- [ ] 읍/면/동/리 정보 표시 확인

---

## 📞 추가 지원

**카카오 개발자 커뮤니티:**
- [카카오 데브톡](https://devtalk.kakao.com)
- [카카오 로컬 API 문서](https://developers.kakao.com/docs/latest/ko/local/dev-guide)

**Vercel 지원:**
- [Vercel 대시보드 Support](https://vercel.com/support)

---

**최종 수정**: 2026-04-12
**UI 버전**: 최신 카카오 개발자 센터 2026년 버전
**예상 소요 시간**: 5-10분
