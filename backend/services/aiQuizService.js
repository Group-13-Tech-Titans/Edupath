exports.generateQuiz = async ({ stepTitle, level }) => {

  // 🔥 Replace later with Gemini API
  return [
    {
      question: `What is ${stepTitle}?`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: "Option A"
    },
    {
      question: `Why is ${stepTitle} important?`,
      options: ["A", "B", "C", "D"],
      correctAnswer: "B"
    }
  ];
};