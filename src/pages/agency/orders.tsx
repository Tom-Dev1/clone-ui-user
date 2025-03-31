"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
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
import { useAuth } from "@/contexts/AuthContext"
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

// Định nghĩa các interface cho dữ liệu
interface OrderDetail {
    orderDetailId: string
    orderId: string
    productId: number
    productName: string
    quantity: number
    unitPrice: number
    totalAmount: number
    unit: string
    createdAt: string
}

interface Order {
    orderId: string
    orderCode: string
    orderDate: string
    discount: number
    agencyId: number
    finalPrice: number
    status: string
    salesName: string
    agencyName: string
    requestCode: string
    orderDetails: OrderDetail[]
}

// Định nghĩa kiểu cho hướng sắp xếp
type SortDirection = "asc" | "desc"

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

    // State cho sắp xếp
    const [sortField, setSortField] = useState<string>("orderDate")
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

    // State cho phân trang
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [itemsPerPage] = useState<number>(15)

    // Thêm state mới cho dialog thanh toán và số tiền
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState<boolean>(false)
    const [paymentAmount, setPaymentAmount] = useState<string>("")
    const [orderToPayment, setOrderToPayment] = useState<Order | null>(null)
    const [paymentDescription, setPaymentDescription] = useState<string>("")

    const token = localStorage.getItem("auth_token") || ""
    const { user } = useAuth()
    console.log(user)

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

    // Hàm sắp xếp đơn hàng
    const sortOrders = (data: Order[], field: string, direction: SortDirection): Order[] => {
        return [...data].sort((a, b) => {
            let compareResult = 0

            switch (field) {
                case "orderCode":
                    compareResult = a.orderCode.localeCompare(b.orderCode)
                    break
                case "orderDate":
                    compareResult = new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime()
                    break
                case "finalPrice":
                    compareResult = a.finalPrice - b.finalPrice
                    break
                case "status":
                    compareResult = a.status.localeCompare(b.status)
                    break
                default:
                    compareResult = 0
            }

            return direction === "asc" ? compareResult : -compareResult
        })
    }

    // Hàm xử lý khi thay đổi trường sắp xếp
    const handleSortChange = (field: string) => {
        if (field === sortField) {
            // Nếu click vào cùng một trường, đảo ngược hướng sắp xếp
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            // Nếu click vào trường khác, đặt trường mới và hướng mặc định là desc
            setSortField(field)
            setSortDirection("desc")
        }
        // Reset về trang đầu tiên khi thay đổi sắp xếp
        setCurrentPage(1)
    }

    // Hàm hiển thị biểu tượng sắp xếp
    const renderSortIcon = (field: string) => {
        if (field !== sortField) {
            return <ArrowUpDown className="ml-2 h-4 w-4" />
        }

        return sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
    }

    // Lọc và sắp xếp đơn hàng khi searchTerm, statusFilter, sortField hoặc sortDirection thay đổi
    useEffect(() => {
        if (orders.length > 0) {
            let filtered = [...orders]

            // Lọc theo trạng thái
            if (statusFilter !== "all") {
                filtered = filtered.filter((order) => order.status === statusFilter)
            }

            // Lọc theo từ khóa tìm kiếm
            if (searchTerm.trim() !== "") {
                const searchTermLower = searchTerm.toLowerCase()
                filtered = filtered.filter(
                    (order) =>
                        order.orderCode.toLowerCase().includes(searchTermLower) ||
                        order.agencyName.toLowerCase().includes(searchTermLower) ||
                        order.requestCode.toLowerCase().includes(searchTermLower) ||
                        order.salesName.toLowerCase().includes(searchTermLower),
                )
            }

            // Sắp xếp dữ liệu
            filtered = sortOrders(filtered, sortField, sortDirection)

            setFilteredOrders(filtered)
            // Reset về trang đầu tiên khi thay đổi bộ lọc
            setCurrentPage(1)
        }
    }, [searchTerm, statusFilter, orders, sortField, sortDirection])

    // Tính toán các giá trị cho phân trang
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem)

    // Hàm để thay đổi trang
    const paginate = (pageNumber: number) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber)
        }
    }

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

    // Cập nhật hàm confirmPayment để mở dialog thanh toán
    const confirmPayment = (order: Order) => {
        setOrderToPayment(order)
        setPaymentAmount("")
        setPaymentDescription(`${order.orderCode}`)
        setIsPaymentDialogOpen(true)
    }

    // Cập nhật hàm handlePayment để sử dụng API mới
    const handlePayment = async () => {
        if (!orderToPayment || !paymentAmount || Number.parseFloat(paymentAmount) <= 0) {
            alert("Vui lòng nhập số tiền hợp lệ")
            return
        }

        setActionLoading(true)
        try {
            const userId = user?.id
            if (!userId) {
                throw new Error("Không tìm thấy thông tin người dùng")
            }

            const paymentData = {
                orderId: orderToPayment.orderId,
                agencyId: orderToPayment.agencyId,
                price: Number.parseFloat(paymentAmount),
                description: paymentDescription,
            }

            const response = await fetch(`https://minhlong.mlhr.org/api/Payment/${userId}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(paymentData),
            })

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`)
            }

            const paymentResponse = await response.json()

            // Đóng dialog thanh toán
            setIsPaymentDialogOpen(false)

            // Kiểm tra xem có checkoutUrl không và chuyển hướng
            if (paymentResponse && paymentResponse.checkoutUrl) {
                // Chuyển hướng đến trang thanh toán
                window.location.href = paymentResponse.checkoutUrl
            } else {
                // Nếu không có checkoutUrl, hiển thị thông báo lỗi
                console.error("Không tìm thấy URL thanh toán trong phản hồi:", paymentResponse)
                alert("Không thể tạo liên kết thanh toán. Vui lòng thử lại sau.")
                // Cập nhật lại danh sách đơn hàng
                fetchOrders()
            }
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
            return date.toLocaleDateString("vi-VN") + " "
        } catch (error) {
            console.log("Error formatting date:", error)
            return dateString
        }
    }

    // Render loading state
    if (loading) {
        return (
            <AgencyLayout>
                <div className="container mx-auto py-6">
                    <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="flex items-center space-x-4">
                                <Skeleton className="h-12 w-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </AgencyLayout>
        )
    }

    // Render error state
    if (error) {
        return (
            <AgencyLayout>
                <div className="container mx-auto py-6">
                    <div className="flex flex-col items-center justify-center py-12">
                        <p className="text-red-500 mb-4">{error}</p>
                        <Button onClick={fetchOrders}>Thử lại</Button>
                    </div>
                </div>
            </AgencyLayout>
        )
    }

    return (
        <AgencyLayout>
            <div className="m-4">
                <div className="mb-4">
                    <h1 className="text-2xl font-bold">Quản Lý đơn hàng của tôi</h1>
                    <p className="text-gray-500 mt-1">Xem lại đơn hàng mà bạn đã yêu cầu</p>
                </div>

                <div className="bg-white p-4 rounded-md shadow-sm">
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <Input
                                placeholder="Tìm kiếm theo mã đơn hàng, đại lý, nhân viên..."
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
                                        <TableHead className="cursor-pointer" onClick={() => handleSortChange("orderCode")}>
                                            <div className="flex items-center">
                                                Mã đơn hàng
                                                {renderSortIcon("orderCode")}
                                            </div>
                                        </TableHead>
                                        <TableHead>Đại lý</TableHead>
                                        <TableHead>Người duyệt</TableHead>
                                        <TableHead className="cursor-pointer" onClick={() => handleSortChange("orderDate")}>
                                            <div className="flex items-center">
                                                Ngày đặt
                                                {renderSortIcon("orderDate")}
                                            </div>
                                        </TableHead>
                                        <TableHead className="cursor-pointer" onClick={() => handleSortChange("status")}>
                                            <div className="flex items-center">
                                                Trạng thái
                                                {renderSortIcon("status")}
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-center cursor-pointer" onClick={() => handleSortChange("finalPrice")}>
                                            <div className="flex items-center justify-center">
                                                Tổng tiền
                                                {renderSortIcon("finalPrice")}
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-center">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentItems.map((order) => (
                                        <TableRow key={order.orderId}>
                                            <TableCell className="font-medium">{order.orderCode}</TableCell>
                                            <TableCell>{order.agencyName}</TableCell>
                                            <TableCell>{order.salesName}</TableCell>
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
                                                                        onClick={() => confirmPayment(order)}
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

                            {/* Phân trang */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-4">
                                    <div className="text-sm text-gray-500">
                                        Hiển thị {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredOrders.length)} của{" "}
                                        {filteredOrders.length} đơn hàng
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => paginate(1)} disabled={currentPage === 1}>
                                            <ChevronsLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => paginate(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>

                                        <div className="flex items-center space-x-1">
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                // Hiển thị 5 trang xung quanh trang hiện tại
                                                let pageToShow
                                                if (totalPages <= 5) {
                                                    // Nếu tổng số trang <= 5, hiển thị tất cả các trang
                                                    pageToShow = i + 1
                                                } else if (currentPage <= 3) {
                                                    // Nếu đang ở gần đầu, hiển thị 5 trang đầu tiên
                                                    pageToShow = i + 1
                                                } else if (currentPage >= totalPages - 2) {
                                                    // Nếu đang ở gần cuối, hiển thị 5 trang cuối cùng
                                                    pageToShow = totalPages - 4 + i
                                                } else {
                                                    // Nếu đang ở giữa, hiển thị 2 trang trước và 2 trang sau
                                                    pageToShow = currentPage - 2 + i
                                                }

                                                return (
                                                    <Button
                                                        key={pageToShow}
                                                        variant={currentPage === pageToShow ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => paginate(pageToShow)}
                                                        className="w-8 h-8 p-0"
                                                    >
                                                        {pageToShow}
                                                    </Button>
                                                )
                                            })}
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => paginate(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => paginate(totalPages)}
                                            disabled={currentPage === totalPages}
                                        >
                                            <ChevronsRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Dialog để hiển thị chi tiết đơn hàng */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Chi tiết đơn hàng</DialogTitle>
                            <DialogDescription>Mã đơn hàng: {selectedOrder?.orderCode}</DialogDescription>
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
                                        <p className="text-sm font-medium text-gray-500">Đại lý</p>
                                        <p>{selectedOrder.agencyName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Người duyệt đơn</p>
                                        <p>{selectedOrder.salesName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Mã yêu cầu</p>
                                        <p>{selectedOrder.requestCode}</p>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <h3 className="text-lg font-medium">Chi tiết sản phẩm</h3>
                                    {selectedOrder.orderDetails.length === 0 ? (
                                        <p className="text-gray-500 mt-2">Không có thông tin chi tiết sản phẩm</p>
                                    ) : (
                                        <div className="bg-white rounded-lg border overflow-hidden">
                                            <div className="overflow-x-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Sản phẩm</TableHead>
                                                            <TableHead>Đơn vị</TableHead>
                                                            <TableHead className="text-right">Số lượng</TableHead>
                                                            <TableHead className="text-right">Đơn giá</TableHead>
                                                            <TableHead className="text-right">Thành tiền</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {selectedOrder.orderDetails.map((detail) => (
                                                            <TableRow key={detail.orderDetailId}>
                                                                <TableCell>
                                                                    {detail.productName !== "N/A" ? detail.productName : `Sản phẩm #${detail.productId}`}
                                                                </TableCell>
                                                                <TableCell>{detail.unit}</TableCell>
                                                                <TableCell className="text-right">{detail.quantity}</TableCell>
                                                                <TableCell className="text-right">
                                                                    {detail.unitPrice.toLocaleString("vi-VN")} đ
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    {detail.totalAmount.toLocaleString("vi-VN")} đ
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
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
                                                confirmPayment(selectedOrder)
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

                {/* Dialog để nhập số tiền thanh toán */}
                <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Thanh toán đơn hàng</DialogTitle>
                            <DialogDescription>
                                Nhập số tiền bạn muốn thanh toán cho đơn hàng {orderToPayment?.orderCode}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="amount" className="text-right">
                                    Số tiền
                                </label>
                                <Input
                                    id="amount"
                                    type="number"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    placeholder="Nhập số tiền"
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="description" className="text-right">
                                    Mô tả
                                </label>
                                <Input
                                    id="description"
                                    value={paymentDescription}
                                    onChange={(e) => setPaymentDescription(e.target.value)}
                                    placeholder="Mô tả thanh toán"
                                    className="col-span-3"
                                />
                            </div>
                            {orderToPayment && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <span className="text-right">Tổng tiền</span>
                                    <span className="col-span-3 font-medium">{orderToPayment.finalPrice.toLocaleString("vi-VN")} đ</span>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                                Hủy
                            </Button>
                            <Button onClick={handlePayment} disabled={actionLoading}>
                                {actionLoading ? "Đang xử lý..." : "Thanh toán"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AgencyLayout>
    )
}

export default AgencyOrders

