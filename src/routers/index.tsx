import { Suspense, lazy } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import LoadingSpinner from "@/components/loading-spinner"
import { AuthGuard } from "./guards/auth-guard"
import { GuestGuard } from "./guards/guest-guard"
import { MainLayout } from "@/layouts/main-layout"
import { UserRole } from "@/types/auth-type"
import { RoleGuard } from "./guards/role-guard"
import AgencyDashboard from "@/pages/agency/dashboard"
import AgencyOrders from "@/pages/agency/AgencyOrders"
import AgencyProfile from "@/pages/agency/AgencyProfile"
import AgencyProducts from "@/pages/agency/AgencyProducts"
import SalesDashboard from "@/pages/sales/dashboard"
import SalesOrders from "@/pages/sales/SalesOrders"
import SalesCustomers from "@/pages/sales/SalesCustomers"
import SalesReports from "@/pages/sales/SalesReports"
import SalesDebt from "@/pages/sales/debt"
import SalesProfile from "@/pages/sales/profile"

// Lazy load pages for better performance
const Home = lazy(() => import("@/pages/home"))
const AboutUs = lazy(() => import("@/pages/AboutUs"))
const CollectionsHome = lazy(() => import("@/pages/collections/CollectionsHome"))
const ProductCategory = lazy(() => import("@/pages/collections/product-category"))
const BlogHome = lazy(() => import("@/pages/blogs/BlogHome"))
const BlogNews = lazy(() => import("@/pages/blogs/BlogNews"))
const ContactPage = lazy(() => import("@/pages/ContactPage"))
const Login = lazy(() => import("@/pages/auth/login"))
const Register = lazy(() => import("@/pages/auth/register"))
const ForgotPassword = lazy(() => import("@/pages/auth/forgot-password"))
const Dashboard = lazy(() => import("@/pages/dashboard"))
const NotFound = lazy(() => import("@/pages/not-found"))

// Role-specific pages
// const SalesDashboard = lazy(() => import("@/pages/sales/dashboard"))
// const SalesOrders = lazy(() => import("@/pages/sales/orders"))
// const SalesCustomers = lazy(() => import("@/pages/sales/customers"))
// const SalesReports = lazy(() => import("@/pages/sales/reports"))

// const AgencyDashboard = lazy(() => import("@/pages/agency/dashboard"))
// const AgencyOrders = lazy(() => import("@/pages/agency/orders"))
// const AgencyProfile = lazy(() => import("@/pages/agency/profile"))
// const AgencyProducts = lazy(() => import("@/pages/agency/products"))

export const AppRouter = () => {
    return (
        <BrowserRouter>
            <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                    {/* Public routes */}
                    <Route
                        path="/"
                        element={
                            <>
                                <MainLayout showBreadcrumb={false}>
                                    <Home />
                                </MainLayout>
                            </>
                        }
                    />

                    {/* GIỚI THIỆU */}
                    <Route
                        path="/pages/about-us"
                        element={
                            <MainLayout>
                                <AboutUs />
                            </MainLayout>
                        }
                    />
                    <Route
                        path="/pages/about-us/:subpage"
                        element={
                            <MainLayout>
                                <AboutUs />
                            </MainLayout>
                        }
                    />

                    {/* SẢN PHẨM */}
                    <Route
                        path="/collections"
                        element={
                            <MainLayout>
                                <CollectionsHome />
                            </MainLayout>
                        }
                    />
                    <Route
                        path="/collections/:category"
                        element={
                            <MainLayout>
                                <ProductCategory />
                            </MainLayout>
                        }
                    />

                    {/* KIẾN THỨC CÂY TRỒNG */}
                    <Route
                        path="/blogs/kien-thuc-cay-trong"
                        element={
                            <MainLayout>
                                <BlogHome />
                            </MainLayout>
                        }
                    />
                    <Route
                        path="/blogs/kien-thuc-cay-trong/:slug"
                        element={
                            <MainLayout>
                                <BlogHome />
                            </MainLayout>
                        }
                    />

                    {/* TIN TỨC */}
                    <Route
                        path="/blogs/news"
                        element={
                            <MainLayout>
                                <BlogNews />
                            </MainLayout>
                        }
                    />
                    <Route
                        path="/blogs/news/:slug"
                        element={
                            <MainLayout>
                                <BlogNews />
                            </MainLayout>
                        }
                    />

                    <Route
                        path="/pages/lien-he"
                        element={
                            <MainLayout>
                                <ContactPage />
                            </MainLayout>
                        }
                    />

                    {/* Auth routes - only accessible if NOT logged in */}
                    <Route element={<GuestGuard />}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                    </Route>

                    {/* Protected routes - only accessible if logged in */}
                    <Route element={<AuthGuard />}>
                        {/* Common dashboard route */}
                        <Route path="/dashboard" element={<Dashboard />} />

                        {/* SALES_MANAGER specific routes */}
                        <Route element={<RoleGuard allowedRoles={[UserRole.SALES_MANAGER]} />}>
                            <Route path="/sales/dashboard" element={<SalesDashboard />} />
                            <Route path="/sales/orders" element={<SalesOrders />} />
                            <Route path="/sales/customers" element={<SalesCustomers />} />
                            <Route path="/sales/reports" element={<SalesReports />} />
                            <Route path="/sales/debt" element={<SalesDebt />} />
                            <Route path="/sales/profile" element={<SalesProfile />} />
                        </Route>

                        {/* AGENCY specific routes */}
                        <Route element={<RoleGuard allowedRoles={[UserRole.AGENCY]} />}>
                            <Route path="/agency/dashboard" element={<AgencyDashboard />} />
                            <Route path="/agency/orders" element={<AgencyOrders />} />
                            <Route path="/agency/profile" element={<AgencyProfile />} />
                            <Route path="/agency/products" element={<AgencyProducts />} />
                        </Route>
                    </Route>

                    {/* Catch all route for 404 */}
                    <Route path="/404" element={<NotFound />} />
                    <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    )
}

