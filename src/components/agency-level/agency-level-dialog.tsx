"use client"

import type React from "react"
import { useState } from "react"
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
    DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, Plus, Save } from "lucide-react"
import { toast } from "sonner"
import { getToken } from "@/utils/auth-utils"

interface NewAgencyLevel {
    levelName: string
    discountPercentage: number
    creditLimit: number
    paymentTerm: number
}

interface AgencyLevelDialogProps {
    onAgencyLevelAdded: () => void
}

export function AgencyLevelDialog({ onAgencyLevelAdded }: AgencyLevelDialogProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formErrors, setFormErrors] = useState<Partial<Record<keyof NewAgencyLevel, string>>>({})

    // New agency level form state
    const [newAgencyLevel, setNewAgencyLevel] = useState<NewAgencyLevel>({
        levelName: "",
        discountPercentage: 0,
        creditLimit: 0,
        paymentTerm: 30,
    })

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target

        // Convert to appropriate types
        if (name === "discountPercentage" || name === "creditLimit" || name === "paymentTerm") {
            const numValue = value === "" ? 0 : Number(value)
            setNewAgencyLevel((prev) => ({ ...prev, [name]: numValue }))
        } else {
            setNewAgencyLevel((prev) => ({ ...prev, [name]: value }))
        }

        // Clear error for this field
        if (formErrors[name as keyof NewAgencyLevel]) {
            setFormErrors((prev) => ({ ...prev, [name]: undefined }))
        }
    }

    // Validate form
    const validateForm = (): boolean => {
        const errors: Partial<Record<keyof NewAgencyLevel, string>> = {}

        if (!newAgencyLevel.levelName.trim()) {
            errors.levelName = "Tên cấp độ không được để trống"
        }

        if (newAgencyLevel.discountPercentage < 0 || newAgencyLevel.discountPercentage > 100) {
            errors.discountPercentage = "Chiết khấu phải từ 0% đến 100%"
        }

        if (newAgencyLevel.creditLimit < 0) {
            errors.creditLimit = "Hạn mức tín dụng không được âm"
        }

        if (newAgencyLevel.paymentTerm < 0 || newAgencyLevel.paymentTerm > 365) {
            errors.paymentTerm = "Thời hạn thanh toán phải từ 0 đến 365 ngày"
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)

        try {
            const token = getToken()
            if (!token) {
                throw new Error("Phiên đăng nhập hết hạn")
            }

            const response = await fetch("https://minhlong.mlhr.org/api/AgencyLevel", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newAgencyLevel),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || `Error: ${response.status}`)
            }

            // Success
            toast.success("Thêm cấp độ đại lý thành công")

            // Reset form
            setNewAgencyLevel({
                levelName: "",
                discountPercentage: 0,
                creditLimit: 0,
                paymentTerm: 30,
            })

            // Close dialog
            setIsDialogOpen(false)

            // Notify parent component
            onAgencyLevelAdded()
        } catch (error) {
            console.error("Failed to add agency level:", error)
            toast.error(error instanceof Error ? error.message : "Không thể thêm cấp độ đại lý")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" /> Thêm cấp độ
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Thêm cấp độ đại lý mới</DialogTitle>
                    <DialogDescription>Điền thông tin để tạo cấp độ đại lý mới. Nhấn Lưu khi hoàn tất.</DialogDescription>
                </DialogHeader>

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
                                    value={newAgencyLevel.levelName}
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
                                    value={newAgencyLevel.discountPercentage}
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
                                    value={newAgencyLevel.creditLimit}
                                    onChange={handleInputChange}
                                    className={formErrors.creditLimit ? "border-red-300" : ""}
                                />
                                {formErrors.creditLimit && <p className="text-red-500 text-xs mt-1">{formErrors.creditLimit}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="paymentTerm" className="text-right ">
                                Thời hạn thanh toán (ngày)
                            </Label>
                            <div className="col-span-2">
                                <Input
                                    id="paymentTerm"
                                    name="paymentTerm"
                                    type="number"
                                    min="0"
                                    max="365"
                                    value={newAgencyLevel.paymentTerm}
                                    onChange={handleInputChange}
                                    className={formErrors.paymentTerm ? "border-red-300" : ""}
                                />
                                {formErrors.paymentTerm && <p className="text-red-500 text-xs mt-1">{formErrors.paymentTerm}</p>}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
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
            </DialogContent>
        </Dialog>
    )
}
