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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import type { ReturnRequest } from "@/types/return-order"
import { ReturnStatusBadge } from "./return-status-badge"

interface ReturnOrderDetailDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    returnOrder: ReturnRequest | null
}

export const ReturnOrderDetailDialog = ({ isOpen, onOpenChange, returnOrder }: ReturnOrderDetailDialogProps) => {
    if (!returnOrder) return null

    // Format date
    const formatDate = (dateString: string) => {
        return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi })
    }

    // Calculate total quantity
    const getTotalQuantity = () => {
        return returnOrder.details.reduce((sum, detail) => sum + detail.quantityReturned, 0)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Chi tiết đơn trả hàng</DialogTitle>
                    <DialogDescription>Mã đơn trả hàng: {returnOrder.returnRequestId}</DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Mã đơn hàng</p>
                                <p className="font-medium">{returnOrder.orderId}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Ngày tạo</p>
                                <p className="font-medium">{formatDate(returnOrder.createdAt)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Người tạo</p>
                                <p className="font-medium">{returnOrder.createdByUserName}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Trạng thái</p>
                                <ReturnStatusBadge status={returnOrder.status} />
                            </div>
                        </div>

                        {returnOrder.note && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Ghi chú</p>
                                <p className="mt-1 p-3 bg-muted rounded-md">{returnOrder.note}</p>
                            </div>
                        )}

                        <div>
                            <h3 className="text-lg font-medium mb-2">Chi tiết sản phẩm trả</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Sản phẩm</TableHead>
                                        <TableHead>Lý do trả</TableHead>
                                        <TableHead className="text-right">Số lượng</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {returnOrder.details.map((detail) => (
                                        <TableRow key={detail.returnRequestDetailId}>
                                            <TableCell className="font-medium">{detail.productName}</TableCell>
                                            <TableCell>{detail.reason}</TableCell>
                                            <TableCell className="text-right">{detail.quantityReturned}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-right font-medium">
                                            Tổng số lượng:
                                        </TableCell>
                                        <TableCell className="text-right font-bold">{getTotalQuantity()}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </ScrollArea>

                <DialogFooter className="pt-4">
                    <Button onClick={() => onOpenChange(false)}>Đóng</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
