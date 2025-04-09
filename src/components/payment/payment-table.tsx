"use client"

import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { ChevronDown, ChevronUp, ArrowUpDown, MoreHorizontal, CreditCard, Eye } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Button } from "../../components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { PaymentStatusBadge } from "./payment-status-badge"
import { formatCurrency } from "../../utils/format-utils"
import type { PaymentHistory } from "../../types/payment-history"
import { DebtStatusBadge } from "./debt-status-badge"

interface PaymentTableProps {
    payments: PaymentHistory[]
    sortField: keyof PaymentHistory
    sortDirection: "asc" | "desc"
    onSortChange: (field: keyof PaymentHistory) => void
    onPaymentClick: (payment: PaymentHistory) => void
    onViewDetail: (payment: PaymentHistory) => void
}

export const PaymentTable = ({
    payments,
    sortField,
    sortDirection,
    onSortChange,
    onPaymentClick,
    onViewDetail,
}: PaymentTableProps) => {
    // Render sort indicator
    const renderSortIndicator = (field: keyof PaymentHistory) => {
        if (sortField !== field) {
            return <ArrowUpDown className="ml-1 h-4 w-4" />
        }
        return sortDirection === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="cursor-pointer truncate" onClick={() => onSortChange("orderCode")}>
                        <div className="flex items-center">
                            Mã đơn hàng
                            {renderSortIndicator("orderCode")}
                        </div>
                    </TableHead>
                    <TableHead className="cursor-pointer truncate" onClick={() => onSortChange("agencyName")}>
                        <div className="flex items-center">
                            Đại lý
                            {renderSortIndicator("agencyName")}
                        </div>
                    </TableHead>
                    <TableHead className="cursor-pointer truncate" onClick={() => onSortChange("paymentDate")}>
                        <div className="flex items-center">
                            Ngày thanh toán
                            {renderSortIndicator("paymentDate")}
                        </div>
                    </TableHead>
                    <TableHead className="cursor-pointer truncate " onClick={() => onSortChange("serieNumber")}>
                        <div className="flex items-center justify-center">
                            Số series
                            {renderSortIndicator("serieNumber")}
                        </div>
                    </TableHead>
                    <TableHead className="cursor-pointer truncate" onClick={() => onSortChange("status")}>
                        <div className="flex items-center">
                            Trạng thái
                            {renderSortIndicator("status")}
                        </div>
                    </TableHead>
                    <TableHead className="cursor-pointer text-right truncate" onClick={() => onSortChange("totalAmountPayment")}>
                        <div className="flex items-center justify-end">
                            Tổng tiền
                            {renderSortIndicator("totalAmountPayment")}
                        </div>
                    </TableHead>
                    <TableHead className="cursor-pointer text-right truncate" onClick={() => onSortChange("paymentAmount")}>
                        <div className="flex items-center justify-end">
                            Đã thanh toán
                            {renderSortIndicator("paymentAmount")}
                        </div>
                    </TableHead>
                    <TableHead className="cursor-pointer text-right truncate" onClick={() => onSortChange("remainingDebtAmount")}>
                        <div className="flex items-center justify-end">
                            Còn nợ
                            {renderSortIndicator("remainingDebtAmount")}
                        </div>
                    </TableHead>
                    <TableHead className="cursor-pointer text-right truncate" onClick={() => onSortChange("remainingDebtAmount")}>
                        <div className="flex items-center justify-end">
                            Hạn thanh toán
                            {renderSortIndicator("dueDate")}
                        </div>
                    </TableHead>
                    <TableHead className="cursor-pointer text-right truncate" onClick={() => onSortChange("remainingDebtAmount")}>
                        <div className="flex items-center justify-end">
                            Trạng thái nợ
                            {renderSortIndicator("debtStatus")}
                        </div>
                    </TableHead>
                    <TableHead className="truncate">Thao tác</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {payments.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={11} className="text-center py-8">
                            Không có dữ liệu thanh toán
                        </TableCell>
                    </TableRow>
                ) : (
                    payments.map((payment) => (
                        <TableRow key={payment.paymentHistoryId}>
                            <TableCell className="">{payment.orderCode}</TableCell>
                            <TableCell className="">{payment.agencyName}</TableCell>
                            <TableCell className="text-center">
                                {format(new Date(payment.paymentDate), "dd/MM/yyyy", {
                                    locale: vi,
                                })}
                            </TableCell>
                            <TableCell>{payment.serieNumber}</TableCell>
                            <TableCell>
                                <PaymentStatusBadge status={payment.status} />
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(payment.totalAmountPayment)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(payment.paymentAmount)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(payment.remainingDebtAmount)}</TableCell>
                            <TableCell className="text-right">
                                {format(new Date(payment.dueDate), "dd/MM/yyyy", {
                                    locale: vi,
                                })}
                            </TableCell>
                            <TableCell className="text-right">
                                <DebtStatusBadge status={payment.debtStatus} />
                            </TableCell>
                            <TableCell className="text-center">

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Mở menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onViewDetail(payment)}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            <span>Xem chi tiết</span>
                                        </DropdownMenuItem>
                                        {payment.status === "PARTIALLY_PAID" && (
                                            <DropdownMenuItem onClick={() => onPaymentClick(payment)}>
                                                <CreditCard className="mr-2 h-4 w-4" />
                                                <span>Thanh toán</span>
                                            </DropdownMenuItem>
                                        )}

                                    </DropdownMenuContent>
                                </DropdownMenu>


                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    )
}
