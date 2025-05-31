import { useAuth } from "@/contexts/AuthContext"
import type React from "react"
import { Navigate } from "react-router-dom"
import { UserRole } from "@/types/auth-type"

interface AuthGuardProps {
    children: React.ReactNode
}

// AuthGuard prevents authenticated users from accessing login/register pages
// and redirects unverified users to verification page
export function AuthGuard({ children }: AuthGuardProps) {
    const { isAuthenticated, userDetails, user, isLoading } = useAuth()

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    // Check if user has valid role
    const hasValidRole = user?.role && Object.values(UserRole).includes(user.role as UserRole)

    // If user is authenticated but email is not verified and has valid role, redirect to verification page
    if (isAuthenticated && userDetails && userDetails.verifyEmail === false && hasValidRole) {
        return <Navigate to="/verify-email" replace />
    }

    // If user is authenticated and email is verified and has valid role, redirect to dashboard
    if (isAuthenticated && (!userDetails || userDetails.verifyEmail === true) && hasValidRole) {
        return <Navigate to="/dashboard" replace />
    }

    // If user is authenticated but doesn't have valid role, clear storage and redirect to login
    if (isAuthenticated && !hasValidRole) {
        localStorage.clear()
        return <Navigate to="/login" replace />
    }

    // Otherwise, render the login/register page
    return <>{children}</>
}

