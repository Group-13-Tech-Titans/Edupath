import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as authApi from "../api/authApi.js";
import * as courseApi from "../api/courseApi.js";
import { getToken, setToken } from "../api/client.js";

const STORAGE_KEY = "edupath_app_state_v1";

const AppContext = createContext(null);

function normalizeUser(u) {
  if (!u) return null;
  const user = { ...u };
  if (user._id && !user.id) user.id = user._id.toString();
  return user;
}

const defaultState = {
  currentUser: null,
  authLoading: true,
  users: [],
  courses: [],
  mentorRequests: [],
  lessonProgress: {},
  payouts: {},
  reviewHistory: [],
  reviewerAccounts: []
};

function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultState };
    const parsed = JSON.parse(raw);
    return {
      ...defaultState,
      ...parsed,
      currentUser: null,
      authLoading: true,
      users: parsed.users || [],
      courses: parsed.courses || []
    };
  } catch (e) {
    console.error("Failed to load state", e);
    return { ...defaultState };
  }
}

function persistState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to persist state", e);
  }
}

export const AppProvider = ({ children }) => {
  const [state, setState] = useState(() => loadState());

  useEffect(() => {
    persistState(state);
  }, [state]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setState((prev) => ({ ...prev, authLoading: false }));
      return;
    }
    authApi
      .getMe()
      .then((user) => {
        setState((prev) => ({ ...prev, currentUser: normalizeUser(user), authLoading: false }));
      })
      .catch(() => {
        setToken(null);
        setState((prev) => ({ ...prev, currentUser: null, authLoading: false }));
      });
  }, []);

  const validateSession = useCallback(async () => {
    if (!getToken()) return;
    try {
      const user = await authApi.getMe();
      setState((prev) => ({ ...prev, currentUser: normalizeUser(user), authLoading: false }));
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        setToken(null);
        setState((prev) => ({ ...prev, currentUser: null, authLoading: false }));
      } else {
        console.warn("Session check failed without logging out:", err.message);
      }
    }
  }, []);

  useEffect(() => {
    if (!state.currentUser) return;

    const interval = window.setInterval(validateSession, 10000);
    const handleFocus = () => validateSession();
    const handleVisibilityChange = () => {
      if (!document.hidden) validateSession();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [state.currentUser?.id, validateSession]);

  const login = useCallback(async (email, password) => {
    try {
      const result = await authApi.login(email.trim(), password);
      if (result.requiresTwoFactor) return result;
      setState((prev) => ({ ...prev, currentUser: normalizeUser(result.user) }));
      return { success: true, user: result.user };
    } catch (err) {
      return { success: false, message: err.message || "Invalid credentials" };
    }
  }, []);

  const verifyLoginOtp = useCallback(async (email, otp) => {
    try {
      const result = await authApi.verifyLoginOtp(email.trim(), otp);
      setState((prev) => ({ ...prev, currentUser: normalizeUser(result.user) }));
      return { success: true, user: result.user };
    } catch (err) {
      return { success: false, message: err.message || "Invalid verification code" };
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setState((prev) => ({ ...prev, currentUser: null }));
  }, []);

  const logoutAllDevices = useCallback(async () => {
    try {
      await authApi.logoutAllDevices();
      setToken(null);
      setState((prev) => ({ ...prev, currentUser: null }));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message || "Failed to log out from all devices" };
    }
  }, []);

  const signupAccount = useCallback(async (payload) => {
    try {
      await authApi.register({
        email: payload.email,
        password: payload.password,
        role: "pending"
      });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message || "Unable to create account" };
    }
  }, []);

  const signupStudent = useCallback(async (formData) => {
    try {
      const result = await authApi.updateProfile({
        name: `${formData.firstName} ${formData.lastName}`,
        role: "student",
        password: formData.password,
        profile: formData
      });
      setState((prev) => ({ ...prev, currentUser: normalizeUser(result.user) }));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message || "Unable to complete registration" };
    }
  }, []);

  const signupEducator = useCallback(async (formData) => {
    try {
      const result = await authApi.registerEducator({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        contact: formData.contact,
        specializationTag: formData.specializationTag,
        credentialsLink: formData.credentialsLink
      });
      setState((prev) => ({ ...prev, currentUser: normalizeUser(result.user) }));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message || "Unable to complete registration" };
    }
  }, []);

  const createReviewer = useCallback((payload) => {
    const exists = state.users.find((u) => u.email === payload.email);
    if (exists) return { success: false, message: "Email already in use" };
    const reviewer = {
      id: `u-${Date.now()}`,
      name: payload.name,
      role: "reviewer",
      email: payload.email,
      password: payload.password,
      specializationTag: payload.specializationTag
    };
    setState((prev) => ({
      ...prev,
      users: [...prev.users, reviewer],
      reviewerAccounts: [...prev.reviewerAccounts, reviewer]
    }));
    return { success: true };
  }, [state.users, state.reviewerAccounts]);

  const verifyEducator = useCallback((educatorEmail, status) => {
    setState((prev) => {
      const users = prev.users.map((u) =>
        u.email === educatorEmail && u.role === "educator" ? { ...u, status } : u
      );
      return { ...prev, users };
    });
  }, []);

  const createCourse = useCallback(async (courseData) => {
    try {
      const result = await courseApi.createCourse(courseData);
      const newCourse = { ...result.course, id: result.course._id };
      setState((prev) => ({ ...prev, courses: [newCourse, ...prev.courses] }));
      return { success: true, course: newCourse };
    } catch (err) {
      return { success: false, message: err.message || "Failed to create course" };
    }
  }, []);

  const fetchMyCourses = useCallback(async () => {
    try {
      const courses = await courseApi.getMyCourses();
      const normalized = courses.map((c) => ({ ...c, id: c._id }));
      setState((prev) => ({ ...prev, courses: normalized }));
    } catch (err) {
      console.error("Failed to fetch courses", err);
    }
  }, []);

  const fetchReviewerQueue = useCallback(async () => {
    try {
      const courses = await courseApi.getReviewerQueue();
      const normalized = courses.map((c) => ({ ...c, id: c._id }));
      setState((prev) => ({ ...prev, courses: normalized }));
      return { success: true, courses: normalized };
    } catch (err) {
      console.error("Failed to fetch reviewer queue", err);
      return { success: false, message: err.message || "Failed to fetch reviewer queue" };
    }
  }, []);

  const submitReviewDecision = useCallback(async ({ itemId, decision, rating, notes }) => {
    const status = decision === "approved" ? "approved" : "rejected";
    try {
      const result = await courseApi.updateCourseStatus(itemId, { status, decision, rating, notes });
      const updatedCourse = { ...result.course, id: result.course._id };
      setState((prev) => ({
        ...prev,
        courses: prev.courses.map((c) =>
          c.id === itemId || c._id === itemId ? { ...c, ...updatedCourse } : c
        )
      }));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message || "Failed to submit review" };
    }
  }, []);

  const updateCourse = useCallback((courseId, updatedData) => {
    setState((prev) => ({
      ...prev,
      courses: prev.courses.map((c) => c.id === courseId ? { ...c, ...updatedData } : c)
    }));
  }, []);

  const moveCourseToTrash = useCallback(async (courseId) => {
    try {
      const result = await courseApi.moveCourseToTrash(courseId);
      const trashedCourse = { ...result.course, id: result.course._id };
      setState((prev) => ({
        ...prev,
        courses: prev.courses.map((c) =>
          c.id === courseId || c._id === courseId ? { ...c, ...trashedCourse } : c
        )
      }));
      return { success: true, course: trashedCourse };
    } catch (err) {
      return { success: false, message: err.message || "Failed to move course to trash" };
    }
  }, []);

  const restoreCourseFromTrash = useCallback(async (courseId) => {
    try {
      const result = await courseApi.restoreCourseFromTrash(courseId);
      const restoredCourse = { ...result.course, id: result.course._id };
      setState((prev) => ({
        ...prev,
        courses: prev.courses.map((c) =>
          c.id === courseId || c._id === courseId ? { ...c, ...restoredCourse } : c
        )
      }));
      return { success: true, course: restoredCourse };
    } catch (err) {
      return { success: false, message: err.message || "Failed to restore course" };
    }
  }, []);

  const permanentlyDeleteCourse = useCallback(async (courseId) => {
    try {
      await courseApi.permanentlyDeleteCourse(courseId);
      setState((prev) => ({
        ...prev,
        courses: prev.courses.filter((c) => c.id !== courseId && c._id !== courseId)
      }));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message || "Failed to permanently delete course" };
    }
  }, []);

  const emptyCourseTrash = useCallback(async () => {
    try {
      const result = await courseApi.emptyCourseTrash();
      setState((prev) => ({
        ...prev,
        courses: prev.courses.filter(
          (c) => !(c.trashedAt && c.createdByEducatorEmail === prev.currentUser?.email)
        )
      }));
      return { success: true, deletedCount: result.deletedCount || 0 };
    } catch (err) {
      return { success: false, message: err.message || "Failed to empty trash" };
    }
  }, []);

  const approveCourse = useCallback((courseId, reviewer) => {
    setState((prev) => {
      const courses = prev.courses.map((c) =>
        c.id === courseId ? { ...c, status: "approved" } : c
      );
      const historyItem = {
        id: `rh-${Date.now()}`,
        courseId,
        decision: "approved",
        reviewerEmail: reviewer?.email,
        createdAt: new Date().toISOString()
      };
      return { ...prev, courses, reviewHistory: [historyItem, ...prev.reviewHistory] };
    });
  }, []);

  const rejectCourse = useCallback((courseId, reviewer, notes) => {
    setState((prev) => {
      const courses = prev.courses.map((c) =>
        c.id === courseId ? { ...c, status: "rejected" } : c
      );
      const historyItem = {
        id: `rh-${Date.now()}`,
        courseId,
        decision: "rejected",
        reviewerEmail: reviewer?.email,
        notes: notes || "",
        createdAt: new Date().toISOString()
      };
      return { ...prev, courses, reviewHistory: [historyItem, ...prev.reviewHistory] };
    });
  }, []);

  const saveMentorRequest = useCallback((payload) => {
    setState((prev) => ({
      ...prev,
      mentorRequests: [{ id: `mr-${Date.now()}`, ...payload }, ...prev.mentorRequests]
    }));
  }, []);

  const markLessonCompleted = useCallback((userEmail, courseId, lessonId) => {
    setState((prev) => {
      const userProgress = prev.lessonProgress[userEmail] || {};
      const courseProgress = new Set(userProgress[courseId] || []);
      courseProgress.add(lessonId);
      return {
        ...prev,
        lessonProgress: {
          ...prev.lessonProgress,
          [userEmail]: { ...userProgress, [courseId]: Array.from(courseProgress) }
        }
      };
    });
  }, []);

  const updateUserProfile = useCallback(async (body) => {
    try {
      const result = await authApi.updateProfile(body);
      setState((prev) => ({ ...prev, currentUser: normalizeUser(result.user) }));
      return { success: true, user: result.user };
    } catch (err) {
      return { success: false, message: err.message || "Update failed" };
    }
  }, []);

  const value = {
    state,
    authLoading: state.authLoading,
    currentUser: state.currentUser,
    users: state.users,
    courses: state.courses,
    mentorRequests: state.mentorRequests,
    lessonProgress: state.lessonProgress,
    payouts: state.payouts,
    reviewHistory: state.reviewHistory,
    reviewerAccounts: state.reviewerAccounts,
    login,
    logout,
    logoutAllDevices,
    verifyLoginOtp,
    signupAccount,
    signupStudent,
    signupEducator,
    createReviewer,
    verifyEducator,
    createCourse,
    fetchMyCourses,
    fetchReviewerQueue,
    submitReviewDecision,
    updateCourse,
    moveCourseToTrash,
    restoreCourseFromTrash,
    permanentlyDeleteCourse,
    emptyCourseTrash,
    approveCourse,
    rejectCourse,
    saveMentorRequest,
    markLessonCompleted,
    updateUserProfile
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);
