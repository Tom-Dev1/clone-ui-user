"use client"

import { useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useCart } from "@/hooks/use-cart"
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { isSalesManager } from "@/utils/auth-utils"
import { SalesLayout } from "@/layouts/sale-layout"

const SalesCart = () => {
    const navigate = useNavigate()
    const { items, removeItem, updateItemQuantity, clearAllItems } = useCart()
    const isSales = isSalesManager()

    // Redirect if not a sales manager
    useEffect(() => {
        if (!isSales) {
            navigate("/login")
        }
    }, [isSales, navigate])

    const handleQuantityChange = (productId: number, newQuantity: number) => {
        if (newQuantity < 1) return
        updateItemQuantity(productId, newQuantity)
    }

    const handleRemoveItem = (productId: number) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
            removeItem(productId)
        }
    }

    const handleClearCart = () => {
        if (window.confirm("Bạn có chắc chắn muốn xóa tất cả sản phẩm?")) {
            clearAllItems()
        }
    }

    const handleCheckout = () => {
        // Here you would implement the checkout process
        alert("Chức năng thanh toán sẽ được triển khai ở đây")
    }

    if (!isSales) {
        return null
    }

    return (
        <SalesLayout>

            <div className="py-8 mx-10">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Giỏ hàng của bạn</h1>
                    <div className="flex gap-2">
                        {items.length > 0 && (
                            <Button variant="outline" onClick={handleClearCart}>
                                Xóa tất cả
                            </Button>
                        )}
                        <Button onClick={() => navigate("/collections")}>Tiếp tục mua hàng</Button>
                    </div>
                </div>

                {items.length === 0 ? (
                    <div className="bg-muted/20 rounded-lg p-8 text-center">
                        <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-medium mb-2">Giỏ hàng trống</h3>
                        <p className="text-muted-foreground mb-4">Bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
                        <Button onClick={() => navigate("/collections")}>Khám phá sản phẩm</Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {items.map((item) => (
                                <Card key={item.productId} className="overflow-hidden">
                                    <div className="aspect-[1/1] relative">
                                        {item.image ? (
                                            <img
                                                src={item.image || "/placeholder.svg"}
                                                alt={item.productName}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    ; (e.target as HTMLImageElement).src = "/placeholder.svg?height=300&width=400"
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-muted flex items-center justify-center">
                                                <span className="text-muted-foreground">Không có hình ảnh</span>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => handleRemoveItem(item.productId)}
                                            className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full hover:bg-white text-red-500"
                                            title="Xóa sản phẩm"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <CardContent className="p-4">
                                        <div className="mb-3">
                                            <Link
                                                to={`/product/${item.productId}`}
                                                className="font-medium line-clamp-2 hover:text-primary transition-colors"
                                            >
                                                {item.productName}
                                            </Link>
                                            <div className="text-sm text-muted-foreground mt-1">
                                                Mã: {item.productCode} | Đơn vị: {item.unit}
                                            </div>
                                        </div>

                                        <Separator className="my-3" />

                                        <div className="flex items-center justify-between">
                                            <div className="text-sm font-medium">Số lượng:</div>
                                            <div className="flex items-center border rounded-md">
                                                <button
                                                    onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                                    className="px-2 py-1 border-r hover:bg-muted/20"
                                                    title="Giảm số lượng"
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="px-3 py-1">{item.quantity}</span>
                                                <button
                                                    onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                                    className="px-2 py-1 border-l hover:bg-muted/20"
                                                    title="Tăng số lượng"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm mt-8">
                            <h3 className="text-lg font-medium mb-4">Tóm tắt đơn hàng</h3>
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between">
                                    <span>Tổng số sản phẩm:</span>
                                    <span>{items.length} loại</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tổng số lượng:</span>
                                    <span>{items.reduce((total, item) => total + item.quantity, 0)} đơn vị</span>
                                </div>
                            </div>
                            <Button onClick={handleCheckout} className="w-full" size="lg">
                                Tiến hành đặt hàng <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

        </SalesLayout>
    )
}

export default SalesCart

