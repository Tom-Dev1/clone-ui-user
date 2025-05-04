"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ShoppingBag } from 'lucide-react'
import { getToken } from "@/utils/auth-utils"
import { toast } from "sonner"

interface SalesOrderCountData {
    orderCount: number
}

export function SalesOrderCount() {
    const [orderData, setOrderData] = useState<SalesOrderCountData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [previousCount, setPreviousCount] = useState<number | null>(null)

    useEffect(() => {
        const fetchSalesOrderCount = async () => {
            setIsLoading(true)
            try {
                const token = getToken()
                if (!token) {
                    toast.error("Phiên đăng nhập hết hạn")
                    return
                }

                const response = await fetch("https://minhlong.mlhr.org/api/orders/dashboard/sales-order-count", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                })

                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`)
                }

                const data = await response.json()

                // Store previous count for comparison if we have current data
                if (orderData) {
                    setPreviousCount(orderData.orderCount)
                }

                setOrderData(data)
            } catch (err) {
                console.error("Failed to fetch sales order count:", err)
                setError(err instanceof Error ? err.message : "Failed to fetch data")
            } finally {
                setIsLoading(false)
            }
        }

        fetchSalesOrderCount()

        // Set up auto-refresh every 5 minutes
        const intervalId = setInterval(fetchSalesOrderCount, 5 * 60 * 1000)

        return () => clearInterval(intervalId)
    }, [])

    // Calculate percentage change if we have previous data
    const getPercentageChange = () => {
        if (previousCount === null || orderData === null) return null
        if (previousCount === 0) return orderData.orderCount > 0 ? 100 : 0

        const change = ((orderData.orderCount - previousCount) / previousCount) * 100
        return change.toFixed(1)
    }

    const percentChange = getPercentageChange()

    if (isLoading && !orderData) {
        return (
            <Card className="animate-pulse">
                <CardHeader className="pb-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardContent>
            </Card>
        )
    }

    if (error && !orderData) {
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

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tổng đơn hàng bán ra</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {orderData?.orderCount.toLocaleString('vi-VN')}
                    {isLoading && <span className="ml-2 text-xs text-muted-foreground">(đang cập nhật...)</span>}
                </div>

                {percentChange !== null && (
                    <div className={`text-xs mt-1 flex items-center ${Number(percentChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <span className="mr-1">
                            {Number(percentChange) >= 0 ? '↑' : '↓'}
                        </span>
                        <span>
                            {Math.abs(Number(percentChange))}% so với lần cập nhật trước
                        </span>
                    </div>
                )}

                <p className="text-xs text-muted-foreground mt-1">
                    Cập nhật lần cuối: {new Date().toLocaleString('vi-VN')}
                </p>
            </CardContent>
        </Card>
    )
}
