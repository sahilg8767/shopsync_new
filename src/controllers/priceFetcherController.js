exports.fetchPrices = async (req, res) => {
    try {
        const queryData = req.body;

        if (!queryData || Object.keys(queryData).length === 0) {
            return res.status(400).json({ message: 'No data provided' });
        }

        const productName = queryData.ocr_text || queryData.productName || 'Unknown Product';
        console.log(`--- Searching prices for: ${productName} ---`);

        // Hardcoded mock values for development/testing
        const mockResults = {
            blinkit: {
                price: "55",
                delivery_time: "10-15 mins"
            },
            zepto: {
                price: "52",
                delivery_time: "10 mins"
            },
            swiggy_instamart: {
                price: "58",
                delivery_time: "15-20 mins"
            },
            bigbasket: {
                price: "60",
                delivery_time: "30-60 mins"
            }
        };

        // Simulate a slight network delay (1.5 seconds) to make the UI look realistic
        setTimeout(() => {
            res.status(200).json({
                message: 'Prices fetched successfully',
                receivedData: queryData,
                results: mockResults
            });
        }, 1500);

    } catch (error) {
        console.error('Error fetching prices:', error);
        res.status(500).json({ message: 'Server error fetching prices', error: error.message });
    }
};
