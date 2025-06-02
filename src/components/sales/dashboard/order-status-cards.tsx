"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Clock, Package, TruckIcon, XCircle } from "lucide-react"
import { getToken } from "@/utils/auth-utils"
import { toast } from "sonner"
import { SalesOrderCount } from "./sales-order-count"
import { SalesRevenue } from "./sales-revenue"

interface OrderStatusCount {
    status: string
    count: number
}

export function OrderStatusCards() {
    const [statusData, setStatusData] = useState<OrderStatusCount[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchOrderStatusCounts = async () => {
            setIsLoading(true)
            try {
                const token = getToken()
                if (!token) {
                    toast.error("Phiên đăng nhập hết hạn")
                    return
                }
                const response = await fetch("https://minhlong.mlhr.org/api/orders/dashboard/order-status-count", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                })

                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`)
                }

                const data = await response.json()
                setStatusData(data)
            } catch (err) {
                console.error("Failed to fetch order status counts:", err)
                setError(err instanceof Error ? err.message : "Failed to fetch data")
            } finally {
                setIsLoading(false)
            }
        }

        fetchOrderStatusCounts()
    }, [])

    // Get appropriate icon and color for each status
    const getStatusInfo = (status: string) => {
        switch (status) {
            case "Exported":
                return {
                    icon: <Package className="h-5 w-5" />,
                    color: "text-blue-500",
                    bgColor: "bg-blue-50",
                    label: "Đã xuất kho",
                }
            case "WaitingDelivery":
                return {
                    icon: <Clock className="h-5 w-5" />,
                    color: "text-yellow-500",
                    bgColor: "bg-yellow-50",
                    label: "Chờ giao hàng",
                }
            case "Canceled":
                return {
                    icon: <XCircle className="h-5 w-5" />,
                    color: "text-red-500",
                    bgColor: "bg-red-50",
                    label: "Đã hủy",
                }
            case "Paid":
                return {
                    icon: <CheckCircle className="h-5 w-5" />,
                    color: "text-green-500",
                    bgColor: "bg-green-50",
                    label: "Đã thanh toán",
                }
            case "Delivered":
                return {
                    icon: <TruckIcon className="h-5 w-5" />,
                    color: "text-indigo-500",
                    bgColor: "bg-indigo-50",
                    label: "Đã giao hàng",
                }
            default:
                return {
                    icon: <AlertCircle className="h-5 w-5" />,
                    color: "text-gray-500",
                    bgColor: "bg-gray-50",
                    label: status,
                }
        }
    }

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, index) => (
                    <Card key={index} className="animate-pulse">
                        <CardHeader className="pb-2">
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="h-5 w-5" />
                        <p>Lỗi khi tải dữ liệu: {error}</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Calculate total orders
    const totalOrders = statusData.reduce((sum, item) => sum + item.count, 0)

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Tổng đơn hàng</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalOrders}</div>
                        <p className="text-xs text-muted-foreground mt-1">Tất cả đơn hàng</p>
                    </CardContent>
                </Card>
                <SalesOrderCount />
                <SalesRevenue />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Orders Card */}

                {/* Status Cards */}
                {statusData.map((item) => {
                    const { icon, color, bgColor, label } = getStatusInfo(item.status)

                    return (
                        <Card key={item.status}>
                            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                                <div className={`${color} ${bgColor} p-2 rounded-full`}>{icon}</div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{item.count}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {((item.count / totalOrders) * 100).toFixed(1)}% của tổng đơn hàng
                                </p>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
