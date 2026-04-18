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

// Get pending courses that match the logged-in reviewer specializations
export async function getReviewerQueue() {
  const data = await apiRequest("/api/courses/reviewer/queue");
  return data.courses;
}

// Get a single course by ID
export async function getCourseById(courseId) {
  const data = await apiRequest(`/api/courses/${courseId}`);
  return data.course;
}

// Update course status + review (reviewer/admin)
export async function updateCourseStatus(courseId, { status, decision, rating, notes }) {
  const data = await apiRequest(`/api/courses/${courseId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, decision, rating, notes })
  });
  return { success: true, course: data.course };
}

// Update an existing course (educator editing a draft)
export async function updateCourseData(courseId, courseData) {
  const data = await apiRequest(`/api/courses/${courseId}`, {
    method: "PUT",
    body: JSON.stringify(courseData)
  });
  return { success: true, course: data.course };
}

// Move a course to trash (soft delete)
export async function moveCourseToTrash(courseId) {
  const data = await apiRequest(`/api/courses/${courseId}/trash`, {
    method: "PATCH"
  });
  return { success: true, course: data.course };
}

// Restore a course from trash
export async function restoreCourseFromTrash(courseId) {
  const data = await apiRequest(`/api/courses/${courseId}/restore`, {
    method: "PATCH"
  });
  return { success: true, course: data.course };
}

// Permanently delete a trashed course
export async function permanentlyDeleteCourse(courseId) {
  const data = await apiRequest(`/api/courses/${courseId}/permanent`, {
    method: "DELETE"
  });
  return { success: true, deletedCourseId: data.deletedCourseId };
}

// Empty trash for the logged-in educator
export async function emptyCourseTrash() {
  const data = await apiRequest("/api/courses/trash/empty", {
    method: "DELETE"
  });
  return { success: true, deletedCount: data.deletedCount || 0 };
}
