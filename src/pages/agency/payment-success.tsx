"use client"

import type React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { AgencyLayout } from "@/layouts/agency-layout"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { CheckCircle } from "lucide-react"

const PaymentSuccess: React.FC = () => {
    const navigate = useNavigate()
    const location = useLocation()

    // Lấy thông tin từ query params (nếu có) hoặc sử dụng dữ liệu mẫu
    const searchParams = new URLSearchParams(location.search)
    const orderCode = searchParams.get("orderCode") || "ORD20250330-030"
    const amount = searchParams.get("amount") ? Number.parseFloat(searchParams.get("amount") || "0") : 10000000
    const description = searchParams.get("description") || "Thanh toán đơn hàng"
    const paymentMethod = searchParams.get("paymentMethod") || "PayOS"
    const transactionId = searchParams.get("transactionId") || "TX-123456789"

    const handleBackToOrders = () => {
        navigate("/agency/orders")
    }

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString("vi-VN") + " " + date.toLocaleTimeString("vi-VN")
        } catch (error) {
            console.log("Error formatting date:", error)
            return dateString
        }
    }

    return (
        <AgencyLayout>
            <div className="container mx-auto py-10 px-4">
                <Card className="max-w-md mx-auto">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <CheckCircle className="h-16 w-16 text-green-500" />
                        </div>
                        <CardTitle className="text-2xl text-green-600">Thanh toán thành công</CardTitle>
                        <CardDescription>Cảm ơn bạn đã thanh toán. Đơn hàng của bạn đã được xử lý.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Mã đơn hàng:</span>
                                <span className="font-medium">{orderCode}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Số tiền:</span>
                                <span className="font-medium">{amount.toLocaleString("vi-VN")} đ</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Phương thức:</span>
                                <span className="font-medium">{paymentMethod}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Mã giao dịch:</span>
                                <span className="font-medium">{transactionId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Thời gian:</span>
                                <span className="font-medium">{formatDate(new Date().toISOString())}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Mô tả:</span>
                                <span className="font-medium">{description}</span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={handleBackToOrders}>
                            Quay lại danh sách đơn hàng
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </AgencyLayout>
    )
}

export default PaymentSuccess

