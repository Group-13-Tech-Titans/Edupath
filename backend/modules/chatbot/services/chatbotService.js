const { GoogleGenerativeAI } = require("@google/generative-ai");
const { chatbotSystemInstruction } = require("../../../prompts/chatbotPrompts");

exports.generateChatResponse = async (history, newMessage) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      systemInstruction: chatbotSystemInstruction,
    });

    const formattedHistory = [];
    for (const msg of history) {
      const role = msg.sender === 'user' ? 'user' : 'model';
      
      // History must start with 'user'
      if (formattedHistory.length === 0 && role === 'model') {
        continue;
      }

      if (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === role) {
        // Merge consecutive messages from the same role
        formattedHistory[formattedHistory.length - 1].parts[0].text += '\n' + msg.text;
      } else {
        formattedHistory.push({ role, parts: [{ text: msg.text }] });
      }
    }

    const chat = model.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessage(newMessage);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API Error:", error.message || error);
    // Return a friendly fallback message instead of crashing the chat for the user
    return "I'm sorry, I'm having a little trouble connecting right now (I might be overwhelmed!). Could we try that again in a moment?";
  }
};
