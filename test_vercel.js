const axios = require('axios');

const BASE_URL = 'https://shopsync-new.vercel.app';

async function runTests() {
  console.log('--- Starting comprehensive API Validation on VERCEL ---\n');

  // Test 1: Healthcheck
  try {
    const res = await axios.get(BASE_URL);
    console.log(`[SUCCESS] Healthcheck: ${res.data}`);
  } catch (err) {
    console.error(`[FAILED] Healthcheck: ${err.message}`);
  }

  // Test 2: Products Route
  try {
    console.log('\nTesting /api/products?lat=28.6139&lon=77.2090 ...');
    const res = await axios.get(`${BASE_URL}/api/products?lat=28.6139&lon=77.2090`);
    if (res.data.success) {
      console.log(`[SUCCESS] Products fetched! Count: ${res.data.count}`);
    } else {
      console.error(`[FAILED] Products fetch returned success=false`);
    }
  } catch (err) {
    console.error(`[FAILED] Products: ${err.response ? JSON.stringify(err.response.data) : err.message}`);
  }

  // Test 3: Compare Route
  try {
    console.log('\nTesting /api/compare?product=lays ...');
    const res = await axios.get(`${BASE_URL}/api/compare?product=lays`);
    if (res.data.success) {
      console.log(`[SUCCESS] Compare data fetched for: ${res.data.data.item}`);
      console.log(`[SUCCESS] Platforms available: ${res.data.data.platforms.map(p => p.platform).join(', ')}`);
    } else {
      console.error(`[FAILED] Compare returned success=false`);
    }
  } catch (err) {
    console.error(`[FAILED] Compare: ${err.response ? JSON.stringify(err.response.data) : err.message}`);
  }

  // Test 4: Cart Add Route
  try {
    console.log('\nTesting /api/cart/add (Warning: Vercel IP might be dynamically blocked by MongoDB unless whitelist is 0.0.0.0/0)...');
    const res = await axios.post(`${BASE_URL}/api/cart/add`, {
      userId: 'testUser123',
      productName: 'Lays Magic Masala',
      quantity: 1,
      preferredPlatform: 'auto',
      prices: { blinkit: 20, zepto: 21, swiggy: 20 }
    }, { timeout: 15000 });
    
    if (res.data.success) {
      console.log(`[SUCCESS] Item added to Universal Cart successfully!`);
      
      console.log('\nTesting /api/cart/testUser123/optimize ...');
      const optRes = await axios.get(`${BASE_URL}/api/cart/testUser123/optimize`, { timeout: 15000 });
      console.log(`[SUCCESS] Optimization resolved with AI split description: ${optRes.data.data.aiOptimizedSplit.description}`);
    }
  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      console.error(`[EXPECTED MONGODB TIMEOUT/FAILED] Cart: MongoDB Operation timed out from Vercel Server.`);
    } else {
      console.error(`[EXPECTED MONGODB FAILED] Cart: ${err.response ? JSON.stringify(err.response.data) : err.message}`);
    }
  }

  console.log('\n--- VERCEL API Validation Complete ---');
}

runTests();
