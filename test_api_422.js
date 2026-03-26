require('dotenv').config();
const axios = require('axios');

async function debugAPI() {
    try {
        const response = await axios.get('https://api.quickcommerceapi.com/v1/search', {
            headers: {
                'X-API-Key': process.env.QUICK_COMMERCE_API_KEY
            },
            params: {
                q: 'snacks',
                platform: 'Zepto',
                lat: '28.6139',
                lon: '77.2090'
            }
        });
        console.log("Success:", response.data);
    } catch (e) {
        if (e.response) {
            console.log("Error 422 Payload:", JSON.stringify(e.response.data, null, 2));
        } else {
            console.log("Other error:", e.message);
        }
    }
}
debugAPI();
