const OpenAI = require("openai");

const client = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.OPENROUTER_API_KEY,
});
const { buildPathwayGenerationPrompt } = require("../prompts/pathwayPrompts");

exports.generatePathway = async ({ path, level }) => {

  // 🔥 TEMP (later connect DeepSeek)
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
  const prompt = buildPathwayGenerationPrompt(pathName, level, context);

  try {
    const apiResponse = await client.chat.completions.create({
      model: 'deepseek-v4-flash',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });
    const text = apiResponse.choices[0].message.content;
    
    // Clean potential markdown from the response
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("DeepSeek AI Error:", error);
    throw new Error("Failed to generate topics from AI");
  }
};