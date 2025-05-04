"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CalendarRange, } from 'lucide-react'
import { getToken } from "@/utils/auth-utils"
import { toast } from "sonner"

interface MonthlyRevenueData {
    month: number
    year: number
    revenue: number
}

export function MonthlyRevenue() {
    const [revenueData, setRevenueData] = useState<MonthlyRevenueData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [previousRevenue, setPreviousRevenue] = useState<number | null>(null)

    useEffect(() => {
        const fetchMonthlyRevenue = async () => {
            setIsLoading(true)
            try {
                const token = getToken()
                if (!token) {
                    toast.error("Phiên đăng nhập hết hạn")
                    return
                }

                const response = await fetch("https://minhlong.mlhr.org/api/orders/dashboard/my-revenue-this-month", {
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
                    setPreviousRevenue(revenueData.revenue)
                }

                setRevenueData(data)
            } catch (err) {
                console.error("Failed to fetch monthly revenue:", err)
                setError(err instanceof Error ? err.message : "Failed to fetch data")
            } finally {
                setIsLoading(false)
            }
        }

        fetchMonthlyRevenue()

        // Set up auto-refresh every 30 minutes
        const intervalId = setInterval(fetchMonthlyRevenue, 30 * 60 * 1000)

        return () => clearInterval(intervalId)
    }, [])

    // Format month and year to Vietnamese format
    const formatMonthYear = (month: number, year: number) => {
        const date = new Date(year, month - 1, 1)
        return new Intl.DateTimeFormat("vi-VN", {
            month: "long",
            year: "numeric",
        }).format(date)
    }

    // Format currency to Vietnamese Dong
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
        }).format(amount)
    }

    // Calculate percentage change if we have previous data
    const getPercentageChange = () => {
        if (previousRevenue === null || revenueData === null) return null
        if (previousRevenue === 0) return revenueData.revenue > 0 ? 100 : 0

        const change = ((revenueData.revenue - previousRevenue) / previousRevenue) * 100
        return change.toFixed(1)
    }

    // Calculate days passed in the month and days remaining
    const getDaysInfo = () => {
        if (!revenueData) return { passed: 0, total: 0, percentage: 0 }

        const today = new Date()
        const currentMonth = today.getMonth() + 1
        const currentYear = today.getFullYear()

        // Only calculate if we're viewing the current month
        if (revenueData.month === currentMonth && revenueData.year === currentYear) {
            const daysPassed = today.getDate()
            const totalDays = new Date(currentYear, currentMonth, 0).getDate()
            const percentage = Math.round((daysPassed / totalDays) * 100)

            return { passed: daysPassed, total: totalDays, percentage }
        }

        // For past or future months, return full month
        const totalDays = new Date(revenueData.year, revenueData.month, 0).getDate()
        return { passed: totalDays, total: totalDays, percentage: 100 }
    }

    const percentChange = getPercentageChange()
    const daysInfo = getDaysInfo()

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
                <CardTitle className="text-sm font-medium text-muted-foreground">Doanh thu tháng này</CardTitle>
                <CalendarRange className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {revenueData ? formatCurrency(revenueData.revenue) : "0 ₫"}
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

                <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <span>{revenueData ? formatMonthYear(revenueData.month, revenueData.year) : "Đang tải..."}</span>
                </div>

                {revenueData && (
                    <div className="mt-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Tiến độ tháng: {daysInfo.passed}/{daysInfo.total} ngày</span>
                            <span>{daysInfo.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                                className="bg-primary h-1.5 rounded-full"
                                style={{ width: `${daysInfo.percentage}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

