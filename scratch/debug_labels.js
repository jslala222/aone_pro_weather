const cheerio = require('cheerio');

async function debugScraper(gid) {
    const url = `https://www.weatheri.co.kr/leisure/leisure04.php?gid=${gid}`;
    console.log(`Fetching ${url}...`);
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const html = await response.text();
        const $ = cheerio.load(html);
        
        console.log('--- Row Labels Found ---');
        $('tr').each((i, tr) => {
            const tds = $(tr).find('td');
            const label = tds.first().text().trim();
            const labelClean = label.replace(/\s+/g, '');
            
            if (label) {
                console.log(`Row ${i} | Raw: "${label}" | Clean: "${labelClean}" | TD Count: ${tds.length}`);
                
                if (labelClean.includes('기온') || labelClean.includes('골프지수') || labelClean.includes('지수')) {
                    const vals = [];
                    tds.each((j, td) => {
                        if (j > 0) vals.push($(td).text().trim());
                    });
                    console.log(`   -> Values: ${vals.slice(0, 5).join(', ')}...`);
                }
            }
        });
    } catch (error) {
        console.error('Error:', error.message);
    }
}

debugScraper('LS04013400');
