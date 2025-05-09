"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface OrderSearchFilterProps {
    searchTerm: string
    onSearchChange: (value: string) => void
    statusFilter: string
    onStatusFilterChange: (value: string) => void
}

export const OrderSearchFilter = ({
    searchTerm,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
}: OrderSearchFilterProps) => {
    return (
        <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
                <Input
                    placeholder="Tìm kiếm theo mã đơn hàng, đại lý, nhân viên..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full"
                />
            </div>
            <div className="w-full md:w-64">
                <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Lọc theo trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="WaitPaid">Chờ thanh toán</SelectItem>
                        <SelectItem value="Paid">Đã thanh toán</SelectItem>
                        <SelectItem value="WaitingDelivery">Chờ xuất kho</SelectItem>
                        <SelectItem value="Exported">Đã xuất kho</SelectItem>
                        <SelectItem value="Canceled">Từ chối</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}

