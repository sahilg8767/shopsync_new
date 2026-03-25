exports.getComparison = (req, res) => {
    try {
        // Express allows reading req.body even in GET requests
        // If not present in body, we could also check req.query, but let's stick to the user's JSON structure.
        const data = req.body;

        // If body is empty, they might be lacking Content-Type headers or doing standard GET without body
        if (!data || Object.keys(data).length === 0) {
            return res.status(400).json({ 
                error: 'Request body is empty.',
                message: 'Please ensure you are sending JSON in the request body with Content-Type: application/json' 
            });
        }

        const { product_name, location, platforms } = data;

        // Here we mock the response based on the required structure 
        // In a real application, you would query databases or external APIs
        const results = {};
        
        if (platforms && platforms.includes('blinkit')) {
            results.blinkit = { price: "55.00", delivery_time: "10 mins", delivery_fee: "Free" };
        }
        if (platforms && platforms.includes('swiggy_instamart')) {
            results.swiggy_instamart = { price: "58.00", delivery_time: "15 mins", delivery_fee: "₹25" };
        }
        if (platforms && platforms.includes('zepto')) {
            results.zepto = { price: "52.00", delivery_time: "8 mins", delivery_fee: "Free" };
        }

        // Send the exact response structure the user requested
        return res.status(200).json({
            product_name: product_name || (data.ocr_text || "Unknown Product"),
            location: {
                city: location?.city || "Unknown",
                pincode: location?.pincode || "Unknown"
            },
            results: results
        });

    } catch (error) {
        console.error('Error in compare endpoint:', error);
        return res.status(500).json({ error: 'Server error processing comparison data' });
    }
};
