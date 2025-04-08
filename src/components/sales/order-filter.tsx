"use client"

interface OrderFilterProps {
    statusFilter: string
    onStatusFilterChange: (value: string) => void
    searchQuery: string
    onSearchQueryChange: (value: string) => void
}

export const OrderFilter = ({
    // statusFilter,
    // onStatusFilterChange,
    searchQuery,
    onSearchQueryChange,
}: OrderFilterProps) => {
    return (
        <>
            {/* 
                <div className="flex items-center space-x-2">
                    <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
                        Lọc theo trạng thái:
                    </label>
                    <select
                        id="status-filter"
                        value={statusFilter}
                        onChange={(e) => onStatusFilterChange(e.target.value)}
                        className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    >
                        <option value="all">Tất cả</option>
                        <option value="Pending">Chờ duyệt</option>
                        <option value="Approved">Đã duyệt</option>
                        <option value="Canceled">Đã hủy</option>
                    </select>
                </div> */}


            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Tìm kiếm đơn hàng..."
                    value={searchQuery}
                    onChange={(e) => onSearchQueryChange(e.target.value)}
                    className="w-full px-4 h-9 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
        </>
    )
}

