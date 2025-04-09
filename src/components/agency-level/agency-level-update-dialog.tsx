"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Save, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { getToken } from "@/utils/auth-utils"
import type { AgencyLevel } from "@/types/agency-level"

interface AgencyLevelUpdateDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    levelId: number | null
    onAgencyLevelUpdated: () => void
}

export function AgencyLevelUpdateDialog({
    isOpen,
    onOpenChange,
    levelId,
    onAgencyLevelUpdated,
}: AgencyLevelUpdateDialogProps) {
    const [agencyLevel, setAgencyLevel] = useState<AgencyLevel | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formErrors, setFormErrors] = useState<Partial<Record<keyof AgencyLevel, string>>>({})

    // Fetch agency level details when dialog opens and levelId changes
    useEffect(() => {
        if (isOpen && levelId) {
            fetchAgencyLevelDetails(levelId)
        } else {
            // Reset state when dialog closes
            setAgencyLevel(null)
            setError(null)
            setFormErrors({})
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

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target

        if (!agencyLevel) return

        // Convert to appropriate types
        if (name === "discountPercentage" || name === "creditLimit" || name === "paymentTerm") {
            const numValue = value === "" ? 0 : Number(value)
            setAgencyLevel((prev) => (prev ? { ...prev, [name]: numValue } : null))
        } else {
            setAgencyLevel((prev) => (prev ? { ...prev, [name]: value } : null))
        }

        // Clear error for this field
        if (formErrors[name as keyof AgencyLevel]) {
            setFormErrors((prev) => ({ ...prev, [name]: undefined }))
        }
    }

    // Validate form
    const validateForm = (): boolean => {
        if (!agencyLevel) return false

        const errors: Partial<Record<keyof AgencyLevel, string>> = {}

        if (!agencyLevel.levelName.trim()) {
            errors.levelName = "Tên cấp độ không được để trống"
        }

        if (agencyLevel.discountPercentage < 0 || agencyLevel.discountPercentage > 100) {
            errors.discountPercentage = "Chiết khấu phải từ 0% đến 100%"
        }

        if (agencyLevel.creditLimit < 0) {
            errors.creditLimit = "Hạn mức tín dụng không được âm"
        }

        if (agencyLevel.paymentTerm < 0 || agencyLevel.paymentTerm > 365) {
            errors.paymentTerm = "Thời hạn thanh toán phải từ 0 đến 365 ngày"
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!agencyLevel || !levelId) return

        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)

        try {
            const token = getToken()
            if (!token) {
                throw new Error("Phiên đăng nhập hết hạn")
            }

            const response = await fetch(`https://minhlong.mlhr.org/api/AgencyLevel/${levelId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    levelName: agencyLevel.levelName,
                    discountPercentage: agencyLevel.discountPercentage,
                    creditLimit: agencyLevel.creditLimit,
                    paymentTerm: agencyLevel.paymentTerm,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || `Error: ${response.status}`)
            }

            // Success
            toast.success("Cập nhật cấp độ đại lý thành công")

            // Close dialog
            onOpenChange(false)

            // Notify parent component
            onAgencyLevelUpdated()
        } catch (error) {
            console.error("Failed to update agency level:", error)
            toast.error(error instanceof Error ? error.message : "Không thể cập nhật cấp độ đại lý")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Cập nhật cấp độ đại lý</DialogTitle>
                    <DialogDescription>Chỉnh sửa thông tin cấp độ đại lý. Nhấn Lưu khi hoàn tất.</DialogDescription>
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
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="levelName" className="text-left">
                                    Tên cấp độ
                                </Label>
                                <div className="col-span-2">
                                    <Input
                                        id="levelName"
                                        name="levelName"
                                        value={agencyLevel.levelName}
                                        onChange={handleInputChange}
                                        placeholder="Ví dụ: Đại lý Cấp 1 - Kim Cương"
                                        className={formErrors.levelName ? "border-red-300" : ""}
                                    />
                                    {formErrors.levelName && <p className="text-red-500 text-xs mt-1">{formErrors.levelName}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="discountPercentage" className="text-left">
                                    Chiết khấu (%)
                                </Label>
                                <div className="col-span-2">
                                    <Input
                                        id="discountPercentage"
                                        name="discountPercentage"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={agencyLevel.discountPercentage}
                                        onChange={handleInputChange}
                                        className={formErrors.discountPercentage ? "border-red-300" : ""}
                                    />
                                    {formErrors.discountPercentage && (
                                        <p className="text-red-500 text-xs mt-1">{formErrors.discountPercentage}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="creditLimit" className="text-left">
                                    Hạn mức tín dụng
                                </Label>
                                <div className="col-span-2">
                                    <Input
                                        id="creditLimit"
                                        name="creditLimit"
                                        type="number"
                                        min="0"
                                        value={agencyLevel.creditLimit}
                                        onChange={handleInputChange}
                                        className={formErrors.creditLimit ? "border-red-300" : ""}
                                    />
                                    {formErrors.creditLimit && <p className="text-red-500 text-xs mt-1">{formErrors.creditLimit}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="paymentTerm" className="text-left">
                                    Thời hạn thanh toán (ngày)
                                </Label>
                                <div className="col-span-2">
                                    <Input
                                        id="paymentTerm"
                                        name="paymentTerm"
                                        type="number"
                                        min="0"
                                        max="365"
                                        value={agencyLevel.paymentTerm}
                                        onChange={handleInputChange}
                                        className={formErrors.paymentTerm ? "border-red-300" : ""}
                                    />
                                    {formErrors.paymentTerm && <p className="text-red-500 text-xs mt-1">{formErrors.paymentTerm}</p>}
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                                Hủy
                            </Button>
                            <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Đang lưu...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" /> Lưu
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <p>Không tìm thấy thông tin cấp độ đại lý.</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
