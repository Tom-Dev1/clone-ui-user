"use client"

import type { SortDirection } from "@/types/sales-orders"
import { ArrowDown, ArrowUp } from "lucide-react"

interface OrderSortProps {
    sortStatus: string
    sortDirection: SortDirection
    onSortStatusChange: (value: string) => void
    onSortDirectionChange: (value: SortDirection) => void
}

export const OrderSort = ({ sortStatus, sortDirection, onSortStatusChange, onSortDirectionChange }: OrderSortProps) => {
    return (
        <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
                <label htmlFor="sort-status" className="text-sm font-medium text-gray-700">
                    Sắp xếp theo:
                </label>
                <select
                    id="sort-status"
                    value={sortStatus}
                    onChange={(e) => onSortStatusChange(e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                >
                    <option value="none">Mặc định</option>
                    <option value="status">Trạng thái</option>
                    <option value="createdAt">Ngày tạo</option>
                    <option value="agencyName">Đại lý</option>
                </select>
            </div>

            {sortStatus !== "none" && (
                <button
                    onClick={() => onSortDirectionChange(sortDirection === "asc" ? "desc" : "asc")}
                    className="flex items-center text-sm text-gray-700 hover:text-gray-900"
                >
                    {sortDirection === "asc" ? (
                        <>
                            <ArrowUp className="h-4 w-4 mr-1" />
                            Tăng dần
                        </>
                    ) : (
                        <>
                            <ArrowDown className="h-4 w-4 mr-1" />
                            Giảm dần
                        </>
                    )}
                </button>
            )}
        </div>
    )
}

