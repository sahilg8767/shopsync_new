// exports.receiveOCRData = async (req, res) => {
//     try {
//         const ocrData = req.body;

//         if (!ocrData || Object.keys(ocrData).length === 0) {
//             return res.status(400).json({ message: 'No OCR data provided' });
//         }

//         console.log('--- Received OCR Data ---');
//         console.log(JSON.stringify(ocrData, null, 2));
//         console.log('-------------------------');

//         res.status(200).json({
//             message: 'OCR data received successfully',
//             receivedData: ocrData
//         });
//     } catch (error) {
//         console.error('Error processing OCR data:', error);
//         res.status(500).json({ message: 'Server error processing OCR data', error: error.message });
//     }
// };

exports.receiveOCRData = async (req, res) => {
    try {
        const ocrData = req.body;

        if (!ocrData || Object.keys(ocrData).length === 0) {
            return res.status(400).json({ message: 'No OCR data provided' });
        }

        const productName = ocrData.ocr_text || 'Unknown Product';
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
                message: 'OCR data processed and prices fetched successfully',
                receivedData: ocrData,
                results: mockResults
            });
        }, 1500);

    } catch (error) {
        console.error('Error processing OCR data:', error);
        res.status(500).json({ message: 'Server error processing OCR data', error: error.message });
    }
};


