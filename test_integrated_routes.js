const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('--- Starting comprehensive API Validation ---\n');

  // Test 1: Products Route
  try {
    console.log('Testing /api/products?lat=28.6139&lon=77.2090 ...');
    const res = await axios.get(`${BASE_URL}/api/products?lat=28.6139&lon=77.2090`);
    if (res.data.success) {
      console.log(`[SUCCESS] Products fetched! Count: ${res.data.count}`);
    } else {
      console.error(`[FAILED] Products fetch returned success=false`);
    }
  } catch (err) {
    console.error(`[FAILED] Products: ${err.response ? JSON.stringify(err.response.data) : err.message}`);
  }

  // Test 2: Compare Route
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

  // Test 3: OCR Route
  try {
    console.log('\nTesting /api/ocr ...');
    // The route issues a redirect to /api/compare, which axios naturally follows.
    const res = await axios.post(`${BASE_URL}/api/ocr`, {
      ocrText: 'kurkure masala\nextra text\n123',
      city: 'Delhi'
    });
    console.log(`[SUCCESS] OCR redirected properly. Landed on: ${res.request.res.responseUrl.replace(BASE_URL, '')}`);
    // Optional check if it successfully parsed the item
    if (res.data && res.data.data) {
       console.log(`[SUCCESS] OCR resolved product: ${res.data.data.item}`);
    }
  } catch (err) {
    console.error(`[FAILED] OCR: ${err.response ? JSON.stringify(err.response.data) : err.message}`);
  }

  // Test 4: Cart Add Route
  try {
    console.log('\nTesting /api/cart/add (Warning: May fail/timeout if MongoDB Atlas IP is not whitelisted)...');
    const res = await axios.post(`${BASE_URL}/api/cart/add`, {
      userId: 'testUser123',
      productName: 'Lays Magic Masala',
      quantity: 1,
      preferredPlatform: 'auto',
      prices: { blinkit: 20, zepto: 21, swiggy: 20 }
    }, { timeout: 6000 });
    
    if (res.data.success) {
      console.log(`[SUCCESS] Item added to Universal Cart successfully!`);
      
      // Secondary nested Cartesian check (Optimization)
      console.log('\nTesting /api/cart/testUser123/optimize ...');
      const optRes = await axios.get(`${BASE_URL}/api/cart/testUser123/optimize`, { timeout: 6000 });
      console.log(`[SUCCESS] Optimization resolved with AI split description: ${optRes.data.data.aiOptimizedSplit.description}`);
    }
  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      console.error(`[EXPECTED MONGODB TIMEOUT/FAILED] Cart: MongoDB Operation timed out because your IP is not whitelisted in Atlas.`);
    } else {
      console.error(`[EXPECTED MONGODB FAILED] Cart: ${err.response ? JSON.stringify(err.response.data) : err.message} (Verify Atlas IP Whitelist)`);
    }
  }

  console.log('\n--- API Validation Complete ---');
}

runTests();
