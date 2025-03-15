"use client"

import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/hooks/use-auth"
import LoadingSpinner from "@/components/loading-spinner"

export const GuestGuard = () => {
    const { isAuthenticated, isLoading } = useAuth()

    // Show loading spinner while checking authentication
    if (isLoading) {
        return <LoadingSpinner />
    }

    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />
    }

    // If not authenticated, render the guest route
    return <Outlet />
}

