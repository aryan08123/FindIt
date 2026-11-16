import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import authService from "../services/authService";
import { tokenStore } from "../utils/storage";

const AuthContext = createContext(null);

/** Where each role lands after login. */
export const homePath = (user) =>
  user?.role === "ADMIN" ? "/admin" : "/dashboard";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Only "loading" if a saved token must be checked first
  const [loading, setLoading] = useState(Boolean(tokenStore.get()));

  // On page load: restore the session from the saved token
  useEffect(() => {
    if (!tokenStore.get()) {
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    authService
      .me()
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch(() => tokenStore.clear())
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password, remember) => {
    const data = await authService.login(email, password);
    tokenStore.set(data.token, remember);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, isAdmin: user?.role === "ADMIN", login, logout }),
    [user, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);


