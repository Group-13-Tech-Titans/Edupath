import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { mockCourses } from "../data/mockCourses.js";
import * as authApi from "../api/authApi.js";
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
  courses: mockCourses,
  mentorRequests: [],
  lessonProgress: {},
  payouts: {},
  reviewHistory: [],
  reviewerAccounts: [],
};

function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...defaultState };
    }
    const parsed = JSON.parse(raw);
    return {
      ...defaultState,
      ...parsed,
      currentUser: null,
      authLoading: true,
      users: parsed.users || [],
      courses: parsed.courses || mockCourses,
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
    // run once only (cleanup legacy keys)
    if (localStorage.getItem("token")) localStorage.removeItem("token");
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setState((prev) => ({ ...prev, authLoading: false }));
      return;
    }
    authApi
      .getMe()
      .then((user) => {
        setState((prev) => ({
          ...prev,
          currentUser: normalizeUser(user),
          authLoading: false,
        }));
      })
      .catch(() => {
        setToken(null);
        setState((prev) => ({
          ...prev,
          currentUser: null,
          authLoading: false,
        }));
      });
  }, []);

  const setSession = useCallback((token, user) => {
    setToken(token); // ✅ saves to edupath_token
    setState((prev) => ({
      ...prev,
      currentUser: normalizeUser(user),
      authLoading: false,
    }));
  }, []);

  const login = useCallback(
    async (email, password) => {
      try {
        const result = await authApi.login(email.trim(), password);
        setSession(result.token, result.user); // ✅ needs authApi.login to return token too
        return { success: true, user: result.user };
      } catch (err) {
        return {
          success: false,
          message: err.message || "Invalid credentials",
        };
      }
    },
    [setSession],
  );

  const logout = useCallback(() => {
    setToken(null); // removes edupath_token
    localStorage.removeItem("edupath_user");
    localStorage.removeItem("user"); // optional if you used it before
    setState((prev) => ({ ...prev, currentUser: null }));
  }, []);

  const signupAccount = useCallback(async (payload) => {
    try {
      await authApi.register({
        email: payload.email,
        password: payload.password,
        role: "pending",
      });
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.message || "Unable to create account",
      };
    }
  }, []);

  const signupStudent = useCallback(async (formData) => {
    try {
      const result = await authApi.updateProfile({
        name: `${formData.firstName} ${formData.lastName}`,
        role: "student",
        password: formData.password,
        profile: formData,
      });
      setState((prev) => ({
        ...prev,
        currentUser: normalizeUser(result.user),
      }));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.message || "Unable to complete registration",
      };
    }
  }, []);

  const signupEducator = useCallback(async (formData) => {
    try {
      const result = await authApi.updateProfile({
        name: formData.fullName,
        role: "educator",
        password: formData.password,
        status: "PENDING_VERIFICATION",
        specializationTag: formData.specializationTag,
        profile: formData,
      });
      setState((prev) => ({
        ...prev,
        currentUser: normalizeUser(result.user),
      }));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.message || "Unable to complete registration",
      };
    }
  }, []);

  const createReviewer = useCallback(
    (payload) => {
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
        specializationTag: payload.specializationTag,
      };
      setState((prev) => ({
        ...prev,
        users: [...prev.users, reviewer],
        reviewerAccounts: [...prev.reviewerAccounts, reviewer],
      }));
      return { success: true };
    },
    [state.users, state.reviewerAccounts],
  );

  const verifyEducator = useCallback((educatorEmail, status) => {
    setState((prev) => {
      const users = prev.users.map((u) =>
        u.email === educatorEmail && u.role === "educator"
          ? { ...u, status }
          : u,
      );
      return { ...prev, users };
    });
  }, []);

  const createCourse = useCallback((courseData) => {
    const newCourse = {
      ...courseData,
      id: `c-${Date.now()}`,
      status: "pending",
    };
    setState((prev) => ({ ...prev, courses: [newCourse, ...prev.courses] }));
    return newCourse;
  }, []);

  const updateCourse = useCallback((courseId, updatedData) => {
    setState((prev) => {
      const courses = prev.courses.map((c) =>
        c.id === courseId ? { ...c, ...updatedData } : c,
      );
      return { ...prev, courses };
    });
  }, []);

  const approveCourse = useCallback((courseId, reviewer) => {
    setState((prev) => {
      const courses = prev.courses.map((c) =>
        c.id === courseId ? { ...c, status: "approved" } : c,
      );
      const historyItem = {
        id: `rh-${Date.now()}`,
        courseId,
        decision: "approved",
        reviewerEmail: reviewer?.email,
        createdAt: new Date().toISOString(),
      };
      return {
        ...prev,
        courses,
        reviewHistory: [historyItem, ...prev.reviewHistory],
      };
    });
  }, []);

  const rejectCourse = useCallback((courseId, reviewer, notes) => {
    setState((prev) => {
      const courses = prev.courses.map((c) =>
        c.id === courseId ? { ...c, status: "rejected" } : c,
      );
      const historyItem = {
        id: `rh-${Date.now()}`,
        courseId,
        decision: "rejected",
        reviewerEmail: reviewer?.email,
        notes: notes || "",
        createdAt: new Date().toISOString(),
      };
      return {
        ...prev,
        courses,
        reviewHistory: [historyItem, ...prev.reviewHistory],
      };
    });
  }, []);

  const saveMentorRequest = useCallback((payload) => {
    setState((prev) => ({
      ...prev,
      mentorRequests: [
        {
          id: `mr-${Date.now()}`,
          ...payload,
        },
        ...prev.mentorRequests,
      ],
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
            [courseId]: Array.from(courseProgress),
          },
        },
      };
    });
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
    signupAccount,
    signupStudent,
    signupEducator,
    createReviewer,
    verifyEducator,
    createCourse,
    updateCourse,
    approveCourse,
    rejectCourse,
    saveMentorRequest,
    markLessonCompleted,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);
