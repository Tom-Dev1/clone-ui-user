export interface ProductCategory {
    categoryId: number
    categoryName: string
    sortOrder: number
    notes: string
    isActive: boolean
    createdBy: string
    createdDate: string
    slug?: string // Added for convenience
}

export interface Product {
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
    updatedBy: string
    updatedDate: string
    availableStock: number
    images: string[]
}

