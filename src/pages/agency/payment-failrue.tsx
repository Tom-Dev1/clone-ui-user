"use client"

import type React from "react"
import { useNavigate } from "react-router-dom"
import { AgencyLayout } from "@/layouts/agency-layout"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { AlertCircle } from "lucide-react"

const PaymentFailure: React.FC = () => {
    const navigate = useNavigate()

    const handleBackToOrders = () => {
        navigate("/agency/orders")
    }

    const handleTryAgain = () => {
        navigate("/agency/orders")
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
                        <div className="text-center p-4 mb-4">
                            <p className="text-gray-700">Đã xảy ra lỗi trong quá trình xử lý thanh toán của bạn.</p>
                        </div>

                        <div className="p-3 bg-red-50 rounded-md border border-red-100">
                            <p className="text-red-700">
                                Giao dịch không thành công. Vui lòng kiểm tra thông tin thanh toán và thử lại.
                            </p>
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

