// Define types for the application
export interface RequestProductDetail {
    requestProductDetailId: number
    productId: number
    productName: string
    unit: string
    quantity: number
    unitPrice: number
}

export interface RequestProduct {
    requestProductId: string
    requestCode: string
    agencyId: number
    agencyName: string
    approvedName?: string
    approvedBy: number | null
    requestStatus: "Pending" | "Approved" | "Completed" | "Canceled"
    createdAt: string
    updatedAt?: string
    requestProductDetails: RequestProductDetail[]
    isLoading?: boolean
}

// Order detail is the same type as RequestProduct
export type OrderDetail = RequestProduct

// Add sorting types
export type SortField = "status" | "createdAt" | "none"
export type SortDirection = "asc" | "desc"

