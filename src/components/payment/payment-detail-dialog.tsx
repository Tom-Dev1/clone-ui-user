"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { PaymentStatusBadge } from "./payment-status-badge"
import { formatCurrency } from "@/utils/format-utils"
import type { PaymentHistory } from "@/types/payment-history"
import { Receipt, Calendar, CreditCard, User, Hash, Banknote, ArrowRight, Clock } from "lucide-react"
import { DebtStatusBadge } from "./debt-status-badge"
import { useState } from "react"
import { PaymentDialog } from "./payment-dialog"

interface PaymentDetailDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    selectedPayment: PaymentHistory | null
    onPaymentSubmit: () => void
    isLoading: boolean
}

export function PaymentDetailDialog({
    isOpen,
    onOpenChange,
    selectedPayment: payment,
    onPaymentSubmit,
    isLoading,
}: PaymentDetailDialogProps) {
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
    const [paymentAmount, setPaymentAmount] = useState<string>("")

    if (!payment) return null

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi })
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            return dateString
        }
    }

    // Handle opening payment dialog
    const handleOpenPaymentDialog = () => {
        setIsPaymentDialogOpen(true)
        onOpenChange(false) // Close the detail dialog
    }

    // Handle payment dialog close
    const handlePaymentDialogClose = (open: boolean) => {
        setIsPaymentDialogOpen(open)
        if (!open) {
            // Reopen the detail dialog when payment dialog is closed
            onOpenChange(true)
        }
    }

    // Handle payment submission from payment dialog
    const handlePaymentSubmit = () => {
        onPaymentSubmit()
        setIsPaymentDialogOpen(false)
    }

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl flex items-center">
                            <Receipt className="mr-2 h-5 w-5 text-green-600" />
                            Chi tiết thanh toán
                        </DialogTitle>
                        <DialogDescription>Mã đơn hàng: {payment.orderCode}</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Payment Status */}
                        <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Trạng thái thanh toán</p>
                                <div className="mt-1">
                                    <PaymentStatusBadge status={payment.status} />
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-500">Số serie</p>
                                <p className="font-medium">{payment.serieNumber}</p>
                            </div>
                        </div>

                        {/* Payment Details */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-start">
                                    <Calendar className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Ngày thanh toán</p>
                                        <p className="font-medium">{formatDate(payment.paymentDate)}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <CreditCard className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Phương thức thanh toán</p>
                                        <p className="font-medium">{payment.paymentMethod}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <User className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Đại lý</p>
                                        <p className="font-medium">{payment.agencyName}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <Hash className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Mã đơn hàng</p>
                                        <p className="font-medium">{payment.orderCode}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <Clock className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Hạn thanh toán</p>
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium">{formatDate(payment.dueDate)}</p>
                                            <DebtStatusBadge status={payment.debtStatus} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-4 mt-4">
                                <h3 className="font-medium mb-3">Thông tin thanh toán</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center">
                                            <Banknote className="h-5 w-5 text-gray-500 mr-2" />
                                            <span>Tổng giá trị đơn hàng</span>
                                        </div>
                                        <span className="font-medium">{formatCurrency(payment.totalAmountPayment)}</span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center">
                                            <Banknote className="h-5 w-5 text-green-600 mr-2" />
                                            <span>Đã thanh toán</span>
                                        </div>
                                        <span className="font-medium text-green-600">{formatCurrency(payment.paymentAmount)}</span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center">
                                            <Banknote className="h-5 w-5 text-red-500 mr-2" />
                                            <span>Còn nợ</span>
                                        </div>
                                        <span className="font-medium text-red-500">{formatCurrency(payment.remainingDebtAmount)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Progress */}
                            <div className="mt-4">
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Tiến độ thanh toán</span>
                                    <span>
                                        {Math.round(
                                            ((payment.totalAmountPayment - payment.remainingDebtAmount) / payment.totalAmountPayment) * 100,
                                        )}
                                        %
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-green-600 h-2.5 rounded-full"
                                        style={{
                                            width: `${Math.round(
                                                ((payment.totalAmountPayment - payment.remainingDebtAmount) / payment.totalAmountPayment) * 100,
                                            )}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>

                            {/* Created/Updated Info */}
                            <div className="border-t pt-4 mt-4 text-sm text-gray-500">
                                <div className="flex justify-between">
                                    <span>Ngày tạo:</span>
                                    <span>{formatDate(payment.createdAt)}</span>
                                </div>
                                {payment.updatedAt && (
                                    <div className="flex justify-between mt-1">
                                        <span>Cập nhật lần cuối:</span>
                                        <span>{formatDate(payment.updatedAt)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        {payment.status === "PARTIALLY_PAID" && (
                            <Button className="mr-auto bg-green-600 hover:bg-green-700" onClick={handleOpenPaymentDialog}>
                                <ArrowRight className="mr-2 h-4 w-4" />
                                Tiếp tục thanh toán
                            </Button>
                        )}
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Đóng
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Payment Dialog */}
            <PaymentDialog
                isOpen={isPaymentDialogOpen}
                onOpenChange={handlePaymentDialogClose}
                selectedPayment={payment}
                paymentAmount={paymentAmount}
                onPaymentAmountChange={setPaymentAmount}
                onPaymentSubmit={handlePaymentSubmit}
                isLoading={isLoading}
            />
        </>
    )
}
