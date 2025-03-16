"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Product {
    id: string
    name: string
    image: string
    hoverImage: string
    category: string
    categoryColor?: string
    href: string
}

export function FeaturedProductsSection() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const slideRef = useRef<HTMLDivElement>(null)

    // Sample featured products data with primary and hover images
    const products: Product[] = [
        {
            id: "1",
            name: "RICEGUARD 40 OD",
            image:
                "https://product.hstatic.net/200000907029/product/product_1_1_back_5812a1be313d4a6ab51c4e2aacded127_large.png",
            hoverImage:
                "https://product.hstatic.net/200000907029/product/product_1_1_copy_25225bfa226c420494762e47214c950c_large.png",
            category: "THUỐC TRỪ CỎ",
            categoryColor: "border-green-500 text-green-600",
            href: "/collections/thuoc-tru-co/riceguard-40-od",
        },
        {
            id: "2",
            name: "BENZEMA 480SL",
            image:
                "https://product.hstatic.net/200000907029/product/product_1_1_back_5812a1be313d4a6ab51c4e2aacded127_large.png",
            hoverImage:
                "https://product.hstatic.net/200000907029/product/product_1_1_copy_25225bfa226c420494762e47214c950c_large.png",
            category: "THUỐC TRỪ CỎ",
            categoryColor: "border-green-500 text-green-600",
            href: "/collections/thuoc-tru-co/benzema-480sl",
        },
        {
            id: "3",
            name: "OCINDIA 750WP",
            image:
                "https://product.hstatic.net/200000907029/product/product_1_1_back_5812a1be313d4a6ab51c4e2aacded127_large.png",
            hoverImage:
                "https://product.hstatic.net/200000907029/product/product_1_1_copy_25225bfa226c420494762e47214c950c_large.png",
            category: "THUỐC TRỪ ỐC",
            categoryColor: "border-yellow-500 text-yellow-600",
            href: "/collections/thuoc-tru-oc-1/ocindia-750wp",
        },
        {
            id: "4",
            name: "BUMROSAI 650WP",
            image:
                "https://product.hstatic.net/200000907029/product/product_1_1_back_5812a1be313d4a6ab51c4e2aacded127_large.png",
            hoverImage:
                "https://product.hstatic.net/200000907029/product/product_1_1_copy_25225bfa226c420494762e47214c950c_large.png",
            category: "THUỐC TRỪ SÂU",
            categoryColor: "border-red-500 text-red-600",
            href: "/collections/thuoc-tru-sau/bumrosai-650wp",
        },
        {
            id: "5",
            name: "FUJIDUC 40WP",
            image:
                "https://product.hstatic.net/200000907029/product/product_1_1_back_5812a1be313d4a6ab51c4e2aacded127_large.png",
            hoverImage:
                "https://product.hstatic.net/200000907029/product/product_1_1_copy_25225bfa226c420494762e47214c950c_large.png",
            category: "THUỐC TRỪ BỆNH",
            categoryColor: "border-blue-500 text-blue-600",
            href: "/collections/thuoc-tru-benh/fujiduc-40wp",
        },
        {
            id: "6",
            name: "SONATA 5SL",
            image:
                "https://product.hstatic.net/200000907029/product/product_1_1_back_5812a1be313d4a6ab51c4e2aacded127_large.png",
            hoverImage:
                "https://product.hstatic.net/200000907029/product/product_1_1_copy_25225bfa226c420494762e47214c950c_large.png",
            category: "THUỐC DƯỠNG",
            categoryColor: "border-purple-500 text-purple-600",
            href: "/collections/thuoc-duong/sonata-5sl",
        },
    ]

    const visibleProducts = 3 // Number of products visible at once
    const maxIndex = Math.max(0, products.length - visibleProducts)

    // Modified to stop at the last product instead of looping
    const nextSlide = () => {
        setCurrentIndex((prev) => Math.min(prev + 1, maxIndex))
    }

    // Keep this as is - stops at the first product
    const prevSlide = () => {
        setCurrentIndex((prev) => Math.max(prev - 1, 0))
    }

    // Update slide position when currentIndex changes
    useEffect(() => {
        if (slideRef.current) {
            const slideWidth = slideRef.current.offsetWidth / visibleProducts
            slideRef.current.style.transform = `translateX(-${currentIndex * slideWidth}px)`
        }
    }, [currentIndex, visibleProducts])

    // Check if we're at the first or last slide
    const isFirstSlide = currentIndex === 0
    const isLastSlide = currentIndex === maxIndex

    return (
        <section
            className="py-16 relative"
            style={{
                backgroundImage:
                    "url('https://theme.hstatic.net/200000907029/1001282128/14/img_home_collection_about.png?v=316')",
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                backgroundPosition: "center",
                padding: "80px 0",
            }}
        >
            <div className="absolute inset-0 bg-white/70 z-0"></div>
            <div className="relative z-10">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-3xl font-bold text-gray-900">SẢN PHẨM NỔI BẬT</h2>
                    <a href="/collections" className="text-gray-600 hover:text-primary font-medium">
                        Tất cả
                    </a>
                </div>
                <div className="flex flex-col mb-8">
                    {/* Navigation buttons below the header */}
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={prevSlide}
                            disabled={isFirstSlide}
                            className={cn(
                                "bg-white text-gray-700 rounded-full p-2 shadow-sm border transition-colors",
                                isFirstSlide ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100",
                            )}
                            aria-label="Previous products"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>

                        <button
                            onClick={nextSlide}
                            disabled={isLastSlide}
                            className={cn(
                                "bg-white text-gray-700 rounded-full p-2 shadow-sm border transition-colors",
                                isLastSlide ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100",
                            )}
                            aria-label="Next products"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="relative">
                    {/* Products Slider */}
                    <div className="overflow-hidden">
                        <div
                            ref={slideRef}
                            className="flex transition-transform duration-500 ease-in-out"
                            style={{ width: `${(100 * products.length) / visibleProducts}%` }}
                        >
                            {products.map((product) => (
                                <div key={product.id} className="px-3" style={{ width: `${100 / products.length}%` }}>
                                    <a
                                        href={product.href}
                                        className="block bg-white rounded-lg p-6 h-full border hover:shadow-lg transition-shadow"
                                    >
                                        <div className="flex justify-center mb-4">
                                            <span
                                                className={cn(
                                                    "px-4 py-1 text-sm border rounded-full",
                                                    product.categoryColor || "border-gray-300 text-gray-600",
                                                )}
                                            >
                                                {product.category}
                                            </span>
                                        </div>

                                        <div className="aspect-square flex items-center justify-center p-4 mb-6 relative overflow-hidden">
                                            <div className="w-full h-full relative group">
                                                {/* Primary image (slides left on hover) */}
                                                <img
                                                    src={product.image || "/placeholder.svg"}
                                                    alt={product.name}
                                                    className="absolute inset-0 w-full h-full object-contain transition-transform duration-500 ease-in-out transform group-hover:-translate-x-full"
                                                />

                                                {/* Hover image (slides in from right on hover) */}
                                                <img
                                                    src={product.hoverImage || "/placeholder.svg"}
                                                    alt={`${product.name} - alternate view`}
                                                    className="absolute inset-0 w-full h-full object-contain transition-transform duration-500 ease-in-out transform translate-x-full group-hover:translate-x-0"
                                                />
                                            </div>
                                        </div>

                                        <h3 className="text-center font-medium text-gray-800">{product.name}</h3>
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

