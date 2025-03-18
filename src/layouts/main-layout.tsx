import type { ReactNode } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { useLocation } from "react-router-dom"
import { ResponsiveContainer } from "@/components/responsive-container"

interface MainLayoutProps {
    children: ReactNode

    maxWidth?: "default" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full"
    isHomePage?: boolean
}

export function MainLayout({ children, maxWidth = "2xl", isHomePage = false }: MainLayoutProps) {
    const location = useLocation()
    const isHomePathname = location.pathname === "/"

    return (
        <div className="flex min-h-screen flex-col">
            <SiteHeader isHomePage={isHomePage} />

            <main className={`flex-1${isHomePage ? "mt-0" : ""}`}>
                {!isHomePathname && (
                    <div className=" py-3 mt-32 px-10">
                        <ResponsiveContainer maxWidth={maxWidth}>
                            <div className="mt-1 mx-auto" />
                        </ResponsiveContainer>
                    </div>
                )}


                {children}

            </main>

            <SiteFooter />
        </div>
    )
}

