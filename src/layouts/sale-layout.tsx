"use client"

import { type ReactNode, } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { getUserInfo, logout } from "@/utils/auth-utils"
import { UserAvatar } from "@/components/user-avatar"

interface SalesLayoutProps {
    children: ReactNode
}

export function SalesLayout({ children }: SalesLayoutProps) {
    const navigate = useNavigate()
    const location = useLocation()
    const userInfo = getUserInfo()

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    const isActive = (path: string) => {
        return location.pathname === path || location.pathname.startsWith(`${path}/`)
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <Link to="/sales/dashboard" className="text-xl font-bold">
                                    Dashboard
                                </Link>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 mr-4">
                                Trang chủ
                            </Link>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-700 hidden md:inline-block">
                                    Xin chào, <span className="font-medium">{userInfo?.username || "Quản lý"}</span>
                                </span>
                                <UserAvatar size="sm" />
                            </div>
                            <button onClick={handleLogout} className="ml-4 text-sm text-red-500 hover:text-red-700">
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 bg-white shadow-sm h-[calc(100vh-4rem)] sticky top-16">
                    <nav className="mt-5 px-2">
                        <Link
                            to="/sales/dashboard"
                            className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${isActive("/sales/dashboard")
                                ? "bg-red-600 text-white"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                        >
                            Tổng quan
                        </Link>

                        <Link
                            to="/sales/profile"
                            className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${isActive("/sales/profile")
                                ? "bg-red-600 text-white"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                        >
                            Hồ sơ cá nhân
                        </Link>

                        <Link
                            to="/sales/orders"
                            className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${isActive("/sales/orders")
                                ? "bg-red-600 text-white"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                        >
                            Đơn hàng
                        </Link>

                        <Link
                            to="/sales/debt"
                            className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${isActive("/sales/debt") ? "bg-red-600 text-white" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                        >
                            Quản lý công nợ
                        </Link>
                    </nav>
                </aside>

                {/* Main content */}
                <main className="flex-1">{children}</main>
            </div>
        </div>
    )
}

