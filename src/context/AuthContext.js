// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import apiFetch from "../utils/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // for initial auth check
  const [error, setError] = useState(null);

  const fetchUser = async () => {
    console.log(apiFetch);
    try {
      const res = await apiFetch("/auth/me", {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Auth fetch error:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (login, password) => {
    setError(null);
    const res = await apiFetch("/auth/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password }) // ✅ matches your backend field
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Login failed");
    }
    await fetchUser();
  };

  const logout = async () => {
    await apiFetch("/auth/logout", {
      method: "POST",
      credentials: "include"
    });
    setUser(null);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}