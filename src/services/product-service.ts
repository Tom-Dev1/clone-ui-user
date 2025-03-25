import { get } from "@/api/axiosUtils"
import { createSlug } from "@/utils/string-utils"

// Define types based on the actual API response
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

// Simplified product for category listing
export interface ProductCard {
    productId: number
    productName: string
    images: string[]
}

// Full product details
export interface ProductDetail {
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
    price: number
    images: string[]
}
export interface PaginatedResponse<T> {
    items: T[]
    totalCount: number
    pageNumber: number
    pageSize: number
    totalPages: number
}
/**
 * Fetches all product categories from the API
 * @returns Array of product categories with added slug property
 */
export async function fetchProductCategories(): Promise<ProductCategory[]> {
    try {
        const response = await get<ProductCategory[]>("product-category")

        if (response.success && Array.isArray(response.result)) {
            // Add slug property to each category based on notes
            return response.result.map((category) => ({
                ...category,
                slug: createSlug(category.notes || category.categoryName),
            }))
        }

        return []
    } catch (error) {
        console.error("Error fetching product categories:", error)
        return []
    }
}

/**
 * Fetches products by category ID
 * @param categoryId The category ID
 * @returns Array of simplified products in the category
 */
export async function fetchProductsByCategory(categoryId: number): Promise<ProductCard[]> {
    try {
        const response = await get<ProductCard[]>(`by-category/${categoryId}`)

        if (response.success && Array.isArray(response.result)) {
            return response.result
        }

        return []
    } catch (error) {
        console.error(`Error fetching products for category ${categoryId}:`, error)
        return []
    }
}

/**
 * Fetches a single product by its ID
 * @param productId The product ID
 * @returns The full product details or null if not found
 */
export async function fetchProductById(productId: number): Promise<ProductDetail | null> {
    try {
        const response = await get<ProductDetail>(`product/${productId}`)

        if (response.success && response.result) {
            return response.result
        }

        return null
    } catch (error) {
        console.error(`Error fetching product ${productId}:`, error)
        return null
    }
}
/**
 * Fetches all products with default parameters
 * @returns Array of products
 */
export async function fetchAllProducts(): Promise<ProductCard[]> {
    try {
        // Always use default parameters
        const response = await get<ProductCard[]>(`/product?page=1&pageSize=20`)

        if (response.success && Array.isArray(response.result)) {
            return response.result
        }

        return []
    } catch (error) {
        console.error("Error fetching products:", error)
        return []
    }
}