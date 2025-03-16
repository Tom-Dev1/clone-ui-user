import { Suspense, lazy } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import LoadingSpinner from "@/components/loading-spinner"
import { AuthGuard } from "./guards/auth-guard"
import { GuestGuard } from "./guards/guest-guard"
import { MainLayout } from "@/layouts/main-layout"

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
                        <Route path="/dashboard/*" element={<Dashboard />} />
                    </Route>

                    {/* Catch all route for 404 */}
                    <Route path="/404" element={<NotFound />} />
                    <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    )
}

