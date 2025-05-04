"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CreditCard } from "lucide-react"
import { getToken } from "@/utils/auth-utils"
import { toast } from "sonner"

interface TotalDebtData {
    remainingDebt: number
}

export function TotalDebt() {
    const [debtData, setDebtData] = useState<TotalDebtData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [previousDebt, setPreviousDebt] = useState<number | null>(null)

    useEffect(() => {
        const fetchTotalDebt = async () => {
            setIsLoading(true)
            try {
                const token = getToken()
                if (!token) {
                    toast.error("Phiên đăng nhập hết hạn")
                    return
                }

                const response = await fetch("https://minhlong.mlhr.org/api/PaymentHistory/dashboard/total-debt", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                })

                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`)
                }

                const data = await response.json()

                // Store previous debt for comparison if we have current data
                if (debtData) {
                    setPreviousDebt(debtData.remainingDebt)
                }

                setDebtData(data)
            } catch (err) {
                console.error("Failed to fetch total debt:", err)
                setError(err instanceof Error ? err.message : "Failed to fetch data")
            } finally {
                setIsLoading(false)
            }
        }

        fetchTotalDebt()

        // Set up auto-refresh every hour
        const intervalId = setInterval(fetchTotalDebt, 60 * 60 * 1000)

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
        if (previousDebt === null || debtData === null) return null
        if (previousDebt === 0) return debtData.remainingDebt > 0 ? 100 : 0

        const change = ((debtData.remainingDebt - previousDebt) / previousDebt) * 100
        return change.toFixed(1)
    }

    const percentChange = getPercentageChange()

    if (isLoading && !debtData) {
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

    if (error && !debtData) {
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
        <Card className={debtData && debtData.remainingDebt > 0 ? "border-amber-200" : ""}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Công nợ hiện tại</CardTitle>
                <CreditCard
                    className={`h-4 w-4 ${debtData && debtData.remainingDebt > 0 ? "text-amber-500" : "text-muted-foreground"}`}
                />
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${debtData && debtData.remainingDebt > 0 ? "text-amber-600" : ""}`}>
                    {debtData ? formatCurrency(debtData.remainingDebt) : "0 ₫"}
                    {isLoading && <span className="ml-2 text-xs text-muted-foreground">(đang cập nhật...)</span>}
                </div>

                {percentChange !== null && (
                    <div
                        className={`text-xs mt-1 flex items-center ${Number(percentChange) > 0
                                ? "text-amber-600"
                                : Number(percentChange) < 0
                                    ? "text-green-600"
                                    : "text-gray-600"
                            }`}
                    >
                        <span className="mr-1">{Number(percentChange) > 0 ? "↑" : Number(percentChange) < 0 ? "↓" : "="}</span>
                        <span>
                            {Math.abs(Number(percentChange))}%{" "}
                            {Number(percentChange) > 0 ? "tăng" : Number(percentChange) < 0 ? "giảm" : "không đổi"} so với lần cập
                            nhật trước
                        </span>
                    </div>
                )}

                <p className="text-xs text-muted-foreground mt-1">
                    {debtData && debtData.remainingDebt > 0
                        ? "Vui lòng thanh toán công nợ đúng hạn"
                        : "Không có công nợ cần thanh toán"}
                </p>
            </CardContent>
        </Card>
    )
}
