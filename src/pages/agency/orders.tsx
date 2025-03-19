import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AgencyLayout } from "@/layouts/agency-layout"
import { ResponsiveContainer } from "@/components/responsive-container"
import { isAuthenticated, isAgency } from "@/utils/auth-utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, FileText, Download } from "lucide-react"

// Định nghĩa kiểu dữ liệu cho đơn hàng
interface OrderItem {
    productId: string
    productName: string
    quantity: number
    price: number
    unit: string
}

interface Order {
    id: string
    orderNumber: string
    createdDate: string
    status: "pending" | "approved" | "completed" | "cancelled"
    totalAmount: number
    items: OrderItem[]
}

export default function AgencyOrders() {
    const navigate = useNavigate()
    const [orders, setOrders] = useState<Order[]>([])
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [showOrderDetail, setShowOrderDetail] = useState(false)

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
    }, [navigate])

    // Dữ liệu mẫu
    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true)
            setError(null)

            try {
                // Trong thực tế, bạn sẽ gọi API để lấy dữ liệu
                // const response = await get<Order[]>("/api/agency/orders")

                // Dữ liệu mẫu
                const sampleOrders: Order[] = [
                    {
                        id: "ORD001",
                        orderNumber: "DH-2023001",
                        createdDate: "2023-11-15T10:30:00",
                        status: "completed",
                        totalAmount: 1250000,
                        items: [
                            {
                                productId: "P001",
                                productName: "Phân bón NPK",
                                quantity: 50,
                                price: 15000,
                                unit: "Kg",
                            },
                            {
                                productId: "P002",
                                productName: "Thuốc trừ sâu sinh học",
                                quantity: 5,
                                price: 85000,
                                unit: "Chai",
                            },
                        ],
                    },
                    {
                        id: "ORD002",
                        orderNumber: "DH-2023002",
                        createdDate: "2023-11-20T14:15:00",
                        status: "approved",
                        totalAmount: 650000,
                        items: [
                            {
                                productId: "P003",
                                productName: "Hạt giống lúa",
                                quantity: 10,
                                price: 45000,
                                unit: "Kg",
                            },
                            {
                                productId: "P004",
                                productName: "Phân bón lá",
                                quantity: 3,
                                price: 65000,
                                unit: "Chai",
                            },
                        ],
                    },
                    {
                        id: "ORD003",
                        orderNumber: "DH-2023003",
                        createdDate: "2023-11-25T09:45:00",
                        status: "pending",
                        totalAmount: 350000,
                        items: [
                            {
                                productId: "P005",
                                productName: "Chế phẩm vi sinh",
                                quantity: 10,
                                price: 35000,
                                unit: "Gói",
                            },
                        ],
                    },
                    {
                        id: "ORD004",
                        orderNumber: "DH-2023004",
                        createdDate: "2023-11-28T16:20:00",
                        status: "cancelled",
                        totalAmount: 425000,
                        items: [
                            {
                                productId: "P001",
                                productName: "Phân bón NPK",
                                quantity: 20,
                                price: 15000,
                                unit: "Kg",
                            },
                            {
                                productId: "P004",
                                productName: "Phân bón lá",
                                quantity: 1,
                                price: 65000,
                                unit: "Chai",
                            },
                        ],
                    },
                ]

                setOrders(sampleOrders)
                setFilteredOrders(sampleOrders)
            } catch (err) {
                console.error("Error fetching orders:", err)
                setError("Đã xảy ra lỗi khi tải dữ liệu đơn hàng")
            } finally {
                setIsLoading(false)
            }
        }

        fetchOrders()
    }, [])

    // Lọc đơn hàng theo trạng thái và từ khóa tìm kiếm
    useEffect(() => {
        let filtered = [...orders]

        // Lọc theo trạng thái
        if (statusFilter !== "all") {
            filtered = filtered.filter((order) => order.status === statusFilter)
        }

        // Lọc theo từ khóa tìm kiếm
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(
                (order) =>
                    order.orderNumber.toLowerCase().includes(query) ||
                    order.items.some((item) => item.productName.toLowerCase().includes(query)),
            )
        }

        setFilteredOrders(filtered)
    }, [orders, statusFilter, searchQuery])

    // Hiển thị chi tiết đơn hàng
    const handleViewOrderDetail = (order: Order) => {
        setSelectedOrder(order)
        setShowOrderDetail(true)
    }

    // Hiển thị trạng thái đơn hàng
    const renderStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        Chờ xử lý
                    </Badge>
                )
            case "approved":
                return (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Đã duyệt
                    </Badge>
                )
            case "completed":
                return (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Hoàn thành
                    </Badge>
                )
            case "cancelled":
                return (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        Đã hủy
                    </Badge>
                )
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    // Format ngày giờ
    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    // Format số tiền
    const formatCurrency = (amount: number) => {
        return amount.toLocaleString("vi-VN") + " đ"
    }

    return (
        <AgencyLayout>
            <div className="py-8">
                <ResponsiveContainer>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Theo dõi đơn hàng</h1>

                        <div className="flex items-center space-x-2">
                            <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
                                Lọc theo trạng thái:
                            </label>
                            <select
                                id="status-filter"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
                            >
                                <option value="all">Tất cả</option>
                                <option value="pending">Chờ xử lý</option>
                                <option value="approved">Đã duyệt</option>
                                <option value="completed">Hoàn thành</option>
                                <option value="cancelled">Đã hủy</option>
                            </select>
                        </div>
                    </div>

                    <div className="mb-4">
                        <Input
                            type="text"
                            placeholder="Tìm kiếm đơn hàng..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full"
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
                                                Ngày đặt
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
                                                Tổng tiền
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Trạng thái
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Thao tác
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredOrders.map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {order.orderNumber}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDateTime(order.createdDate)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.items.length}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatCurrency(order.totalAmount)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">{renderStatusBadge(order.status)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="flex items-center gap-1"
                                                            onClick={() => handleViewOrderDetail(order)}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            Chi tiết
                                                        </Button>
                                                        {order.status === "completed" && (
                                                            <Button variant="ghost" size="sm" className="flex items-center gap-1">
                                                                <FileText className="h-4 w-4" />
                                                                Hóa đơn
                                                            </Button>
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
                                        <h2 className="text-xl font-bold">Chi tiết đơn hàng #{selectedOrder.orderNumber}</h2>
                                        <button onClick={() => setShowOrderDetail(false)} className="text-gray-500 hover:text-gray-700">
                                            ✕
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <p className="text-sm text-gray-500">Ngày đặt</p>
                                            <p className="font-medium">{formatDateTime(selectedOrder.createdDate)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Trạng thái</p>
                                            <p className="font-medium">{renderStatusBadge(selectedOrder.status)}</p>
                                        </div>
                                    </div>

                                    <h3 className="font-medium mb-2">Sản phẩm</h3>
                                    <table className="min-w-full divide-y divide-gray-200 mb-4">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th
                                                    scope="col"
                                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Sản phẩm
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
                                                <th
                                                    scope="col"
                                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Thành tiền
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {selectedOrder.items.map((item) => (
                                                <tr key={item.productId}>
                                                    <td className="px-4 py-3 text-sm text-gray-900">{item.productName}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{item.unit}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{item.quantity}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{formatCurrency(item.price)}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">
                                                        {formatCurrency(item.quantity * item.price)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-md">
                                        <span className="font-medium">Tổng cộng:</span>
                                        <span className="font-bold">{formatCurrency(selectedOrder.totalAmount)}</span>
                                    </div>

                                    <div className="flex justify-end space-x-2 mt-6">
                                        <Button
                                            onClick={() => setShowOrderDetail(false)}
                                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                        >
                                            Đóng
                                        </Button>
                                        {selectedOrder.status === "completed" && (
                                            <Button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2">
                                                <Download className="h-4 w-4" />
                                                Tải hóa đơn
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </ResponsiveContainer>
            </div>
        </AgencyLayout>
    )
}

