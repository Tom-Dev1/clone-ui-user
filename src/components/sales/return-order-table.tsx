"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, CheckCircle, ArrowUpDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { ReturnRequest } from "@/types/return-order"
import ReturnStatusBadge from "./return-status-badge"
import { formatDate } from "@/utils/date-utils"

interface ReturnOrderTableProps {
    returnOrders: ReturnRequest[]
    onViewDetails: (order: ReturnRequest) => void
    onStatusUpdate: (returnRequestId: string, newStatus: string) => void
    onApproveReturn: (returnRequestId: string) => void
    sortField: string
    sortDirection: "asc" | "desc"
    onSortChange: (field: string) => void
    getStatusInVietnamese: (status: string) => string
}

export default function ReturnOrderTable({
    returnOrders,
    onViewDetails,
    onApproveReturn,
    sortField,
    sortDirection,
    onSortChange,
    getStatusInVietnamese,
}: ReturnOrderTableProps) {
    // Get sort icon
    const getSortIcon = (field: string) => {
        if (field !== sortField) return <ArrowUpDown className="ml-2 h-4 w-4" />
        return sortDirection === "asc" ? (
            <ArrowUpDown className="ml-2 h-4 w-4 text-primary" />
        ) : (
            <ArrowUpDown className="ml-2 h-4 w-4 text-primary rotate-180" />
        )
    }

    // Get total quantity for an order
    const getTotalQuantity = (order: ReturnRequest) => {
        return order.details.reduce((total, detail) => total + detail.quantityReturned, 0)
    }

    // Get product names as a comma-separated string
    const getProductNames = (order: ReturnRequest) => {
        return order.details.map((detail) => detail.productName).join(", ")
    }

    if (returnOrders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md bg-muted/10">
                <p className="text-muted-foreground">Không tìm thấy đơn trả hàng nào</p>
            </div>
        )
    }

    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[180px]">
                            <Button variant="ghost" className="p-0 font-medium" onClick={() => onSortChange("orderCode")}>
                                Mã đơn hàng {sortField === "orderCode" && getSortIcon("orderCode")}
                            </Button>
                        </TableHead>
                        <TableHead>Sản phẩm</TableHead>
                        <TableHead className="text-center">Số lượng</TableHead>
                        <TableHead>
                            <Button variant="ghost" className="p-0 font-medium" onClick={() => onSortChange("createdByUserName")}>
                                Đại lý {sortField === "createdByUserName" && getSortIcon("createdByUserName")}
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button variant="ghost" className="p-0 font-medium" onClick={() => onSortChange("createdAt")}>
                                Ngày tạo {sortField === "createdAt" && getSortIcon("createdAt")}
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button variant="ghost" className="p-0 font-medium" onClick={() => onSortChange("status")}>
                                Trạng thái {sortField === "status" && getSortIcon("status")}
                            </Button>
                        </TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {returnOrders.map((order) => (
                        <TableRow key={order.returnRequestId}>
                            <TableCell className="font-medium">{order.orderCode}</TableCell>
                            <TableCell>{getProductNames(order)}</TableCell>
                            <TableCell className="text-center">{getTotalQuantity(order)}</TableCell>
                            <TableCell>{order.createdByUserName}</TableCell>
                            <TableCell>{formatDate(order.createdAt)}</TableCell>
                            <TableCell>
                                <ReturnStatusBadge status={order.status} getStatusInVietnamese={getStatusInVietnamese} />
                            </TableCell>
                            <TableCell className="text-right">

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
                                            Xem chi tiết
                                        </DropdownMenuItem>
                                        {/* {order.status === "Pending" && (
                                                <DropdownMenuItem onClick={() => onStatusUpdate(order.returnRequestId, "Rejected")}>
                                                    <XCircle className="mr-2 h-4 w-4" />
                                                    Từ chối
                                                </DropdownMenuItem>
                                            )}
                                            {order.status === "Approved" && (
                                                <DropdownMenuItem onClick={() => onStatusUpdate(order.returnRequestId, "Completed")}>
                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                    Hoàn thành
                                                </DropdownMenuItem>
                                            )} */}
                                        {order.status === "Pending" && (
                                            <DropdownMenuItem


                                                className="w-full h-8 px-2 text-green-600"
                                                onClick={() => onApproveReturn(order.returnRequestId)}
                                            >
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                Chấp nhận
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>

                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
