export interface RequestExportDetail {
    requestExportDetailId: number
    productId: number
    productName: string
    unit: string
    price: number
    requestedQuantity: number
}

export interface RequestExport {
    requestExportId: number
    orderId: string
    requestExportCode: string
    agencyName: string
    orderCode: string
    warehouseName: string
    approvedByName: string
    status: string
    note: string
    requestDate: string
    requestExportDetails: RequestExportDetail[]
    discount: number,
    reason: string
    totalPrice: number
    finalPrice: number
}

export interface ApiProduct {
    productId: number
    productCode: string
    productName: string
    unit: string
    defaultExpiration: number
    categoryId: number
    description: string
    taxId: number
    createdBy: string
    createdDate: string
    availableStock: number
    price: number
    images: string[]
}

export type SortDirection = "asc" | "desc"