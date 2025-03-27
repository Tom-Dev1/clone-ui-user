"use client"

import { useState, useEffect } from "react"
import { ResponsiveContainer } from "@/components/responsive-container"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { CalendarIcon, ClipboardList, CirclePlus, Eye, Filter, Search } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { SalesLayout } from "@/layouts/sale-layout"
import ExportRequestCreateDialog from "@/components/sales/dialogs/export-request-detail-dialog"

// Define the API response interfaces
interface RequestExportDetail {
    requestExportDetailId: number
    productId: number
    requestedQuantity: number
}

interface ApiRequestExport {
    requestExportId: number
    orderId: string
    requestedBy: number
    approvedBy: number | null
    status: "Processing" | "Requested" | "Approved"
    approvedDate: string | null
    note: string | null
    requestExportDetails: RequestExportDetail[]
}

interface ApiProduct {
    productId: number
    productCode: string
    productName: string
    unit: string
    defaultExpiration: number
    categoryId: number
    description: string
    taxId: number
    createdBy: string
    createdDate: string
    availableStock: number
    price: number
    images: string[]
}

// Sửa hàm getToken để lấy auth_token thay vì auto_token
const getToken = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("auth_token")
    }
    return null
}

// Đảm bảo fetchWithAuth sử dụng Bearer token đúng cách
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = getToken()
    if (!token) {
        throw new Error("Authentication token not found")
    }

    const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
    }

    const response = await fetch(url, {
        ...options,
        headers,
    })

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
    }

    return response.json()
}

const SalesExports = () => {
    const [exportRequests, setExportRequests] = useState<ApiRequestExport[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedRequest, setSelectedRequest] = useState<ApiRequestExport | null>(null)
    const [detailsOpen, setDetailsOpen] = useState<boolean>(false)
    const [products, setProducts] = useState<ApiProduct[]>([])
    const [, setLoadingProducts] = useState<boolean>(false)
    const [, setProductError] = useState<string | null>(null)
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
        from: undefined,
        to: undefined,
    })
    const [filteredRequests, setFilteredRequests] = useState<ApiRequestExport[]>([])
    const [authError, setAuthError] = useState<string | null>(null)
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [baseRequestId, setBaseRequestId] = useState<number | null>(null)
    const [alertMessage, setAlertMessage] = useState<{
        type: "error" | "success" | null
        title: string
        message: string
    }>({ type: null, title: "", message: "" })

    // Check for authentication token
    useEffect(() => {
        const token = getToken()
        if (!token) {
            setAuthError("Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.")
            setLoading(false)
        }
    }, [])

    // Fetch export requests from API
    useEffect(() => {
        const fetchExportRequests = async () => {
            if (authError) return

            try {
                setLoading(true)
                const data = await fetchWithAuth("https://minhlong.mlhr.org/api/RequestExport/all")
                setExportRequests(data)
                setFilteredRequests(data)
                setError(null)
            } catch (err) {
                console.error("Error fetching export requests:", err)
                setError("Failed to load export requests. Please try again later.")
            } finally {
                setLoading(false)
            }
        }

        fetchExportRequests()
    }, [authError])

    // Fetch products for displaying product details
    useEffect(() => {
        const fetchProducts = async () => {
            if (authError) return

            try {
                setLoadingProducts(true)
                const data = await fetchWithAuth("https://minhlong.mlhr.org/api/product")
                setProducts(data)
                setProductError(null)
            } catch (err) {
                console.error("Error fetching products:", err)
                setProductError("Failed to load products. Please try again later.")
            } finally {
                setLoadingProducts(false)
            }
        }

        fetchProducts()
    }, [authError])

    // Filter export requests based on status, search query, and date range
    useEffect(() => {
        let filtered = [...exportRequests]

        // Filter by status
        if (statusFilter !== "all") {
            filtered = filtered.filter((request) => request.status === statusFilter)
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(
                (request) =>
                    request.orderId.toLowerCase().includes(query) ||
                    (request.note && request.note.toLowerCase().includes(query)) ||
                    request.requestExportId.toString().includes(query),
            )
        }

        // Filter by date range
        if (dateRange.from) {
            filtered = filtered.filter((request) => {
                if (!request.approvedDate) return false
                return new Date(request.approvedDate) >= dateRange.from!
            })
        }
        if (dateRange.to) {
            filtered = filtered.filter((request) => {
                if (!request.approvedDate) return false
                return new Date(request.approvedDate) <= dateRange.to!
            })
        }

        setFilteredRequests(filtered)
    }, [exportRequests, statusFilter, searchQuery, dateRange])

    // Clear alert after 5 seconds
    useEffect(() => {
        if (alertMessage.type) {
            const timer = setTimeout(() => {
                setAlertMessage({ type: null, title: "", message: "" })
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [alertMessage])

    const handleViewDetails = (request: ApiRequestExport) => {
        setSelectedRequest(request)
        setDetailsOpen(true)
    }

    // Cập nhật hàm handleCreateRequest để chỉ hiển thị thông báo thành công
    const handleCreateRequest = async (requestData: ApiRequestExport) => {
        try {
            // Refresh danh sách yêu cầu sau khi tạo thành công
            const fetchExportRequests = async () => {
                try {
                    setLoading(true)
                    const data = await fetchWithAuth("https://minhlong.mlhr.org/api/RequestExport/all")
                    setExportRequests(data)
                    setFilteredRequests(data)
                    setError(null)
                } catch (err) {
                    console.error("Error fetching export requests:", err)
                    setError("Failed to load export requests. Please try again later.")
                } finally {
                    setLoading(false)
                }
            }

            // Hiển thị thông báo thành công
            setAlertMessage({
                type: "success",
                title: "Thành công",
                message: `Yêu cầu xuất kho #${requestData.requestExportId} đã được liên kết với kho.`,
            })

            // Gọi API để lấy danh sách yêu cầu mới
            fetchExportRequests()

            // Đóng dialog
            setCreateDialogOpen(false)
            setBaseRequestId(null)
        } catch (err) {
            console.error("Error handling export request:", err)
            setAlertMessage({
                type: "error",
                title: "Lỗi",
                message: "Không thể cập nhật danh sách yêu cầu xuất kho. Vui lòng thử lại sau.",
            })
        }
    }

    const handleCreateBasedOn = (requestId: number) => {
        setBaseRequestId(requestId)
        setCreateDialogOpen(true)
    }

    // Get product by ID
    const getProduct = (productId: number) => {
        return products.find((p) => p.productId === productId)
    }

    // Get product name by ID
    const getProductName = (productId: number) => {
        const product = getProduct(productId)
        return product ? product.productName : `Product ID: ${productId}`
    }

    // Get product code by ID
    const getProductCode = (productId: number) => {
        const product = getProduct(productId)
        return product ? product.productCode : "N/A"
    }

    // Get product unit by ID
    const getProductUnit = (productId: number) => {
        const product = getProduct(productId)
        return product ? product.unit : "N/A"
    }

    // Get product price by ID
    const getProductPrice = (productId: number) => {
        const product = getProduct(productId)
        return product ? product.price : 0
    }

    // Get product image by ID
    const getProductImage = (productId: number) => {
        const product = getProduct(productId)
        return product && product.images && product.images.length > 0 ? product.images[0] : null
    }

    // Render status badge
    const renderStatusBadge = (status: string) => {
        switch (status) {
            case "Requested":
                return (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        Chờ duyệt
                    </Badge>
                )
            case "Approved":
                return (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Đã duyệt
                    </Badge>
                )
            case "Processing":
                return (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Đang xử lý
                    </Badge>
                )
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }


    //
    // Format date
    const formatDate = (dateString: string | null) => {
        if (!dateString) return "N/A"
        try {
            return format(new Date(dateString), "dd/MM/yyyy HH:mm")
        } catch (error) {
            console.log(error);

            return "Invalid date"
        }
    }

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
    }

    // Calculate total requested quantity
    const getTotalRequestedQuantity = (request: ApiRequestExport) => {
        return request.requestExportDetails.reduce((total, item) => total + item.requestedQuantity, 0)
    }

    // Calculate total value of request
    const getTotalValue = (request: ApiRequestExport) => {
        return request.requestExportDetails.reduce((total, item) => {
            const price = getProductPrice(item.productId)
            return total + price * item.requestedQuantity
        }, 0)
    }

    if (authError) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{authError}</p>
                    <Button onClick={() => (window.location.href = "/login")}>Đăng nhập</Button>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Đang tải yêu cầu xuất kho...</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()}>Thử lại</Button>
                </div>
            </div>
        )
    }

    return (
        <SalesLayout>
            <div className="py-8">
                <ResponsiveContainer>
                    {alertMessage.type && (
                        <Alert variant={alertMessage.type === "error" ? "destructive" : "default"} className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>{alertMessage.title}</AlertTitle>
                            <AlertDescription>{alertMessage.message}</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Quản Lý Yêu Cầu Xuất Kho</h1>

                    </div>

                    <Tabs defaultValue="all" className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <TabsList>
                                <TabsTrigger value="all" onClick={() => setStatusFilter("all")}>
                                    Tất cả
                                </TabsTrigger>
                                <TabsTrigger value="Requested" onClick={() => setStatusFilter("Requested")}>
                                    Chờ duyệt
                                </TabsTrigger>
                                <TabsTrigger value="Approved" onClick={() => setStatusFilter("Approved")}>
                                    Đã duyệt
                                </TabsTrigger>
                                <TabsTrigger value="Processing" onClick={() => setStatusFilter("Processing")}>
                                    Đang xử lý
                                </TabsTrigger>
                            </TabsList>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <div className="relative flex-1 sm:flex-none">
                                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Tìm kiếm yêu cầu..."
                                        className="pl-8"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" size="icon">
                                            <Filter className="h-4 w-4" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-4" align="end">
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-sm">Lọc theo ngày</h4>
                                            <div className="flex flex-col gap-2">
                                                <div className="grid gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <Label className="text-xs">Từ ngày</Label>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="w-full justify-start text-left font-normal"
                                                                >
                                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                                    {dateRange.from ? format(dateRange.from, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0" align="start">
                                                                <Calendar
                                                                    mode="single"
                                                                    selected={dateRange.from}
                                                                    onSelect={(date) => setDateRange({ ...dateRange, from: date })}
                                                                    initialFocus
                                                                    locale={vi}
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Label className="text-xs">Đến ngày</Label>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="w-full justify-start text-left font-normal"
                                                                >
                                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                                    {dateRange.to ? format(dateRange.to, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0" align="start">
                                                                <Calendar
                                                                    mode="single"
                                                                    selected={dateRange.to}
                                                                    onSelect={(date) => setDateRange({ ...dateRange, to: date })}
                                                                    initialFocus
                                                                    locale={vi}
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setDateRange({ from: undefined, to: undefined })}
                                                >
                                                    Xóa bộ lọc
                                                </Button>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <TabsContent value="all" className="space-y-4">
                            {filteredRequests.length === 0 ? (
                                <div className="bg-muted/20 rounded-lg p-8 text-center">
                                    <ClipboardList className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                    <h3 className="text-lg font-medium mb-2">Không tìm thấy yêu cầu xuất kho</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Không có yêu cầu xuất kho nào phù hợp với điều kiện tìm kiếm.
                                    </p>
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
                                                    <TableHead className="w-[120px]">Mã yêu cầu</TableHead>
                                                    <TableHead className="w-[120px]">Mã đơn hàng</TableHead>
                                                    <TableHead className="w-[120px]">Ngày duyệt</TableHead>
                                                    <TableHead>Ghi chú</TableHead>
                                                    <TableHead className="w-[100px]">Số SP</TableHead>
                                                    <TableHead className="w-[100px]">Tổng SL</TableHead>
                                                    <TableHead className="w-[120px]">Tổng giá trị</TableHead>
                                                    <TableHead className="w-[120px]">Trạng thái</TableHead>
                                                    <TableHead className="w-[120px] text-right">Thao tác</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredRequests.map((request) => (
                                                    <TableRow key={request.requestExportId}>
                                                        <TableCell className="font-medium">{request.requestExportId}</TableCell>
                                                        <TableCell>{request.orderId.substring(0, 8)}...</TableCell>
                                                        <TableCell>{formatDate(request.approvedDate)}</TableCell>
                                                        <TableCell>{request.note || "Không có ghi chú"}</TableCell>
                                                        <TableCell>{request.requestExportDetails.length}</TableCell>
                                                        <TableCell>{getTotalRequestedQuantity(request)}</TableCell>
                                                        <TableCell>{formatCurrency(getTotalValue(request))}</TableCell>
                                                        <TableCell>{renderStatusBadge(request.status)}</TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleViewDetails(request)}
                                                                    title="Xem chi tiết"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleCreateBasedOn(request.requestExportId)}
                                                                    title="Tạo yêu cầu dựa trên yêu cầu này"
                                                                >
                                                                    <CirclePlus className="h-4 w-4" />
                                                                </Button>
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

                        <TabsContent value="Requested" className="space-y-4">
                            {/* Content is filtered by the useEffect */}
                        </TabsContent>

                        <TabsContent value="Approved" className="space-y-4">
                            {/* Content is filtered by the useEffect */}
                        </TabsContent>

                        <TabsContent value="Processing" className="space-y-4">
                            {/* Content is filtered by the useEffect */}
                        </TabsContent>
                    </Tabs>
                </ResponsiveContainer>
            </div>

            {/* Dialog for viewing export request details */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Chi tiết yêu cầu xuất kho</DialogTitle>
                        <DialogDescription>Mã yêu cầu: {selectedRequest?.requestExportId}</DialogDescription>
                    </DialogHeader>

                    {selectedRequest && (
                        <ScrollArea className="flex-1 pr-4">
                            <div className="space-y-6 py-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base">Thông tin yêu cầu</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <dl className="grid grid-cols-2 gap-1 text-sm">
                                                <dt className="text-muted-foreground">Mã yêu cầu:</dt>
                                                <dd>{selectedRequest.requestExportId}</dd>

                                                <dt className="text-muted-foreground">Mã đơn hàng:</dt>
                                                <dd>{selectedRequest.orderId}</dd>

                                                <dt className="text-muted-foreground">Người yêu cầu:</dt>
                                                <dd>ID: {selectedRequest.requestedBy}</dd>

                                                <dt className="text-muted-foreground">Trạng thái:</dt>
                                                <dd>{renderStatusBadge(selectedRequest.status)}</dd>

                                                {selectedRequest.approvedBy && (
                                                    <>
                                                        <dt className="text-muted-foreground">Người duyệt:</dt>
                                                        <dd>ID: {selectedRequest.approvedBy}</dd>
                                                    </>
                                                )}

                                                {selectedRequest.approvedDate && (
                                                    <>
                                                        <dt className="text-muted-foreground">Ngày duyệt:</dt>
                                                        <dd>{formatDate(selectedRequest.approvedDate)}</dd>
                                                    </>
                                                )}

                                                {selectedRequest.note && (
                                                    <>
                                                        <dt className="text-muted-foreground">Ghi chú:</dt>
                                                        <dd>{selectedRequest.note}</dd>
                                                    </>
                                                )}
                                            </dl>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base">Thông tin tổng hợp</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <dl className="grid grid-cols-2 gap-1 text-sm">
                                                <dt className="text-muted-foreground">Số lượng sản phẩm:</dt>
                                                <dd>{selectedRequest.requestExportDetails.length}</dd>

                                                <dt className="text-muted-foreground">Tổng số lượng:</dt>
                                                <dd>{getTotalRequestedQuantity(selectedRequest)}</dd>

                                                <dt className="text-muted-foreground">Tổng giá trị:</dt>
                                                <dd className="font-medium">{formatCurrency(getTotalValue(selectedRequest))}</dd>
                                            </dl>
                                        </CardContent>
                                    </Card>
                                </div>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Danh sách sản phẩm</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[60px]"></TableHead>
                                                    <TableHead className="w-[80px]">Mã SP</TableHead>
                                                    <TableHead>Tên sản phẩm</TableHead>
                                                    <TableHead className="w-[80px]">Đơn vị</TableHead>
                                                    <TableHead className="w-[100px]">Số lượng</TableHead>
                                                    <TableHead className="w-[120px]">Đơn giá</TableHead>
                                                    <TableHead className="w-[120px]">Thành tiền</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {selectedRequest.requestExportDetails.map((item) => {
                                                    const productPrice = getProductPrice(item.productId)
                                                    const totalPrice = productPrice * item.requestedQuantity
                                                    const productImage = getProductImage(item.productId)

                                                    return (
                                                        <TableRow key={item.requestExportDetailId}>
                                                            <TableCell>
                                                                <Avatar className="h-10 w-10">
                                                                    {productImage ? (
                                                                        <AvatarImage src={productImage} alt={getProductName(item.productId)} />
                                                                    ) : (
                                                                        <AvatarFallback>{getProductCode(item.productId).substring(0, 2)}</AvatarFallback>
                                                                    )}
                                                                </Avatar>
                                                            </TableCell>
                                                            <TableCell>{getProductCode(item.productId)}</TableCell>
                                                            <TableCell>{getProductName(item.productId)}</TableCell>
                                                            <TableCell>{getProductUnit(item.productId)}</TableCell>
                                                            <TableCell>{item.requestedQuantity}</TableCell>
                                                            <TableCell>{formatCurrency(productPrice)}</TableCell>
                                                            <TableCell>{formatCurrency(totalPrice)}</TableCell>
                                                        </TableRow>
                                                    )
                                                })}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </div>
                        </ScrollArea>
                    )}

                    <DialogFooter className="pt-4">
                        <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                            Đóng
                        </Button>
                        <Button
                            onClick={() => {
                                setDetailsOpen(false)
                                handleCreateBasedOn(selectedRequest!.requestExportId)
                            }}
                        >
                            Chọn kho để xuất hàng
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog for creating new export request */}
            <ExportRequestCreateDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                requestExportId={baseRequestId}
                onCreateRequest={handleCreateRequest}
            />
        </SalesLayout>
    )
}

export default SalesExports

