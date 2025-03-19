
import { useState, useEffect } from "react"
import { ResponsiveContainer } from "@/components/responsive-container"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Eye, Search, ShoppingBag } from "lucide-react"
import { get, put } from "@/api/axiosUtils"

// Thêm import cho auth-utils và useNavigate
import { useNavigate } from "react-router-dom"
import { getUserRole, isAuthenticated, getToken } from "@/utils/auth-utils"
import { SalesLayout } from "@/layouts/sale-layout"

// Định nghĩa các kiểu dữ liệu
interface Product {
    productId: number
    productCode: string
    productName: string
    unit: string
    defaultExpiration: number
    categoryId: number
    description: string
    taxId: number
    images: string[]
    availableStock: number
}

interface RequestProductDetail {
    requestDetailId: number
    requestProductId: string
    productId: number
    quantity: number
    price: number
    unit: string
    product: Product
}

interface RequestProduct {
    requestProductId: string
    agencyId: number
    approvedBy: number | null
    createdAt: string
    updatedAt: string | null
    requestStatus: "Pending" | "Approved"
    requestProductDetails: RequestProductDetail[]
    agencyName?: string // Thêm tên đại lý nếu có
}

// Thay đổi phần đầu của component SalesOrders
const SalesOrders = () => {
    const navigate = useNavigate()
    // State cho danh sách đơn hàng
    const [orders, setOrders] = useState<RequestProduct[]>([])
    const [filteredOrders, setFilteredOrders] = useState<RequestProduct[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedOrder, setSelectedOrder] = useState<RequestProduct | null>(null)
    const [showOrderDetail, setShowOrderDetail] = useState(false)
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
        from: undefined,
        to: undefined,
    })

    // Kiểm tra xác thực và quyền truy cập
    useEffect(() => {
        // Kiểm tra xem người dùng đã đăng nhập chưa
        if (!isAuthenticated()) {
            navigate("/login")
            return
        }

        // Kiểm tra xem người dùng có quyền SALES_MANAGER không
        const userRole = getUserRole()
        if (userRole !== "4") {
            // "4" là mã cho SALES_MANAGER
            navigate("/unauthorized")
            return
        }
    }, [navigate])

    // Fetch đơn hàng từ API với token
    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true)
            setError(null)

            try {
                // Lấy token từ auth-utils
                const token = getToken()

                if (!token) {
                    navigate("/login")
                    return
                }

                const response = await get<RequestProduct[]>("/request-products")

                if (response.success && Array.isArray(response.result)) {
                    // Thêm tên đại lý mẫu (trong thực tế sẽ lấy từ API)
                    const ordersWithAgencyNames = response.result.map((order) => ({
                        ...order,
                        agencyName: `Đại lý ${order.agencyId}`,
                    }))

                    setOrders(ordersWithAgencyNames)
                    setFilteredOrders(ordersWithAgencyNames)
                } else {
                    setError("Không thể tải dữ liệu đơn hàng")
                }
            } catch (err) {
                console.error("Error fetching orders:", err)

                // Kiểm tra lỗi xác thực
                if (err instanceof Error && err.message.includes("401")) {
                    navigate("/login")
                    return
                }

                setError("Đã xảy ra lỗi khi tải dữ liệu đơn hàng")
            } finally {
                setIsLoading(false)
            }
        }

        fetchOrders()
    }, [navigate])

    // Lọc đơn hàng theo trạng thái, từ khóa tìm kiếm và khoảng thời gian
    useEffect(() => {
        let filtered = [...orders]

        // Lọc theo trạng thái
        if (statusFilter !== "all") {
            filtered = filtered.filter((order) => {
                if (statusFilter === "Pending") return order.requestStatus === "Pending"
                if (statusFilter === "Approved") return order.requestStatus === "Approved"

                return true
            })
        }

        // Lọc theo từ khóa tìm kiếm
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(
                (order) =>
                    order.requestProductId.toLowerCase().includes(query) ||
                    order.agencyName?.toLowerCase().includes(query) ||
                    order.requestProductDetails.some(
                        (detail) =>
                            detail.product.productName.toLowerCase().includes(query) ||
                            detail.product.productCode.toLowerCase().includes(query),
                    ),
            )
        }

        // Lọc theo khoảng thời gian
        if (dateRange.from) {
            filtered = filtered.filter((order) => new Date(order.createdAt) >= dateRange.from!)
        }
        if (dateRange.to) {
            const toDateEnd = new Date(dateRange.to)
            toDateEnd.setHours(23, 59, 59, 999)
            filtered = filtered.filter((order) => new Date(order.createdAt) <= toDateEnd)
        }

        setFilteredOrders(filtered)
    }, [orders, statusFilter, searchQuery, dateRange])

    // Hiển thị chi tiết đơn hàng
    const handleViewOrderDetail = (order: RequestProduct) => {
        setSelectedOrder(order)
        setShowOrderDetail(true)
    }

    // Cập nhật hàm handleApproveOrder để sử dụng token
    const handleApproveOrder = async (requestProductId: string) => {
        try {
            // Lấy token từ auth-utils
            const token = localStorage.getItem("auth_token");
            console.log("tokenn", token);

            if (!token) {
                navigate("/login")
                return
            }

            const response = await put(`request-products/${requestProductId}/approve`)

            if (response.success) {
                // Cập nhật trạng thái đơn hàng trong state
                const updatedOrders = orders.map((order) =>
                    order.requestProductId === requestProductId
                        ? { ...order, requestStatus: "Approved" as const, updatedAt: new Date().toISOString(), approvedBy: 4 }
                        : order,
                )
                setOrders(updatedOrders)

                // Nếu đang xem chi tiết đơn hàng này, cập nhật thông tin
                if (selectedOrder && selectedOrder.requestProductId === requestProductId) {
                    setSelectedOrder({
                        ...selectedOrder,
                        requestStatus: "Approved",
                        updatedAt: new Date().toISOString(),
                        approvedBy: 4,
                    })
                }

                alert("Đơn hàng đã được phê duyệt thành công!")
            } else {
                alert("Không thể phê duyệt đơn hàng. Vui lòng thử lại sau.")
            }
        } catch (err) {
            console.error("Error approving order:", err)

            // Kiểm tra lỗi xác thực
            if (err instanceof Error && err.message.includes("401")) {
                navigate("/login")
                return
            }

            alert("Đã xảy ra lỗi khi phê duyệt đơn hàng")
        }
    }

    // Tính tổng số lượng sản phẩm trong đơn hàng
    const getTotalQuantity = (order: RequestProduct) => {
        return order.requestProductDetails.reduce((total, detail) => total + detail.quantity, 0)
    }

    // Tính tổng số loại sản phẩm trong đơn hàng
    const getTotalProductTypes = (order: RequestProduct) => {
        return order.requestProductDetails.length
    }

    // Hiển thị trạng thái đơn hàng
    const renderStatusBadge = (status: string) => {
        switch (status) {
            case "Pending":
                return (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        Chờ duyệt
                    </Badge>
                )
            case "Approved":
                return (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Đã duyệt
                    </Badge>
                )
            case "Rejected":
                return (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        Từ chối
                    </Badge>
                )
            case "Completed":
                return (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Hoàn thành
                    </Badge>
                )
            case "Cancelled":
                return (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                        Đã hủy
                    </Badge>
                )
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    // Format ngày giờ


    return (
        <SalesLayout>
            <div className="py-8">
                <ResponsiveContainer>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Quản Lý Đơn Hàng</h1>
                    </div>

                    <Tabs defaultValue="all" className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <TabsList>
                                <TabsTrigger value="all" onClick={() => setStatusFilter("all")}>
                                    Tất cả
                                </TabsTrigger>

                            </TabsList>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <div className="relative flex-1 sm:flex-none">
                                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Tìm kiếm đơn hàng..."
                                        className="pl-8"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>


                            </div>
                        </div>

                        <TabsContent value="all" className="space-y-4">
                            {isLoading ? (
                                <div className="space-y-4">
                                    {Array.from({ length: 5 }).map((_, index) => (
                                        <div key={index} className="bg-muted/20 h-16 rounded-lg animate-pulse"></div>
                                    ))}
                                </div>
                            ) : error ? (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
                            ) : filteredOrders.length === 0 ? (
                                <div className="bg-muted/20 rounded-lg p-8 text-center">
                                    <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                    <h3 className="text-lg font-medium mb-2">Không tìm thấy đơn hàng</h3>
                                    <p className="text-muted-foreground mb-4">Không có đơn hàng nào phù hợp với điều kiện tìm kiếm.</p>
                                    <Button
                                        onClick={() => {
                                            setStatusFilter("all")
                                            setSearchQuery("")
                                            setDateRange({ from: undefined, to: undefined })
                                        }}
                                    >
                                        Xóa bộ lọc
                                    </Button>
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg border overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[180px]">Mã đơn hàng</TableHead>
                                                    <TableHead className="w-[180px]">Ngày tạo</TableHead>
                                                    <TableHead>Đại lý</TableHead>
                                                    <TableHead className="w-[100px]">Số SP</TableHead>
                                                    <TableHead className="w-[100px]">Tổng SL</TableHead>
                                                    <TableHead className="w-[120px]">Trạng thái</TableHead>
                                                    <TableHead className="w-[80px] text-right">Thao tác</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredOrders.map((order) => (
                                                    <TableRow key={order.requestProductId}>
                                                        <TableCell className="font-medium">{order.requestProductId.substring(0, 8)}</TableCell>
                                                        <TableCell>{order.createdAt}</TableCell>
                                                        <TableCell>{order.agencyName}</TableCell>
                                                        <TableCell>{getTotalProductTypes(order)}</TableCell>
                                                        <TableCell>{getTotalQuantity(order)}</TableCell>
                                                        <TableCell>{renderStatusBadge(order.requestStatus)}</TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleViewOrderDetail(order)}
                                                                    title="Xem chi tiết"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                                {order.requestStatus === "Pending" && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => handleApproveOrder(order.requestProductId)}
                                                                        title="Phê duyệt"
                                                                        className="text-green-600 hover:text-green-800 hover:bg-green-50"
                                                                    >
                                                                        <Check className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="Pending" className="space-y-4">
                            {/* Nội dung giống với tab "all" nhưng đã được lọc theo trạng thái */}
                        </TabsContent>

                        <TabsContent value="Approved" className="space-y-4">
                            {/* Nội dung giống với tab "all" nhưng đã được lọc theo trạng thái */}
                        </TabsContent>

                        <TabsContent value="Completed" className="space-y-4">
                            {/* Nội dung giống với tab "all" nhưng đã được lọc theo trạng thái */}
                        </TabsContent>
                    </Tabs>
                </ResponsiveContainer>
            </div>

            {/* Dialog xem chi tiết đơn hàng */}
            <Dialog open={showOrderDetail} onOpenChange={setShowOrderDetail}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Chi tiết đơn hàng</DialogTitle>
                        <DialogDescription>Mã đơn hàng: {selectedOrder?.requestProductId}</DialogDescription>
                    </DialogHeader>

                    {selectedOrder && (
                        <ScrollArea className="flex-1 pr-4">
                            <div className="space-y-6 py-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base">Thông tin đơn hàng</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <dl className="grid grid-cols-2 gap-1 text-sm">
                                                <dt className="text-muted-foreground">Mã đơn hàng:</dt>
                                                <dd>{selectedOrder.requestProductId}</dd>

                                                <dt className="text-muted-foreground">Ngày tạo:</dt>
                                                {/* <dd>{formatDateTime(selectedOrder.createdAt)}</dd> */}

                                                <dt className="text-muted-foreground">Đại lý:</dt>
                                                <dd>{selectedOrder.agencyName}</dd>

                                                <dt className="text-muted-foreground">Trạng thái:</dt>
                                                <dd>{renderStatusBadge(selectedOrder.requestStatus)}</dd>
                                            </dl>
                                        </CardContent>
                                    </Card>

                                    {(selectedOrder.requestStatus === "Approved") && (
                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-base">Thông tin phê duyệt</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <dl className="grid grid-cols-2 gap-1 text-sm">
                                                    <dt className="text-muted-foreground">Người phê duyệt:</dt>
                                                    <dd>ID: {selectedOrder.approvedBy}</dd>

                                                    <dt className="text-muted-foreground">Ngày phê duyệt:</dt>
                                                    {/* <dd>{selectedOrder.updatedAt ? formatDateTime(selectedOrder.updatedAt) : "N/A"}</dd> */}
                                                </dl>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Danh sách sản phẩm</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[80px]">Mã SP</TableHead>
                                                    <TableHead>Tên sản phẩm</TableHead>
                                                    <TableHead className="w-[80px]">Đơn vị</TableHead>
                                                    <TableHead className="w-[100px]">Số lượng</TableHead>
                                                    <TableHead className="w-[100px]">Đơn giá</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {selectedOrder.requestProductDetails.map((detail) => (
                                                    <TableRow key={detail.requestDetailId}>
                                                        <TableCell>{detail.product.productCode}</TableCell>
                                                        <TableCell>{detail.product.productName}</TableCell>
                                                        <TableCell>{detail.product.unit}</TableCell>
                                                        <TableCell>{detail.quantity}</TableCell>
                                                        <TableCell>{detail.price > 0 ? `${detail.price.toLocaleString()} đ` : "N/A"}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </div>
                        </ScrollArea>
                    )}

                    <DialogFooter className="pt-4">
                        <Button variant="outline" onClick={() => setShowOrderDetail(false)}>
                            Đóng
                        </Button>
                        {selectedOrder?.requestStatus === "Pending" && (
                            <Button onClick={() => handleApproveOrder(selectedOrder.requestProductId)}>Phê duyệt đơn hàng</Button>
                        )}

                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </SalesLayout>
    )
}

export default SalesOrders

