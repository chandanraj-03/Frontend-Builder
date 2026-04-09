/**
 * AuthContext — global auth state
 *
 * Provides: user, token, login(), signup(), logout(), isLoading
 */
import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI, getToken, setToken, clearToken, getUser, setUser, clearUser } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(getUser);
  const [token, setTokenState] = useState(getToken);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Refresh user profile on mount if token exists
  useEffect(() => {
    if (token && !user) {
      authAPI.me()
        .then((u) => { setUserState(u); setUser(u); })
        .catch(() => { clearToken(); clearUser(); setTokenState(null); setUserState(null); });
    }
  }, []);

  async function login(email, password) {
    setIsLoading(true); setError(null);
    try {
      const res = await authAPI.login(email, password);
      setToken(res.access_token);
      setUser(res.user);
      setTokenState(res.access_token);
      setUserState(res.user);
      return res;
    } catch (e) { setError(e.message); throw e; }
    finally { setIsLoading(false); }
  }

  async function signup(name, email, password) {
    setIsLoading(true); setError(null);
    try {
      const res = await authAPI.signup(name, email, password);
      setToken(res.access_token);
      setUser(res.user);
      setTokenState(res.access_token);
      setUserState(res.user);
      return res;
    } catch (e) { setError(e.message); throw e; }
    finally { setIsLoading(false); }
  }

  function logout() {
    clearToken(); clearUser();
    setTokenState(null); setUserState(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, error, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
