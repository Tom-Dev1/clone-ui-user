"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, } from "@/components/ui/tabs"
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
import {
    CalendarIcon,
    ClipboardList,
    Eye,
    Filter,
    Search,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Loader2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { AgencyLayout } from "@/layouts/agency-layout"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Cập nhật interface theo cấu trúc API mới
interface RequestProductDetail {
    requestProductDetailId: number
    productId: number
    productName: string
    unit: string
    quantity: number
    unitPrice: number
}

interface RequestProduct {
    requestProductId: string
    requestCode: string
    agencyId: number
    agencyName: string
    approvedName: string | null
    approvedBy: number | null
    requestStatus: "Pending" | "Approved" | "Canceled"
    createdAt: string
    requestProductDetails: RequestProductDetail[]
}

type SortDirection = "asc" | "desc"

// Hàm lấy token xác thực
const getToken = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("auth_token")
    }
    return null
}

// Hàm fetch với xác thực
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

const AgencyRequests = () => {
    const [requests, setRequests] = useState<RequestProduct[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedRequest, setSelectedRequest] = useState<RequestProduct | null>(null)
    const [detailsOpen, setDetailsOpen] = useState<boolean>(false)
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
        from: undefined,
        to: undefined,
    })
    const [filteredRequests, setFilteredRequests] = useState<RequestProduct[]>([])
    const [authError, setAuthError] = useState<string | null>(null)
    const [alertMessage, setAlertMessage] = useState<{
        type: "error" | "success" | null
        title: string
        message: string
    }>({ type: null, title: "", message: "" })

    // Thêm state cho sắp xếp
    const [sortField, setSortField] = useState<string>("createdAt")
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

    // Thêm state cho phân trang
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(5)
    const [paginatedRequests, setPaginatedRequests] = useState<RequestProduct[]>([])
    const [totalPages, setTotalPages] = useState(1)

    // Kiểm tra token xác thực
    useEffect(() => {
        const token = getToken()
        if (!token) {
            setAuthError("Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.")
            setLoading(false)
        }
    }, [])

    // Lấy danh sách yêu cầu từ API
    useEffect(() => {
        const fetchRequests = async () => {
            if (authError) return

            try {
                setLoading(true)
                const data = await fetchWithAuth("https://minhlong.mlhr.org/api/request-products/my-request-product")
                setRequests(data)
                setFilteredRequests(data)
                setError(null)
            } catch (err) {
                console.error("Error fetching requests:", err)
                setError("Không thể tải danh sách yêu cầu. Vui lòng thử lại sau.")
            } finally {
                setLoading(false)
            }
        }

        fetchRequests()
    }, [authError])

    // Hàm sắp xếp yêu cầu
    const sortRequests = (requestsToSort: RequestProduct[]) => {
        return [...requestsToSort].sort((a, b) => {
            let valueA, valueB

            // Xác định giá trị để so sánh dựa trên trường sắp xếp
            switch (sortField) {
                case "createdAt":
                    valueA = new Date(a.createdAt).getTime()
                    valueB = new Date(b.createdAt).getTime()
                    break
                case "requestCode":
                    valueA = a.requestCode
                    valueB = b.requestCode
                    break
                case "agencyName":
                    valueA = a.agencyName
                    valueB = b.agencyName
                    break
                case "totalQuantity":
                    valueA = getTotalQuantity(a)
                    valueB = getTotalQuantity(b)
                    break
                case "totalValue":
                    valueA = getTotalValue(a)
                    valueB = getTotalValue(b)
                    break
                case "productCount":
                    valueA = a.requestProductDetails.length
                    valueB = b.requestProductDetails.length
                    break
                case "requestStatus":
                    valueA = a.requestStatus
                    valueB = b.requestStatus
                    break
                default:
                    valueA = new Date(a.createdAt).getTime()
                    valueB = new Date(b.createdAt).getTime()
            }

            // So sánh các giá trị
            if (sortDirection === "asc") {
                return valueA > valueB ? 1 : -1
            } else {
                return valueA < valueB ? 1 : -1
            }
        })
    }

    // Lọc và sắp xếp yêu cầu dựa trên trạng thái, từ khóa tìm kiếm và khoảng thời gian
    useEffect(() => {
        let filtered = [...requests]

        // Lọc theo trạng thái
        if (statusFilter !== "all") {
            filtered = filtered.filter((request) => request.requestStatus === statusFilter)
        }

        // Lọc theo từ khóa tìm kiếm
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(
                (request) =>
                    request.requestCode.toLowerCase().includes(query) ||
                    request.agencyName.toLowerCase().includes(query) ||
                    (request.approvedName && request.approvedName.toLowerCase().includes(query)) ||
                    request.requestProductDetails.some((detail) => detail.productName.toLowerCase().includes(query)),
            )
        }

        // Lọc theo khoảng thời gian
        if (dateRange.from) {
            filtered = filtered.filter((request) => {
                return new Date(request.createdAt) >= dateRange.from!
            })
        }
        if (dateRange.to) {
            filtered = filtered.filter((request) => {
                return new Date(request.createdAt) <= dateRange.to!
            })
        }

        // Sắp xếp kết quả
        const sorted = sortRequests(filtered)
        setFilteredRequests(sorted)

        // Reset về trang đầu tiên khi thay đổi bộ lọc
        setCurrentPage(1)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [requests, statusFilter, searchQuery, dateRange, sortField, sortDirection])

    // Cập nhật phân trang khi filteredRequests hoặc currentPage thay đổi
    useEffect(() => {
        // Tính tổng số trang
        const total = Math.ceil(filteredRequests.length / itemsPerPage)
        setTotalPages(total || 1) // Đảm bảo có ít nhất 1 trang

        // Tính chỉ số bắt đầu và kết thúc cho trang hiện tại
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = Math.min(startIndex + itemsPerPage, filteredRequests.length)

        // Lấy dữ liệu cho trang hiện tại
        const paginatedData = filteredRequests.slice(startIndex, endIndex)
        setPaginatedRequests(paginatedData)
    }, [filteredRequests, currentPage, itemsPerPage])

    // Xóa thông báo sau 5 giây
    useEffect(() => {
        if (alertMessage.type) {
            const timer = setTimeout(() => {
                setAlertMessage({ type: null, title: "", message: "" })
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [alertMessage])

    const handleViewDetails = (request: RequestProduct) => {
        setSelectedRequest(request)
        setDetailsOpen(true)
    }

    // Xử lý thay đổi sắp xếp
    const handleSortChange = (field: string) => {
        if (field === sortField) {
            // Nếu đã sắp xếp theo trường này, đảo ngược hướng sắp xếp
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            // Nếu sắp xếp theo trường mới, đặt trường mới và hướng mặc định
            setSortField(field)
            setSortDirection("desc")
        }
    }

    // Xử lý thay đổi trang
    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    // Xử lý thay đổi số lượng item mỗi trang
    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value))
        setCurrentPage(1) // Reset về trang đầu tiên khi thay đổi số lượng item mỗi trang
    }

    // Hiển thị biểu tượng sắp xếp
    const renderSortIcon = (field: string) => {
        if (field !== sortField) {
            return <ArrowUpDown className="h-4 w-4 ml-1 inline" />
        }
        return sortDirection === "asc" ? (
            <ArrowUp className="h-4 w-4 ml-1 inline" />
        ) : (
            <ArrowDown className="h-4 w-4 ml-1 inline" />
        )
    }

    // Hiển thị badge trạng thái
    const renderStatusBadge = (status: string) => {
        switch (status) {
            case "Pending":
                return (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 p-1 w-[100px]">
                        <span className="text-center w-[100px]">Chờ duyệt</span>
                    </Badge>
                )
            case "Approved":
                return (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 p-1 w-[100px]">
                        <span className="text-center w-[100px]">Đã duyệt</span>
                    </Badge>
                )
            case "Canceled":
                return (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 p-1 w-[100px]">
                        <span className="text-center w-[100px]">Từ chối</span>
                    </Badge>
                )
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    // Định dạng ngày
    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), "dd/MM/yyyy")
        } catch (error) {
            console.error(error)
            return "Ngày không hợp lệ"
        }
    }

    // Định dạng tiền tệ
    const formatCurrency = (amount: number) => {
        return amount.toLocaleString("vi-VN") + " đ"
    }

    // Tính tổng số lượng sản phẩm
    const getTotalQuantity = (request: RequestProduct) => {
        return request.requestProductDetails.reduce((total, item) => total + item.quantity, 0)
    }

    // Tính tổng giá trị đơn hàng
    const getTotalValue = (request: RequestProduct) => {
        return request.requestProductDetails.reduce((total, item) => {
            return total + item.unitPrice * item.quantity
        }, 0)
    }

    // Tạo mảng các số trang để hiển thị
    const getPageNumbers = () => {
        const pageNumbers = []
        const maxPagesToShow = 5 // Số lượng nút trang tối đa hiển thị

        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
        const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)

        // Điều chỉnh startPage nếu endPage đã đạt giới hạn
        if (endPage === totalPages) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1)
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i)
        }

        return pageNumbers
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
                <span className="ml-2">Đang tải danh sách yêu cầu...</span>
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
        <AgencyLayout>
            <div className="m-4">
                {alertMessage.type && (
                    <Alert variant={alertMessage.type === "error" ? "destructive" : "default"} className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>{alertMessage.title}</AlertTitle>
                        <AlertDescription>{alertMessage.message}</AlertDescription>
                    </Alert>
                )}
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Quản Lý Yêu Cầu Đặt Hàng</h1>
                </div>
                <Tabs defaultValue="all" className="space-y-6">
                    <div className="mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

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
                                <h3 className="text-lg font-medium mb-2">Không tìm thấy yêu cầu</h3>
                                <p className="text-muted-foreground mb-4">Không có yêu cầu nào phù hợp với điều kiện tìm kiếm.</p>
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
                                                <TableHead
                                                    className="w-[160px] text-center cursor-pointer"
                                                    onClick={() => handleSortChange("requestCode")}
                                                >
                                                    Mã yêu cầu {renderSortIcon("requestCode")}
                                                </TableHead>
                                                <TableHead
                                                    className="w-[160px] text-center cursor-pointer"
                                                    onClick={() => handleSortChange("createdAt")}
                                                >
                                                    Ngày tạo {renderSortIcon("createdAt")}
                                                </TableHead>
                                                <TableHead
                                                    className="w-[160px] text-center cursor-pointer"
                                                    onClick={() => handleSortChange("agencyName")}
                                                >
                                                    Đại lý {renderSortIcon("agencyName")}
                                                </TableHead>
                                                <TableHead className="w-[120px] text-center">Người duyệt</TableHead>
                                                <TableHead
                                                    className="w-[120px] text-center cursor-pointer"
                                                    onClick={() => handleSortChange("productCount")}
                                                >
                                                    Số SP {renderSortIcon("productCount")}
                                                </TableHead>
                                                <TableHead
                                                    className="w-[120px] text-center cursor-pointer"
                                                    onClick={() => handleSortChange("totalQuantity")}
                                                >
                                                    Tổng SL {renderSortIcon("totalQuantity")}
                                                </TableHead>
                                                <TableHead
                                                    className="w-[130px] text-right cursor-pointer"
                                                    onClick={() => handleSortChange("totalValue")}
                                                >
                                                    Tổng giá trị {renderSortIcon("totalValue")}
                                                </TableHead>
                                                <TableHead
                                                    className="w-[120px] text-center cursor-pointer"
                                                    onClick={() => handleSortChange("requestStatus")}
                                                >
                                                    Trạng thái {renderSortIcon("requestStatus")}
                                                </TableHead>
                                                <TableHead className="w-[80px] text-center">Thao tác</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paginatedRequests.map((request) => (
                                                <TableRow key={request.requestProductId}>
                                                    <TableCell className="w-[160px] text-center cursor-pointer font-medium">{request.requestCode}</TableCell>
                                                    <TableCell className="text-center"> {formatDate(request.createdAt)}</TableCell>
                                                    <TableCell className="text-center">{request.agencyName}</TableCell>
                                                    <TableCell className="text-center">{request.approvedName}</TableCell>

                                                    <TableCell className="text-center">{request.requestProductDetails.length}</TableCell>
                                                    <TableCell className="text-center">{getTotalQuantity(request)}</TableCell>
                                                    <TableCell className="text-right">{formatCurrency(getTotalValue(request))}</TableCell>
                                                    <TableCell className="text-center">{renderStatusBadge(request.requestStatus)}</TableCell>
                                                    <TableCell>
                                                        <div className="flex justify-center">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleViewDetails(request)}
                                                                title="Xem chi tiết"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Phân trang */}
                                <div className="flex items-center justify-between px-4 py-4 border-t">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm text-muted-foreground">Hiển thị</p>
                                        <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                                            <SelectTrigger className="h-8 w-[70px]">
                                                <SelectValue placeholder={itemsPerPage.toString()} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="5">5</SelectItem>
                                                <SelectItem value="10">10</SelectItem>
                                                <SelectItem value="15">15</SelectItem>
                                                <SelectItem value="20">20</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-sm text-muted-foreground">trên tổng số {filteredRequests.length} yêu cầu</p>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handlePageChange(1)}
                                            disabled={currentPage === 1}
                                            className="h-8 w-8"
                                        >
                                            <ChevronsLeft className="h-4 w-4" />
                                            <span className="sr-only">Trang đầu</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="h-8 w-8"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            <span className="sr-only">Trang trước</span>
                                        </Button>

                                        {getPageNumbers().map((page) => (
                                            <Button
                                                key={page}
                                                variant={currentPage === page ? "default" : "outline"}
                                                size="icon"
                                                onClick={() => handlePageChange(page)}
                                                className="h-8 w-8"
                                            >
                                                {page}
                                            </Button>
                                        ))}

                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="h-8 w-8"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                            <span className="sr-only">Trang sau</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handlePageChange(totalPages)}
                                            disabled={currentPage === totalPages}
                                            className="h-8 w-8"
                                        >
                                            <ChevronsRight className="h-4 w-4" />
                                            <span className="sr-only">Trang cuối</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="Pending" className="space-y-4">
                        {/* Nội dung được lọc bởi useEffect */}
                    </TabsContent>

                    <TabsContent value="Approved" className="space-y-4">
                        {/* Nội dung được lọc bởi useEffect */}
                    </TabsContent>

                    <TabsContent value="Canceled" className="space-y-4">
                        {/* Nội dung được lọc bởi useEffect */}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Dialog xem chi tiết yêu cầu */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="flex flex-col min-w-[100vh] max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Chi tiết yêu cầu đặt hàng</DialogTitle>
                        <DialogDescription>Mã yêu cầu: {selectedRequest?.requestCode}</DialogDescription>
                    </DialogHeader>

                    {selectedRequest && (
                        <ScrollArea className="flex-1 overflow-y-auto">
                            <div className="space-y-6 py-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base">Thông tin yêu cầu</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <dl className="grid grid-cols-2 gap-1 text-sm">
                                                <dt className="text-muted-foreground">Mã yêu cầu:</dt>
                                                <dd>{selectedRequest.requestCode}</dd>

                                                <dt className="text-muted-foreground">Đại lý:</dt>
                                                <dd>{selectedRequest.agencyName}</dd>

                                                <dt className="text-muted-foreground">Ngày tạo:</dt>
                                                <dd>{formatDate(selectedRequest.createdAt)}</dd>

                                                <dt className="text-muted-foreground">Trạng thái:</dt>
                                                <dd>{renderStatusBadge(selectedRequest.requestStatus)}</dd>

                                                {selectedRequest.approvedBy && (
                                                    <>
                                                        <dt className="text-muted-foreground">Người duyệt:</dt>
                                                        <dd>{selectedRequest.approvedName || `ID: ${selectedRequest.approvedBy}`}</dd>
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
                                                <dd>{selectedRequest.requestProductDetails.length}</dd>

                                                <dt className="text-muted-foreground">Tổng số lượng:</dt>
                                                <dd>{getTotalQuantity(selectedRequest)}</dd>

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
                                                    <TableHead>Tên sản phẩm</TableHead>
                                                    <TableHead className="w-[80px]">Đơn vị</TableHead>
                                                    <TableHead className="w-[100px]">Số lượng</TableHead>
                                                    <TableHead className="w-[120px]">Đơn giá</TableHead>
                                                    <TableHead className="w-[120px]">Thành tiền</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {selectedRequest.requestProductDetails.map((item) => {
                                                    const totalPrice = item.unitPrice * item.quantity

                                                    return (
                                                        <TableRow key={item.requestProductDetailId}>
                                                            <TableCell>
                                                                <Avatar className="h-10 w-10">
                                                                    <AvatarFallback>{item.productName.substring(0, 2)}</AvatarFallback>
                                                                </Avatar>
                                                            </TableCell>
                                                            <TableCell>{item.productName}</TableCell>
                                                            <TableCell>{item.unit}</TableCell>
                                                            <TableCell>{item.quantity}</TableCell>
                                                            <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
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
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AgencyLayout>
    )
}

export default AgencyRequests

