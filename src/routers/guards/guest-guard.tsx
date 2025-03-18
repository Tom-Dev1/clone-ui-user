import { Navigate, Outlet } from "react-router-dom"
import { isAuthenticated, isTokenExpired, getUserRole } from "@/utils/auth-utils"
import { UserRole } from "@/types/auth-type"

export const GuestGuard = () => {
    const isLoggedIn = isAuthenticated() && !isTokenExpired()

    if (isLoggedIn) {
        // If user is already logged in, redirect to appropriate dashboard based on role
        const role = getUserRole()

        if (role === UserRole.SALES_MANAGER) {
            return <Navigate to="/sales/dashboard" replace />
        } else if (role === UserRole.AGENCY) {
            return <Navigate to="/agency/dashboard" replace />
        } else {
            // Default dashboard for any other role
            return <Navigate to="/dashboard" replace />
        }
    }

    return <Outlet />
}

