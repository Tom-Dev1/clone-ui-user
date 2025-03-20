"use client"

import { useState, useEffect, useRef } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Menu, Search, User, ChevronDown, LogOut, Settings, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useScrollDirection } from "@/hooks/use-scroll-direction"
import {
    isAuthenticated,
    getUserInfo,
    getUserRole,
    getUserDisplayName,
    logout,

} from "@/utils/auth-utils"
import HoverButton from "./hover-button"
import { UserAvatar } from "./user-avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { fetchProductCategories } from "@/services/product-service"
// import type { ProductCategory } from "@/services/product-service"
import { CartIndicator } from "./cart-indicator"

interface SiteHeaderProps {
    isHomePage?: boolean
}

// Define types for menu items
type MenuItem = {
    title: string
    href: string
    items?: CategoryMenuItem[]
}

// Define the base menu items
const baseMenuItems: MenuItem[] = [
    {
        title: "GIỚI THIỆU",
        href: "/pages/about-us",
    },
    {
        title: "SẢN PHẨM",
        href: "/collections",
        items: [], // Will be populated from API
    },
    {
        title: "KIẾN THỨC CÂY TRỒNG",
        href: "/blogs/kien-thuc-cay-trong",
    },
    {
        title: "TIN TỨC",
        href: "/blogs/news",
    },
    {
        title: "LIÊN HỆ",
        href: "/pages/lien-he",
    },
]


// Define a new interface for menu items with categoryId
interface CategoryMenuItem {
    title: string
    href: string
    categoryId?: number
}

export function SiteHeader({ isHomePage = false }: SiteHeaderProps) {
    const [menuItems, setMenuItems] = useState(baseMenuItems)
    //   const [categories, setCategories] = useState<ProductCategory[]>([])
    const { scrollDirection, isAtTop } = useScrollDirection()
    const [isVisible, setIsVisible] = useState(true)
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
    const [sheetOpen, setSheetOpen] = useState(false)
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
    const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const location = useLocation()
    const navigate = useNavigate()

    // Get authentication state and user info from auth-utils
    const authenticated = isAuthenticated()
    const userInfo = getUserInfo()
    const userRole = getUserRole()

    const displayName = getUserDisplayName()

    const [scrolledPast500, setScrolledPast500] = useState(false)

    // Add this useEffect to track scroll position
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY
            if (scrollPosition > 160) {
                setScrolledPast500(true)
            } else {
                setScrolledPast500(false)
            }
        }

        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const handleLogin = () => {
        navigate("/login")
    }

    const handleLogout = () => {
        logout()
        navigate("/")
    }

    const toggleExpandItem = (href: string) => {
        setExpandedItems((prev) => ({
            ...prev,
            [href]: !prev[href],
        }))
    }

    const handleDropdownEnter = (href: string) => {
        if (dropdownTimeoutRef.current) {
            clearTimeout(dropdownTimeoutRef.current)
            dropdownTimeoutRef.current = null
        }
        setActiveDropdown(href)
    }

    const handleDropdownLeave = () => {
        dropdownTimeoutRef.current = setTimeout(() => {
            setActiveDropdown(null)
        }, 150) // Small delay to prevent accidental closing
    }

    useEffect(() => {
        // Always show header when at the top of the page
        if (isAtTop) {
            setIsVisible(true)
            return
        }

        // Update visibility based on scroll direction
        if (scrollDirection === "down") {
            setIsVisible(false)
        } else if (scrollDirection === "up") {
            setIsVisible(true)
        }
    }, [scrollDirection, isAtTop])

    // Close mobile menu on route change
    useEffect(() => {
        setSheetOpen(false)
        setExpandedItems({})
        setActiveDropdown(null)
    }, [location])

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (dropdownTimeoutRef.current) {
                clearTimeout(dropdownTimeoutRef.current)
            }
        }
    }, [])


    const isSalesManager = () => {
        return userRole === "4"
    }
    const isAgency = () => {
        return userRole === "2"
    }

    // Get appropriate dashboard link based on user role
    const getDashboardLink = () => {
        if (!userRole) return "/dashboard"

        // Check user role and return appropriate dashboard link
        switch (userRole) {
            case "4": // SALES_MANAGER
                return "/sales"
            case "2": // AGENCY
                return "/agency"
            default:
                return "/"
        }
    }

    // Fetch product categories for the menu
    useEffect(() => {
        async function fetchCategories() {
            try {
                const categoriesData = await fetchProductCategories()
                // setCategories(categoriesData)

                // Filter active categories and sort them
                const activeCategories = categoriesData.filter((cat) => cat.isActive).sort((a, b) => a.sortOrder - b.sortOrder)

                // Map categories to menu items with slugs and categoryId
                const categoryItems = activeCategories.map((category) => ({
                    title: category.categoryName,
                    href: `/collections/${category.categoryId}`,
                    categoryId: category.categoryId,
                }))

                // Update the SẢN PHẨM menu item with the fetched categories
                setMenuItems((prevItems) =>
                    prevItems.map((item) => (item.title === "SẢN PHẨM" ? { ...item, items: categoryItems } : item)),
                )
            } catch (error) {
                console.error("Failed to fetch product categories:", error)
            }
        }

        fetchCategories()
    }, [])

    return (
        <div
            className={cn(
                "w-full transition-all duration-300",
                "fixed left-0 top-0 z-50",
                scrolledPast500 ? "bg-white" : isHomePage ? "bg-transparent" : "bg-transparent",
                !isHomePage && !isVisible && "-translate-y-full",
            )}
        >
            <div className="px-6 flex h-[102px] items-center">
                <Link to="/" className="mr-14">
                    <img
                        src="https://theme.hstatic.net/200000907029/1001282128/14/logo.png?v=318"
                        alt="Logo"
                        className="w-full h-full object-contain p-3 bg-red-600"
                    />
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center space-x-2">
                    {menuItems.map((item) => (
                        <div
                            key={item.href}
                            className="relative"
                            onMouseEnter={() => item.items && handleDropdownEnter(item.href)}
                            onMouseLeave={handleDropdownLeave}
                        >
                            {item.items ? (
                                <>
                                    <Link
                                        to={item.href}
                                        className={cn(
                                            "flex items-center text-base font-semibold text-gray-700",
                                            location.pathname === item.href && "text-primary",
                                        )}
                                    >
                                        {item.title}{" "}
                                        <ChevronDown
                                            className={cn("ml-1 h-4 w-3 transition-transform", activeDropdown === item.href && "rotate-180")}
                                        />
                                    </Link>
                                    <div
                                        className={cn(
                                            "absolute left-0 top-full z-50 mt-2 w-72 rounded-md border bg-white p-3 py-4 shadow-md",
                                            activeDropdown === item.href ? "block" : "hidden",
                                        )}
                                        onMouseEnter={() => handleDropdownEnter(item.href)}
                                        onMouseLeave={handleDropdownLeave}
                                    >
                                        <div className="grid gap-2 grid-cols-2">
                                            {Array.isArray(item.items) &&
                                                item.items.map((subItem: CategoryMenuItem) => (
                                                    <Link
                                                        key={subItem.href}
                                                        to={subItem.href}
                                                        className={cn(
                                                            "rounded-md px-4 py-3 w-32 text-sm hover:bg-accent transition-colors",
                                                            location.pathname === subItem.href && "bg-accent text-gray-600",
                                                        )}
                                                    >
                                                        {subItem.title}
                                                    </Link>
                                                ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="h-10 flex items-center mb-0.5">
                                    <HoverButton title={item.title} href={item.href} active={location.pathname === item.href} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Mobile Menu  */}
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    <SheetTrigger asChild className="lg:hidden">
                        <Button variant="ghost" size="icon" className="mr-2">
                            <Menu className="h-6 w-6" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
                        <div className="flex flex-col h-full">
                            <div className="flex justify-between items-center p-4 border-b">
                                <Link to="/" className="flex items-center" onClick={() => setSheetOpen(false)}>
                                    <div className="h-14 w-14 p-3 flex items-center justify-center">
                                        <img
                                            src="https://theme.hstatic.net/200000907029/1001282128/14/logo.png?v=318"
                                            alt="Logo"
                                            className="w-12 h-12 object-contain"
                                        />
                                    </div>
                                </Link>
                            </div>

                            <div className="flex-1 overflow-y-auto py-4">
                                <nav>
                                    {menuItems.map((item) => (
                                        <div key={item.href} className="border-b border-gray-100 last:border-b-0">
                                            {item.items ? (
                                                <div>
                                                    <div className="flex items-center justify-between px-4 py-3">
                                                        <Link
                                                            to={item.href}
                                                            className={cn("text-sm font-medium", location.pathname === item.href && "text-primary")}
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                // Allow navigation but don't close the menu
                                                            }}
                                                        >
                                                            {item.title}
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => toggleExpandItem(item.href)}
                                                            className="h-8 w-8 p-0 rounded-full hover:bg-muted"
                                                        >
                                                            <ChevronDown
                                                                className={cn(
                                                                    "h-4 w-4 transition-transform duration-200",
                                                                    expandedItems[item.href] && "rotate-180",
                                                                )}
                                                            />
                                                            <span className="sr-only">{expandedItems[item.href] ? "Collapse" : "Expand"}</span>
                                                        </Button>
                                                    </div>
                                                    {expandedItems[item.href] && (
                                                        <div className="bg-muted/30 py-2">
                                                            {Array.isArray(item.items) &&
                                                                item.items.map((subItem: CategoryMenuItem) => (
                                                                    <Link
                                                                        key={subItem.href}
                                                                        to={subItem.href}
                                                                        className={cn(
                                                                            "block text-sm px-8 py-3 hover:bg-muted",
                                                                            location.pathname === subItem.href
                                                                                ? "text-primary font-medium"
                                                                                : "text-muted-foreground",
                                                                        )}
                                                                        onClick={() => setSheetOpen(false)}
                                                                    >
                                                                        {subItem.title}
                                                                    </Link>
                                                                ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="px-4 py-2">
                                                    <HoverButton
                                                        title={item.title}
                                                        href={item.href}
                                                        active={location.pathname === item.href}
                                                        mobile
                                                        onClick={() => setSheetOpen(false)}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </nav>
                            </div>

                            <div className="mt-auto p-4 border-t">
                                {authenticated && userInfo ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-md">
                                            <UserAvatar size="sm" />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">{displayName}</p>
                                                <p className="text-xs text-muted-foreground truncate">{userRole || "Người dùng"}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Link
                                                to={getDashboardLink()}
                                                className="text-center text-sm bg-muted py-2 px-3 rounded-md hover:bg-muted/80"
                                                onClick={() => setSheetOpen(false)}
                                            >
                                                Dashboard
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    handleLogout()
                                                    setSheetOpen(false)
                                                }}
                                                className="text-center text-sm bg-muted py-2 px-3 rounded-md hover:bg-muted/80"
                                            >
                                                Đăng xuất
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => {
                                            handleLogin()
                                            setSheetOpen(false)
                                        }}
                                    >
                                        Đăng nhập
                                    </Button>
                                )}


                            </div>
                        </div>
                    </SheetContent>
                </Sheet>

                <div className="ml-auto flex items-center space-x-4">
                    {isSalesManager() && (
                        <div className="mr-2">
                            <CartIndicator />
                        </div>
                    )}
                    {isAgency() && (
                        <div className="mr-2">
                            <CartIndicator />
                        </div>
                    )}
                    {/* Auth Button - Desktop */}
                    {authenticated && userInfo ? (
                        <div className="hidden md:flex items-center">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="relative gap-2 px-3">
                                        <UserAvatar size="sm" showInitial={false} />
                                        <span className="font-medium text-sm hidden lg:inline-block">{displayName}</span>
                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="font-medium text-sm">{displayName}</p>
                                            {userInfo.email && <p className="text-xs text-muted-foreground">{userInfo.email}</p>}
                                            {userRole && <p className="text-xs text-primary">{userRole}</p>}
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link to={`${getDashboardLink()}/dashboard`} className="cursor-pointer">
                                            <User className="mr-2 h-4 w-4" />
                                            <span>Dashboard</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to={`${getDashboardLink()}/profile`} className="cursor-pointer">
                                            <Settings className="mr-2 h-4 w-4" />
                                            <span>Hồ sơ cá nhân</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to={`${getDashboardLink()}/orders`} className="cursor-pointer">
                                            <ShoppingBag className="mr-2 h-4 w-4" />
                                            <span>Đơn hàng</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="cursor-pointer text-destructive focus:text-destructive"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Đăng xuất</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        <Button variant="outline" size="sm" className="hidden md:flex" onClick={handleLogin}>
                            Đăng nhập
                        </Button>
                    )}

                    {/* Search Button */}
                    <Button variant="ghost" size="icon">
                        <Search className="h-5 w-5" />
                    </Button>

                    {/* User Icon - Mobile */}
                    {authenticated && userInfo && (
                        <Link to={getDashboardLink()} className="md:hidden">
                            <Button variant="ghost" size="icon">
                                <UserAvatar size="sm" showInitial={false} />
                            </Button>
                        </Link>
                    )}


                </div>
            </div>
        </div>
    )
}

