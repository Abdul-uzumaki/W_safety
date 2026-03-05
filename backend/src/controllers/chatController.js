const axios = require('axios');

// POST /api/chat
const chatProxy = async (req, res, next) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ success: false, error: 'Message required' });

        // Assuming chatbot (Python app) is running on port 5000
        const pythonAppUrl = process.env.CHATBOT_URL || 'http://localhost:5000/api/chat';

        const response = await axios.post(pythonAppUrl, { message });

        res.json(response.data);
    } catch (error) {
        console.error('Chatbot API Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: 'Unable to connect to AI assistant. Please try again later.',
        });
    }
};

module.exports = { chatProxy };
