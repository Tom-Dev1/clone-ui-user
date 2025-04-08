"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import type { Order } from "@/types/agency-orders"

interface PaymentDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    orderToPayment: Order | null
    paymentAmount: string
    onPaymentAmountChange: (value: string) => void
    paymentDescription: string
    onPaymentDescriptionChange: (value: string) => void
    onPaymentSubmit: () => void
    actionLoading: boolean
    errorMessage?: string | null // Add this prop
}

export const PaymentDialog = ({
    isOpen,
    onOpenChange,
    orderToPayment,
    paymentAmount,
    onPaymentAmountChange,
    paymentDescription,
    onPaymentDescriptionChange,
    onPaymentSubmit,
    actionLoading,
    errorMessage, // Add this prop
}: PaymentDialogProps) => {
    const [validationError, setErrorMessage] = useState<string | null>(null)
    const [formattedAmount, setFormattedAmount] = useState<string>("")

    // Format the payment amount when it changes
    useEffect(() => {
        if (!paymentAmount) {
            setFormattedAmount("")
            return
        }

        // Parse the payment amount to a number
        const numericValue = Number.parseFloat(paymentAmount)
        if (!isNaN(numericValue)) {
            // Format with commas for thousands
            setFormattedAmount(numericValue.toLocaleString("vi-VN"))
        }
    }, [paymentAmount])

    // Handle input change with formatting
    const handleAmountChange = (value: string) => {
        // Remove all non-numeric characters except decimal point
        const numericValue = value.replace(/[^\d]/g, "")

        // Convert to number and pass to parent component
        onPaymentAmountChange(numericValue)
    }

    // Validate payment amount when it changes
    useEffect(() => {
        if (!orderToPayment) return

        const amount = Number(paymentAmount)

        // Clear error if amount is empty
        if (!paymentAmount) {
            setErrorMessage(null)
            return
        }

        // Calculate minimum acceptable payment (10% of order value)
        const minimumAcceptable = orderToPayment.finalPrice * 0.1

        // Check if payment is 0 or less than minimum acceptable (10%)
        if (amount <= 0 || amount < minimumAcceptable) {
            setErrorMessage(
                `Số tiền thanh toán không hợp lệ. Bạn cần thanh toán tối thiểu ${minimumAcceptable.toLocaleString("vi-VN")}đ (10% giá trị đơn hàng).`,
            )
            return
        }

        // Check if payment is more than order value
        if (amount > orderToPayment.finalPrice) {
            setErrorMessage(
                `Số tiền thanh toán không thể lớn hơn tổng giá trị đơn hàng (${orderToPayment.finalPrice.toLocaleString("vi-VN")}đ).`,
            )
            return
        }

        setErrorMessage(null)
    }, [paymentAmount, orderToPayment])

    if (!orderToPayment) return null

    // Add this before the return statement to display the error message
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Thanh toán đơn hàng</DialogTitle>
                    <DialogDescription>
                        Nhập số tiền bạn muốn thanh toán cho đơn hàng {orderToPayment?.orderCode}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* Display error message if it exists */}
                    {errorMessage && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            <AlertDescription>{errorMessage}</AlertDescription>
                        </Alert>
                    )}

                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="amount" className="text-right">
                            Số tiền
                        </label>
                        <Input
                            id="amount"
                            type="text"
                            value={formattedAmount}
                            onChange={(e) => handleAmountChange(e.target.value)}
                            placeholder="Nhập số tiền"
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="description" className="text-right">
                            Mô tả
                        </label>
                        <Input
                            id="description"
                            value={paymentDescription}
                            onChange={(e) => onPaymentDescriptionChange(e.target.value)}
                            placeholder="Mô tả thanh toán"
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <span className="text-right">Tổng tiền</span>
                        <span className="col-span-3 font-medium">{orderToPayment?.finalPrice.toLocaleString("vi-VN")} đ</span>
                    </div>

                    {/* Keep existing validation error display */}
                    {validationError && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            <AlertDescription>{validationError}</AlertDescription>
                        </Alert>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Hủy
                    </Button>
                    <Button onClick={onPaymentSubmit} disabled={actionLoading || !!validationError || !paymentAmount}>
                        {actionLoading ? "Đang xử lý..." : "Thanh toán"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
