import { scrapeGolfWeather } from '../src/lib/weather-engine';

async function test() {
  const result = await scrapeGolfWeather('LS04013400');
  console.log('Result for Balios CC (LS04013400):');
  console.log(JSON.stringify(result, null, 2));
}

test();
