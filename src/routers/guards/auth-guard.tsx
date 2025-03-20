import { Navigate, Outlet, useLocation } from "react-router-dom"
import { isAuthenticated, isTokenExpired } from "@/utils/auth-utils"

export const AuthGuard = () => {
    const location = useLocation()
    const isLoggedIn = isAuthenticated() && !isTokenExpired()

    if (!isLoggedIn) {
        // Redirect to login page but save the location they were trying to access
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return (
        <>
            <Outlet />
        </>
    )
}

