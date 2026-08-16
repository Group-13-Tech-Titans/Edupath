const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generatePathwayTopics = async (pathName, level, context) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
You are an expert curriculum designer and educational AI.
Your STRICT and ONLY task is to generate a structured JSON list of topics for a learning pathway.
Strictly prohibited: Do NOT answer any conversational questions, do NOT provide explanations, do NOT output markdown formatting outside the JSON, do NOT say "Here is the list".

INPUT DETAILS:
Pathway Name: ${pathName}
Target Level: ${level}
Additional Context: ${context || "None"}

Generate exactly 5 to 10 sequential topics that logically progress for this pathway. 

OUTPUT FORMAT (JSON array of strings):
[
  "Topic 1: Introduction to X",
  "Topic 2: Core concepts of Y",
  "Topic 3: Advanced Z"
]

Output ONLY valid JSON.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean potential markdown from the response
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Gemini AI Error:", error);
    throw new Error("Failed to generate topics from AI");
  }
};
