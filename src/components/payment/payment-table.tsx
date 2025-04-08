
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { ChevronDown, ChevronUp, ArrowUpDown, MoreHorizontal, CreditCard } from "lucide-react"
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

interface PaymentTableProps {
    payments: PaymentHistory[]
    sortField: keyof PaymentHistory
    sortDirection: "asc" | "desc"
    onSortChange: (field: keyof PaymentHistory) => void
    onPaymentClick: (payment: PaymentHistory) => void
}

export const PaymentTable = ({
    payments,
    sortField,
    sortDirection,
    onSortChange,
    onPaymentClick,
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
                    <TableHead className="cursor-pointer" onClick={() => onSortChange("orderCode")}>
                        <div className="flex items-center">
                            Mã đơn hàng
                            {renderSortIndicator("orderCode")}
                        </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => onSortChange("agencyName")}>
                        <div className="flex items-center">
                            Đại lý
                            {renderSortIndicator("agencyName")}
                        </div>
                    </TableHead>
                    <TableHead className="cursor-pointer w-[120px] text-center" onClick={() => onSortChange("paymentMethod")}>
                        <div className="flex items-center">
                            Hạn thanh toán
                            {renderSortIndicator("debtStatus")}
                        </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => onSortChange("paymentDate")}>
                        <div className="flex items-center">
                            Ngày đến hạn
                            {renderSortIndicator("dueDate")}
                        </div>
                    </TableHead>
                    <TableHead className="cursor-pointer " onClick={() => onSortChange("serieNumber")}>
                        <div className="flex items-center justify-center">
                            Số serie
                            {renderSortIndicator("serieNumber")}
                        </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => onSortChange("status")}>
                        <div className="flex items-center">
                            Trạng thái
                            {renderSortIndicator("status")}
                        </div>
                    </TableHead>
                    <TableHead className="cursor-pointer text-right" onClick={() => onSortChange("totalAmountPayment")}>
                        <div className="flex items-center justify-end">
                            Tổng tiền
                            {renderSortIndicator("totalAmountPayment")}
                        </div>
                    </TableHead>
                    <TableHead className="cursor-pointer text-right" onClick={() => onSortChange("paymentAmount")}>
                        <div className="flex items-center justify-end">
                            Đã thanh toán
                            {renderSortIndicator("paymentAmount")}
                        </div>
                    </TableHead>
                    <TableHead className="cursor-pointer text-right" onClick={() => onSortChange("remainingDebtAmount")}>
                        <div className="flex items-center justify-end">
                            Còn nợ
                            {renderSortIndicator("remainingDebtAmount")}
                        </div>
                    </TableHead>
                    <TableHead className="w-[100px] text-center">Thao tác</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {payments.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={10} className="text-center py-8">
                            Không có dữ liệu thanh toán
                        </TableCell>
                    </TableRow>
                ) : (
                    payments.map((payment) => (
                        <TableRow key={payment.paymentHistoryId}>
                            <TableCell>{payment.orderCode}</TableCell>
                            <TableCell>{payment.agencyName}</TableCell>
                            <TableCell className=" w-[120px] text-center">{payment.debtStatus}</TableCell>
                            <TableCell>
                                {format(new Date(payment.dueDate), "dd/MM/yyyy", {
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
                            <TableCell className="w-[100px] text-center">
                                {payment.status === "PARTIALLY_PAID" && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Mở menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onPaymentClick(payment)}>
                                                <CreditCard className="mr-2 h-4 w-4" />
                                                <span>Thanh toán</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    )
}

