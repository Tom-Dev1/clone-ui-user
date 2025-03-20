import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { get, put } from "@/api/axiosUtils"
import { isAuthenticated, isSalesManager, getToken } from "@/utils/auth-utils"
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
    requestStatus: "Pending" | "Approved" | "Completed" | "Canceled"
    requestProductDetails: RequestProductDetail[]
    agencyName?: string // Thêm tên đại lý nếu có
}

export default function SalesOrders() {
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
    const [dateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
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
        if (!isSalesManager()) {
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
                // Lấy token từ auth-service
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
                if (statusFilter === "Completed") return order.requestStatus === "Completed"
                if (statusFilter === "Canceled") return order.requestStatus === "Canceled"

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

    // Phê duyệt đơn hàng
    const handleApproveOrder = async (requestProductId: string) => {
        try {
            // Kiểm tra quyền SALES_MANAGER
            if (!isSalesManager()) {
                alert("Bạn không có quyền phê duyệt đơn hàng")
                return
            }

            // Lấy token từ auth-service
            const token = getToken()

            if (!token) {
                navigate("/login")
                return
            }

            // Gọi API với token trong header
            const response = await put(`/request-products/${requestProductId}/approve`, {})

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

    // Xác nhận hoàn thành đơn hàng
    // const handleCompleteOrder = async (requestProductId: string) => {
    //     try {
    //         // Kiểm tra quyền SALES_MANAGER
    //         if (!isSalesManager()) {
    //             alert("Bạn không có quyền xác nhận hoàn thành đơn hàng")
    //             return
    //         }

    //         // Lấy token từ auth-service
    //         const token = getToken()

    //         if (!token) {
    //             navigate("/login")
    //             return
    //         }

    //         const response = await put(`/request-product/${requestProductId}/complete`, {})

    //         if (response.success) {
    //             // Cập nhật trạng thái đơn hàng trong state
    //             const updatedOrders = orders.map((order) =>
    //                 order.requestProductId === requestProductId
    //                     ? { ...order, requestStatus: "Completed" as const, updatedAt: new Date().toISOString() }
    //                     : order,
    //             )
    //             setOrders(updatedOrders)

    //             // Nếu đang xem chi tiết đơn hàng này, cập nhật thông tin
    //             if (selectedOrder && selectedOrder.requestProductId === requestProductId) {
    //                 setSelectedOrder({
    //                     ...selectedOrder,
    //                     requestStatus: "Completed",
    //                     updatedAt: new Date().toISOString(),
    //                 })
    //             }

    //             alert("Đơn hàng đã được xác nhận hoàn thành!")
    //         } else {
    //             alert("Không thể xác nhận hoàn thành đơn hàng. Vui lòng thử lại sau.")
    //         }
    //     } catch (err) {
    //         console.error("Error completing order:", err)

    //         // Kiểm tra lỗi xác thực
    //         if (err instanceof Error && err.message.includes("401")) {
    //             navigate("/login")
    //             return
    //         }

    //         alert("Đã xảy ra lỗi khi xác nhận hoàn thành đơn hàng")
    //     }
    // }

    // Hủy đơn hàng
    const handleCancelOrder = async (requestProductId: string) => {
        try {
            // Kiểm tra quyền SALES_MANAGER
            if (!isSalesManager()) {
                alert("Bạn không có quyền hủy đơn hàng")
                return
            }

            // Lấy token từ auth-service
            const token = getToken()

            if (!token) {
                navigate("/login")
                return
            }

            const response = await put(`/request-products/${requestProductId}/cancel`, {})

            if (response.success) {
                // Cập nhật trạng thái đơn hàng trong state
                const updatedOrders = orders.map((order) =>
                    order.requestProductId === requestProductId
                        ? { ...order, requestStatus: "Canceled" as const, updatedAt: new Date().toISOString() }
                        : order,
                )
                setOrders(updatedOrders)

                // Nếu đang xem chi tiết đơn hàng này, cập nhật thông tin
                if (selectedOrder && selectedOrder.requestProductId === requestProductId) {
                    setSelectedOrder({
                        ...selectedOrder,
                        requestStatus: "Canceled",
                        updatedAt: new Date().toISOString(),
                    })
                }

                alert("Đơn hàng đã được hủy thành công!")
            } else {
                alert("Không thể hủy đơn hàng. Vui lòng thử lại sau.")
            }
        } catch (err) {
            console.error("Error cancelling order:", err)

            // Kiểm tra lỗi xác thực
            if (err instanceof Error && err.message.includes("401")) {
                navigate("/login")
                return
            }

            alert("Đã xảy ra lỗi khi hủy đơn hàng")
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
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Chờ duyệt
                    </span>
                )
            case "Approved":
                return (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Đã duyệt
                    </span>
                )
            case "Completed":
                return (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Hoàn thành
                    </span>
                )
            case "Canceled":
                return (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Đã hủy
                    </span>
                )
            default:
                return (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {status}
                    </span>
                )
        }
    }

    // Format ngày giờ
    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",

        })
    }

    return (
        <SalesLayout>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>

                    <div className="flex items-center space-x-2">
                        <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
                            Lọc theo trạng thái:
                        </label>
                        <select
                            id="status-filter"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        >
                            <option value="all">Tất cả</option>
                            <option value="Pending">Chờ duyệt</option>
                            <option value="Approved">Đã duyệt</option>
                            <option value="Canceled">Đã hủy</option>
                        </select>
                    </div>
                </div>

                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Tìm kiếm đơn hàng..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {isLoading ? (
                    <div className="text-center py-8">
                        <p>Đang tải dữ liệu...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-8">
                        <p>Không tìm thấy đơn hàng nào.</p>
                    </div>
                ) : (
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Mã đơn hàng
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Ngày tạo
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Đại lý
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Số SP
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Tổng SL
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Trạng thái
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredOrders.map((order) => (
                                        <tr key={order.requestProductId} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {order.requestProductId.substring(0, 8)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDateTime(order.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.agencyName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {getTotalProductTypes(order)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getTotalQuantity(order)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{renderStatusBadge(order.requestStatus)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex justify-around ml-2">
                                                    <button
                                                        onClick={() => handleViewOrderDetail(order)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        Chi tiết
                                                    </button>
                                                    {order.requestStatus === "Pending" && (
                                                        <button
                                                            onClick={() => handleApproveOrder(order.requestProductId)}
                                                            className="text-green-600 hover:text-green-900"
                                                        >
                                                            Duyệt
                                                        </button>
                                                    )}

                                                    {(order.requestStatus === "Pending") && (
                                                        <button
                                                            onClick={() => handleCancelOrder(order.requestProductId)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Hủy
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Order Detail Modal */}
                {selectedOrder && showOrderDetail && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold">Chi tiết đơn hàng #{selectedOrder.requestProductId}</h2>
                                    <button onClick={() => setShowOrderDetail(false)} className="text-gray-500 hover:text-gray-700">
                                        ✕
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <p className="text-sm text-gray-500">Đại lý</p>
                                        <p className="font-medium">{selectedOrder.agencyName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Ngày tạo</p>
                                        <p className="font-medium">{formatDateTime(selectedOrder.createdAt)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Trạng thái</p>
                                        <p className="font-medium">{renderStatusBadge(selectedOrder.requestStatus)}</p>
                                    </div>
                                    {selectedOrder.updatedAt && (
                                        <div>
                                            <p className="text-sm text-gray-500">Ngày cập nhật</p>
                                            <p className="font-medium">{formatDateTime(selectedOrder.updatedAt)}</p>
                                        </div>
                                    )}
                                </div>

                                <h3 className="font-medium mb-2">Sản phẩm</h3>
                                <table className="min-w-full divide-y divide-gray-200 mb-4">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Mã SP
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Tên sản phẩm
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Đơn vị
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Số lượng
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Đơn giá
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {selectedOrder.requestProductDetails.map((detail) => (
                                            <tr key={detail.requestDetailId}>
                                                <td className="px-4 py-3 text-sm text-gray-900">{detail.product.productCode}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{detail.product.productName}</td>
                                                <td className="px-4 py-3 text-sm text-gray-500">{detail.unit}</td>
                                                <td className="px-4 py-3 text-sm text-gray-500">{detail.quantity}</td>
                                                <td className="px-4 py-3 text-sm text-gray-500">{detail.price.toLocaleString("vi-VN")} đ</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="flex justify-end space-x-2 mt-6">
                                    <button
                                        onClick={() => setShowOrderDetail(false)}
                                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                    >
                                        Đóng
                                    </button>

                                    {selectedOrder.requestStatus === "Pending" && (
                                        <button
                                            onClick={() => {
                                                handleApproveOrder(selectedOrder.requestProductId)
                                                setShowOrderDetail(false)
                                            }}
                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                        >
                                            Phê duyệt
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </SalesLayout>
    )
}

