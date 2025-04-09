"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle, Percent, CreditCard, Clock, User, FileText } from 'lucide-react'
import { getToken } from "@/utils/auth-utils"
import type { AgencyLevel } from "@/types/agency-level"
import { formatCurrency, getLevelColor } from "@/utils/agency-level-utils"

interface AgencyLevelViewDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    levelId: number | null
}

export function AgencyLevelViewDialog({ isOpen, onOpenChange, levelId }: AgencyLevelViewDialogProps) {
    const [agencyLevel, setAgencyLevel] = useState<AgencyLevel | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Fetch agency level details when dialog opens and levelId changes
    useEffect(() => {
        if (isOpen && levelId) {
            fetchAgencyLevelDetails(levelId)
        } else {
            // Reset state when dialog closes
            setAgencyLevel(null)
            setError(null)
        }
    }, [isOpen, levelId])

    // Fetch agency level details from API
    const fetchAgencyLevelDetails = async (id: number) => {
        setIsLoading(true)
        setError(null)

        try {
            const token = getToken()
            if (!token) {
                throw new Error("Phiên đăng nhập hết hạn")
            }

            const response = await fetch(`https://minhlong.mlhr.org/api/AgencyLevel/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            })

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`)
            }

            const data = await response.json()
            setAgencyLevel(data)
        } catch (error) {
            console.error("Failed to fetch agency level details:", error)
            setError(error instanceof Error ? error.message : "Không thể tải thông tin cấp độ đại lý")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>Chi tiết cấp độ đại lý</DialogTitle>
                    <DialogDescription>Thông tin chi tiết về cấp độ đại lý</DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin mr-2" />
                        <p>Đang tải thông tin cấp độ đại lý...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        <span>{error}</span>
                    </div>
                ) : agencyLevel ? (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className={`p-3 rounded-full ${getLevelColor(agencyLevel.levelName)}`}>
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">{agencyLevel.levelName}</h3>
                                    <Badge variant="outline" className={getLevelColor(agencyLevel.levelName)}>
                                        Cấp {agencyLevel.levelId}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 rounded-full bg-green-100">
                                        <Percent className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Chiết khấu</p>
                                        <p className="font-bold text-lg">{agencyLevel.discountPercentage}%</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 rounded-full bg-green-100">
                                        <CreditCard className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Hạn mức tín dụng</p>
                                        <p className="font-bold text-lg">{formatCurrency(agencyLevel.creditLimit)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 rounded-full bg-green-100">
                                        <Clock className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Thời hạn thanh toán</p>
                                        <p className="font-bold text-lg">{agencyLevel.paymentTerm} ngày</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                            <h4 className="font-medium mb-2 flex items-center">
                                <User className="h-4 w-4 mr-2 text-green-600" />
                                Quyền lợi đại lý
                            </h4>
                            <p className="text-sm text-green-800">
                                Đại lý thuộc cấp độ <strong>{agencyLevel.levelName}</strong> được hưởng chiết khấu{" "}
                                <strong>{agencyLevel.discountPercentage}%</strong> trên mỗi đơn hàng. Hạn mức tín dụng tối đa là{" "}
                                <strong>{formatCurrency(agencyLevel.creditLimit)}</strong> và thời hạn thanh toán là{" "}
                                <strong>{agencyLevel.paymentTerm} ngày</strong> kể từ ngày đặt hàng.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <p>Không tìm thấy thông tin cấp độ đại lý.</p>
                    </div>
                )}

                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Đóng</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
