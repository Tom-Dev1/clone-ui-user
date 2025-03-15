"use client"

import { lazy, Suspense } from "react"
import { Routes, Route, Link, useLocation, } from "react-router-dom"
import LoadingSpinner from "@/components/loading-spinner"
import { useAuth } from "@/hooks/use-auth"

// Lazy load dashboard pages
const Profile = lazy(() => import("@/pages/dashboard/profile"))
const Orders = lazy(() => import("@/pages/dashboard/order"))
const Settings = lazy(() => import("@/pages/dashboard/settting"))
const DashboardHome = lazy(() => import("./home"))

export default function Dashboard() {
    const { user, logout } = useAuth()
    const location = useLocation()

    const handleLogout = async () => {
        try {
            await logout()
            // Redirect happens automatically via AuthGuard
        } catch (error) {
            console.error("Logout failed:", error)
        }
    }

    const isActive = (path: string) => {
        return location.pathname === path
    }

    return (
        <div className="min-h-screen bg-muted">
            <div className="bg-white border-b">
                <div className="container py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <div className="flex items-center justify-between gap-4">
                        <Link to={'/'}><span className="items-center text-sm text-primary hover:text-primary/90">Trang chủ</span></Link>
                        <h1 className="items-center text-sm text-muted-foreground">Xin chào, {user?.name}</h1>
                        <button onClick={handleLogout} className="text-sm text-primary hover:text-primary/90">
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </div>

            <div className="container py-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="md:w-64">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <nav className="space-y-1">
                                <Link
                                    to="/dashboard"
                                    className={`block px-4 py-2 rounded-md ${isActive("/dashboard")
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-muted"
                                        }`}
                                >
                                    Tổng quan
                                </Link>
                                <Link
                                    to="/dashboard/profile"
                                    className={`block px-4 py-2 rounded-md ${isActive("/dashboard/profile")
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-muted"
                                        }`}
                                >
                                    Hồ sơ cá nhân
                                </Link>
                                <Link
                                    to="/dashboard/orders"
                                    className={`block px-4 py-2 rounded-md ${isActive("/dashboard/orders")
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-muted"
                                        }`}
                                >
                                    Đơn hàng
                                </Link>
                                <Link
                                    to="/dashboard/settings"
                                    className={`block px-4 py-2 rounded-md ${isActive("/dashboard/settings")
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-muted"
                                        }`}
                                >
                                    Cài đặt
                                </Link>
                            </nav>
                        </div>
                    </div>

                    {/* Main content */}
                    <div className="flex-1">
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <Suspense fallback={<LoadingSpinner />}>
                                <Routes>
                                    <Route path="/" element={<DashboardHome />} />
                                    <Route path="/profile" element={<Profile />} />
                                    <Route path="/orders" element={<Orders />} />
                                    <Route path="/settings" element={<Settings />} />
                                </Routes>
                            </Suspense>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

