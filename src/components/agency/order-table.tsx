"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { OrderStatusBadge } from "./order-status-badge"
import type { Order, SortDirection } from "@/types/agency-orders"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, CreditCard, X } from "lucide-react"

interface OrderTableProps {
    orders: Order[]
    sortField: string
    sortDirection: SortDirection
    onSortChange: (field: string) => void
    onViewDetails: (order: Order) => void
    onPayment: (order: Order) => void
    onCancel: (orderId: string) => void
    actionLoading: boolean
    formatDate: (dateString: string) => string
}

export const OrderTable = ({
    orders,
    sortField,
    sortDirection,
    onSortChange,
    onViewDetails,
    onPayment,
    onCancel,

    formatDate,
}: OrderTableProps) => {
    // Render sort icon
    const renderSortIcon = (field: string) => {
        if (field !== sortField) {
            return <ArrowUpDown className="ml-2 h-4 w-4" />
        }

        return sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="cursor-pointer" onClick={() => onSortChange("orderCode")}>
                            <div className="flex items-center">
                                Mã đơn hàng
                                {renderSortIcon("orderCode")}
                            </div>
                        </TableHead>
                        <TableHead>Đại lý</TableHead>
                        <TableHead>Người duyệt</TableHead>
                        <TableHead className="cursor-pointer" onClick={() => onSortChange("orderDate")}>
                            <div className="flex items-center">
                                Ngày đặt
                                {renderSortIcon("orderDate")}
                            </div>
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => onSortChange("status")}>
                            <div className="flex items-center">
                                Trạng thái
                                {renderSortIcon("status")}
                            </div>
                        </TableHead>
                        <TableHead className="text-center cursor-pointer" onClick={() => onSortChange("finalPrice")}>
                            <div className="flex items-center justify-center">
                                Tổng tiền
                                {renderSortIcon("finalPrice")}
                            </div>
                        </TableHead>
                        <TableHead className="text-center">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                                Không tìm thấy đơn hàng nào
                            </TableCell>
                        </TableRow>
                    ) : (
                        orders.map((order) => (
                            <TableRow key={order.orderId}>
                                <TableCell className="font-medium">{order.orderCode}</TableCell>
                                <TableCell>{order.agencyName}</TableCell>
                                <TableCell>{order.salesName}</TableCell>
                                <TableCell>{formatDate(order.orderDate)}</TableCell>
                                <TableCell>
                                    <OrderStatusBadge status={order.status} />
                                </TableCell>
                                <TableCell className="text-center">{order.finalPrice.toLocaleString("vi-VN")} đ</TableCell>
                                <TableCell className="text-center">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Mở menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onViewDetails(order)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                <span>Xem chi tiết</span>
                                            </DropdownMenuItem>

                                            {order.status === "WaitPaid" && (
                                                <>
                                                    <DropdownMenuItem onClick={() => onPayment(order)}>
                                                        <CreditCard className="mr-2 h-4 w-4" />
                                                        <span>Thanh toán</span>
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        onClick={() => onCancel(order.orderId)}
                                                        className="text-red-600 focus:text-red-600"
                                                    >
                                                        <X className="mr-2 h-4 w-4" />
                                                        <span>Hủy đơn hàng</span>
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

