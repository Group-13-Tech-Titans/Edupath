const { GoogleGenerativeAI } = require("@google/generative-ai");
const { buildPathwayGenerationPrompt } = require("../prompts/pathwayPrompts");

exports.generatePathway = async ({ path, level }) => {

  // 🔥 TEMP (later connect Gemini)
  if (path === "Web Development") {
    return [
      {
        title: "Learn HTML",
        description: "Basics of HTML",
        type: "course",
        resource: "YouTube"
      },
      {
        title: "Learn CSS",
        description: "Styling",
        type: "course",
        resource: "YouTube"
      },
      {
        title: "Build Portfolio Website",
        description: "Project",
        type: "project"
      }
    ];
  }

  return [];
};

exports.generatePathwayTopics = async (pathName, level, context) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const prompt = buildPathwayGenerationPrompt(pathName, level, context);

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