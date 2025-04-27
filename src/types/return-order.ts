// Define types for the return order data
export interface ReturnRequestDetail {
    returnRequestDetailId: string
    orderDetailId: string
    productName: string
    reason: string
    quantityReturned: number
}

export interface ReturnRequest {
    returnRequestId: string
    orderId: string
    createdAt: string
    createdByUserName: string
    status: string
    note: string
    details: ReturnRequestDetail[]
}

export type SortDirection = "asc" | "desc"
