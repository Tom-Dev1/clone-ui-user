"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Skeleton } from "../../components/ui/skeleton"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../../components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../../components/ui/alert-dialog"
import { AgencyLayout } from "@/layouts/agency-layout"

// Định nghĩa các interface cho dữ liệu
interface RequestProduct {
    requestProductId: string
    agencyId: number
    approvedBy: number
    createdAt: string
    updatedAt: string
    requestStatus: string
}

interface OrderDetail {
    orderDetailId: string
    orderId: string
    productId: number
    quantity: number
    price: number
    discount: number
    finalPrice: number
    product?: {
        productId: number
        productName: string
        price: number
    }
}

interface Order {

    orderId: string
    orderCode: number
    orderDate: string
    salesAgentId: number
    discount: number
    finalPrice: number
    status: string
    requestCode: number
    requestProduct: RequestProduct
    orderDetails: OrderDetail[]
}

// Component chính
const AgencyOrders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([])
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
    const [isAlertDialogOpen, setIsAlertDialogOpen] = useState<boolean>(false)
    const [orderToCancel, setOrderToCancel] = useState<string | null>(null)
    const [actionLoading, setActionLoading] = useState<boolean>(false)

    const token = localStorage.getItem("auth_token") || ""

    // Hàm để lấy danh sách đơn hàng
    const fetchOrders = async () => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch("https://minhlong.mlhr.org/api/orders/my-orders", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            })

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`)
            }

            const data = await response.json()
            setOrders(data)
            setFilteredOrders(data)
        } catch (err) {
            console.error("Failed to fetch orders:", err)
            setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.")
        } finally {
            setLoading(false)
        }
    }

    // Gọi API khi component được mount
    useEffect(() => {
        if (token) {
            fetchOrders()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token])

    // Lọc đơn hàng khi searchTerm hoặc statusFilter thay đổi
    useEffect(() => {
        if (orders.length > 0) {
            let filtered = [...orders]

            // Lọc theo trạng thái
            if (statusFilter !== "all") {
                filtered = filtered.filter((order) => order.status === statusFilter)
            }

            // Lọc theo từ khóa tìm kiếm
            if (searchTerm.trim() !== "") {
                filtered = filtered.filter(
                    (order) =>
                        order.orderId.toLowerCase().includes(searchTerm.toLowerCase())

                )
            }

            setFilteredOrders(filtered)
        }
    }, [searchTerm, statusFilter, orders])

    // Hàm để hiển thị trạng thái đơn hàng
    const renderStatusBadge = (status: string) => {
        let variant: "default" | "secondary" | "destructive" | "outline" = "default"

        switch (status) {
            case "WaitPaid":
                variant = "outline"
                return <Badge variant={variant}>Chờ thanh toán</Badge>
            case "Paid":
                variant = "default"
                return <Badge variant={variant}>Đã thanh toán</Badge>
            case "Processing":
                variant = "secondary"
                return <Badge variant={variant}>Đang xử lý</Badge>
            case "Delivery":
                variant = "secondary"
                return <Badge variant={variant}>Đang giao hàng</Badge>
            case "Canceled":
                variant = "destructive"
                return <Badge variant={variant}>Đã hủy</Badge>
            default:
                return <Badge variant={variant}>{status}</Badge>
        }
    }

    // Hàm để xem chi tiết đơn hàng trong popup
    const viewOrderDetails = (order: Order) => {
        setSelectedOrder(order)
        setIsDialogOpen(true)
    }

    // Hàm để thanh toán đơn hàng
    const handlePayment = async (orderId: string) => {
        setActionLoading(true)
        try {
            const response = await fetch(`https://minhlong.mlhr.org/api/orders/${orderId}/payment`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            })

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`)
            }

            // Cập nhật lại danh sách đơn hàng sau khi thanh toán thành công
            fetchOrders()
            alert("Thanh toán đơn hàng thành công!")
        } catch (err) {
            console.error("Failed to pay for order:", err)
            alert("Không thể thanh toán đơn hàng. Vui lòng thử lại sau.")
        } finally {
            setActionLoading(false)
        }
    }

    // Hàm để mở dialog xác nhận hủy đơn hàng
    const confirmCancelOrder = (orderId: string) => {
        setOrderToCancel(orderId)
        setIsAlertDialogOpen(true)
    }
    console.log("orderToCancel", orderToCancel);

    // Hàm để hủy đơn hàng
    const handleCancelOrder = async () => {
        if (!orderToCancel) return

        setActionLoading(true)
        try {
            const response = await fetch(`https://minhlong.mlhr.org/api/orders/${orderToCancel}/cancel`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            })

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`)
            }

            // Cập nhật lại danh sách đơn hàng sau khi hủy thành công
            fetchOrders()
            alert("Hủy đơn hàng thành công!")
        } catch (err) {
            console.error("Failed to cancel order:", err)
            alert("Không thể hủy đơn hàng. Vui lòng thử lại sau.")
        } finally {
            setActionLoading(false)
            setIsAlertDialogOpen(false)
            setOrderToCancel(null)
        }
    }

    // Hàm để định dạng ngày tháng đơn giản
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString)
            return (
                date.toLocaleDateString("vi-VN") +
                " " +
                date.toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                })
            )
        } catch (error) {
            console.log("Error formatting date:", error);

            return dateString
        }
    }

    // Render loading state
    if (loading) {
        return (
            <AgencyLayout>
                <div className="container mx-auto py-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Đơn hàng của tôi</CardTitle>
                            <CardDescription>Danh sách đơn hàng của bạn</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <div key={index} className="flex items-center space-x-4">
                                        <Skeleton className="h-12 w-full" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AgencyLayout>
        )
    }

    // Render error state
    if (error) {
        return (
            <AgencyLayout>
                <div className="container mx-auto py-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Đơn hàng của tôi</CardTitle>
                            <CardDescription>Danh sách đơn hàng của bạn</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center py-12">
                                <p className="text-red-500 mb-4">{error}</p>
                                <Button onClick={fetchOrders}>Thử lại</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AgencyLayout>
        )
    }

    return (
        <AgencyLayout>
            <div className="container mx-auto py-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Đơn hàng của tôi</CardTitle>
                        <CardDescription>Danh sách đơn hàng của bạn</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="flex-1">
                                <Input
                                    placeholder="Tìm kiếm theo mã đơn hàng..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            <div className="w-full md:w-64">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Lọc theo trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                        <SelectItem value="WaitPaid">Chờ thanh toán</SelectItem>
                                        <SelectItem value="Paid">Đã thanh toán</SelectItem>
                                        <SelectItem value="Processing">Đang xử lý</SelectItem>
                                        <SelectItem value="Delivery">Đang giao hàng</SelectItem>
                                        <SelectItem value="Canceled">Đã hủy</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {filteredOrders.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500">Không tìm thấy đơn hàng nào</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Mã đơn hàng</TableHead>
                                            <TableHead>Ngày đặt</TableHead>
                                            <TableHead >Trạng thái</TableHead>
                                            <TableHead className="text-center">Tổng tiền</TableHead>
                                            <TableHead className="text-center">Thao tác</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredOrders.map((order) => (
                                            <TableRow key={order.orderId}>
                                                <TableCell className="font-medium">{order.orderCode}</TableCell>
                                                <TableCell>{formatDate(order.orderDate)}</TableCell>
                                                <TableCell>{renderStatusBadge(order.status)}</TableCell>
                                                <TableCell className="text-center">{order.finalPrice.toLocaleString("vi-VN")} đ</TableCell>
                                                <TableCell className="w-60">
                                                    <div className="flex ml-2 gap-3">
                                                        <div>
                                                            <Button variant="outline" size="sm" onClick={() => viewOrderDetails(order)}>
                                                                Xem chi tiết
                                                            </Button>
                                                        </div>
                                                        <div className="gap-3 flex">
                                                            {order.status === "WaitPaid" && (
                                                                <>
                                                                    <div>
                                                                        <Button
                                                                            variant="default"
                                                                            size="sm"
                                                                            onClick={() => handlePayment(order.orderId)}
                                                                            disabled={actionLoading}
                                                                        >
                                                                            Thanh toán
                                                                        </Button>
                                                                    </div>
                                                                    <div>
                                                                        <Button
                                                                            variant="destructive"
                                                                            size="sm"
                                                                            onClick={() => confirmCancelOrder(order.orderId)}
                                                                            disabled={actionLoading}
                                                                        >
                                                                            Hủy
                                                                        </Button>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Dialog để hiển thị chi tiết đơn hàng */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Chi tiết đơn hàng</DialogTitle>
                            <DialogDescription>Mã đơn hàng: {selectedOrder?.orderId}</DialogDescription>
                        </DialogHeader>

                        {selectedOrder && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Ngày đặt hàng</p>
                                        <p>{formatDate(selectedOrder.orderDate)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Trạng thái</p>
                                        <div className="mt-1">{renderStatusBadge(selectedOrder.status)}</div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Mã yêu cầu</p>
                                        <p>{selectedOrder.orderCode}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Trạng thái yêu cầu</p>
                                        <p>{selectedOrder.requestProduct.requestStatus}</p>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <h3 className="text-lg font-medium">Chi tiết sản phẩm</h3>
                                    {selectedOrder.orderDetails.length === 0 ? (
                                        <p className="text-gray-500 mt-2">Không có thông tin chi tiết sản phẩm</p>
                                    ) : (
                                        <div className="mt-2 border rounded-md">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Sản phẩm</TableHead>
                                                        <TableHead className="text-right">Số lượng</TableHead>
                                                        <TableHead className="text-right">Đơn giá</TableHead>
                                                        <TableHead className="text-right">Thành tiền</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {selectedOrder.orderDetails.map((detail) => (
                                                        <TableRow key={detail.orderDetailId}>
                                                            <TableCell>{detail.product?.productName || `Sản phẩm #${detail.productId}`}</TableCell>
                                                            <TableCell className="text-right">{detail.quantity}</TableCell>
                                                            <TableCell className="text-right">{detail.price.toLocaleString("vi-VN")} đ</TableCell>
                                                            <TableCell className="text-right">
                                                                {detail.finalPrice.toLocaleString("vi-VN")} đ
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Giảm giá</p>
                                        <p>{selectedOrder.discount.toLocaleString("vi-VN")} đ</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Tổng tiền</p>
                                        <p className="text-xl font-bold">{selectedOrder.finalPrice.toLocaleString("vi-VN")} đ</p>
                                    </div>
                                </div>

                                {selectedOrder.status === "WaitPaid" && (
                                    <div className="flex justify-end space-x-2 pt-4">
                                        <Button
                                            variant="default"
                                            onClick={() => {
                                                setIsDialogOpen(false)
                                                handlePayment(selectedOrder.orderId)
                                            }}
                                            disabled={actionLoading}
                                        >
                                            Thanh toán
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={() => {
                                                setIsDialogOpen(false)
                                                confirmCancelOrder(selectedOrder.orderId)
                                            }}
                                            disabled={actionLoading}
                                        >
                                            Hủy đơn hàng
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        <DialogFooter>
                            <Button onClick={() => setIsDialogOpen(false)}>Đóng</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* AlertDialog để xác nhận hủy đơn hàng */}
                <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận hủy đơn hàng</AlertDialogTitle>
                            <AlertDialogDescription>
                                Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={actionLoading}>Hủy bỏ</AlertDialogCancel>
                            <AlertDialogAction onClick={handleCancelOrder} disabled={actionLoading}>
                                Xác nhận
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AgencyLayout>
    )
}

export default AgencyOrders

