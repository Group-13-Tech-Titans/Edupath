const { generateChatResponse } = require('../services/chatbotService');

exports.chat = async (req, res) => {
  try {
    const { history, message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const responseText = await generateChatResponse(history || [], message);

    res.status(200).json({
      success: true,
      data: {
        text: responseText,
        sender: 'bot'
      }
    });

  } catch (error) {
    console.error("Chat Controller Error:", error.message || error);
    res.status(500).json({
      success: false,
      error: error.message || "An error occurred while processing your request. Please try again."
    });
  }
};
