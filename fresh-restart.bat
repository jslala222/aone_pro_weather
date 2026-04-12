@echo off
chcp 65001 > nul
title Golf Caddy Fresh Restart
cd /d "C:\Users\User\Desktop\제미나이 3\연습\Antigravity\golf-caddy"

echo.
echo ╔════════════════════════════════════════════════════╗
echo ║                                                    ║
echo ║       🔄 Golf Caddy 서버 재시작 중...            ║
echo ║                                                    ║
echo ╚════════════════════════════════════════════════════╝
echo.

echo [1/3] 기존 서버 프로세스 종료...
for /f "tokens=5" %%a in ('netstat -ano ^| find ":4455"') do (
    taskkill //F //PID %%a >nul 2>&1
)
timeout /t 2 /nobreak > nul

echo [2/3] 캐시 삭제 + 빌드 + 서버 시작...
call npm run fresh

echo.
echo ✅ 완료! 브라우저를 열고 주소를 입력하세요:
echo    http://localhost:4455
echo.
pause
