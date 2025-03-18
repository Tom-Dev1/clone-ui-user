"use client"

import { SalesLayout } from "@/layouts/sale-layout"
import { useState } from "react"

// Sample order data
const ORDERS = [
    {
        id: "ORD-2023001",
        date: "3/18/2025",
        customer: "Nguyễn Văn A",
        status: "Đã giao hàng",
        total: "250.000 đ",
        items: [
            { name: "Phân bón hữu cơ", quantity: 2, price: "75.000 đ" },
            { name: "Hạt giống rau muống", quantity: 5, price: "20.000 đ" },
        ],
    },
    {
        id: "ORD-2023002",
        date: "3/18/2025",
        customer: "Trần Thị B",
        status: "Đã giao hàng",
        total: "500.000 đ",
        items: [
            { name: "Thuốc bảo vệ thực vật", quantity: 1, price: "120.000 đ" },
            { name: "Phân bón NPK", quantity: 3, price: "85.000 đ" },
            { name: "Hạt giống cà chua", quantity: 2, price: "40.000 đ" },
        ],
    },
    {
        id: "ORD-2023003",
        date: "3/18/2025",
        customer: "Lê Văn C",
        status: "Đã giao hàng",
        total: "750.000 đ",
        items: [
            { name: "Máy bơm nước mini", quantity: 1, price: "450.000 đ" },
            { name: "Ống tưới nhỏ giọt", quantity: 5, price: "60.000 đ" },
        ],
    },
    {
        id: "ORD-2023004",
        date: "3/17/2025",
        customer: "Phạm Thị D",
        status: "Đang giao",
        total: "320.000 đ",
        items: [{ name: "Chậu trồng cây", quantity: 8, price: "40.000 đ" }],
    },
    {
        id: "ORD-2023005",
        date: "3/17/2025",
        customer: "Hoàng Văn E",
        status: "Đang xử lý",
        total: "1.200.000 đ",
        items: [
            { name: "Bộ dụng cụ làm vườn", quantity: 1, price: "850.000 đ" },
            { name: "Găng tay làm vườn", quantity: 2, price: "75.000 đ" },
            { name: "Kéo cắt cành", quantity: 1, price: "200.000 đ" },
        ],
    },
]

export default function SalesOrders() {
    const [selectedOrder, setSelectedOrder] = useState<(typeof ORDERS)[0] | null>(null)
    const [filterStatus, setFilterStatus] = useState<string>("all")

    const filteredOrders = filterStatus === "all" ? ORDERS : ORDERS.filter((order) => order.status === filterStatus)

    return (
        <SalesLayout>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>

                    <div className="flex items-center space-x-2">
                        <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
                            Lọc theo trạng thái:
                        </label>
                        <select
                            id="status-filter"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        >
                            <option value="all">Tất cả</option>
                            <option value="Đã giao hàng">Đã giao hàng</option>
                            <option value="Đang giao">Đang giao</option>
                            <option value="Đang xử lý">Đang xử lý</option>
                        </select>
                    </div>
                </div>

                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
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
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Ngày đặt
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Khách hàng
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Trạng thái
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Tổng tiền
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === "Đã giao hàng"
                                                        ? "bg-green-100 text-green-800"
                                                        : order.status === "Đang giao"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-blue-100 text-blue-800"
                                                    }`}
                                            >
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.total}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button onClick={() => setSelectedOrder(order)} className="text-blue-600 hover:text-blue-900">
                                                Chi tiết
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Order Detail Modal */}
                {selectedOrder && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold">Chi tiết đơn hàng #{selectedOrder.id}</h2>
                                    <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-gray-700">
                                        ✕
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <p className="text-sm text-gray-500">Khách hàng</p>
                                        <p className="font-medium">{selectedOrder.customer}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Ngày đặt</p>
                                        <p className="font-medium">{selectedOrder.date}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Trạng thái</p>
                                        <p className="font-medium">{selectedOrder.status}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Tổng tiền</p>
                                        <p className="font-medium">{selectedOrder.total}</p>
                                    </div>
                                </div>

                                <h3 className="font-medium mb-2">Sản phẩm</h3>
                                <table className="min-w-full divide-y divide-gray-200 mb-4">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Sản phẩm
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
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {selectedOrder.items.map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                                                <td className="px-4 py-3 text-sm text-gray-500">{item.quantity}</td>
                                                <td className="px-4 py-3 text-sm text-gray-500">{item.price}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="flex justify-end space-x-2 mt-6">
                                    <button
                                        onClick={() => setSelectedOrder(null)}
                                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                    >
                                        Đóng
                                    </button>
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">In đơn hàng</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </SalesLayout>
    )
}

