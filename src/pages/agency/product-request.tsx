"use client"

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
import { Trash2, ShoppingCart, Loader2 } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import axios, { AxiosError } from "axios"
import { post } from "@/api/axiosUtils"

export default function AgencyProductRequest() {
    const navigate = useNavigate()
    const { items, removeItem, updateItemQuantity, clearAllItems } = useCart()

    const [note, setNote] = useState<string>("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [agencyName, setAgencyName] = useState<string>("")

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
        if (newQuantity > 0) {
            updateItemQuantity(productId, newQuantity)
        }
    }

    // Gửi yêu cầu
    const handleSubmitRequest = async () => {
        if (items.length === 0) {
            alert("Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi gửi yêu cầu.")
            return
        }

        setIsSubmitting(true)

        try {
            const requestData = {
                agencyName,
                note,
                products: items.map((item) => ({
                    productId: item.productId,
                    unit: item.unit,
                    quantity: item.quantity,
                })),
            }

            // Gọi API để gửi yêu cầu
            await post("/request-products", requestData)

            // Hiển thị thông báo thành công
            alert("Yêu cầu đã được gửi thành công!")
            clearAllItems()
            setNote("")

            // navigate("/agency/requests")
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<unknown>

                // Lấy thông báo lỗi từ response.data nếu có
                const errorMessage =

                    axiosError.message ||
                    "Đã xảy ra lỗi khi gửi yêu cầu. Vui lòng thử lại sau."

                console.error("API Error:", axiosError.response?.data)

                alert(errorMessage)
            }
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
                            <CardTitle>Giỏ hàng của bạn</CardTitle>
                            <CardDescription>Danh sách sản phẩm đã chọn</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {items.length > 0 ? (
                                <div>
                                    <div className="border rounded-md overflow-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Sản phẩm</TableHead>
                                                    <TableHead>Đơn vị</TableHead>
                                                    <TableHead className="text-center">Số lượng</TableHead>
                                                    <TableHead className="w-[50px]"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {items.map((item) => (
                                                    <TableRow key={item.productId}>
                                                        <TableCell>
                                                            <div>
                                                                <div className="font-medium">{item.productName}</div>
                                                                <div className="text-sm text-gray-500">{item.productCode}</div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{item.unit}</TableCell>
                                                        <TableCell className="text-center">
                                                            <div className="flex items-center justify-center">
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                    onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                                                    disabled={item.quantity <= 1}
                                                                >
                                                                    -
                                                                </Button>
                                                                <span className="mx-2 w-8 text-center">{item.quantity}</span>
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                    onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                                                >
                                                                    +
                                                                </Button>
                                                            </div>
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
                        {items.length > 0 && (
                            <CardFooter className="flex justify-between">
                                <Button variant="outline" onClick={() => navigate("/collections")}>
                                    Tiếp tục mua sắm
                                </Button>
                                <Button onClick={handleSubmitRequest} disabled={isSubmitting || items.length === 0}>
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

