import type React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { UserRole } from "../types/auth-type";
import { useAuth } from "@/contexts/AuthContext";
import SignalRListener from "@/components/signalr/SignalRListener";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  skipEmailVerification?: boolean; // Bỏ qua kiểm tra xác thực email cho các route nhất định
}

export function ProtectedRoute({
  children,
  requiredRole,
  skipEmailVerification = false,
}: ProtectedRouteProps) {
  const { user, userDetails, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Hiển thị trạng thái loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Nếu chưa xác thực, chuyển hướng về trang đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Kiểm tra trạng thái xác thực email (bỏ qua kiểm tra đối với trang xác thực email)
  if (
    !skipEmailVerification &&
    userDetails &&
    userDetails.verifyEmail === false
  ) {
    // Nếu email chưa được xác thực, chuyển hướng về trang xác thực email
    return <Navigate to="/verify-email" replace />;
  }

  // Nếu requiredRole được chỉ định và người dùng không có vai trò đó, chuyển hướng dựa vào vai trò của họ
  if (requiredRole && user?.role !== requiredRole) {
    if (user?.role === UserRole.AGENCY) {
      return <Navigate to="/agency/dashboard" replace />;
    } else if (user?.role === UserRole.SALES_MANAGER) {
      return <Navigate to="/sales/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Render children kèm theo SignalRListener nếu người dùng có vai trò Agency hoặc Sales Manager
  return (
    <>
      {(user?.role === UserRole.AGENCY ||
        user?.role === UserRole.SALES_MANAGER) && <SignalRListener />}
      {children}
    </>
  );
}
