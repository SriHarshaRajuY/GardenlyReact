// api/utils/performanceTest.js
import { performance } from 'perf_hooks';

const API_URL = 'http://localhost:3000/api/products';

async function runTest() {
  console.log('--- Redis Performance Test ---');
  
  try {
    // 1. Initial request (Cache Miss)
    console.log('Making initial request (Cache Miss)...');
    const start1 = performance.now();
    const res1 = await fetch(API_URL);
    if (!res1.ok) throw new Error(`HTTP error! status: ${res1.status}`);
    await res1.json();
    const end1 = performance.now();
    const timeMiss = end1 - start1;
    console.log(`Initial Request Time: ${timeMiss.toFixed(2)}ms`);

    // 2. Second request (Cache Hit)
    console.log('Making second request (Cache Hit)...');
    const start2 = performance.now();
    const res2 = await fetch(API_URL);
    if (!res2.ok) throw new Error(`HTTP error! status: ${res2.status}`);
    await res2.json();
    const end2 = performance.now();
    const timeHit = end2 - start2;
    console.log(`Cached Request Time: ${timeHit.toFixed(2)}ms`);

    // 3. Results
    const improvement = ((timeMiss - timeHit) / timeMiss) * 100;
    console.log('\n--- Summary ---');
    console.log(`Improvement: ${improvement.toFixed(2)}%`);
    console.log(`Saved Time: ${(timeMiss - timeHit).toFixed(2)}ms`);
    
  } catch (err) {
    console.error('Error during performance test:', err.message);
    console.log('Note: Make sure the server is running on http://localhost:3000 and Redis is connected.');
  }
}

runTest();
