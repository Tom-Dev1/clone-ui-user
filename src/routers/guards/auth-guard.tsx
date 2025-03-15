"use client"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/use-auth"
import LoadingSpinner from "@/components/loading-spinner"

export const AuthGuard = () => {
    const { isAuthenticated, isLoading } = useAuth()
    const location = useLocation()

    // Show loading spinner while checking authentication
    if (isLoading) {
        return <LoadingSpinner />
    }

    // If not authenticated, redirect to login page with return URL
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />
    }

    // If authenticated, render the protected route
    return <Outlet />
}

