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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import type { Order } from "@/types/agency-orders"
import { OrderStatusBadge } from "./order-status-badge"

interface OrderDetailDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    selectedOrder: Order | null
    onPayment: (order: Order) => void
    onCancel: (orderId: string) => void
    actionLoading: boolean
    formatDate: (dateString: string) => string
}

export const OrderDetailDialog = ({
    isOpen,
    onOpenChange,
    selectedOrder,
    onPayment,
    onCancel,
    actionLoading,
    formatDate,
}: OrderDetailDialogProps) => {
    if (!selectedOrder) return null

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[650px] max-h-[90vh] p-0 overflow-hidden">
                <DialogHeader className="px-6 pt-6 pb-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-xl">Chi tiết đơn hàng</DialogTitle>
                            <DialogDescription className="mt-1">
                                Mã đơn hàng: <span className="font-medium">{selectedOrder.orderCode}</span>
                            </DialogDescription>
                        </div>
                        <OrderStatusBadge status={selectedOrder.status} />
                    </div>
                </DialogHeader>

                <ScrollArea className="px-6 py-4 max-h-[calc(90vh-180px)]">
                    <div className="space-y-6">
                        <Card>
                            <CardContent className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Ngày đặt hàng</p>
                                        <p className="font-medium">{formatDate(selectedOrder.orderDate)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Đại lý</p>
                                        <p className="font-medium">{selectedOrder.agencyName}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div>
                            <h3 className="text-lg font-medium mb-3 flex items-center">
                                Chi tiết sản phẩm
                                {selectedOrder.orderDetails.length > 0 && (
                                    <Badge variant="outline" className="ml-2">
                                        {selectedOrder.orderDetails.length} sản phẩm
                                    </Badge>
                                )}
                            </h3>

                            {selectedOrder.orderDetails.length === 0 ? (
                                <Card>
                                    <CardContent className="p-6 text-center">
                                        <p className="text-muted-foreground">Không có thông tin chi tiết sản phẩm</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="rounded-lg border overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Sản phẩm</TableHead>
                                                    <TableHead>Đơn vị</TableHead>
                                                    <TableHead className="text-right">Số lượng</TableHead>
                                                    <TableHead className="text-right">Đơn giá</TableHead>
                                                    <TableHead className="text-right">Tạm tính</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {selectedOrder.orderDetails.map((detail) => (
                                                    <TableRow key={detail.orderDetailId}>
                                                        <TableCell className="font-medium">
                                                            {detail.productName !== "N/A" ? detail.productName : `Sản phẩm #${detail.productId}`}
                                                        </TableCell>
                                                        <TableCell>{detail.unit}</TableCell>
                                                        <TableCell className="text-right">{detail.quantity}</TableCell>
                                                        <TableCell className="text-right">{detail.unitPrice.toLocaleString("vi-VN")} đ</TableCell>
                                                        <TableCell className="text-right font-medium">
                                                            {detail.totalAmount.toLocaleString("vi-VN")} đ
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex flex-col space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Tổng tiền hàng:</span>
                                        <span className="line-through text-gray-400">{selectedOrder.totalPrice ? selectedOrder.totalPrice.toLocaleString("vi-VN") + " đ" : "Đang cập nhật"}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Giảm giá:</span>
                                        <span>{selectedOrder.discount.toLocaleString("vi-VN")}%</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">Thành tiền:</span>
                                        <span className="text-xl font-bold">{selectedOrder.finalPrice.toLocaleString("vi-VN")} đ</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </ScrollArea>

                <DialogFooter className="px-6 py-4 border-t flex-col sm:flex-row gap-2 sm:justify-between">
                    {selectedOrder.status === "WaitPaid" && (
                        <div className="flex gap-2 w-full sm:w-auto order-2 sm:order-1">
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    onOpenChange(false)
                                    onCancel(selectedOrder.orderId)
                                }}
                                disabled={actionLoading}
                                className="flex-1 sm:flex-none"
                            >
                                Hủy đơn hàng
                            </Button>
                            <Button
                                variant="default"
                                onClick={() => {
                                    onOpenChange(false)
                                    onPayment(selectedOrder)
                                }}
                                disabled={actionLoading}
                                className="flex-1 sm:flex-none"
                            >
                                Thanh toán
                            </Button>
                        </div>
                    )}
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto order-1 sm:order-2">
                        Đóng
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
