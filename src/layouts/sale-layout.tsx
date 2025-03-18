"use client"

import type React from "react"

import { type ReactNode, useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { getUserInfo, logout } from "@/utils/auth-utils"
import { UserAvatar } from "@/components/user-avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import {
    Menu,
    Home,
    LayoutDashboard,
    ShoppingBag,
    Package,
    ShoppingCart,
    Receipt,
    FileText,
    CreditCard,
    User,
    LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"

interface SalesLayoutProps {
    children: ReactNode
}

interface NavItem {
    title: string
    href: string
    icon: React.ReactNode
}

export function SalesLayout({ children }: SalesLayoutProps) {
    const navigate = useNavigate()
    const location = useLocation()
    const userInfo = getUserInfo()
    const [open, setOpen] = useState(false)
    const isDesktop = useMediaQuery("(min-width: 1024px)")

    // Close sheet when screen size changes to desktop
    useEffect(() => {
        if (isDesktop) {
            setOpen(false)
        }
    }, [isDesktop])

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    const isActive = (path: string) => {
        return location.pathname === path || location.pathname.startsWith(`${path}/`)
    }

    const navItems: NavItem[] = [
        {
            title: "Tổng quan",
            href: "/sales/dashboard",
            icon: <LayoutDashboard className="h-5 w-5" />,
        },
        {
            title: "Đơn hàng",
            href: "/sales/orders",
            icon: <ShoppingBag className="h-5 w-5" />,
        },
        {
            title: "Sản phẩm",
            href: "/sales/product",
            icon: <Package className="h-5 w-5" />,
        },
        {
            title: "Giỏ hàng",
            href: "/sales/cart",
            icon: <ShoppingCart className="h-5 w-5" />,
        },
        {
            title: "Thuế",
            href: "/sales/tax",
            icon: <Receipt className="h-5 w-5" />,
        },
        {
            title: "Yêu cầu xuất kho",
            href: "/sales/export",
            icon: <FileText className="h-5 w-5" />,
        },
        {
            title: "Quản lý công nợ",
            href: "/sales/debt",
            icon: <CreditCard className="h-5 w-5" />,
        },
        {
            title: "Hồ sơ cá nhân",
            href: "/sales/profile",
            icon: <User className="h-5 w-5" />,
        },
    ]

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            {!isDesktop && (
                                <Sheet open={open} onOpenChange={setOpen}>
                                    <SheetTrigger asChild>
                                        <Button variant="ghost" size="icon" className="lg:hidden mr-2">
                                            <Menu className="h-5 w-5" />
                                            <span className="sr-only">Toggle menu</span>
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="left" className="p-0 w-[280px]">
                                        <div className="p-6 border-b">
                                            <Link
                                                to="/sales/dashboard"
                                                className="text-xl font-bold flex items-center"
                                                onClick={() => setOpen(false)}
                                            >
                                                Dashboard
                                            </Link>
                                        </div>
                                        <ScrollArea className="h-[calc(100vh-81px)]">
                                            <div className="py-4">
                                                <nav className="px-2 space-y-1">
                                                    {navItems.map((item) => (
                                                        <Link
                                                            key={item.href}
                                                            to={item.href}
                                                            onClick={() => setOpen(false)}
                                                            className={cn(
                                                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                                                isActive(item.href)
                                                                    ? "bg-red-600 text-white"
                                                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                                                            )}
                                                        >
                                                            {item.icon}
                                                            {item.title}
                                                        </Link>
                                                    ))}
                                                </nav>
                                                <Separator className="my-4" />
                                                <div className="px-3">
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        onClick={handleLogout}
                                                    >
                                                        <LogOut className="mr-2 h-5 w-5" />
                                                        Đăng xuất
                                                    </Button>
                                                </div>
                                            </div>
                                        </ScrollArea>
                                    </SheetContent>
                                </Sheet>
                            )}
                            <Link to="/sales/dashboard" className="text-xl font-bold flex items-center">
                                Dashboard
                            </Link>
                        </div>

                        <div className="flex items-center">
                            <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 mr-4 flex items-center gap-1">
                                <Home className="h-4 w-4" />
                                <span className="hidden sm:inline">Trang chủ</span>
                            </Link>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-700 hidden md:inline-block">
                                    Xin chào, <span className="font-medium">{userInfo?.username || "Quản lý"}</span>
                                </span>
                                <UserAvatar size="sm" />
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLogout}
                                className="ml-4 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                                <LogOut className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">Đăng xuất</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:block w-64 bg-white shadow-sm h-[calc(100vh-4rem)] sticky top-16 border-r">
                    <ScrollArea className="h-full">
                        <nav className="p-4 space-y-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                        isActive(item.href)
                                            ? "bg-red-600 text-white"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                                    )}
                                >
                                    {item.icon}
                                    {item.title}
                                </Link>
                            ))}
                        </nav>
                    </ScrollArea>
                </aside>

                {/* Main content */}
                <main className="flex-1">{children}</main>
            </div>
        </div>
    )
}

