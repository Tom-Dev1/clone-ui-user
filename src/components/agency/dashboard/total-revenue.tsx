"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, DollarSign } from 'lucide-react'
import { getToken } from "@/utils/auth-utils"
import { toast } from "sonner"

interface TotalRevenueData {
    totalRevenue: number
}

export function TotalRevenue() {
    const [revenueData, setRevenueData] = useState<TotalRevenueData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [previousRevenue, setPreviousRevenue] = useState<number | null>(null)

    useEffect(() => {
        const fetchTotalRevenue = async () => {
            setIsLoading(true)
            try {
                const token = getToken()
                if (!token) {
                    toast.error("Phiên đăng nhập hết hạn")
                    return
                }

                const response = await fetch("https://minhlong.mlhr.org/api/orders/dashboard/my-total-revenue", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                })

                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`)
                }

                const data = await response.json()

                // Store previous revenue for comparison if we have current data
                if (revenueData) {
                    setPreviousRevenue(revenueData.totalRevenue)
                }

                setRevenueData(data)
            } catch (err) {
                console.error("Failed to fetch total revenue:", err)
                setError(err instanceof Error ? err.message : "Failed to fetch data")
            } finally {
                setIsLoading(false)
            }
        }

        fetchTotalRevenue()

        // Set up auto-refresh every hour
        const intervalId = setInterval(fetchTotalRevenue, 60 * 60 * 1000)

        return () => clearInterval(intervalId)
    }, [])

    // Format currency to Vietnamese Dong
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount)
    }

    // Calculate percentage change if we have previous data
    const getPercentageChange = () => {
        if (previousRevenue === null || revenueData === null) return null
        if (previousRevenue === 0) return revenueData.totalRevenue > 0 ? 100 : 0

        const change = ((revenueData.totalRevenue - previousRevenue) / previousRevenue) * 100
        return change.toFixed(1)
    }

    const percentChange = getPercentageChange()

    if (isLoading && !revenueData) {
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

    if (error && !revenueData) {
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
                <CardTitle className="text-sm font-medium text-muted-foreground">Tổng doanh thu</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {revenueData ? formatCurrency(revenueData.totalRevenue) : "0 ₫"}
                    {isLoading && <span className="ml-2 text-xs text-muted-foreground">(đang cập nhật...)</span>}
                </div>

                {percentChange !== null && (
                    <div
                        className={`text-xs mt-1 flex items-center ${Number(percentChange) >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                        <span className="mr-1">{Number(percentChange) >= 0 ? "↑" : "↓"}</span>
                        <span>{Math.abs(Number(percentChange))}% so với lần cập nhật trước</span>
                    </div>
                )}

            </CardContent>
        </Card>
    )
}

