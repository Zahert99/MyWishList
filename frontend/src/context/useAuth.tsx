import { useContext } from "react";
import AuthContext from "./AuthContext.js";
import type { AuthContextType } from "../types.js";

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export default useAuth;
