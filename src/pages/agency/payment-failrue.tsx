"use client"

import type React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { AgencyLayout } from "@/layouts/agency-layout"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { AlertCircle } from "lucide-react"

const PaymentFailure: React.FC = () => {
    const navigate = useNavigate()
    const location = useLocation()

    // Lấy thông tin từ query params (nếu có) hoặc sử dụng dữ liệu mẫu
    const searchParams = new URLSearchParams(location.search)
    const orderCode = searchParams.get("orderCode") || "ORD20250330-030"
    const errorCode = searchParams.get("errorCode") || "ERR-1001"
    const errorMessage = searchParams.get("errorMessage") || "Giao dịch bị từ chối bởi ngân hàng phát hành"
    const transactionId = searchParams.get("transactionId") || "TX-123456789"

    const handleBackToOrders = () => {
        navigate("/agency/orders")
    }

    const handleTryAgain = () => {
        // Nếu có orderCode, chuyển hướng đến trang đơn hàng với orderCode
        if (orderCode) {
            navigate(`/agency/orders?orderCode=${orderCode}`)
        } else {
            navigate("/agency/orders")
        }
    }

    return (
        <AgencyLayout>
            <div className="container mx-auto py-10 px-4">
                <Card className="max-w-md mx-auto">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <AlertCircle className="h-16 w-16 text-red-500" />
                        </div>
                        <CardTitle className="text-2xl text-red-600">Thanh toán thất bại</CardTitle>
                        <CardDescription>Rất tiếc, giao dịch của bạn không thể hoàn tất.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Mã đơn hàng:</span>
                                <span className="font-medium">{orderCode}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Mã giao dịch:</span>
                                <span className="font-medium">{transactionId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Mã lỗi:</span>
                                <span className="font-medium">{errorCode}</span>
                            </div>
                            <div className="mt-4 p-3 bg-red-50 rounded-md border border-red-100">
                                <p className="text-red-700">{errorMessage}</p>
                            </div>
                            <div className="mt-4">
                                <h3 className="font-medium mb-2">Nguyên nhân có thể:</h3>
                                <ul className="list-disc list-inside space-y-1 text-gray-600">
                                    <li>Thẻ/tài khoản của bạn không đủ số dư</li>
                                    <li>Thông tin thẻ không chính xác</li>
                                    <li>Ngân hàng từ chối giao dịch vì lý do bảo mật</li>
                                    <li>Kết nối mạng không ổn định</li>
                                    <li>Hệ thống thanh toán tạm thời gặp sự cố</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                        <Button variant="outline" className="w-full" onClick={handleBackToOrders}>
                            Quay lại danh sách đơn hàng
                        </Button>
                        <Button className="w-full" onClick={handleTryAgain}>
                            Thử lại
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </AgencyLayout>
    )
}

export default PaymentFailure

