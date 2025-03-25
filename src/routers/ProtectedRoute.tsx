"use client"

import type React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { UserRole } from "../types/auth-type"
import { useAuth } from "@/contexts/AuthContext"

interface ProtectedRouteProps {
    children: React.ReactNode
    requiredRole?: UserRole
    skipEmailVerification?: boolean // Add this prop to skip email verification check for specific routes
}

export function ProtectedRoute({ children, requiredRole, skipEmailVerification = false }: ProtectedRouteProps) {
    const { user, userDetails, isAuthenticated, isLoading } = useAuth()
    const location = useLocation()

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    // Check email verification status (skip this check for the email verification page itself)
    if (!skipEmailVerification && userDetails && userDetails.verifyEmail === false) {
        // If email is not verified, redirect to verification page
        return <Navigate to="/verify-email" replace />
    }

    // If requiredRole is specified and user doesn't have it, redirect based on user's role
    if (requiredRole && user?.role !== requiredRole) {
        // Redirect to appropriate dashboard based on user's role
        if (user?.role === UserRole.AGENCY) {
            return <Navigate to="/agency/dashboard" replace />
        } else if (user?.role === UserRole.SALES_MANAGER) {
            return <Navigate to="/sales/dashboard" replace />
        } else {
            // If no specific role match, redirect to general dashboard
            return <Navigate to="/dashboard" replace />
        }
    }

    // Render children if authenticated, email is verified (if required), and has the required role (if specified)
    return <>{children}</>
}

