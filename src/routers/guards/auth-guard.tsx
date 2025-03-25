import { useAuth } from "@/contexts/AuthContext"
import type React from "react"
import { Navigate } from "react-router-dom"

interface AuthGuardProps {
    children: React.ReactNode
}

// AuthGuard prevents authenticated users from accessing login/register pages
// and redirects unverified users to verification page
export function AuthGuard({ children }: AuthGuardProps) {
    const { isAuthenticated, userDetails, isLoading } = useAuth()

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    // If user is authenticated but email is not verified, redirect to verification page
    if (isAuthenticated && userDetails && userDetails.verifyEmail === false) {
        return <Navigate to="/verify-email" replace />
    }

    // If user is authenticated and email is verified, redirect to dashboard
    if (isAuthenticated && (!userDetails || userDetails.verifyEmail === true)) {
        return <Navigate to="/dashboard" replace />
    }

    // Otherwise, render the login/register page
    return <>{children}</>
}

