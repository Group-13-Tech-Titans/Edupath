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

// Normalize user object
function normalizeUser(u) {
  if (!u) return null;
  const user = { ...u };
  if (user._id && !user.id) user.id = user._id.toString();
  return user;
}

// Default initial state
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

/* ---------------------- FIXED loadState() ---------------------- */
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
      currentUser: parsed.currentUser
        ? normalizeUser(parsed.currentUser)
        : null,
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

/* ---------------------- App Provider ---------------------- */

export const AppProvider = ({ children }) => {
  const [state, setState] = useState(() => loadState());

  // persist state whenever it changes
  useEffect(() => {
    persistState(state);
  }, [state]);

  // Auto-login with stored token
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

  /* ---------------------- FIXED login() ---------------------- */
  const login = useCallback(async (email, password) => {
    try {
      const result = await authApi.login(email.trim(), password);

      // Save token so refresh doesn't logout user
      setToken(result.token);

      setState((prev) => ({
        ...prev,
        currentUser: normalizeUser(result.user),
      }));

      return { success: true, user: result.user };
    } catch (err) {
      return {
        success: false,
        message: err.message || "Invalid credentials",
      };
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);

    setState((prev) => ({
      ...prev,
      currentUser: null,
    }));
  }, []);

  const value = {
    ...state,
    login,
    logout,
    setState,
  };

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);