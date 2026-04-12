@echo off
chcp 65001 > nul
echo.
echo [add-fresh] package.json에 fresh 스크립트를 추가합니다...
echo.

if not exist "package.json" (
    echo ERROR: package.json을 찾을 수 없습니다.
    echo Next.js 프로젝트 폴더에서 실행해주세요.
    pause
    exit /b 1
)

node -e "const fs=require('fs');const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));if(pkg.scripts&&pkg.scripts.fresh){console.log('이미 fresh 스크립트가 있습니다: '+pkg.scripts.fresh);process.exit(0);}if(!pkg.scripts)pkg.scripts={};pkg.scripts.fresh='npx rimraf .next && npm run build && npm start';fs.writeFileSync('package.json',JSON.stringify(pkg,null,2),'utf8');console.log('fresh 스크립트 추가 완료!');console.log('이제 npm run fresh 로 실행하면 캐시 완전 초기화 후 재시작됩니다.');"

echo.
pause
