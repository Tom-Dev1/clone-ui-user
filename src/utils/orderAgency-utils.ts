import type { Order, SortDirection } from "@/types/agency-orders"

// Sort orders based on field and direction
export const sortOrders = (data: Order[], field: string, direction: SortDirection): Order[] => {
    return [...data].sort((a, b) => {
        let compareResult = 0

        switch (field) {
            case "orderCode":
                compareResult = a.orderCode.localeCompare(b.orderCode)
                break
            case "orderDate":
                compareResult = new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime()
                break
            case "finalPrice":
                compareResult = a.finalPrice - b.finalPrice
                break
            case "status":
                compareResult = a.status.localeCompare(b.status)
                break
            default:
                compareResult = 0
        }

        return direction === "asc" ? compareResult : -compareResult
    })
}

// Filter orders based on search term and status
export const filterOrders = (orders: Order[], searchTerm: string, statusFilter: string): Order[] => {
    let filtered = [...orders]

    // Filter by status
    if (statusFilter !== "all") {
        filtered = filtered.filter((order) => order.status === statusFilter)
    }

    // Filter by search term
    if (searchTerm.trim() !== "") {
        const searchTermLower = searchTerm.toLowerCase()
        filtered = filtered.filter(
            (order) =>
                order.orderCode.toLowerCase().includes(searchTermLower) ||
                order.agencyName.toLowerCase().includes(searchTermLower) ||
                order.requestCode.toLowerCase().includes(searchTermLower) ||
                order.salesName.toLowerCase().includes(searchTermLower),
        )
    }

    return filtered
}

