"use client"

import type React from "react"
import { useNavigate } from "react-router-dom"
import { AgencyLayout } from "@/layouts/agency-layout"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { CheckCircle } from "lucide-react"

const PaymentSuccess: React.FC = () => {
    const navigate = useNavigate()

    const handleBackToOrders = () => {
        navigate("/agency/orders")
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
                        <CardDescription>Cảm ơn bạn đã thanh toán!</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center p-4">
                            <p className="text-gray-700 mb-4">Đơn hàng của bạn đã được thanh toán thành công và đang được xử lý.</p>
                            <p className="text-gray-700">Bạn có thể theo dõi trạng thái đơn hàng trong mục "Đơn hàng của tôi".</p>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <Button className="w-full sm:w-auto" onClick={handleBackToOrders}>
                            Quay lại danh sách đơn hàng
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </AgencyLayout>
    )
}

export default PaymentSuccess

