const cheerio = require('cheerio');

async function testParsing() {
    const gid = 'LS04022100'; // 발리오스 CC
    const url = `https://www.weatheri.co.kr/leisure/leisure04.php?gid=${gid}`;
    
    console.log('Fetching:', url);
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    const weeklyForecasts = [];

    // 주간 예보 파싱 로직 재현
    $('table').each((_, tbl) => {
      const text = $(tbl).text();
      if (text.includes('주간예보') && text.includes('최저/최고')) {
        console.log('Found Weekly Table!');
        const rows = $(tbl).find('tr');
        const dates_w = [];
        const index_w = [];
        const status_w = [];
        const temps_w = [];
        const suns_w = [];

        rows.each((ri, tr_w) => {
          const l = $(tr_w).find('td').first().text().trim();
          const tds_w = $(tr_w).find('td');

          if (l.includes('날짜')) {
            tds_w.each((i, td) => { if (i > 0) dates_w.push($(td).text().trim().replace(/\s+/g, ' ')); });
          } else if (l.includes('지수')) {
            tds_w.each((i, td) => { if (i > 0) index_w.push($(td).text().trim()); });
          } else if (l.includes('날씨')) {
            tds_w.each((i, td) => { if (i > 0) {
              const img = $(td).find('img');
              const src = img.attr('src') || '';
              const fileName = src.split('/').pop() || '';
              // status_w.push(weatherMap[fileName] || '맑음'); // weatherMap 생략
              status_w.push('날씨아이콘');
            }});
          } else if (l.includes('최저/최고')) {
            tds_w.each((i, td) => { if (i > 0) temps_w.push($(td).text().trim()); });
          } else if (l.includes('일출일몰')) {
            tds_w.each((i, td) => { if (i > 0) suns_w.push($(td).text().trim()); });
          }
        });

        for (let i = 0; i < dates_w.length; i++) {
          weeklyForecasts.push({
            date: dates_w[i] || '',
            golfIndex: index_w[i] || '0',
            status: status_w[i] || '맑음',
            temps: temps_w[i] || '0/0',
            sunriseSunset: suns_w[i] || '',
          });
        }
      }
    });

    console.log('Result Count:', weeklyForecasts.length);
    if (weeklyForecasts.length > 0) {
        console.log('First Item:', weeklyForecasts[0]);
    } else {
        console.log('Table NOT FOUND or parsing FAILED');
        // fallback: 전체 테이블의 텍스트 출력하여 원인 파악
        $('table').each((i, tbl) => {
            if ($(tbl).text().includes('주간예보')) {
                console.log(`Table ${i} text:`, $(tbl).text().substring(0, 200));
            }
        });
    }
}

testParsing();
