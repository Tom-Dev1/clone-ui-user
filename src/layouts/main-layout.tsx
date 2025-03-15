import type { ReactNode } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Breadcrumb } from "@/components/breadcrumb"
import { useLocation } from "react-router-dom"
import { ResponsiveContainer } from "@/components/responsive-container"

interface MainLayoutProps {
    children: ReactNode
    showBreadcrumb?: boolean
    maxWidth?: "default" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full"
    isHomePage?: boolean
}

export function MainLayout({ children, showBreadcrumb = true, maxWidth = "2xl", isHomePage = false }: MainLayoutProps) {
    const location = useLocation()
    const isHomePathname = location.pathname === "/"

    return (
        <div className="flex min-h-screen flex-col">
            <SiteHeader isHomePage={isHomePage} />

            <main className={`flex-1 ${isHomePage ? "mt-0" : ""}`}>
                {showBreadcrumb && !isHomePathname && (
                    <div className="border-b py-3 mt-32 px-20">
                        <ResponsiveContainer maxWidth={maxWidth}>
                            <Breadcrumb />
                        </ResponsiveContainer>
                    </div>
                )}

                {children}
            </main>

            <SiteFooter />
        </div>
    )
}

