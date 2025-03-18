"use client"

import { SalesLayout } from "@/layouts/sale-layout"
import { useState } from "react"

// Sample debt data
const DEBTS = [
    {
        id: "DEBT-001",
        customer: "Nguyễn Văn A",
        amount: "2.500.000 đ",
        dueDate: "15/04/2025",
        status: "Chưa thanh toán",
        createdAt: "01/03/2025",
    },
    {
        id: "DEBT-002",
        customer: "Trần Thị B",
        amount: "1.800.000 đ",
        dueDate: "20/04/2025",
        status: "Chưa thanh toán",
        createdAt: "05/03/2025",
    },
    {
        id: "DEBT-003",
        customer: "Lê Văn C",
        amount: "3.200.000 đ",
        dueDate: "10/04/2025",
        status: "Đã thanh toán một phần",
        createdAt: "28/02/2025",
    },
    {
        id: "DEBT-004",
        customer: "Phạm Thị D",
        amount: "950.000 đ",
        dueDate: "05/04/2025",
        status: "Đã thanh toán",
        createdAt: "25/02/2025",
    },
    {
        id: "DEBT-005",
        customer: "Hoàng Văn E",
        amount: "4.200.000 đ",
        dueDate: "30/04/2025",
        status: "Chưa thanh toán",
        createdAt: "10/03/2025",
    },
]

export default function SalesDebt() {
    const [filterStatus, setFilterStatus] = useState<string>("all")

    const filteredDebts = filterStatus === "all" ? DEBTS : DEBTS.filter((debt) => debt.status === filterStatus)

    // Calculate total debt
    const totalDebt = DEBTS.filter((debt) => debt.status !== "Đã thanh toán")
        .reduce((sum, debt) => {
            const amount = Number.parseFloat(debt.amount.replace(/\./g, "").replace(" đ", "")) / 1000
            return sum + amount
        }, 0)
        .toLocaleString("vi-VN")

    return (
        <SalesLayout>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Quản lý công nợ</h1>

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
                            <option value="Chưa thanh toán">Chưa thanh toán</option>
                            <option value="Đã thanh toán một phần">Đã thanh toán một phần</option>
                            <option value="Đã thanh toán">Đã thanh toán</option>
                        </select>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h3 className="text-gray-700 font-medium mb-2">Tổng công nợ</h3>
                        <p className="text-3xl font-bold">{totalDebt}.000 đ</p>
                        <p className="text-sm text-gray-500 mt-1">Cần thu hồi</p>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h3 className="text-gray-700 font-medium mb-2">Khách hàng nợ</h3>
                        <p className="text-3xl font-bold">{DEBTS.filter((debt) => debt.status !== "Đã thanh toán").length}</p>
                        <p className="text-sm text-gray-500 mt-1">Tổng số</p>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h3 className="text-gray-700 font-medium mb-2">Sắp đến hạn</h3>
                        <p className="text-3xl font-bold">3</p>
                        <p className="text-sm text-gray-500 mt-1">Trong 7 ngày tới</p>
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
                                        Mã công nợ
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
                                        Số tiền
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Ngày tạo
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Hạn thanh toán
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
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredDebts.map((debt) => (
                                    <tr key={debt.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{debt.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{debt.customer}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{debt.amount}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{debt.createdAt}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{debt.dueDate}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${debt.status === "Đã thanh toán"
                                                        ? "bg-green-100 text-green-800"
                                                        : debt.status === "Đã thanh toán một phần"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-red-100 text-red-800"
                                                    }`}
                                            >
                                                {debt.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button className="text-blue-600 hover:text-blue-900 mr-2">Chi tiết</button>
                                            {debt.status !== "Đã thanh toán" && (
                                                <button className="text-green-600 hover:text-green-900">Thanh toán</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </SalesLayout>
    )
}

