

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { authenticate } from "../lib/api.ts";
import Cookies from 'js-cookie';

interface User {
  username: string;
  role: string;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  login: (data: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (path: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: [
    "dashboard",
    "product",
    "productCategory", 
    "supplier",
    "purchase",
    "sell",
    "transactions",
    "reports",
    "manage-user",
    "roles"
  ],
  MANAGER: [
    "dashboard",
    "product",
    "productCategory",
    "supplier",
    "purchase",
    "sell",
    "transactions",
    "reports"
  ],
  CASHIER: [
    "dashboard",
    "sell",
    "transactions"
  ]
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

 
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem("token");
        const storedUsername = localStorage.getItem("username");
        const storedRole = Cookies.get("user_role");

        console.log("Initializing auth:", { storedToken, storedUsername, storedRole });

        if (storedToken && storedUsername && storedRole) {
          setUser({ 
            username: storedUsername, 
            role: storedRole,
            token: storedToken 
          });
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (data: { email: string; password: string }) => {
    try {
      setIsLoading(true);
      console.log("Attempting login with:", data);
      
      const response = await authenticate(data);
      console.log("Login response:", response);
      
     
      const { token, role, name } = response.data;
      
      if (!token || !role || !name) {
        throw new Error("Invalid login response: missing required data");
      }

      const username = name;
      
      console.log("Setting user:", { username, role });

      
      setUser({ username, role, token });
      
     
      localStorage.setItem("token", token);
      localStorage.setItem("username", username);
      Cookies.set("user_role", role, { expires: 180 }); 
      
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsLoading(false);
    
    
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    Cookies.remove("user_role");
    
    
    document.cookie.split(";").forEach(cookie => {
      const [name] = cookie.split("=");
      if (name.trim().startsWith("auth_") || name.trim() === "user_role") {
        Cookies.remove(name.trim());
      }
    });
  };

  const hasPermission = (path: string): boolean => {
    
    if (!user) return false;
    
    const userRole = user.role;
    

    if (path === "dashboard" || path === "/") return true;
    
    
    if (!ROLE_PERMISSIONS[userRole]) {
      console.warn(`No permissions defined for role: ${userRole}`);
      return false;
    }
    
   
    const hasAccess = ROLE_PERMISSIONS[userRole].includes(path);
    console.log(`Permission check: ${path} for ${userRole} = ${hasAccess}`);
    
    return hasAccess;
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};



