import { apiRequest } from "./client.js";

export const quizApi = {
  // 1. Fetch the questions you created in the Admin Panel
  getQuestions: async () => {
    try {
      console.log("Fetching PathFinder questions from backend...");
      const data = await apiRequest("/api/admin/questions", {
        method: "GET" 
      });
      return data;
    } catch (error) {
      console.error("Quiz API Error (getQuestions):", error);
      throw error;
    }
  },

  // 2. We will use this later when the student clicks "Start Path"
  submitQuiz: async (payload) => {
    try {
      const data = await apiRequest("/api/student/quiz", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      return data;
    } catch (error) {
      console.error("Quiz API Error (submitQuiz):", error);
      throw error;
    }
  }
};