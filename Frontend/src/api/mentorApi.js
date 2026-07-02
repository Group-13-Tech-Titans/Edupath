import { apiRequest } from "./client.js";

// Dashboard & Analytics
export const getDashboardData = () => apiRequest("/api/mentor/dashboard");
export const getMentorAnalytics = () => apiRequest("/api/mentor/analytics");

// Profile
export const getMentorProfile = () => apiRequest("/api/mentor/profile");
export const createMentorProfile = (data) => apiRequest("/api/mentor/profile", {
  method: "POST",
  body: JSON.stringify(data)
});
export const updateMentorProfile = (data) => apiRequest("/api/mentor/profile", {
  method: "PUT",
  body: JSON.stringify(data)
});
export const getMentorReviews = () => apiRequest("/api/mentor/profile/reviews");
export const getPublicMentorProfile = (mentorId) => apiRequest(`/api/mentor/profile/${mentorId}`);
export const getMentorsByField = (field) => apiRequest(`/api/mentor/profiles?field=${field || ""}`);

// Sessions
export const getMentorSessions = () => apiRequest("/api/mentor/sessions");
export const getStudentSessions = () => apiRequest("/api/mentor/sessions/student");
export const getSessionStats = () => apiRequest("/api/mentor/sessions/stats");
export const acceptSession = (id, data) => apiRequest(`/api/mentor/sessions/${id}/accept`, { 
  method: "PUT",
  body: JSON.stringify(data)
});
export const declineSession = (id) => apiRequest(`/api/mentor/sessions/${id}/decline`, { method: "PUT" });
export const completeSession = (id) => apiRequest(`/api/mentor/sessions/${id}/complete`, { method: "PUT" });
export const requestSession = (data) => apiRequest("/api/mentor/sessions/request", {
  method: "POST",
  body: JSON.stringify(data)
});

// Students
export const getMentorStudents = () => apiRequest("/api/mentor/students");
export const getStudentStats = () => apiRequest("/api/mentor/students/stats");
export const getStudentById = (studentId) => apiRequest(`/api/mentor/students/${studentId}`);
export const updateStudentNotes = (studentId, notes) => apiRequest(`/api/mentor/students/${studentId}/notes`, {
  method: "PATCH",
  body: JSON.stringify({ notes })
});

// Resources
export const getMentorResources = () => apiRequest("/api/mentor/resources");
export const getMyResources = () => apiRequest("/api/mentor/resources/mine");
export const shareResource = (data) => apiRequest("/api/mentor/resources", {
  method: "POST",
  body: JSON.stringify(data)
});
export const deleteResource = (id) => apiRequest(`/api/mentor/resources/${id}`, { method: "DELETE" });
export const updateResource = (id, data) => apiRequest(`/api/mentor/resources/${id}`, {
  method: "PUT",
  body: JSON.stringify(data)
});

// Messages
export const getConversations = () => apiRequest("/api/mentor/messages/conversations");
export const getMessages = (targetId) => apiRequest(`/api/mentor/messages/conversations/${targetId}`);
export const sendMessage = (data) => apiRequest("/api/mentor/messages/send", {
  method: "POST",
  body: JSON.stringify(data)
});
export const markAsRead = (targetId) => apiRequest(`/api/mentor/messages/conversations/${targetId}/read`, { method: "PUT" });
export const getUnreadCount = () => apiRequest("/api/mentor/messages/unread-count");
export const getEligibleMentors = () => apiRequest("/api/mentor/messages/eligible-mentors");
