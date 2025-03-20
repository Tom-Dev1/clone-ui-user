"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AgencyLayout } from "@/layouts/agency-layout"
import { ResponsiveContainer } from "@/components/responsive-container"
import { isAuthenticated, isAgency } from "@/utils/auth-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, ShoppingCart, Loader2, AlertCircle } from "lucide-react"
import { useCart } from "@/hooks/use-cart"

export default function AgencyProductRequest() {
    const navigate = useNavigate()
    const { cartItems, itemCount, totalPrice, removeItem, updateItemQuantity, clearCart } = useCart()

    const [note, setNote] = useState<string>("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [agencyName, setAgencyName] = useState<string>("")
    const [quantityErrors, setQuantityErrors] = useState<Record<number, string>>({})

    // Kiểm tra xác thực và quyền truy cập
    useEffect(() => {
        if (!isAuthenticated()) {
            navigate("/login")
            return
        }

        if (!isAgency()) {
            navigate("/unauthorized")
            return
        }

        // Trong thực tế, bạn sẽ lấy tên đại lý từ thông tin người dùng đã đăng nhập
        setAgencyName("Đại lý ABC")
    }, [navigate])

    // Xử lý thay đổi số lượng
    const handleQuantityChange = (productId: number, newQuantity: number) => {
        const item = cartItems.find((item) => item.productId === productId)

        if (!item) return

        // Kiểm tra giới hạn số lượng
        if (newQuantity < 1) {
            setQuantityErrors((prev) => ({
                ...prev,
                [productId]: "Số lượng tối thiểu là 1",
            }))
            updateItemQuantity(productId, 1)
            return
        }

        if (newQuantity > item.availableStock) {
            setQuantityErrors((prev) => ({
                ...prev,
                [productId]: `Số lượng tối đa là ${item.availableStock} ${item.unit}`,
            }))
            updateItemQuantity(productId, item.availableStock)
            return
        }

        // Xóa lỗi nếu số lượng hợp lệ
        if (quantityErrors[productId]) {
            setQuantityErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors[productId]
                return newErrors
            })
        }

        updateItemQuantity(productId, newQuantity)
    }

    // Xử lý khi người dùng nhập trực tiếp vào input
    const handleQuantityInputChange = (productId: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = Number.parseInt(e.target.value, 10)

        if (isNaN(newValue)) {
            handleQuantityChange(productId, 1)
            return
        }

        handleQuantityChange(productId, newValue)
    }

    // Gửi yêu cầu sử dụng fetch API thay vì axios
    const handleSubmitRequest = async () => {
        if (cartItems.length === 0) {
            alert("Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi gửi yêu cầu.")
            return
        }

        // Kiểm tra lỗi số lượng
        if (Object.keys(quantityErrors).length > 0) {
            alert("Vui lòng sửa lỗi số lượng sản phẩm trước khi gửi yêu cầu.")
            return
        }

        setIsSubmitting(true)

        try {
            // Chuẩn bị dữ liệu theo định dạng yêu cầu
            const requestData = {
                agencyName,
                note,
                products: cartItems.map((item) => ({
                    productId: item.productId,
                    unit: item.unit,
                    quantity: item.quantity,
                })),
            }

            // Lấy token từ localStorage
            const token = localStorage.getItem("auth_token")

            // Gọi API để gửi yêu cầu sử dụng fetch
            const response = await fetch("https://minhlong.mlhr.org/api/request-products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token ? `Bearer ${token}` : "",
                },
                body: JSON.stringify(requestData),
            })

            // Kiểm tra Content-Type của response
            const contentType = response.headers.get("content-type")
            let data

            if (contentType && contentType.includes("application/json")) {
                // Nếu response là JSON, parse nó
                data = await response.json()
            } else {
                // Nếu không phải JSON, lấy text
                const text = await response.text()
                console.error("Non-JSON response:", text)

                // Ném lỗi với thông báo phù hợp
                throw new Error("Server trả về định dạng không hợp lệ. Vui lòng thử lại sau.")
            }

            if (!response.ok) {
                // Nếu response không thành công, ném lỗi với thông báo từ server
                throw new Error(data?.message || data?.error || `Lỗi ${response.status}: ${response.statusText}`)
            }

            // Hiển thị thông báo thành công
            alert("Yêu cầu đã được gửi thành công!")

            // Xóa giỏ hàng
            clearCart()

            // Reset form
            setNote("")

            // Chuyển hướng đến trang danh sách yêu cầu
            navigate("/agency/requests")
        } catch (error) {
            // Xử lý lỗi
            console.error("Error submitting request:", error)

            // Hiển thị thông báo lỗi
            alert("Bạn đã đặt hàng, Vui lòng thử lại sau 24h")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <AgencyLayout>
            <div className="py-8">
                <ResponsiveContainer>
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Yêu cầu sản phẩm</h1>
                        <p className="text-gray-500 mt-1">Xem lại và gửi yêu cầu đặt hàng sản phẩm</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                <span>Giỏ hàng của bạn</span>
                                <span className="text-sm font-normal bg-primary/10 text-primary px-3 py-1 rounded-full">
                                    {itemCount} sản phẩm
                                </span>
                            </CardTitle>
                            <CardDescription>Danh sách sản phẩm đã chọn</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {cartItems.length > 0 ? (
                                <div>
                                    <div className="border rounded-md overflow-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Sản phẩm</TableHead>
                                                    <TableHead>Đơn vị</TableHead>
                                                    <TableHead className="text-center">Số lượng</TableHead>
                                                    <TableHead className="text-right">Đơn giá</TableHead>
                                                    <TableHead className="text-right">Thành tiền</TableHead>
                                                    <TableHead className="w-[50px]"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {cartItems.map((item) => (
                                                    <TableRow key={item.productId}>
                                                        <TableCell>
                                                            <div>
                                                                <div className="font-medium">{item.productName}</div>
                                                                <div className="text-sm text-gray-500">{item.productCode}</div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{item.unit}</TableCell>
                                                        <TableCell className="text-center">
                                                            <div className="flex flex-col items-center">
                                                                <div className="flex items-center">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="icon"
                                                                        className="h-8 w-8"
                                                                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                                                        disabled={item.quantity <= 1}
                                                                    >
                                                                        -
                                                                    </Button>
                                                                    <input
                                                                        type="number"
                                                                        value={item.quantity}
                                                                        onChange={(e) => handleQuantityInputChange(item.productId, e)}
                                                                        min={1}
                                                                        max={item.availableStock}
                                                                        className="mx-2 w-16 text-center border rounded-md py-1"
                                                                        aria-label={`Số lượng ${item.productName}`}
                                                                    />
                                                                    <Button
                                                                        variant="outline"
                                                                        size="icon"
                                                                        className="h-8 w-8"
                                                                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                                                        disabled={item.quantity >= item.availableStock}
                                                                    >
                                                                        +
                                                                    </Button>
                                                                </div>
                                                                <div className="mt-1 text-xs">
                                                                    <span
                                                                        className={`${item.quantity >= item.availableStock
                                                                            ? "text-red-500"
                                                                            : item.quantity > item.availableStock * 0.8
                                                                                ? "text-orange-500"
                                                                                : "text-green-500"
                                                                            }`}
                                                                    >
                                                                        Có sẵn: {item.availableStock} {item.unit}
                                                                    </span>
                                                                </div>
                                                                {quantityErrors[item.productId] && (
                                                                    <div className="mt-1 text-xs text-red-500 flex items-center">
                                                                        <AlertCircle className="h-3 w-3 mr-1" />
                                                                        {quantityErrors[item.productId]}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">{(item.price || 0).toLocaleString("vi-VN")} đ</TableCell>
                                                        <TableCell className="text-right">
                                                            {((item.price || 0) * item.quantity).toLocaleString("vi-VN")} đ
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button variant="ghost" size="icon" onClick={() => removeItem(item.productId)}>
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    <div className="mt-4 p-4 bg-gray-50 rounded-md">
                                        <div className="flex justify-between font-medium">
                                            <span>Tổng cộng:</span>
                                            <span>{totalPrice.toLocaleString("vi-VN")} đ</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="note">Ghi chú</Label>
                                            <Textarea
                                                id="note"
                                                placeholder="Nhập ghi chú cho đơn hàng (nếu có)"
                                                value={note}
                                                onChange={(e) => setNote(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 border rounded-md">
                                    <ShoppingCart className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                                    <p className="text-gray-500 mb-4">Chưa có sản phẩm nào trong giỏ hàng</p>
                                    <Button onClick={() => navigate("/collections")}>Tiếp tục mua sắm</Button>
                                </div>
                            )}
                        </CardContent>
                        {cartItems.length > 0 && (
                            <CardFooter className="flex justify-between">
                                <Button variant="outline" onClick={() => navigate("/collections")}>
                                    Tiếp tục mua sắm
                                </Button>
                                <Button
                                    onClick={handleSubmitRequest}
                                    disabled={isSubmitting || cartItems.length === 0 || Object.keys(quantityErrors).length > 0}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        "Gửi yêu cầu"
                                    )}
                                </Button>
                            </CardFooter>
                        )}
                    </Card>
                </ResponsiveContainer>
            </div>
        </AgencyLayout>
    )
}

