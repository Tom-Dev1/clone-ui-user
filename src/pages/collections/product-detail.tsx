"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { fetchProductById, fetchProductCategories } from "@/services/product-service"
import type { ProductDetail, ProductCategory } from "@/services/product-service"
import { ResponsiveContainer } from "@/components/responsive-container"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronRight, ChevronLeft, Phone, ShoppingCart, Plus, Minus } from "lucide-react"
import { useCart } from "@/hooks/use-cart"

export default function ProductDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [product, setProduct] = useState<ProductDetail | null>(null)
    const [category, setCategory] = useState<ProductCategory | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeImageIndex, setActiveImageIndex] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const { addItem } = useCart()
    const userRole = localStorage.getItem("role_name")
    const canOrder = userRole === "SALE" || userRole === "AGENCY"

    useEffect(() => {
        async function loadProduct() {
            if (!id) {
                navigate("/collections")
                return
            }
            setLoading(true)
            setError(null)
            try {
                const productId = Number.parseInt(id, 10)
                if (isNaN(productId)) {
                    setError("Invalid product ID")
                    setLoading(false)
                    return
                }
                const productData = await fetchProductById(productId)
                if (!productData) {
                    setError("Product not found")
                    setLoading(false)
                    return
                }
                setProduct(productData)
                if (productData.categoryId) {
                    const categories = await fetchProductCategories()
                    const productCategory = categories.find((c) => c.categoryId === productData.categoryId)
                    setCategory(productCategory || null)
                }
            } catch (err) {
                console.error("Failed to load product:", err)
                setError("Could not load product information")
            } finally {
                setLoading(false)
            }
        }
        loadProduct()
    }, [id, navigate])
    const handlePrevImage = () => {
        if (!product?.images?.length) return
        setActiveImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))
    }
    const handleNextImage = () => {
        if (!product?.images?.length) return
        setActiveImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))
    }
    const incrementQuantity = () => {
        setQuantity((prev) => prev + 1)
    }
    const decrementQuantity = () => {
        setQuantity((prev) => (prev > 1 ? prev - 1 : 1))
    }
    const handleAddToCart = () => {
        if (product) {
            addItem(product, quantity)

            alert(`Added ${quantity} ${product.unit} of ${product.productName} to cart`)
        }
    }

    if (loading) {
        return (
            <div className="py-12">
                <ResponsiveContainer>
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="md:w-1/2">
                            <Skeleton className="aspect-square w-full rounded-lg" />
                            <div className="flex gap-2 mt-4">
                                {[1, 2, 3].map((_, i) => (
                                    <Skeleton key={i} className="w-20 h-20 rounded-md" />
                                ))}
                            </div>
                        </div>
                        <div className="md:w-1/2">
                            <Skeleton className="h-10 w-3/4 mb-4" />
                            <Skeleton className="h-6 w-1/2 mb-2" />
                            <Skeleton className="h-4 w-full mb-6" />
                            <Skeleton className="h-20 w-full mb-4" />
                            <Skeleton className="h-10 w-32" />
                        </div>
                    </div>
                </ResponsiveContainer>
            </div>
        )
    }

    if (error || !product) {
        return (
            <div className="py-12">
                <ResponsiveContainer>
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                        {error || "Product not found"}
                    </div>
                    <Link to="/collections" className="text-primary hover:underline">
                        &larr; Back to products
                    </Link>
                </ResponsiveContainer>
            </div>
        )
    }

    return (
        <div className="py-12">
            <ResponsiveContainer>
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Product Images */}
                    <div className="md:w-1/2">
                        <div className="relative">
                            <div className="aspect-square bg-white rounded-lg border overflow-hidden">
                                {product.images && product.images.length > 0 ? (
                                    <div className="relative w-full h-full">
                                        {/* Main Image */}
                                        <div className="w-full h-full">
                                            <img
                                                key={activeImageIndex} // Key helps React recognize this is a new image
                                                src={product.images[activeImageIndex] || "/placeholder.svg?height=500&width=500"}
                                                alt={product.productName}
                                                className="w-full h-full object-contain transition-opacity duration-300"
                                                onError={(e) => {
                                                    ; (e.target as HTMLImageElement).src = "/placeholder.svg?height=500&width=500"
                                                }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-muted/20">
                                        <span className="text-muted-foreground">No image available</span>
                                    </div>
                                )}
                            </div>

                            {product.images && product.images.length > 1 && (
                                <>
                                    <button
                                        onClick={handlePrevImage}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md hover:bg-white"
                                        aria-label="Previous image"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={handleNextImage}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md hover:bg-white"
                                        aria-label="Next image"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnail Images */}
                        {product.images && product.images.length > 1 && (
                            <div className="flex gap-2 mt-4 overflow-x-auto p-2">
                                {product.images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveImageIndex(index)}
                                        className={`w-20 h-20 rounded-md border overflow-hidden flex-shrink-0 transition-all duration-200 ${activeImageIndex === index
                                            ? "ring-2 ring-primary scale-105"
                                            : "hover:ring-1 hover:ring-primary/50 hover:scale-[1.02]"
                                            }`}
                                        aria-label={`View image ${index + 1}`}
                                        aria-current={activeImageIndex === index ? "true" : "false"}
                                    >
                                        <img
                                            src={image || "/placeholder.svg?height=80&width=80"}
                                            alt={`${product.productName} - Image ${index + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                ; (e.target as HTMLImageElement).src = "/placeholder.svg?height=80&width=80"
                                            }}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div className="md:w-1/2">
                        <h1 className="text-2xl font-bold mb-2">{product.productName}</h1>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-sm text-muted-foreground">Mã sản phẩm: {product.productCode}</span>
                            <span className="text-sm text-muted-foreground">|</span>
                            <span className="text-sm text-muted-foreground">Đơn vị: {product.unit}</span>
                        </div>

                        <div className="bg-muted/20 p-4 rounded-lg mb-6">
                            <h2 className="font-medium mb-2">Mô tả sản phẩm</h2>
                            <p className="text-muted-foreground whitespace-pre-line">{product.description}</p>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-sm">Loại:</span>
                                <span className="text-sm font-medium">{category?.categoryName || "N/A"}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-sm">Hạn sử dụng:</span>
                                <span className="text-sm font-medium">{product.defaultExpiration} days</span>
                            </div>
                        </div>

                        {canOrder && (
                            <div className="mt-6 border-t pt-6 mb-5">
                                <h3 className="font-medium mb-4">Số lượng đặt hàng</h3>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center border rounded-md">
                                        <button
                                            onClick={decrementQuantity}
                                            className="px-3 py-2 border-r hover:bg-muted/20"
                                            aria-label="Decrease quantity"
                                        >
                                            <Minus className="h-4 w-4" />
                                        </button>
                                        <span className="px-4 py-2">{quantity}</span>
                                        <button
                                            onClick={incrementQuantity}
                                            className="px-3 py-2 border-l hover:bg-muted/20"
                                            aria-label="Increase quantity"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        Chọn số lượng và nhấn "Thêm vào giỏ hàng" để thêm vào đơn hàng
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4">
                            {canOrder ? (
                                <button
                                    onClick={handleAddToCart}
                                    className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
                                >
                                    <ShoppingCart className="h-4 w-4" />
                                    Thêm vào giỏ hàng
                                </button>
                            ) : (
                                <button className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                                    Liên hệ để đặt
                                </button>
                            )}
                            <Link
                                to="/collections"
                                className="px-6 py-2 border border-muted-foreground/30 rounded-md hover:bg-muted/20"
                            >
                                Quay lại sản phẩm
                            </Link>
                        </div>
                    </div>
                </div>
            </ResponsiveContainer>

            <div className="fixed bottom-6 right-6 z-30">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>
                    <a
                        href="tel:02812345678"
                        className="relative flex items-center justify-center w-16 h-16 bg-primary rounded-full shadow-lg hover:bg-primary/90 transition-colors"
                    >
                        <Phone className="h-6 w-6 text-primary-foreground" />
                    </a>
                </div>
            </div>
        </div>
    )
}

