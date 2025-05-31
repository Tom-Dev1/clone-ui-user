import { Link } from "react-router-dom"
import { MainLayout } from "@/layouts/main-layout"

export default function Unauthorized() {
    return (
        <MainLayout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <h1 className="text-4xl font-bold text-red-600 mb-4">Không có quyền truy cập</h1>
                <p className="text-lg text-gray-600 mb-8">
                    Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link to="/" className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                        Về trang chủ
                    </Link>

                </div>
            </div>
        </MainLayout>
    )
}

