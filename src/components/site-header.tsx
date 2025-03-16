

import { useState, useEffect, useRef } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Menu, Search, User, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useScrollDirection } from "@/hooks/use-scroll-direction"
import { useAuth } from "@/hooks/use-auth"
import HoverButton from "./hover-button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


interface SiteHeaderProps {
    isHomePage?: boolean
}
const menuItems = [
    {
        title: "GIỚI THIỆU",
        href: "/pages/about-us",
    },
    {
        title: "SẢN PHẨM",
        href: "/collections",
        items: [
            { title: "Thuốc trừ ốc", href: "/collections/thuoc-tru-oc-1" },
            { title: "Thuốc trừ cỏ", href: "/collections/thuoc-tru-co" },
            { title: "Thuốc trừ sâu", href: "/collections/thuoc-tru-sau" },
            { title: "Thuốc trừ bệnh", href: "/collections/thuoc-tru-benh" },
            { title: "Thuốc dưỡng", href: "/collections/thuoc-duong" },
            { title: "Phân bón", href: "/collections/phan-bon" },
        ],
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

export function SiteHeader({ isHomePage = false }: SiteHeaderProps) {
    const [lang, setLang] = useState<"VI" | "EN">("VI")
    const { scrollDirection, isAtTop } = useScrollDirection()
    const [isVisible, setIsVisible] = useState(true)
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
    const [sheetOpen, setSheetOpen] = useState(false)
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
    const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const location = useLocation()
    const navigate = useNavigate()
    const { isAuthenticated, user, logout } = useAuth()

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

    const handleLogout = async () => {
        try {
            await logout()
            navigate("/")
        } catch (error) {
            console.error("Logout failed:", error)
        }
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

    return (
        <div
            className={cn(
                "w-full transition-all duration-300",
                "fixed left-0 top-0 z-50",
                scrolledPast500 ? "bg-white" : isHomePage ? "bg-transparent" : "bg-white/0 backdrop-blur-0",
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
                                            {item.items.map((subItem) => (
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
                    <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0" >
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
                                                            {item.items.map((subItem) => (
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
                                {isAuthenticated && user ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                                            <User className="h-5 w-5 text-primary" />
                                            <span className="font-medium">{user.name}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Link
                                                to="/dashboard"
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

                                <div className="flex items-center justify-center space-x-1 text-sm font-medium mt-4 p-2 bg-muted/30 rounded-md">
                                    <button
                                        onClick={() => setLang("VI")}
                                        className={cn(
                                            "px-3 py-1 rounded",
                                            lang === "VI" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                                        )}
                                    >
                                        VI
                                    </button>
                                    <span className="text-muted-foreground">/</span>
                                    <button
                                        onClick={() => setLang("EN")}
                                        className={cn(
                                            "px-3 py-1 rounded",
                                            lang === "EN" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                                        )}
                                    >
                                        EN
                                    </button>
                                </div>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>

                <div className="ml-auto flex items-center space-x-4">
                    {/* Auth Button - Desktop */}
                    {isAuthenticated && user ? (
                        <div className="hidden md:flex items-center">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="relative">
                                        <User className="h-5 w-5" />
                                        <span className="sr-only">User menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <div className="flex items-center gap-2 p-2 border-b">
                                        <User className="h-4 w-4 text-primary" />
                                        <span className="font-medium">{user.name}</span>
                                    </div>
                                    <DropdownMenuItem asChild>
                                        <Link to="/dashboard" className="cursor-pointer">
                                            Dashboard
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/dashboard/profile" className="cursor-pointer">
                                            Hồ sơ cá nhân
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/dashboard/orders" className="cursor-pointer">
                                            Đơn hàng
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="cursor-pointer text-destructive focus:text-destructive"
                                    >
                                        Đăng xuất
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
                    {isAuthenticated && user && (
                        <Link to="/dashboard" className="md:hidden">
                            <Button variant="ghost" size="icon">
                                <User className="h-5 w-5" />
                            </Button>
                        </Link>
                    )}

                    {/* Language Switcher */}
                    <div className="hidden md:flex items-center space-x-1 text-sm font-medium">
                        <button
                            onClick={() => setLang("VI")}
                            className={cn("px-1", lang === "VI" ? "text-primary" : "text-muted-foreground")}
                        >
                            VI
                        </button>
                        <span className="text-muted-foreground">/</span>
                        <button
                            onClick={() => setLang("EN")}
                            className={cn("px-1", lang === "EN" ? "text-primary" : "text-muted-foreground")}
                        >
                            EN
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

