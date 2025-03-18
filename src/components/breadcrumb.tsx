import { Link, useLocation } from "react-router-dom"
import { ChevronRight, Home } from 'lucide-react'
import { cn } from "@/lib/utils"

interface BreadcrumbProps {
    className?: string
}

export function Breadcrumb({ className }: BreadcrumbProps) {
    const location = useLocation()
    const pathnames = location.pathname.split("/").filter((x) => x)

    // Map of path segments to display names
    const pathMap: Record<string, string> = {
        // Main sections
        "pages": "",
        "collections": "Sản Phẩm",
        "blogs": "",

        // About pages
        "about-us": "Giới Thiệu",
        //

        // Collection pages
        "1": "Thuốc Trừ Ốc",
        "2": "Thuốc Trừ Cỏ",
        "3": "Thuốc Trừ Sâu",
        "4": "Thuốc Trừ Bệnh",
        "5": "Thuốc Dưỡng",
        "6": "Phân Bón",

        // Blog pages
        "kien-thuc-cay-trong": "Kiến Thức Cây Trồng",
        "news": "Tin Tức",
        "tuyen-dung": "Tuyển Dụng",

        // Contact page
        "lien-he": "Liên Hệ",

        // Auth pages
        "login": "Đăng Nhập",
        "register": "Đăng Ký",
        "forgot-password": "Quên Mật Khẩu",

        // Dashboard
        "dashboard": "Bảng Điều Khiển",
        "profile": "Hồ Sơ Cá Nhân",
        "orders": "Đơn Hàng",
        "settings": "Cài Đặt",

        // Legacy paths (keeping for backward compatibility)
        "gioi-thieu": "Giới Thiệu",
        "ve-chung-toi": "Về Chúng Tôi",
        "tam-nhin-su-menh": "Tầm Nhìn & Sứ Mệnh",
        "san-pham": "Sản Phẩm",
        "moi": "Sản Phẩm Mới",
        "ban-chay": "Bán Chạy",
        "kien-thuc": "Kiến Thức Cây Trồng",
        "huong-dan": "Hướng Dẫn Trồng",
        "cham-soc": "Chăm Sóc Cây",
        "tin-tuc": "Tin Tức",
        "cong-ty": "Tin Công Ty",
        "nganh": "Tin Ngành",
        "vi-tri": "Vị Trí Tuyển Dụng",
        "quy-trinh": "Quy Trình Tuyển Dụng",
    }

    // Process the breadcrumb items to handle special cases
    const getBreadcrumbItems = () => {
        const items = []
        let currentPath = ""

        for (let i = 0; i < pathnames.length; i++) {
            const path = pathnames[i]
            currentPath += `/${path}`

            // Skip "pages" and "blogs" segments in the breadcrumb display
            if (path === "pages" || path === "blogs") {
                continue
            }

            // Get the display name for this path segment
            let displayName = pathMap[path] || path

            // If this is the last item and it's a slug/ID, try to make it more readable
            if (i === pathnames.length - 1 && !pathMap[path]) {
                displayName = path
                    .split("-")
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")
            }

            items.push({
                path: currentPath,
                displayName,
                isLast: i === pathnames.length - 1
            })
        }

        return items
    }

    const breadcrumbItems = getBreadcrumbItems()

    return (
        <nav className={cn("flex items-center text-sm", className)}>
            <ol className="flex items-center space-x-1">
                <li>
                    <Link to="/" className="flex items-center text-muted-foreground hover:text-foreground">
                        <Home className="h-4 w-4" />
                        <span className="sr-only">Trang chủ</span>
                    </Link>
                </li>

                {breadcrumbItems.map((item,) => (
                    <li key={item.path} className="flex items-center">
                        <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
                        {item.isLast ? (
                            <span className="font-medium">{item.displayName}</span>
                        ) : (
                            <Link to={item.path} className="text-muted-foreground hover:text-foreground">
                                {item.displayName}
                            </Link>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    )
}
