"use client"

import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../components/ui/dialog"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { formatCurrency } from "../../utils/format-utils"
import type { PaymentHistory } from "../../types/payment-history"

interface PaymentDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    selectedPayment: PaymentHistory | null
    paymentAmount: string
    onPaymentAmountChange: (value: string) => void
    onPaymentSubmit: () => void
    isLoading: boolean
}

export const PaymentDialog = ({
    isOpen,
    onOpenChange,
    selectedPayment,
    paymentAmount,
    onPaymentAmountChange,
    onPaymentSubmit,
    isLoading,
}: PaymentDialogProps) => {
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
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
        if (!selectedPayment) return

        const amount = Number(paymentAmount)

        // Clear error if amount is empty
        if (!paymentAmount) {
            setErrorMessage(null)
            return
        }

        // Calculate minimum acceptable payment (10% of remaining debt)
        const minimumAcceptable = 10000

        // Check if payment is 0 or less than minimum acceptable (10%)
        if (amount <= 0 || amount < minimumAcceptable) {
            setErrorMessage(
                `Số tiền thanh toán không hợp lệ. Bạn cần thanh toán tối thiểu ${minimumAcceptable.toLocaleString("vi-VN")}đ.`,
            )
            return
        }

        // Check if payment is more than remaining debt
        if (amount > selectedPayment.remainingDebtAmount) {
            setErrorMessage(
                `Số tiền thanh toán không thể lớn hơn số tiền còn nợ (${formatCurrency(selectedPayment.remainingDebtAmount)}).`,
            )
            return
        }

        setErrorMessage(null)
    }, [paymentAmount, selectedPayment])

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Thanh toán đơn hàng</DialogTitle>
                    <DialogDescription>
                        Nhập số tiền bạn muốn thanh toán cho đơn hàng {selectedPayment?.orderCode}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {errorMessage && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            <AlertDescription>{errorMessage}</AlertDescription>
                        </Alert>
                    )}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="amount" className="text-left">
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
                    {selectedPayment && (
                        <>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <span className="text-right">Còn nợ</span>
                                <span className="col-span-3 font-medium">{formatCurrency(selectedPayment.remainingDebtAmount)}</span>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <span className="text-right">Tổng tiền</span>
                                <span className="col-span-3 font-medium">{formatCurrency(selectedPayment.totalAmountPayment)}</span>
                            </div>
                        </>
                    )}


                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Hủy
                    </Button>
                    <Button onClick={onPaymentSubmit} disabled={isLoading || !!errorMessage || !paymentAmount}>
                        {isLoading ? "Đang xử lý..." : "Thanh toán"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

