# 카카오 API 빠른 시작 가이드 (5분 완성)

## ⏱️ 예상 시간: 5분

---

## 🚀 Step 1: 카카오 계정 로그인
https://developers.kakao.com 접속 후 로그인

---

## 🏗️ Step 2: 앱 만들기

### 위치
상단 우측 **프로필 아이콘** → **내 애플리케이션** → **[앱 만들기]**

### 입력 정보
```
앱 이름: A-One Pro Weather
(또는 원하는 이름)
```

**[만들기]** 클릭 → 완료

---

## 🌐 Step 3: Web 플랫폼 등록 (중요!)

### 앱 선택 후
**[앱 설정] → [플랫폼]** 메뉴 이동

### Web 플랫폼 추가
"Web 플랫폼" 카드에서 **[추가]** 또는 **[등록]** 클릭

### 도메인 입력
```
https://aoneproweather.vercel.app
http://localhost:5588
```

**[저장]** 클릭

---

## 🔐 Step 4: REST API 키 복사

### 키 위치
같은 앱 설정 페이지의 **[앱 키]** 섹션

### 복사할 키
```
REST API 키: xxxxxxxxxxxxxxxxxxxxx
```

**복사 아이콘** 클릭 또는 드래그로 선택 후 복사

---

## 📌 Step 5: Vercel 환경 변수 설정

### Vercel 대시보드 접속
https://vercel.com/dashboard

### aoneproweather 프로젝트 선택

### Settings 메뉴
**[Settings] → [Environment Variables]**

### 새 변수 추가
1. **Variable Name**: `NEXT_PUBLIC_KAKAO_API_KEY`
2. **Value**: (위에서 복사한 REST API 키 붙여넣기)
3. **Environment**: Production, Preview, Development 모두 체크
4. **[Save]** 클릭

### 또 다른 변수 (선택사항)
```
NEXT_PUBLIC_APP_URL = https://aoneproweather.vercel.app
```

---

## ✅ Step 6: 배포 확인

### 옵션 A: 자동 재배포 (권장)
Vercel 환경 변수 저장 → 자동으로 재배포됨

### 옵션 B: 수동 재배포
Vercel Dashboard → [Redeploy] 버튼 클릭

### 배포 상태 확인
```
Dashboard → Deployments → Status 확인
✓ Production 상태 = 배포 완료
```

---

## 🧪 Step 7: 기능 테스트

### 앱 접속
https://aoneproweather.vercel.app

### 주소 검색 테스트
1. 검색창에 **"강남구 역삼동"** 입력
2. 결과가 표시되는지 확인
3. 읍/면/동 정보가 포함되는지 확인

### 또는 도로명 주소로 검색
```
"서울 강남구 강남대로"
```

### 성공 표시
- ✅ 검색 결과 표시됨
- ✅ 상세 주소(시/도/구/동) 포함
- ✅ 에러 메시지 없음

---

## ❌ 문제 해결

### "키 오류" 또는 "401 Unauthorized"
1. REST API 키를 정확히 복사했는지 확인
2. Vercel 환경 변수에 **정확히** 붙여넣었는지 확인
3. Vercel에서 **[Redeploy]** 클릭
4. 배포 완료 대기 (1-2분)
5. 앱 새로고침 (F5)

### CORS 또는 도메인 오류
1. 카카오 개발자 센터 → [앱 설정] → [플랫폼]
2. **Web 플랫폼**에 다음 도메인들이 **모두** 등록되었는지 확인:
   ```
   https://aoneproweather.vercel.app
   http://localhost:5588
   ```
3. http:// vs https:// 정확히 확인
4. 저장 후 5-10분 기다리기 (카카오 서버 반영)

### 검색 결과가 비어있음
1. 정확한 주소명 입력 (예: "강남 역삼동" ❌ → "강남구 역삼동" ✅)
2. 띄어쓰기 정확히 입력
3. 카카오 개발자 센터에서 **[로컬] API 승인**했는지 확인

---

## 💡 팁

- 환경 변수 변경 후 **반드시 재배포** 필요
- 로컬 개발(`npm run dev`) 시 환경 변수는 자동 반영됨
- 카카오 도메인 변경 후 **5-10분** 대기 권장
- 브라우저 콘솔(F12)에서 Network 탭 확인 시 API 요청 상태 볼 수 있음

---

## 📞 도움말

**카카오 문제:** [카카오 데브톡](https://devtalk.kakao.com)
**Vercel 문제:** [Vercel Support](https://vercel.com/support)

---

**최종 수정**: 2026-04-12
**설정 완료 예상 시간**: 5분
