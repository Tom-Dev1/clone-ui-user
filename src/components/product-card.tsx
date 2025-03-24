"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import type { ProductCard as ProductCardType } from "@/services/product-service"

interface ProductCardProps {
    product: ProductCardType
    categoryId?: string
}

export function ProductCard({ product }: ProductCardProps) {
    const [isHovering, setIsHovering] = useState(false)

    // Get the first and second images, or use placeholders if not available
    const firstImage =
        product.images && product.images.length > 0 ? product.images[0] : "/placeholder.svg?height=300&width=300"

    const secondImage = product.images && product.images.length > 1 ? product.images[1] : firstImage // Fall back to first image if no second image

    const hasMultipleImages = product.images && product.images.length > 1

    return (
        <div
            className="bg-white p-4 rounded-lg border group hover:shadow-md transition-all"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <Link to={`/product/${product.productId}`}>
                <div className="aspect-square bg-muted rounded-md mb-4 overflow-hidden relative">
                    {/* First image */}
                    <div
                        className="absolute inset-0 w-full h-full transition-transform duration-500 ease-in-out"
                        style={{
                            transform: isHovering && hasMultipleImages ? "translateX(-100%)" : "translateX(0)",
                        }}
                    >
                        <img
                            src={firstImage || "/placeholder.svg"}
                            alt={product.productName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                ; (e.target as HTMLImageElement).src = "/placeholder.svg?height=300&width=300"
                            }}
                        />
                    </div>

                    {/* Second image */}
                    {hasMultipleImages && (
                        <div
                            className="absolute inset-0 w-full h-full transition-transform duration-500 ease-in-out"
                            style={{
                                transform: isHovering ? "translateX(0)" : "translateX(100%)",
                            }}
                        >
                            <img
                                src={secondImage || "/placeholder.svg"}
                                alt={`${product.productName} - alternate view`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    ; (e.target as HTMLImageElement).src = "/placeholder.svg?height=300&width=300"
                                }}
                            />
                        </div>
                    )}
                </div>
                <h3 className="font-medium line-clamp-2 h-12">{product.productName}</h3>
                <div className="flex justify-end mt-2">
                    <button className="text-sm bg-primary text-primary-foreground px-3 py-2 rounded">Xem chi tiết</button>
                </div>
            </Link>
        </div>
    )
}

