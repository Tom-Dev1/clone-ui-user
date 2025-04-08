"use client"

import { Loader2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import type { RequestProduct, SortField, SortDirection } from "../../types/sales-orders"
import { OrderStatusBadge } from "./order-status-badge"
import { OrderActionMenu } from "./order-action-menu"
import { formatCurrency, formatDateTime, formatNumber } from "../../utils/format-utils"
import { getTotalOrderValue, getTotalProductTypes, getTotalQuantity } from "../../utils/order-utils"

interface OrderTableProps {
    orders: RequestProduct[]
    detailsLoaded: Record<string, boolean>
    onViewDetail: (order: RequestProduct) => void
    onApprove: (requestProductId: string) => void
    onCancel: (requestProductId: string) => void
    sortField: SortField
    sortDirection: SortDirection
    onSort: (field: SortField) => void
}

export const OrderTable = ({
    orders,
    detailsLoaded,
    onViewDetail,
    onApprove,
    onCancel,
    sortField,
    sortDirection,
    onSort,
}: OrderTableProps) => {
    // Helper function to render sort icons
    const renderSortIcon = (field: SortField) => {
        if (sortField !== field) {
            return <ArrowUpDown className="h-4 w-4 ml-1" />
        }
        return sortDirection === "asc" ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />
    }

    return (
        <div className="bg-white rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border rounded-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Mã đơn hàng
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                onClick={() => onSort("createdAt")}
                            >
                                <div className="flex items-center">
                                    Ngày tạo
                                    {renderSortIcon("createdAt")}
                                </div>
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Đại lý
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Số SP
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Tổng SL
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Tổng giá trị
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                onClick={() => onSort("status")}
                            >
                                <div className="flex items-center">
                                    Trạng thái
                                    {renderSortIcon("status")}
                                </div>
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Thao tác
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                            <tr key={order.requestProductId} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.requestCode}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(order.createdAt)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.agencyName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {order.isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin inline" />
                                    ) : detailsLoaded[order.requestProductId] ? (
                                        getTotalProductTypes(order)
                                    ) : (
                                        <button onClick={() => onViewDetail(order)} className="text-blue-600 hover:text-blue-900 text-xs">
                                            Xem
                                        </button>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {order.isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin inline" />
                                    ) : detailsLoaded[order.requestProductId] ? (
                                        formatNumber(getTotalQuantity(order))
                                    ) : (
                                        <button onClick={() => onViewDetail(order)} className="text-blue-600 hover:text-blue-900 text-xs">
                                            Xem
                                        </button>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {order.isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin inline" />
                                    ) : detailsLoaded[order.requestProductId] ? (
                                        formatCurrency(getTotalOrderValue(order))
                                    ) : (
                                        <button onClick={() => onViewDetail(order)} className="text-blue-600 hover:text-blue-900 text-xs">
                                            Xem
                                        </button>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <OrderStatusBadge status={order.requestStatus} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                                    <OrderActionMenu
                                        order={order}
                                        onViewDetail={onViewDetail}
                                        onApprove={onApprove}
                                        onCancel={onCancel}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

