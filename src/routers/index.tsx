import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoadingSpinner from "@/components/loading-spinner";
import { AuthGuard } from "./guards/auth-guard";
import { MainLayout } from "@/layouts/main-layout";
import { UserRole } from "@/types/auth-type";
import AgencyDashboard from "@/pages/agency/dashboard";
import AgencyProfile from "@/pages/agency/AgencyProfile";
import AgencyRequests from "@/pages/agency/request";
import AgencyProductRequest from "@/pages/agency/product-request";
import AgencyPayment from "@/pages/agency/payment";
import AgencyOrders from "@/pages/agency/orders";
import { LoginPage } from "@/pages/auth/login";
import { ProtectedRoute } from "./ProtectedRoute";
import { VerifyEmail } from "@/pages/VerifyEmail";
import { DashboardRouter } from "@/components/DashboardRouter";
import PaymentSuccess from "@/pages/agency/payment-success";
import PaymentFailure from "@/pages/agency/payment-failrue";
import SaleAgencyLevel from "@/pages/sales/sale-agency-level";
import SaleReviewOrder from "@/pages/sales/sale-review-order";
import SaleCustomer from "@/pages/sales/sale-customer";
import AgencyReturnOrder from "@/pages/agency/return-order";
import ChatPage from "@/pages/sales/sale-chat-page";

// Lazy load pages for better performance
const Home = lazy(() => import("@/pages/home"));
const AboutUs = lazy(() => import("@/pages/AboutUs"));
const CollectionsHome = lazy(
  () => import("@/pages/collections/collection-home")
);
const CollectionSlug = lazy(
  () => import("@/pages/collections/collection-slug")
);
const BlogHome = lazy(() => import("@/pages/blogs/BlogHome"));
const BlogNews = lazy(() => import("@/pages/blogs/BlogNews"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const Register = lazy(() => import("@/pages/auth/register"));
const ForgotPassword = lazy(() => import("@/pages/auth/forgot-password"));
const NotFound = lazy(() => import("@/pages/not-found"));
const ProductDetail = lazy(() => import("@/pages/collections/product-detail"));
// Role-specific pages
const SalesDashboard = lazy(() => import("@/pages/sales/sale-dashboard"));
const SalesOrders = lazy(() => import("@/pages/sales/sale-order"));
const SalesDebt = lazy(() => import("@/pages/sales/sale-debt"));
const SalesProfile = lazy(() => import("@/pages/sales/sale-profile"));
const SalesExports = lazy(() => import("@/pages/sales/sale-export"));
const SalesProducts = lazy(() => import("@/pages/sales/sale-product"));
const SalesCart = lazy(() => import("@/pages/sales/sale-cart"));
const SalesTax = lazy(() => import("@/pages/sales/sale-tax"));

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
                <MainLayout>
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
            path="/collections/:categoryId"
            element={
              <MainLayout>
                <CollectionSlug />
              </MainLayout>
            }
          />
          <Route
            path="/product/:id"
            element={
              <MainLayout>
                <ProductDetail />
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
          <Route
            path="/login"
            element={
              <AuthGuard>
                {" "}
                <LoginPage />{" "}
              </AuthGuard>
            }
          />
          <Route
            path="/register"
            element={
              <AuthGuard>
                <Register />{" "}
              </AuthGuard>
            }
          />
          <Route
            path="/verify-email"
            element={
              <ProtectedRoute skipEmailVerification={true}>
                <VerifyEmail />
              </ProtectedRoute>
            }
          />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/dashboard" element={<DashboardRouter />} />
          <Route
            path="/sales/dashboard"
            element={
              <ProtectedRoute requiredRole={UserRole.SALES_MANAGER}>
                <SalesDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/messages"
            element={
              <ProtectedRoute requiredRole={UserRole.SALES_MANAGER}>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/cart"
            element={
              <ProtectedRoute requiredRole={UserRole.SALES_MANAGER}>
                <SalesCart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/profile"
            element={
              <ProtectedRoute requiredRole={UserRole.SALES_MANAGER}>
                <SalesProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/orders"
            element={
              <ProtectedRoute requiredRole={UserRole.SALES_MANAGER}>
                <SalesOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/debt"
            element={
              <ProtectedRoute requiredRole={UserRole.SALES_MANAGER}>
                <SalesDebt />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/export"
            element={
              <ProtectedRoute requiredRole={UserRole.SALES_MANAGER}>
                <SalesExports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/tax"
            element={
              <ProtectedRoute requiredRole={UserRole.SALES_MANAGER}>
                <SalesTax />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/product"
            element={
              <ProtectedRoute requiredRole={UserRole.SALES_MANAGER}>
                <SalesProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/level"
            element={
              <ProtectedRoute requiredRole={UserRole.SALES_MANAGER}>
                <SaleAgencyLevel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/review-order"
            element={
              <ProtectedRoute requiredRole={UserRole.SALES_MANAGER}>
                <SaleReviewOrder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales/customer"
            element={
              <ProtectedRoute requiredRole={UserRole.SALES_MANAGER}>
                <SaleCustomer />
              </ProtectedRoute>
            }
          />

          <Route
            path="/agency/dashboard"
            element={
              <ProtectedRoute requiredRole={UserRole.AGENCY}>
                <AgencyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agency/requests"
            element={
              <ProtectedRoute requiredRole={UserRole.AGENCY}>
                <AgencyRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agency/product-request"
            element={
              <ProtectedRoute requiredRole={UserRole.AGENCY}>
                <AgencyProductRequest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agency/orders"
            element={
              <ProtectedRoute requiredRole={UserRole.AGENCY}>
                <AgencyOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agency/profile"
            element={
              <ProtectedRoute requiredRole={UserRole.AGENCY}>
                <AgencyProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agency/payment"
            element={
              <ProtectedRoute requiredRole={UserRole.AGENCY}>
                <AgencyPayment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agency/payment-success"
            element={
              <ProtectedRoute requiredRole={UserRole.AGENCY}>
                <PaymentSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agency/payment-failure"
            element={
              <ProtectedRoute requiredRole={UserRole.AGENCY}>
                <PaymentFailure />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agency/return-order"
            element={
              <ProtectedRoute requiredRole={UserRole.AGENCY}>
                <AgencyReturnOrder />
              </ProtectedRoute>
            }
          />

          {/* Catch all route for 404 */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
