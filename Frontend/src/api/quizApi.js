import axios from "axios";

// Adjust this base URL if your backend runs on a different port (e.g., 5000)
const API_URL = "http://localhost:5000/api/quiz"; 

// Helper to get token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token"); // Or however you store your JWT
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
};

export const quizApi = {
  // Fetch questions from database (You will need to create a backend route for this, 
  // or return default data if the endpoint doesn't exist yet)
  getQuestions: async () => {
    try {
      const response = await axios.get(`${API_URL}/questions`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error("Error fetching questions, using fallbacks.", error);
      throw error;
    }
  },

  // Submit the final quiz to your existing backend controller
  submitQuiz: async (payload) => {
    const response = await axios.post(`${API_URL}/submit`, payload, getAuthHeaders());
    return response.data;
  }
};