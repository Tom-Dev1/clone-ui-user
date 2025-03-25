"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { ProtectedRoute } from "@/routers/ProtectedRoute"
import { Dashboard } from "@/pages/Dashboard"
import { useAuth } from "@/contexts/AuthContext"
import { UserRole } from "@/types/auth-type"

// Dashboard Router - Redirects to role-specific dashboard or verification page
export function DashboardRouter() {
    const { user, userDetails, isAuthenticated, isLoading } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!isLoading && isAuthenticated && user) {
            // First check if email is verified
            if (userDetails && userDetails.verifyEmail === false) {
                console.log("ww", userDetails.verifyEmail);

                // Redirect to email verification page if not verified
                navigate("/verify-email", { replace: true })
                return
            }

            // If email is verified, redirect based on role
            const role = user.role

            if (role === UserRole.SALES_MANAGER) {
                navigate("/sales/dashboard", { replace: true })
            } else if (role === UserRole.AGENCY) {
                navigate("/agency/dashboard", { replace: true })
            } else {
                // If no specific role match, stay on the general dashboard
                // We're already on /dashboard, so no need to navigate
            }
        }
    }, [isLoading, isAuthenticated, user, userDetails, navigate])

    // Show loading state while checking
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    // If not authenticated, ProtectedRoute will handle the redirect to login
    return (
        <ProtectedRoute>
            <Dashboard />
        </ProtectedRoute>
    )
}

