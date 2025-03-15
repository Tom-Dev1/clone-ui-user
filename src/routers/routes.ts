import type React from "react"
import { lazy } from "react"

// Define route types for better type safety
export interface GuardProps {
    children: React.ReactNode;
}

export interface RouteConfig {
    path: string
    component: React.ComponentType<unknown>
    layout?: React.ComponentType<unknown> | null
    guard?: React.ComponentType<GuardProps> | null
    children?: RouteConfig[]
    meta?: {
        title?: string
        requiresAuth?: boolean
        guestOnly?: boolean
        permissions?: string[]
    }
}

// Define route groups for organization
export const routes: Record<string, RouteConfig[]> = {
    public: [
        {
            path: "/",
            component: lazy(() => import("@/pages/home")),
            meta: {
                title: "Trang chủ",
            },
        },
        {
            path: "/pages/about-us",
            component: lazy(() => import("@/pages/AboutUs")),
            meta: {
                title: "Giới thiệu",
            },
        },
        {
            path: "/collections/",
            component: lazy(() => import("@/pages/collections/CollectionsHome")),
            meta: {
                title: "Sản phẩm",
            },
            children: [
                {
                    path: "/collections/thuoc-tru-oc-1",
                    component: lazy(() => import("@/pages/collections/CollectionSlug")),
                    meta: {
                        title: "Thuốc trừ ốc",
                    },
                },
                {
                    path: "/collections/thuoc-tru-co",
                    component: lazy(() => import("@/pages/collections/CollectionSlug")),
                    meta: {
                        title: "Thuốc trừ cỏ",
                    },
                },
                {
                    path: "/collections/thuoc-tru-sau",
                    component: lazy(() => import("@/pages/collections/CollectionSlug")),
                    meta: {
                        title: "Thuốc trừ sâu",
                    },
                },
                {
                    path: "/collections/thuoc-tru-benh",
                    component: lazy(() => import("@/pages/collections/CollectionSlug")),
                    meta: {
                        title: "Thuốc trừ bệnh",
                    },
                },
                {
                    path: "/collections/thuoc-duong",
                    component: lazy(() => import("@/pages/collections/CollectionSlug")),
                    meta: {
                        title: "Thuốc dưỡng",
                    },
                },
                {
                    path: "/collections/phan-bon",
                    component: lazy(() => import("@/pages/collections/CollectionSlug")),
                    meta: {
                        title: "Phân bón",
                    },
                },
            ],
        },
        {
            path: "/blogs/kien-thuc-cay-trong",
            component: lazy(() => import("@/pages/blogs/BlogHome")),
            meta: {
                title: "Kiến thức cây trồng",
            },
        },
        {
            path: "/blogs/news",
            component: lazy(() => import("@/pages/blogs/BlogNews")),
            meta: {
                title: "Tin tức",
            },
        },
        {
            path: "/blogs/tuyen-dung",
            component: lazy(() => import("@/pages/blogs/BlogCareer")),
            meta: {
                title: "Tuyển dụng",
            },
        },
        {
            path: "/pages/lien-he",
            component: lazy(() => import("@/pages/ContactPage")),
            meta: {
                title: "Liên hệ",
            },
        },
    ],
    auth: [
        {
            path: "/login",
            component: lazy(() => import("@/pages/auth/login")),
            meta: {
                title: "Đăng nhập",
                guestOnly: true,
            },
        },
        {
            path: "/register",
            component: lazy(() => import("@/pages/auth/register")),
            meta: {
                title: "Đăng ký",
                guestOnly: true,
            },
        },
        {
            path: "/forgot-password",
            component: lazy(() => import("@/pages/auth/forgot-password")),
            meta: {
                title: "Quên mật khẩu",
                guestOnly: true,
            },
        },
    ],
    dashboard: [
        {
            path: "/dashboard",
            component: lazy(() => import("@/pages/dashboard")),
            meta: {
                title: "Dashboard",
                requiresAuth: true,
            },
            children: [
                {
                    path: "/dashboard/profile",
                    component: lazy(() => import("@/pages/dashboard/profile")),
                    meta: {
                        title: "Hồ sơ cá nhân",
                        requiresAuth: true,
                    },
                },
                {
                    path: "/dashboard/orders",
                    component: lazy(() => import("@/pages/dashboard/order")),
                    meta: {
                        title: "Đơn hàng",
                        requiresAuth: true,
                    },
                },
                {
                    path: "/dashboard/settings",
                    component: lazy(() => import("@/pages/dashboard/")),
                    meta: {
                        title: "Cài đặt",
                        requiresAuth: true,
                    },
                },
            ],
        },
    ],
    error: [
        {
            path: "/404",
            component: lazy(() => import("@/pages/not-found")),
            meta: {
                title: "Không tìm thấy trang",
            },
        },

    ],
}

// Flatten routes for easier access
export const flattenRoutes = (): RouteConfig[] => {
    const flattened: RouteConfig[] = []

    Object.values(routes).forEach((routeGroup) => {
        const processRoute = (route: RouteConfig) => {
            flattened.push(route)
            if (route.children) {
                route.children.forEach(processRoute)
            }
        }

        routeGroup.forEach(processRoute)
    })

    return flattened
}

