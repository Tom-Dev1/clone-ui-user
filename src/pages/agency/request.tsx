"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AgencyLayout } from "@/layouts/agency-layout"
import { ResponsiveContainer } from "@/components/responsive-container"
import { isAuthenticated, isAgency } from "@/utils/auth-utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, FileText, ShoppingCart } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { get } from "@/api/axiosUtils"

// Định nghĩa kiểu dữ liệu cho sản phẩm
interface Product {
    productId: number
    productCode: string
    productName: string
    createdBy: string
    createdDate: string
    updatedBy: string
    updatedDate: string
    unit: string
    defaultExpiration: number
    categoryId: number
    description: string
    taxId: number
    images: string[] | null
    availableStock: number
    requestProductDetail: string[]
}

// Định nghĩa kiểu dữ liệu cho chi tiết yêu cầu sản phẩm
interface RequestProductDetail {
    requestDetailId: number
    requestProductId: string
    productId: number
    quantity: number
    price: number
    unit: string
    product: Product
}

// Định nghĩa kiểu dữ liệu cho yêu cầu sản phẩm
interface RequestProduct {
    requestProductId: string
    agencyId: number
    approvedBy: number | null
    createdAt: string
    updatedAt: string
    requestStatus: "Pending" | "Approved" | "Rejected" | "Completed"
    requestProductDetails: RequestProductDetail[]
}

// Định nghĩa kiểu dữ liệu cho response từ API
interface ApiResponse<T> {
    result: T
    isSuccess: boolean
    message: string
}

export default function AgencyRequests() {
    const navigate = useNavigate()
    const [requests, setRequests] = useState<RequestProduct[]>([])
    const [filteredRequests, setFilteredRequests] = useState<RequestProduct[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [selectedRequest, setSelectedRequest] = useState<RequestProduct | null>(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)

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

    // Lấy dữ liệu từ API
    useEffect(() => {
        const fetchRequests = async () => {
            setIsLoading(true)
            setError(null)

            try {
                const response = await get<ApiResponse<RequestProduct[]>>("request-products/my-request-product")

                // Kiểm tra xem response.result có tồn tại và là một mảng không
                if (response.result && Array.isArray(response.result)) {
                    setRequests(response.result)
                    setFilteredRequests(response.result)
                } else {
                    console.error("Invalid response format:", response)
                    setError("Định dạng dữ liệu không hợp lệ")
                    setRequests([])
                    setFilteredRequests([])
                }
            } catch (err) {
                console.error("Error fetching requests:", err)
                setError("Đã xảy ra lỗi khi tải dữ liệu yêu cầu")
                setRequests([])
                setFilteredRequests([])
            } finally {
                setIsLoading(false)
            }
        }

        fetchRequests()
    }, [])

    // Lọc yêu cầu theo trạng thái và từ khóa tìm kiếm
    useEffect(() => {
        if (!Array.isArray(requests)) {
            setFilteredRequests([])
            return
        }

        let filtered = [...requests]

        // Lọc theo trạng thái
        if (statusFilter !== "all") {
            filtered = filtered.filter((request) => request.requestStatus.toLowerCase() === statusFilter.toLowerCase())
        }

        // Lọc theo từ khóa tìm kiếm
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(
                (request) =>
                    request.requestProductId.toLowerCase().includes(query) ||
                    request.requestProductDetails.some(
                        (detail) =>
                            detail.product.productName.toLowerCase().includes(query) ||
                            detail.product.productCode.toLowerCase().includes(query),
                    ),
            )
        }

        setFilteredRequests(filtered)
    }, [requests, statusFilter, searchQuery])

    // Hiển thị trạng thái yêu cầu
    const renderStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
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
            case "rejected":
                return (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        Từ chối
                    </Badge>
                )
            case "completed":
                return (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Hoàn thành
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
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
    }

    // Tính tổng giá trị yêu cầu
    const calculateTotalValue = (details: RequestProductDetail[]) => {
        return details.reduce((total, detail) => total + detail.price * detail.quantity, 0)
    }

    // Xem chi tiết yêu cầu
    const viewRequestDetail = (request: RequestProduct) => {
        setSelectedRequest(request)
        setIsDetailOpen(true)
    }

    return (
        <AgencyLayout>
            <div className="py-8">
                <ResponsiveContainer>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Theo dõi yêu cầu sản phẩm</h1>

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
                                <option value="rejected">Từ chối</option>
                            </select>
                        </div>
                    </div>

                    <div className="mb-4">
                        <Input
                            type="text"
                            placeholder="Tìm kiếm yêu cầu..."
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
                    ) : filteredRequests.length === 0 ? (
                        <div className="text-center py-8">
                            <p>Không tìm thấy yêu cầu nào.</p>
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
                                                Mã yêu cầu
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
                                                Cập nhật
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
                                        {filteredRequests.map((request) => (
                                            <tr key={request.requestProductId} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {request.requestProductId.substring(0, 8)}...
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDateTime(request.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDateTime(request.updatedAt)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">{renderStatusBadge(request.requestStatus)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="flex items-center gap-1"
                                                        onClick={() => viewRequestDetail(request)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        Chi tiết
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </ResponsiveContainer>
            </div>

            {/* Dialog hiển thị chi tiết yêu cầu */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Chi tiết yêu cầu sản phẩm
                        </DialogTitle>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <p className="text-sm text-gray-500">Mã yêu cầu:</p>
                                    <p className="font-medium">{selectedRequest.requestProductId}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Trạng thái:</p>
                                    <div className="mt-1">{renderStatusBadge(selectedRequest.requestStatus)}</div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Ngày tạo:</p>
                                    <p className="font-medium">{formatDateTime(selectedRequest.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Cập nhật lần cuối:</p>
                                    <p className="font-medium">{formatDateTime(selectedRequest.updatedAt)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Mã đại lý:</p>
                                    <p className="font-medium">{selectedRequest.agencyId}</p>
                                </div>
                                {selectedRequest.approvedBy && (
                                    <div>
                                        <p className="text-sm text-gray-500">Người duyệt:</p>
                                        <p className="font-medium">ID: {selectedRequest.approvedBy}</p>
                                    </div>
                                )}
                            </div>

                            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5" />
                                Danh sách sản phẩm
                            </h3>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Mã SP</TableHead>
                                        <TableHead>Tên sản phẩm</TableHead>
                                        <TableHead>Đơn vị</TableHead>
                                        <TableHead className="text-right">Số lượng</TableHead>
                                        <TableHead className="text-right">Đơn giá</TableHead>
                                        <TableHead className="text-right">Thành tiền</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selectedRequest.requestProductDetails.map((detail) => (
                                        <TableRow key={detail.requestDetailId}>
                                            <TableCell className="font-medium">{detail.product.productCode}</TableCell>
                                            <TableCell>{detail.product.productName}</TableCell>
                                            <TableCell>{detail.unit}</TableCell>
                                            <TableCell className="text-right">{detail.quantity}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(detail.price)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(detail.price * detail.quantity)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <div className="mt-4 text-right">
                                <p className="text-sm text-gray-500">Tổng giá trị:</p>
                                <p className="text-xl font-bold">
                                    {formatCurrency(calculateTotalValue(selectedRequest.requestProductDetails))}
                                </p>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                                    Đóng
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AgencyLayout>
    )
}

