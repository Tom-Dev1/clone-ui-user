"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams, Link } from "react-router-dom"
import { fetchProductCategories, fetchProductsByCategory } from "@/services/product-service"
import type { ProductCategory, ProductCard } from "@/services/product-service"
import { PageHeader } from "@/components/page-header"
import { ResponsiveContainer } from "@/components/responsive-container"
import { ProductCard as ProductCardComponent } from "@/components/product-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Phone } from "lucide-react"

const CollectionSlug = () => {
    const { categoryId: slugParam } = useParams<{ categoryId: string }>()
    const [searchParams] = useSearchParams()
    const actualCategoryId = searchParams.get("id")

    const [category, setCategory] = useState<ProductCategory | null>(null)
    const [products, setProducts] = useState<ProductCard[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [allCategories, setAllCategories] = useState<ProductCategory[]>([])

    useEffect(() => {
        async function loadData() {
            setLoading(true)
            setError(null)

            try {
                // Get categoryId from URL params
                const categoryIdFromUrl = slugParam ? Number.parseInt(slugParam, 10) : null

                if (!categoryIdFromUrl || isNaN(categoryIdFromUrl)) {
                    setError("Invalid category ID")
                    setLoading(false)
                    return
                }

                // 1. Fetch all categories
                const categories = await fetchProductCategories()
                setAllCategories(categories)

                // 2. Find the category details
                const currentCategory = categories.find((c) => c.categoryId === categoryIdFromUrl)

                if (!currentCategory) {
                    setError("Category not found")
                    setLoading(false)
                    return
                }

                setCategory(currentCategory)

                // 3. Fetch products for this category
                const productsData = await fetchProductsByCategory(categoryIdFromUrl)
                setProducts(productsData)

                if (productsData.length === 0) {
                    setError("No products found in this category")
                }
            } catch (err) {
                console.error("Error loading data:", err)
                setError("Failed to load data. Please try again later.")
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [slugParam])

    return (
        <div className="py-12">
            <ResponsiveContainer maxWidth="2xl">
                <PageHeader
                    title={category?.categoryName || "Category"}
                    description={category?.notes || "Loading category details..."}
                />

                {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

                {/* Categories sidebar */}
                <div className="flex flex-col lg:flex-row gap-8 mb-8">
                    <div className="lg:w-1/5 xl:w-1/6">
                        <div className="bg-white p-6 rounded-lg border sticky top-24">
                            <h3 className="font-medium text-lg mb-4">Danh mục</h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link to="/collections" className="text-muted-foreground hover:text-primary">
                                        All Products
                                    </Link>
                                </li>
                                {allCategories
                                    .filter((cat) => cat.isActive)
                                    .sort((a, b) => a.sortOrder - b.sortOrder)
                                    .map((cat) => (
                                        <li key={cat.categoryId}>
                                            <Link
                                                to={`/collections/${cat.categoryId}`}
                                                className={cn(
                                                    category?.categoryId === cat.categoryId
                                                        ? "text-primary font-medium"
                                                        : "text-muted-foreground",
                                                    "hover:text-primary",
                                                )}
                                            >
                                                {cat.categoryName}
                                            </Link>
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    </div>

                    {/* Products grid */}
                    <div className="lg:w-4/5 xl:w-5/6">
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="bg-white p-4 rounded-lg border">
                                        <Skeleton className="aspect-square w-full mb-4" />
                                        <Skeleton className="h-6 w-3/4 mb-2" />
                                        <div className="flex justify-end">
                                            <Skeleton className="h-8 w-16" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <>
                                {products.length === 0 ? (
                                    <div className="bg-muted/20 rounded-lg p-8 text-center">
                                        <h3 className="text-lg font-medium mb-2">No products</h3>
                                        <p className="text-muted-foreground">There are currently no products in this category.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {products.map((product) => (
                                            <ProductCardComponent
                                                key={product.productId}
                                                product={product}
                                                categoryId={actualCategoryId || category?.categoryId.toString() || ""}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
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

// Helper function to conditionally join class names
function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(" ")
}

export default CollectionSlug

