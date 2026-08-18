"use client";
import { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

// Helper to strip heavy relational arrays (e.g. exam_results, test attempts, marks) before storing in localStorage
const sanitizeUser = (userData) => {
  if (!userData || typeof userData !== "object") return userData;
  const {
    exam_results,
    examResults,
    exam_result,
    examResult,
    test_results,
    testResults,
    test_result,
    testResult,
    exam_attempts,
    examAttempts,
    test_attempts,
    testAttempts,
    quiz_results,
    quizResults,
    user_answers,
    userAnswers,
    submissions,
    marks,
    scores,
    results,
    ...cleanUser
  } = userData;
  return cleanUser;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check local storage for an existing session on mount
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const cleanUser = sanitizeUser(parsedUser);
        setUser(cleanUser);
        // Overwrite localStorage to clean up any pre-existing heavy exam_results
        localStorage.setItem("user", JSON.stringify(cleanUser));
      } catch (err) {
        console.error("Failed to parse stored user", err);
      }
    }

    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  const login = (userData, jwt) => {
    const cleanUser = sanitizeUser(userData);
    localStorage.setItem("user", JSON.stringify(cleanUser));
    localStorage.setItem("jwt", jwt);
    setUser(cleanUser);
  };

  const updateUser = (updatedData) => {
    setUser((prevUser) => {
      const newUser = { ...prevUser, ...updatedData };
      const cleanUser = sanitizeUser(newUser);
      localStorage.setItem("user", JSON.stringify(cleanUser));
      return cleanUser;
    });
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("jwt");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);