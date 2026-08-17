const OpenAI = require("openai");
const { chatbotSystemInstruction } = require("../../../prompts/chatbotPrompts");

exports.generateChatResponse = async (history, newMessage) => {
  try {
    const client = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const formattedHistory = [
      { role: "system", content: chatbotSystemInstruction }
    ];

    for (const msg of history) {
      const role = msg.sender === 'user' ? 'user' : 'assistant';
      
      if (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === role && role !== "system") {
        // Merge consecutive messages from the same role
        formattedHistory[formattedHistory.length - 1].content += '\n' + msg.text;
      } else {
        formattedHistory.push({ role, content: msg.text });
      }
    }

    // Add the new message
    formattedHistory.push({ role: 'user', content: newMessage });

    const apiResponse = await client.chat.completions.create({
      model: 'deepseek-v4-flash',
      messages: formattedHistory,
    });

    return apiResponse.choices[0].message.content;
  } catch (error) {
    console.error("DeepSeek API Error:", error.message || error);
    // Return a friendly fallback message instead of crashing the chat for the user
    return "I'm sorry, I'm having a little trouble connecting right now (I might be overwhelmed!). Could we try that again in a moment?";
  }
};
