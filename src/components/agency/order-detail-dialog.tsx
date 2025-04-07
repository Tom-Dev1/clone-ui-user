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
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Chi tiết đơn hàng</DialogTitle>
                    <DialogDescription>Mã đơn hàng: {selectedOrder.orderCode}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Ngày đặt hàng</p>
                            <p>{formatDate(selectedOrder.orderDate)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Trạng thái</p>
                            <div className="mt-1">
                                <OrderStatusBadge status={selectedOrder.status} />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Đại lý</p>
                            <p>{selectedOrder.agencyName}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Người duyệt đơn</p>
                            <p>{selectedOrder.salesName}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Mã yêu cầu</p>
                            <p>{selectedOrder.requestCode}</p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-lg font-medium">Chi tiết sản phẩm</h3>
                        {selectedOrder.orderDetails.length === 0 ? (
                            <p className="text-gray-500 mt-2">Không có thông tin chi tiết sản phẩm</p>
                        ) : (
                            <div className="bg-white rounded-lg border overflow-hidden">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Sản phẩm</TableHead>
                                                <TableHead>Đơn vị</TableHead>
                                                <TableHead className="text-right">Số lượng</TableHead>
                                                <TableHead className="text-right">Đơn giá</TableHead>
                                                <TableHead className="text-right">Thành tiền</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedOrder.orderDetails.map((detail) => (
                                                <TableRow key={detail.orderDetailId}>
                                                    <TableCell>
                                                        {detail.productName !== "N/A" ? detail.productName : `Sản phẩm #${detail.productId}`}
                                                    </TableCell>
                                                    <TableCell>{detail.unit}</TableCell>
                                                    <TableCell className="text-right">{detail.quantity}</TableCell>
                                                    <TableCell className="text-right">{detail.unitPrice.toLocaleString("vi-VN")} đ</TableCell>
                                                    <TableCell className="text-right">{detail.totalAmount.toLocaleString("vi-VN")} đ</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Giảm giá</p>
                            <p>{selectedOrder.discount.toLocaleString("vi-VN")} đ</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Tổng tiền</p>
                            <p className="text-xl font-bold">{selectedOrder.finalPrice.toLocaleString("vi-VN")} đ</p>
                        </div>
                    </div>

                    {selectedOrder.status === "WaitPaid" && (
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button
                                variant="default"
                                onClick={() => {
                                    onOpenChange(false)
                                    onPayment(selectedOrder)
                                }}
                                disabled={actionLoading}
                            >
                                Thanh toán
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    onOpenChange(false)
                                    onCancel(selectedOrder.orderId)
                                }}
                                disabled={actionLoading}
                            >
                                Hủy đơn hàng
                            </Button>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Đóng</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

