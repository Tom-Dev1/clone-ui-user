"use client"

import { useState } from "react"
import type { ReturnRequest, ReturnRequestImage } from "@/types/return-order"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/utils/date-utils"
import ReturnStatusBadge from "./return-status-badge"
import { CheckCircle, Image as ImageIcon, X } from "lucide-react"
import { toast } from "sonner"

interface ReturnOrderDetailDialogProps {
    returnOrder: ReturnRequest
    open: boolean
    onOpenChange: (open: boolean) => void
    onStatusUpdate: (returnRequestId: string, newStatus: string) => void
    onApproveReturn: (returnRequestId: string) => void
    getStatusInVietnamese: (status: string) => string
}

export default function ReturnOrderDetailDialog({
    returnOrder,
    open,
    onOpenChange,
    onApproveReturn,
    getStatusInVietnamese,
}: ReturnOrderDetailDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedImage, setSelectedImage] = useState<ReturnRequestImage | null>(null)

    // Calculate total quantity
    const totalQuantity = returnOrder.details.reduce((total, detail) => total + detail.quantityReturned, 0)

    // Handle approve return
    const handleApproveReturn = async () => {
        setIsSubmitting(true)

        try {
            await onApproveReturn(returnOrder.returnRequestId)
            onOpenChange(false)

            toast.success(
                "Đơn trả hàng đã được chấp nhận thành công",
            )
        } catch (error) {
            console.log(error);

            toast.error(
                "Không thể chấp nhận đơn trả hàng. Vui lòng thử lại.",
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    // Handle dialog close
    const handleDialogClose = (open: boolean) => {
        if (selectedImage) {
            setSelectedImage(null)
        } else {
            onOpenChange(open)
        }
    }

    return (
        <>
            <Dialog open={open} onOpenChange={handleDialogClose}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span>Chi Tiết Đơn Trả Hàng</span>
                            <ReturnStatusBadge status={returnOrder.status} getStatusInVietnamese={getStatusInVietnamese} />
                        </DialogTitle>
                        <DialogDescription>
                            Đơn trả hàng được tạo vào ngày {formatDate(returnOrder.createdAt)} bởi {returnOrder.createdByUserName}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6">
                        {/* Order information */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Mã đơn hàng</h3>
                                <p className="text-sm">{returnOrder.returnRequestCode}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Mã đơn trả hàng</h3>
                                <p className="text-sm">{returnOrder.returnRequestId}</p>
                            </div>
                        </div>

                        {/* Return details */}
                        <div>
                            <h3 className="text-sm font-medium mb-2">Sản phẩm</h3>
                            <div className="border rounded-md">
                                <table className="w-full">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="text-left p-2 text-sm font-medium">Sản phẩm</th>
                                            <th className="text-left p-2 text-sm font-medium">Số lượng</th>
                                            <th className="text-left p-2 text-sm font-medium">Lý do</th>
                                            <th className="text-left p-2 text-sm font-medium">Hình ảnh</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {returnOrder.details.map((detail) => (
                                            <tr key={detail.returnRequestDetailId} className="border-t">
                                                <td className="p-2 text-sm">{detail.productName}</td>
                                                <td className="p-2 text-sm">{detail.quantityReturned}</td>
                                                <td className="p-2 text-sm">{detail.reason}</td>
                                                <td className="p-2 text-sm">
                                                    {detail.images && detail.images.length > 0 ? (
                                                        <div className="flex gap-2">
                                                            {detail.images.map((image) => (
                                                                <div
                                                                    key={image.returnRequestImageId}
                                                                    className="relative w-16 h-16 cursor-pointer hover:opacity-80 transition-opacity"
                                                                    onClick={() => setSelectedImage(image)}
                                                                >
                                                                    <img
                                                                        src={image.imageUrl}
                                                                        alt={`Hình ảnh trả hàng ${detail.productName}`}
                                                                        className="object-cover rounded-md w-full h-full"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center text-muted-foreground">
                                                            <ImageIcon className="w-4 h-4 mr-1" />
                                                            <span>Không có hình ảnh</span>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="border-t bg-muted/50">
                                            <td className="p-2 text-sm font-medium">Tổng cộng</td>
                                            <td className="p-2 text-sm font-medium">{totalQuantity}</td>
                                            <td className="p-2"></td>
                                            <td className="p-2"></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        {/* Status update section */}
                        {returnOrder.status === "Pending" && (
                            <div>
                                <div className="flex space-x-2">
                                    <Button onClick={handleApproveReturn} disabled={isSubmitting} className="flex-1">
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Chấp nhận
                                    </Button>
                                </div>
                            </div>
                        )}
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Đóng
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Image Preview Dialog */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center"
                    onClick={(e) => {
                        e.stopPropagation()
                        setSelectedImage(null)
                    }}
                >
                    <div
                        className="relative max-w-4xl max-h-[90vh] p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-2 right-2 text-white hover:text-gray-300 z-10"
                            onClick={(e) => {
                                e.stopPropagation()
                                setSelectedImage(null)
                            }}
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <img
                            src={selectedImage.imageUrl}
                            alt="Preview"
                            className="max-w-full max-h-[80vh] object-contain"
                        />
                    </div>
                </div>
            )}
        </>
    )
}
