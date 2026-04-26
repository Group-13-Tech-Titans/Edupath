import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import PropTypes from "prop-types";
import { mockCourses } from "../data/mockCourses.js";
import * as authApi from "../api/authApi.js";
import { getToken, setToken } from "../api/client.js";
import { googleLogout } from "@react-oauth/google";
import * as courseApi from '../api/courseApi';
import axios from "axios";



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
    const raw = globalThis.localStorage.getItem(STORAGE_KEY);
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
    globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
    googleLogout();
    setToken(null); // removes edupath_token
    localStorage.removeItem("edupath_user");
    localStorage.removeItem("user"); // optional if you used it before
    setState((prev) => ({ ...prev, currentUser: null }));
  }, []);

  const signupAccount = useCallback(async (payload) => {
    try {
      // 1) Register (creates user with pending role)
      await authApi.register({
        email: payload.email,
        password: payload.password,
        role: "pending",
      });

      // 2) Immediately login to get token + user
      const loginRes = await authApi.login(payload.email, payload.password);

      // 3) Save currentUser in state
      setState((prev) => ({
        ...prev,
        currentUser: normalizeUser(loginRes.user),
      }));

      return { success: true, user: loginRes.user };
    } catch (err) {
      return {
        success: false,
        message: err.message || "Unable to create account",
      };
    }
  }, []);

  const signupStudent = useCallback(async (formData) => {
    try {
      // Extract password & confirm. Keep everything else in 'safeProfileData'
      const { password, confirm, ...safeProfileData } = formData;

      const result = await authApi.updateProfile({
        name: `${formData.firstName} ${formData.lastName}`,
        role: "student",
        password: password,
        profile: safeProfileData,
        status: "active",
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
      // Extract password & confirm. Keep everything else in 'safeProfileData'
      const { password, confirm, ...safeProfileData } = formData;

      const result = await authApi.updateProfile({
        name: formData.fullName,
        role: "educator",
        password: password,
        status: "PENDING_VERIFICATION",
        specializationTag: formData.specializationTag,
        profile: safeProfileData,
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

  const createCourse = useCallback(async (courseData) => {
    try {
      const result = await courseApi.createCourse(courseData);
      const newCourse = { ...result.course, id: result.course._id };
      setState((prev) => ({ ...prev, courses: [newCourse, ...prev.courses] }));
      return { success: true, course: newCourse };
    } catch (err) {
      return {
        success: false,
        message: err.message || "Failed to create course",
      };
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
      return {
        success: false,
        message: err.message || "Failed to fetch reviewer queue",
      };
    }
  }, []);

  const submitReviewDecision = useCallback(
    async ({ itemId, decision, rating, notes }) => {
      const status = decision === "approved" ? "approved" : "rejected";
      try {
        const result = await courseApi.updateCourseStatus(itemId, {
          status,
          decision,
          rating,
          notes,
        });
        const updatedCourse = { ...result.course, id: result.course._id };
        setState((prev) => ({
          ...prev,
          courses: prev.courses.map((c) =>
            c.id === itemId || c._id === itemId
              ? { ...c, ...updatedCourse }
              : c,
          ),
        }));
        return { success: true };
      } catch (err) {
        return {
          success: false,
          message: err.message || "Failed to submit review",
        };
      }
    },
    [],
  );

  const updateCourse = useCallback((courseId, updatedData) => {
    setState((prev) => ({
      ...prev,
      courses: prev.courses.map((c) =>
        c.id === courseId ? { ...c, ...updatedData } : c,
      ),
    }));
  }, []);

  const moveCourseToTrash = useCallback(async (courseId) => {
    try {
      const result = await courseApi.moveCourseToTrash(courseId);
      const trashedCourse = { ...result.course, id: result.course._id };
      setState((prev) => ({
        ...prev,
        courses: prev.courses.map((c) =>
          c.id === courseId || c._id === courseId
            ? { ...c, ...trashedCourse }
            : c,
        ),
      }));
      return { success: true, course: trashedCourse };
    } catch (err) {
      return {
        success: false,
        message: err.message || "Failed to move course to trash",
      };
    }
  }, []);

  const restoreCourseFromTrash = useCallback(async (courseId) => {
    try {
      const result = await courseApi.restoreCourseFromTrash(courseId);
      const restoredCourse = { ...result.course, id: result.course._id };
      setState((prev) => ({
        ...prev,
        courses: prev.courses.map((c) =>
          c.id === courseId || c._id === courseId
            ? { ...c, ...restoredCourse }
            : c,
        ),
      }));
      return { success: true, course: restoredCourse };
    } catch (err) {
      return {
        success: false,
        message: err.message || "Failed to restore course",
      };
    }
  }, []);

  const permanentlyDeleteCourse = useCallback(async (courseId) => {
    try {
      await courseApi.permanentlyDeleteCourse(courseId);
      setState((prev) => ({
        ...prev,
        courses: prev.courses.filter(
          (c) => c.id !== courseId && c._id !== courseId,
        ),
      }));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.message || "Failed to permanently delete course",
      };
    }
  }, []);

  const emptyCourseTrash = useCallback(async () => {
    try {
      const result = await courseApi.emptyCourseTrash();
      setState((prev) => ({
        ...prev,
        courses: prev.courses.filter(
          (c) =>
            !(
              c.trashedAt &&
              c.createdByEducatorEmail === prev.currentUser?.email
            ),
        ),
      }));
      return { success: true, deletedCount: result.deletedCount || 0 };
    } catch (err) {
      return {
        success: false,
        message: err.message || "Failed to empty trash",
      };
    }
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

  const updateUserProfile = useCallback(async (body) => {
    try {
      const result = await authApi.updateProfile(body);
      setState((prev) => ({
        ...prev,
        currentUser: normalizeUser(result.user),
      }));
      return { success: true, user: result.user };
    } catch (err) {
      return { success: false, message: err.message || "Update failed" };
    }
  }, []);

  // 🟢 FIXED: Using localStorage instead of getToken()
  const enrollInCourse = useCallback(async (courseId) => {
    try {
      // Get the token exactly how you do it in your other files!
      const token = localStorage.getItem("edupath_token"); 
      
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/courses/enroll/${courseId}`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update the current user state with the new enrolledCourses array
      setState((prev) => ({
        ...prev,
        currentUser: res.data.user, // Let's safely just use the returned user directly
      }));
      return { success: true };
    } catch (err) {
      console.error("Enrollment Frontend Error:", err);
      return { 
        success: false, 
        message: err.response?.data?.message || "Failed to enroll. Please check console." 
      };
    }
  }, []);

  // Wrapped the value object in useMemo to prevent massive re-renders
  const value = useMemo(
    () => ({
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
      setSession,
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
      updateUserProfile,
      enrollInCourse
    }),
    [
      // This dependency array tells React: "Only recreate this object if one of these specific things changes"
      state,
      login,
      logout,
      setSession,
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
      updateUserProfile,
      enrollInCourse
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
// Added Prop Validation for 'children'
AppProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useApp = () => useContext(AppContext);
