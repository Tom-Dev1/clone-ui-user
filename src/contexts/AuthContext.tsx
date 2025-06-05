import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { UserRole } from "@/types/auth-type";

// Define the user information structure based on JWT claims
interface UserInfo {
  id: string; // nameidentifier
  username: string; // name
  email: string; // emailaddress
  role: string; // role
  token: string | null;
}

// Import the UserDetails interface
export interface UserDetails {
  userId: string;
  username: string;
  email: string;
  password: string;
  userType: string;
  phone: string;
  status: boolean;
  verifyEmail: boolean;
}

// Define the auth context state
interface AuthContextType {
  user: UserInfo | null;
  userDetails: UserDetails | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  userDetails: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => { },
  logout: () => { },
});

// Custom hook to use the auth context
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const baseURL = `https://minhlong.mlhr.org`;

  // Function to fetch user details from API
  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return null;

      const response = await fetch(`${baseURL}/api/get-info-user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching user details:", error);
      return null;
    }
  };

  // Function to decode JWT token and extract claims
  const decodeToken = (token: string): UserInfo | null => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      const payload = JSON.parse(jsonPayload);

      // Extract specific claims from the payload
      return {
        id:
          payload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
          ] || "",
        username:
          payload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
          ] || "",
        email:
          payload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
          ] || "",
        role:
          payload[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ] || "",
        token: token,
      };
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  // Login function - decode token, set user info, and fetch user details
  const login = async (token: string) => {
    const decodedUser = decodeToken(token);

    if (decodedUser) {
      // Check if user has valid role
      const hasValidRole = Object.values(UserRole).includes(decodedUser.role as UserRole);

      if (!hasValidRole) {
        console.error("Invalid user role");
        toast.error("Bạn không có quyền đăng nhập vào hệ thống!");
        localStorage.clear();
        return;
      }

      setUser(decodedUser);
      localStorage.setItem("auth_token", token);
      console.log("User authenticated:", decodedUser);

      // Fetch additional user details
      const details = await fetchUserDetails();
      if (details) {
        setUserDetails(details);
        console.log("User details fetched:", details);
      }
    } else {
      console.error("Failed to decode token");
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return null;
      const res = await fetch(`https://minhlong.mlhr.org/api/auth/logout`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: "POST",
        credentials: "include",

      });
      if (res.ok) {
        console.log(res);

        setUser(null);
        setUserDetails(null);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("role_name");
        localStorage.removeItem("remembered_username");
        toast.success("Đăng xuất thành công!");
      }

    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Có lỗi xảy ra khi đăng xuất!");
    }
  };

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("auth_token");

      if (token) {
        const decodedUser = decodeToken(token);
        if (decodedUser) {
          setUser(decodedUser);

          // Fetch additional user details
          const details = await fetchUserDetails();
          if (details) {
            setUserDetails(details);
          }
        } else {
          // Token is invalid or expired
          localStorage.removeItem("auth_token");
        }
      }

      setIsLoading(false);
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    user,
    userDetails,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
