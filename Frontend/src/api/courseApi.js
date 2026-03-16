import { apiRequest } from "./client.js";

// Create a new course
export async function createCourse(courseData) {
  const data = await apiRequest("/api/courses", {
    method: "POST",
    body: JSON.stringify(courseData)
  });
  return { success: true, course: data.course };
}

// Get courses for the logged-in educator
export async function getMyCourses() {
  const data = await apiRequest("/api/courses/my");
  return data.courses;
}

// Get all approved courses (public)
export async function getAllCourses() {
  const data = await apiRequest("/api/courses");
  return data.courses;
}

// Get all courses (admin)
export async function getAllCoursesAdmin() {
  const data = await apiRequest("/api/courses/all");
  return data.courses;
}

// Update course status (admin)
export async function updateCourseStatus(courseId, status) {
  const data = await apiRequest(`/api/courses/${courseId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
  return { success: true, course: data.course };
}

// Delete a course
export async function deleteCourse(courseId) {
  await apiRequest(`/api/courses/${courseId}`, { method: "DELETE" });
  return { success: true };
}
