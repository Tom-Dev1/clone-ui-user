"use client"

import { Loader2 } from "lucide-react"
import type { OrderDetail, RequestProduct } from "../../types/sales-orders"
import { OrderStatusBadge } from "./order-status-badge"
import { formatCurrency, formatDateTime, formatNumber } from "@/utils/format-utils"

interface OrderDetailModalProps {
    isOpen: boolean
    onClose: () => void
    isLoading: boolean
    selectedOrder: RequestProduct | null
    orderDetail: OrderDetail | null
    onApprove: (requestProductId: string) => void
}

export const OrderDetailModal = ({
    isOpen,
    onClose,
    isLoading,
    selectedOrder,
    orderDetail,
    onApprove,
}: OrderDetailModalProps) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">
                            {isLoading
                                ? "Đang tải chi tiết đơn hàng..."
                                : `Chi tiết đơn hàng ${(orderDetail || selectedOrder)?.requestCode}`}
                        </h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            ✕
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            <p>Đang tải dữ liệu chi tiết...</p>
                        </div>
                    ) : orderDetail ? (
                        <>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <p className="text-sm text-gray-500">Đại lý</p>
                                    <p className="font-medium">{orderDetail.agencyName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Ngày tạo</p>
                                    <p className="font-medium">{formatDateTime(orderDetail.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Trạng thái</p>
                                    <p className="font-medium">
                                        <OrderStatusBadge status={orderDetail.requestStatus} />
                                    </p>
                                </div>
                                {orderDetail.updatedAt && (
                                    <div>
                                        <p className="text-sm text-gray-500">Ngày cập nhật</p>
                                        <p className="font-medium">{formatDateTime(orderDetail.updatedAt)}</p>
                                    </div>
                                )}
                                {orderDetail.approvedName && (
                                    <div>
                                        <p className="text-sm text-gray-500">Người duyệt</p>
                                        <p className="font-medium">{orderDetail.approvedName}</p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Số loại sản phẩm</p>
                                        <p className="font-medium text-lg">{orderDetail.requestProductDetails?.length || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Tổng số lượng</p>
                                        <p className="font-medium text-lg">
                                            {formatNumber(
                                                orderDetail.requestProductDetails?.reduce((sum, item) => sum + item.quantity, 0) || 0,
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Tổng giá trị</p>
                                        <p className="font-medium text-lg">
                                            {formatCurrency(
                                                orderDetail.requestProductDetails?.reduce(
                                                    (sum, item) => sum + item.unitPrice * item.quantity,
                                                    0,
                                                ) || 0,
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <h3 className="font-medium mb-2">Sản phẩm</h3>
                            {orderDetail.requestProductDetails && orderDetail.requestProductDetails.length > 0 ? (
                                <table className="min-w-full divide-y divide-gray-200 mb-4">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Mã SP
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Tên sản phẩm
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Đơn vị
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Số lượng
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Đơn giá
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Thành tiền
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {orderDetail.requestProductDetails.map((detail) => (
                                            <tr key={detail.requestProductDetailId}>
                                                <td className="px-4 py-3 text-sm text-gray-900">{detail.productId}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{detail.productName}</td>
                                                <td className="px-4 py-3 text-sm text-gray-500">{detail.unit}</td>
                                                <td className="px-4 py-3 text-sm text-gray-500">{formatNumber(detail.quantity)}</td>
                                                <td className="px-4 py-3 text-sm text-gray-500">
                                                    {detail.unitPrice > 0 ? formatCurrency(detail.unitPrice) : "Chưa có giá"}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                    {detail.unitPrice > 0 ? formatCurrency(detail.unitPrice * detail.quantity) : "N/A"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-center py-4 text-gray-500">Không có thông tin chi tiết sản phẩm</p>
                            )}

                            <div className="flex justify-end space-x-2 mt-6">
                                <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                                    Đóng
                                </button>

                                {orderDetail.requestStatus === "Pending" && (
                                    <button
                                        onClick={() => {
                                            onApprove(orderDetail.requestProductId)
                                            onClose()
                                        }}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                    >
                                        Phê duyệt
                                    </button>
                                )}
                            </div>
                        </>
                    ) : selectedOrder ? (
                        <>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <p className="text-sm text-gray-500">Đại lý</p>
                                    <p className="font-medium">{selectedOrder.agencyName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Ngày tạo</p>
                                    <p className="font-medium">{formatDateTime(selectedOrder.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Trạng thái</p>
                                    <p className="font-medium">
                                        <OrderStatusBadge status={selectedOrder.requestStatus} />
                                    </p>
                                </div>
                                {selectedOrder.updatedAt && (
                                    <div>
                                        <p className="text-sm text-gray-500">Ngày cập nhật</p>
                                        <p className="font-medium">{formatDateTime(selectedOrder.updatedAt)}</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end space-x-2 mt-6">
                                <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                                    Đóng
                                </button>

                                {selectedOrder.requestStatus === "Pending" && (
                                    <button
                                        onClick={() => {
                                            onApprove(selectedOrder.requestProductId)
                                            onClose()
                                        }}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                    >
                                        Phê duyệt
                                    </button>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <p>Không thể tải chi tiết đơn hàng.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

