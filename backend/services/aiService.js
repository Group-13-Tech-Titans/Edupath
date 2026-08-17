const OpenAI = require("openai");

const client = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.OPENROUTER_API_KEY,
});
const { buildPathwayGenerationPrompt } = require("../prompts/pathwayPrompts");

exports.generatePathway = async ({ path, level = "Beginner" }) => {
  const normalized = (path || "General Technology").toLowerCase();
  
  if (normalized.includes("web") || normalized.includes("frontend") || normalized.includes("fullstack")) {
    return [
      {
        title: "Web Fundamentals & HTML5/CSS3",
        description: "Master modern semantic HTML structure, responsive styling, flexbox, and CSS grid layout.",
        type: "course",
        resources: [{ title: "Modern HTML5 & CSS3 Masterclass", url: "https://www.w3schools.com/html/", type: "document" }],
        quiz: [{ question: "What HTML tag is used for the largest heading?", options: ["<h6>", "<h1>", "<heading>", "<head>"], correctAnswerIndex: 1 }]
      },
      {
        title: "JavaScript Essentials & DOM Manipulation",
        description: "Learn variables, functions, modern ES6+ features, asynchronous programming, and DOM interaction.",
        type: "course",
        resources: [{ title: "JavaScript for Beginners", url: "https://javascript.info", type: "document" }],
        quiz: [{ question: "Which keyword declares a block-scoped variable in modern JS?", options: ["var", "let", "global", "set"], correctAnswerIndex: 1 }]
      },
      {
        title: "Frontend Framework (React.js)",
        description: "Build interactive user interfaces with components, state management, and modern React hooks.",
        type: "course",
        resources: [{ title: "React Official Documentation", url: "https://react.dev", type: "document" }],
        quiz: [{ question: "What hook is used to manage state in a React component?", options: ["useEffect", "useState", "useContext", "useReducer"], correctAnswerIndex: 1 }]
      },
      {
        title: "Backend API & Database Architecture",
        description: "Create robust RESTful APIs with Node.js/Express and connect with MongoDB databases.",
        type: "course",
        resources: [{ title: "Node.js & Express API Guide", url: "https://expressjs.com", type: "document" }],
        quiz: [{ question: "Which HTTP method is typically used to create a new resource?", options: ["GET", "POST", "PUT", "DELETE"], correctAnswerIndex: 1 }]
      },
      {
        title: "Full-Stack Project Deployment & Production",
        description: "Deploy a production-ready web application with user authentication and cloud hosting.",
        type: "project",
        resources: [{ title: "Deployment Guide", url: "https://vercel.com/docs", type: "document" }],
        quiz: [{ question: "What is CI/CD in modern software development?", options: ["Continuous Integration & Continuous Deployment", "Code Inspection & Code Debugging", "Computer Interface & Core Directory", "Centralized Input & Cloud Distribution"], correctAnswerIndex: 0 }]
      }
    ];
  }

  const pathTitle = path || "Specialization";
  return [
    {
      title: `${pathTitle} - Foundations & Core Principles`,
      description: `Learn the essential theoretical and practical foundations of ${pathTitle}.`,
      type: "course",
      resources: [{ title: `Introduction to ${pathTitle}`, url: "https://en.wikipedia.org/wiki/" + encodeURIComponent(pathTitle), type: "document" }],
      quiz: [{ question: `What is the primary objective in ${pathTitle}?`, options: ["Problem Solving & Value Creation", "Random Testing", "Manual Computation", "Data Storage"], correctAnswerIndex: 0 }]
    },
    {
      title: `${pathTitle} - Practical Tools & Frameworks`,
      description: `Hands-on training with industry-standard development tools and workflows.`,
      type: "course",
      resources: [{ title: "Tooling & Frameworks Guide", url: "https://github.com", type: "document" }],
      quiz: [{ question: "Why are industry frameworks adopted?", options: ["To standardize and accelerate reliable development", "To make code harder to read", "To increase file sizes", "To replace compilers"], correctAnswerIndex: 0 }]
    },
    {
      title: `${pathTitle} - Intermediate Techniques & Optimization`,
      description: `Deep-dive into performance, scalability, and production best practices.`,
      type: "course",
      resources: [{ title: "Best Practices & Design Patterns", url: "https://medium.com", type: "document" }],
      quiz: [{ question: "What is a primary benefit of modular architecture?", options: ["Maintainability & Reusability", "Monolithic coupling", "Hard-coded values", "Slow execution"], correctAnswerIndex: 0 }]
    },
    {
      title: `${pathTitle} - Real-World Capstone Project`,
      description: `Design, build, and deliver a comprehensive portfolio project demonstrating ${level} level proficiency.`,
      type: "project",
      resources: [{ title: "Portfolio Capstone Guide", url: "https://github.com", type: "document" }],
      quiz: [{ question: "What is the final stage of a project lifecycle?", options: ["Testing, Delivery & Evaluation", "Initial Ideation", "Requirement Gathering", "Drafting"], correctAnswerIndex: 0 }]
    }
  ];
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