import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { mockCourses } from "../data/mockCourses.js";

const STORAGE_KEY = "edupath_app_state_v1";

const AppContext = createContext(null);

const defaultUsers = [
  {
    id: "u-admin",
    name: "Platform Admin",
    email: "admin@edupath.com",
    password: "Admin@123",
    role: "admin"
  },
  {
    id: "u-student",
    name: "Demo Student",
    email: "student@edupath.com",
    password: "Student@123",
    role: "student"
  },
  {
    id: "u-educator",
    name: "Demo Educator",
    email: "educator@edupath.com",
    password: "Educator@123",
    role: "educator",
    status: "VERIFIED",
    specializationTag: "web-dev"
  }
];

const defaultState = {
  currentUser: null,
  users: defaultUsers,
  courses: mockCourses,
  mentorRequests: [],
  lessonProgress: {},
  payouts: {},
  reviewHistory: [],
  reviewerAccounts: []
};

function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
      return defaultState;
    }
    const parsed = JSON.parse(raw);
    return {
      ...defaultState,
      ...parsed,
      users: parsed.users || defaultUsers,
      courses: parsed.courses || mockCourses
    };
  } catch (e) {
    console.error("Failed to load state", e);
    return defaultState;
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

  const login = useCallback((email, password) => {
    const user = state.users.find((u) => u.email === email && u.password === password);
    if (!user) return { success: false, message: "Invalid credentials" };
    const newState = { ...state, currentUser: user };
    setState(newState);
    return { success: true, user };
  }, [state]);

  const logout = useCallback(() => {
    setState((prev) => ({ ...prev, currentUser: null }));
  }, []);

  const signupStudent = useCallback((formData) => {
    const exists = state.users.find((u) => u.email === formData.email);
    if (exists) {
      return { success: false, message: "Email already in use" };
    }
    const newUser = {
      id: `u-${Date.now()}`,
      name: `${formData.firstName} ${formData.lastName}`,
      role: "student",
      email: formData.email,
      password: formData.password,
      profile: { ...formData }
    };
    setState((prev) => ({ ...prev, users: [...prev.users, newUser] }));
    return { success: true };
  }, [state.users]);

  const signupEducator = useCallback((formData) => {
    const exists = state.users.find((u) => u.email === formData.email);
    if (exists) {
      return { success: false, message: "Email already in use" };
    }
    const newUser = {
      id: `u-${Date.now()}`,
      name: formData.fullName,
      role: "educator",
      email: formData.email,
      password: formData.password,
      status: "PENDING_VERIFICATION",
      specializationTag: formData.specializationTag,
      profile: { ...formData }
    };
    setState((prev) => ({ ...prev, users: [...prev.users, newUser] }));
    return { success: true };
  }, [state.users]);

  const createReviewer = useCallback((payload) => {
    const exists = state.users.find((u) => u.email === payload.email);
    if (exists) {
      return { success: false, message: "Email already in use" };
    }
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
        u.email === educatorEmail && u.role === "educator"
          ? { ...u, status }
          : u
      );
      return { ...prev, users };
    });
  }, []);

  const createCourse = useCallback((courseData) => {
    const newCourse = {
      ...courseData,
      id: `c-${Date.now()}`,
      status: "pending"
    };
    setState((prev) => ({ ...prev, courses: [newCourse, ...prev.courses] }));
    return newCourse;
  }, []);

  const updateCourse = useCallback((courseId, updatedData) => {
    setState((prev) => {
      const courses = prev.courses.map((c) =>
        c.id === courseId ? { ...c, ...updatedData } : c
      );
      return { ...prev, courses };
    });
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
      mentorRequests: [
        {
          id: `mr-${Date.now()}`,
          ...payload
        },
        ...prev.mentorRequests
      ]
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
          [userEmail]: {
            ...userProgress,
            [courseId]: Array.from(courseProgress)
          }
        }
      };
    });
  }, []);

  const value = {
    state,
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
    signupStudent,
    signupEducator,
    createReviewer,
    verifyEducator,
    createCourse,
    updateCourse,
    approveCourse,
    rejectCourse,
    saveMentorRequest,
    markLessonCompleted
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);

