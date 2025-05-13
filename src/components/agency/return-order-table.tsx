
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, ChevronUp, Eye, MoreHorizontal } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import type { ReturnRequest, SortDirection } from "@/types/return-order"
import { ReturnStatusBadge } from "./return-status-badge"


interface ReturnOrderTableProps {
    returnOrders: ReturnRequest[]
    sortField: keyof ReturnRequest
    sortDirection: SortDirection
    onSortChange: (field: keyof ReturnRequest) => void
    onViewDetails: (order: ReturnRequest) => void
}

export const ReturnOrderTable = ({
    returnOrders,
    sortField,
    sortDirection,
    onSortChange,
    onViewDetails,
}: ReturnOrderTableProps) => {
    // Render sort icon
    const renderSortIcon = (field: keyof ReturnRequest) => {
        if (sortField !== field) return null
        return sortDirection === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
    }

    // Calculate total quantity for a return order
    const getTotalQuantity = (order: ReturnRequest) => {
        return order.details.reduce((sum, detail) => sum + detail.quantityReturned, 0)
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead >
                            <div className="flex items-center cursor-pointer" onClick={() => onSortChange("returnRequestId")}>
                                Mã đơn trả hàng
                                {renderSortIcon("returnRequestId")}
                            </div>
                        </TableHead>
                        <TableHead >
                            <div className="flex items-center cursor-pointer" onClick={() => onSortChange("orderId")}>
                                Mã đơn hàng
                                {renderSortIcon("orderId")}
                            </div>
                        </TableHead>
                        <TableHead >
                            <div className="flex items-center cursor-pointer" onClick={() => onSortChange("createdAt")}>
                                Ngày tạo
                                {renderSortIcon("createdAt")}
                            </div>
                        </TableHead>
                        <TableHead>
                            <div className="flex items-center cursor-pointer" onClick={() => onSortChange("createdByUserName")}>
                                Người tạo
                                {renderSortIcon("createdByUserName")}
                            </div>
                        </TableHead>
                        <TableHead >Số SP</TableHead>
                        <TableHead >Tổng SL</TableHead>
                        <TableHead>
                            <div className="flex items-center cursor-pointer" onClick={() => onSortChange("status")}>
                                Trạng thái
                                {renderSortIcon("status")}
                            </div>
                        </TableHead>
                        <TableHead >Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {returnOrders.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                Không có dữ liệu đơn trả hàng
                            </TableCell>
                        </TableRow>
                    ) : (
                        returnOrders.map((order) => (
                            <TableRow key={order.returnRequestId} className="hover:bg-muted/30">
                                <TableCell className="font-medium">{order.returnRequestCode}</TableCell>
                                <TableCell>{order.orderCode}</TableCell>
                                <TableCell>{format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}</TableCell>
                                <TableCell>{order.createdByUserName}</TableCell>
                                <TableCell className="text-center">{order.details.length}</TableCell>
                                <TableCell className="text-center">{getTotalQuantity(order)}</TableCell>
                                <TableCell>
                                    <ReturnStatusBadge status={order.status} />
                                </TableCell>
                                <TableCell >
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Mở menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onViewDetails(order)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                <span>Xem chi tiết</span>
                                            </DropdownMenuItem>
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
