/* eslint-disable react-refresh/only-export-components */
import { createContext, useMemo, useState } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const value = useMemo(
    () => ({
      user,
      token,
      login: (data, jwt) => {
        localStorage.setItem("token", jwt);
        localStorage.setItem("user", JSON.stringify(data));
        setToken(jwt);
        setUser(data);
      },
      logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
      },
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
