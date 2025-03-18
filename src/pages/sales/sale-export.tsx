"use client"

import { useState } from "react"
import { ResponsiveContainer } from "@/components/responsive-container"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
    ArrowUp,
    ArrowDown,
    Plus,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Search,
    Filter,
} from "lucide-react"
import { SalesLayout } from "@/layouts/sale-layout"

// Định nghĩa các kiểu dữ liệu
// interface Product {
//     id: string
//     code: string
//     name: string
//     unit: string
//     stock: number
// }

interface ExportRequest {
    id: string
    type: "export" | "import"
    requestNo: string
    createdAt: string
    createdBy: string
    status: "pending" | "approved" | "completed" | "rejected"
    reason: string
    items: RequestItem[]
    notes?: string
    approvedBy?: string
    approvedAt?: string
    completedAt?: string
    rejectedReason?: string
}

interface RequestItem {
    id: string
    productId: string
    productName: string
    productCode: string
    unit: string
    quantity: number
}

const SalesExports = () => {
    // Trạng thái cho mẫu yêu cầu mới
    const [newRequestType, setNewRequestType] = useState<"export" | "import">("export")
    const [reason, setReason] = useState("")
    const [notes, setNotes] = useState("")
    const [requestItems, setRequestItems] = useState<RequestItem[]>([])
    const [selectedProduct, setSelectedProduct] = useState("")
    const [quantity, setQuantity] = useState<number>(1)

    // Trạng thái cho bộ lọc và tìm kiếm
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [typeFilter, setTypeFilter] = useState<string>("all")
    const [dateFilter, setDateFilter] = useState<string>("all")

    // Trạng thái cho hiển thị chi tiết
    const [selectedRequest, setSelectedRequest] = useState<ExportRequest | null>(null)
    const [showDetailSheet, setShowDetailSheet] = useState(false)

    // Trạng thái lưu trữ dữ liệu
    const products = [
        { id: "1", code: "SP001", name: "Phân bón NPK", unit: "kg", stock: 1500 },
        { id: "2", code: "SP002", name: "Thuốc trừ sâu sinh học", unit: "lít", stock: 350 },
        { id: "3", code: "SP003", name: "Hạt giống lúa", unit: "kg", stock: 2000 },
        { id: "4", code: "SP004", name: "Hạt giống rau muống", unit: "gói", stock: 800 },
        { id: "5", code: "SP005", name: "Phân vi sinh", unit: "kg", stock: 1200 },
        { id: "6", code: "SP006", name: "Thuốc kích thích tăng trưởng", unit: "chai", stock: 450 },
        { id: "7", code: "SP007", name: "Chế phẩm xử lý đất", unit: "kg", stock: 600 },
        { id: "8", code: "SP008", name: "Vôi nông nghiệp", unit: "kg", stock: 3000 },
    ]

    const [requests, setRequests] = useState<ExportRequest[]>([
        {
            id: "1",
            type: "export",
            requestNo: "XK-230315-001",
            createdAt: "2023-03-15T09:23:45",
            createdBy: "Nguyễn Văn A",
            status: "completed",
            reason: "Xuất hàng cho đại lý tỉnh Bắc Ninh",
            items: [
                { id: "i1", productId: "1", productName: "Phân bón NPK", productCode: "SP001", unit: "kg", quantity: 200 },
                {
                    id: "i2",
                    productId: "2",
                    productName: "Thuốc trừ sâu sinh học",
                    productCode: "SP002",
                    unit: "lít",
                    quantity: 50,
                },
            ],
            notes: "Giao hàng vào buổi sáng",
            approvedBy: "Lê Thị B",
            approvedAt: "2023-03-16T10:05:30",
            completedAt: "2023-03-17T14:30:00",
        },
        {
            id: "2",
            type: "import",
            requestNo: "NK-230320-001",
            createdAt: "2023-03-20T11:45:12",
            createdBy: "Nguyễn Văn A",
            status: "approved",
            reason: "Nhập thêm hàng từ nhà cung cấp",
            items: [
                { id: "i3", productId: "5", productName: "Phân vi sinh", productCode: "SP005", unit: "kg", quantity: 500 },
                {
                    id: "i4",
                    productId: "6",
                    productName: "Thuốc kích thích tăng trưởng",
                    productCode: "SP006",
                    unit: "chai",
                    quantity: 100,
                },
            ],
            approvedBy: "Lê Thị B",
            approvedAt: "2023-03-21T09:10:25",
        },
        {
            id: "3",
            type: "export",
            requestNo: "XK-230325-001",
            createdAt: "2023-03-25T15:20:30",
            createdBy: "Nguyễn Văn A",
            status: "rejected",
            reason: "Xuất hàng cho đại lý tỉnh Hải Dương",
            items: [
                { id: "i5", productId: "3", productName: "Hạt giống lúa", productCode: "SP003", unit: "kg", quantity: 150 },
            ],
            approvedBy: "Lê Thị B",
            rejectedReason: "Không đủ số lượng trong kho",
        },
        {
            id: "4",
            type: "export",
            requestNo: "XK-230330-001",
            createdAt: "2023-03-30T08:15:00",
            createdBy: "Nguyễn Văn A",
            status: "pending",
            reason: "Xuất hàng cho đại lý tỉnh Nam Định",
            items: [
                {
                    id: "i6",
                    productId: "4",
                    productName: "Hạt giống rau muống",
                    productCode: "SP004",
                    unit: "gói",
                    quantity: 300,
                },
                {
                    id: "i7",
                    productId: "7",
                    productName: "Chế phẩm xử lý đất",
                    productCode: "SP007",
                    unit: "kg",
                    quantity: 200,
                },
                { id: "i8", productId: "8", productName: "Vôi nông nghiệp", productCode: "SP008", unit: "kg", quantity: 500 },
            ],
            notes: "Cần giao trước ngày 5/4/2023",
        },
    ])

    // Hàm thêm một sản phẩm vào danh sách yêu cầu
    const addProductToRequest = () => {
        if (!selectedProduct || quantity <= 0) return

        const product = products.find((p) => p.id === selectedProduct)
        if (!product) return

        const newItem: RequestItem = {
            id: `temp-${Date.now()}`,
            productId: product.id,
            productName: product.name,
            productCode: product.code,
            unit: product.unit,
            quantity: quantity,
        }

        setRequestItems([...requestItems, newItem])
        setSelectedProduct("")
        setQuantity(1)
    }

    // Hàm xóa một sản phẩm khỏi danh sách yêu cầu
    const removeProductFromRequest = (itemId: string) => {
        setRequestItems(requestItems.filter((item) => item.id !== itemId))
    }

    // Hàm tạo yêu cầu mới
    const createNewRequest = () => {
        if (reason.trim() === "" || requestItems.length === 0) {
            alert("Vui lòng nhập đầy đủ thông tin và thêm ít nhất một sản phẩm!")
            return
        }

        const newRequest: ExportRequest = {
            id: `${requests.length + 1}`,
            type: newRequestType,
            requestNo:
                newRequestType === "export"
                    ? `XK-${new Date().toISOString().substring(2, 10).replace(/-/g, "")}-${String(requests.length + 1).padStart(3, "0")}`
                    : `NK-${new Date().toISOString().substring(2, 10).replace(/-/g, "")}-${String(requests.length + 1).padStart(3, "0")}`,
            createdAt: new Date().toISOString(),
            createdBy: "Nguyễn Văn A", // Lấy từ thông tin người dùng đăng nhập
            status: "pending",
            reason: reason,
            items: requestItems,
            notes: notes || undefined,
        }

        setRequests([newRequest, ...requests])
        resetForm()

        // Hiển thị thông báo thành công
        alert(`Đã tạo ${newRequestType === "export" ? "yêu cầu xuất kho" : "yêu cầu nhập kho"} thành công!`)
    }

    // Hàm reset form sau khi tạo yêu cầu
    const resetForm = () => {
        setNewRequestType("export")
        setReason("")
        setNotes("")
        setRequestItems([])
        setSelectedProduct("")
        setQuantity(1)
    }

    // Hàm lọc yêu cầu theo điều kiện tìm kiếm
    const filteredRequests = requests.filter((request) => {
        // Lọc theo từ khóa tìm kiếm
        const searchMatch =
            searchTerm === "" ||
            request.requestNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.items.some(
                (item) =>
                    item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.productCode.toLowerCase().includes(searchTerm.toLowerCase()),
            )

        // Lọc theo trạng thái
        const statusMatch = statusFilter === "all" || request.status === statusFilter

        // Lọc theo loại yêu cầu
        const typeMatch = typeFilter === "all" || request.type === typeFilter

        // Lọc theo thời gian
        let dateMatch = true
        if (dateFilter !== "all") {
            const today = new Date()
            const requestDate = new Date(request.createdAt)

            if (dateFilter === "today") {
                dateMatch =
                    requestDate.getDate() === today.getDate() &&
                    requestDate.getMonth() === today.getMonth() &&
                    requestDate.getFullYear() === today.getFullYear()
            } else if (dateFilter === "thisWeek") {
                const startOfWeek = new Date(today)
                startOfWeek.setDate(today.getDate() - today.getDay())
                startOfWeek.setHours(0, 0, 0, 0)
                dateMatch = requestDate >= startOfWeek
            } else if (dateFilter === "thisMonth") {
                dateMatch = requestDate.getMonth() === today.getMonth() && requestDate.getFullYear() === today.getFullYear()
            }
        }

        return searchMatch && statusMatch && typeMatch && dateMatch
    })

    // Hàm định dạng ngày tháng
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    // Hàm hiển thị trạng thái
    const renderStatus = (status: string) => {
        switch (status) {
            case "pending":
                return (
                    <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Chờ duyệt
                    </Badge>
                )
            case "approved":
                return (
                    <Badge variant="secondary" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Đã duyệt
                    </Badge>
                )
            case "completed":
                return (
                    <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-100">
                        <CheckCircle className="h-3 w-3" /> Hoàn thành
                    </Badge>
                )
            case "rejected":
                return (
                    <Badge variant="destructive" className="flex items-center gap-1">
                        <XCircle className="h-3 w-3" /> Từ chối
                    </Badge>
                )
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <SalesLayout>
            <div className="py-8">
                <ResponsiveContainer>
                    <Tabs defaultValue="list" className="space-y-6">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-2">
                            <TabsList className="mb-4 md:mb-0">
                                <TabsTrigger value="list" className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    <span>Danh sách yêu cầu</span>
                                </TabsTrigger>
                                <TabsTrigger value="new" className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    <span>Tạo yêu cầu mới</span>
                                </TabsTrigger>
                            </TabsList>

                            <div className="flex flex-col sm:flex-row gap-2">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Tìm kiếm yêu cầu..."
                                        className="pl-8 w-full sm:w-[200px] md:w-[260px]"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="flex items-center gap-2">
                                            <Filter className="h-4 w-4" />
                                            <span>Lọc</span>
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Lọc yêu cầu</DialogTitle>
                                            <DialogDescription>Điều chỉnh các bộ lọc bên dưới để tìm kiếm yêu cầu.</DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="status">Trạng thái</Label>
                                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                                    <SelectTrigger id="status">
                                                        <SelectValue placeholder="Chọn trạng thái" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                                        <SelectItem value="pending">Chờ duyệt</SelectItem>
                                                        <SelectItem value="approved">Đã duyệt</SelectItem>
                                                        <SelectItem value="completed">Hoàn thành</SelectItem>
                                                        <SelectItem value="rejected">Từ chối</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="type">Loại yêu cầu</Label>
                                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                                    <SelectTrigger id="type">
                                                        <SelectValue placeholder="Chọn loại yêu cầu" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">Tất cả loại</SelectItem>
                                                        <SelectItem value="export">Xuất kho</SelectItem>
                                                        <SelectItem value="import">Nhập kho</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="date">Thời gian</Label>
                                                <Select value={dateFilter} onValueChange={setDateFilter}>
                                                    <SelectTrigger id="date">
                                                        <SelectValue placeholder="Chọn thời gian" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">Tất cả thời gian</SelectItem>
                                                        <SelectItem value="today">Hôm nay</SelectItem>
                                                        <SelectItem value="thisWeek">Tuần này</SelectItem>
                                                        <SelectItem value="thisMonth">Tháng này</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button
                                                type="submit"
                                                onClick={() => {
                                                    setStatusFilter("all")
                                                    setTypeFilter("all")
                                                    setDateFilter("all")
                                                }}
                                                variant="outline"
                                            >
                                                Đặt lại
                                            </Button>
                                            <Button type="submit">Áp dụng</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>

                        {/* Tab nội dung: Danh sách các yêu cầu */}
                        <TabsContent value="list" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Danh sách yêu cầu xuất nhập kho</CardTitle>
                                    <CardDescription>Quản lý tất cả các yêu cầu xuất nhập kho và theo dõi trạng thái</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {filteredRequests.length === 0 ? (
                                        <div className="text-center py-6">
                                            <p className="text-muted-foreground">Không tìm thấy yêu cầu nào phù hợp với tiêu chí tìm kiếm.</p>
                                        </div>
                                    ) : (
                                        <div className="rounded-md border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[120px]">Mã yêu cầu</TableHead>
                                                        <TableHead>Loại</TableHead>
                                                        <TableHead>Ngày tạo</TableHead>
                                                        <TableHead className="hidden md:table-cell">Lý do</TableHead>
                                                        <TableHead>Trạng thái</TableHead>
                                                        <TableHead className="hidden md:table-cell">Số sản phẩm</TableHead>
                                                        <TableHead className="text-right">Chi tiết</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {filteredRequests.map((request) => (
                                                        <TableRow key={request.id}>
                                                            <TableCell className="font-medium">{request.requestNo}</TableCell>
                                                            <TableCell>
                                                                {request.type === "export" ? (
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="flex items-center gap-1 bg-orange-50 text-orange-800 hover:bg-orange-50"
                                                                    >
                                                                        <ArrowUp className="h-3 w-3" /> Xuất kho
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="flex items-center gap-1 bg-blue-50 text-blue-800 hover:bg-blue-50"
                                                                    >
                                                                        <ArrowDown className="h-3 w-3" /> Nhập kho
                                                                    </Badge>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>{formatDate(request.createdAt)}</TableCell>
                                                            <TableCell className="hidden md:table-cell max-w-[300px] truncate">
                                                                {request.reason}
                                                            </TableCell>
                                                            <TableCell>{renderStatus(request.status)}</TableCell>
                                                            <TableCell className="hidden md:table-cell">{request.items.length}</TableCell>
                                                            <TableCell className="text-right">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setSelectedRequest(request)
                                                                        setShowDetailSheet(true)
                                                                    }}
                                                                >
                                                                    Xem
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Sheet hiển thị chi tiết yêu cầu */}
                            <Sheet open={showDetailSheet} onOpenChange={setShowDetailSheet}>
                                <SheetContent className="w-full sm:max-w-[540px] overflow-y-auto">
                                    <SheetHeader>
                                        <SheetTitle>Chi tiết yêu cầu {selectedRequest?.requestNo}</SheetTitle>
                                        <SheetDescription>
                                            {selectedRequest?.type === "export" ? "Yêu cầu xuất kho" : "Yêu cầu nhập kho"}
                                        </SheetDescription>
                                    </SheetHeader>

                                    {selectedRequest && (
                                        <div className="mt-6 space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Mã yêu cầu</h4>
                                                    <p>{selectedRequest.requestNo}</p>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Ngày tạo</h4>
                                                    <p>{formatDate(selectedRequest.createdAt)}</p>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Người tạo</h4>
                                                    <p>{selectedRequest.createdBy}</p>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Trạng thái</h4>
                                                    <p>{renderStatus(selectedRequest.status)}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-medium text-muted-foreground mb-1">Lý do</h4>
                                                <p>{selectedRequest.reason}</p>
                                            </div>

                                            {selectedRequest.notes && (
                                                <div>
                                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Ghi chú</h4>
                                                    <p>{selectedRequest.notes}</p>
                                                </div>
                                            )}

                                            <div>
                                                <h4 className="text-sm font-medium mb-2">Danh sách sản phẩm</h4>
                                                <div className="rounded-md border">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Mã SP</TableHead>
                                                                <TableHead>Tên sản phẩm</TableHead>
                                                                <TableHead className="text-right">Số lượng</TableHead>
                                                                <TableHead className="text-right">Đơn vị</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {selectedRequest.items.map((item) => (
                                                                <TableRow key={item.id}>
                                                                    <TableCell>{item.productCode}</TableCell>
                                                                    <TableCell>{item.productName}</TableCell>
                                                                    <TableCell className="text-right">{item.quantity}</TableCell>
                                                                    <TableCell className="text-right">{item.unit}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </div>

                                            {selectedRequest.status !== "pending" && (
                                                <div className="space-y-4">
                                                    <div className="border-t pt-4">
                                                        <h4 className="text-sm font-medium mb-2">Thông tin duyệt</h4>

                                                        {selectedRequest.status === "rejected" ? (
                                                            <Alert variant="destructive">
                                                                <AlertCircle className="h-4 w-4" />
                                                                <AlertTitle>Yêu cầu bị từ chối</AlertTitle>
                                                                <AlertDescription>
                                                                    {selectedRequest.rejectedReason || "Không có lý do từ chối"}
                                                                </AlertDescription>
                                                            </Alert>
                                                        ) : (
                                                            <div className="grid grid-cols-2 gap-4">
                                                                {selectedRequest.approvedBy && (
                                                                    <>
                                                                        <div>
                                                                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Người duyệt</h4>
                                                                            <p>{selectedRequest.approvedBy}</p>
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Ngày duyệt</h4>
                                                                            <p>{selectedRequest.approvedAt ? formatDate(selectedRequest.approvedAt) : ""}</p>
                                                                        </div>
                                                                    </>
                                                                )}
                                                                {selectedRequest.status === "completed" && selectedRequest.completedAt && (
                                                                    <div className="col-span-2">
                                                                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Ngày hoàn thành</h4>
                                                                        <p>{formatDate(selectedRequest.completedAt)}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex justify-end pt-4">
                                                <Button variant="outline" onClick={() => setShowDetailSheet(false)}>
                                                    Đóng
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </SheetContent>
                            </Sheet>
                        </TabsContent>

                        {/* Tab nội dung: Tạo yêu cầu mới */}
                        <TabsContent value="new" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Tạo yêu cầu xuất nhập kho mới</CardTitle>
                                    <CardDescription>Điền đầy đủ thông tin để tạo yêu cầu mới</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="requestType">Loại yêu cầu</Label>
                                            <Select
                                                value={newRequestType}
                                                onValueChange={(value) => setNewRequestType(value as "export" | "import")}
                                            >
                                                <SelectTrigger id="requestType">
                                                    <SelectValue placeholder="Chọn loại yêu cầu" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="export">Xuất kho</SelectItem>
                                                    <SelectItem value="import">Nhập kho</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="reason">Lý do {newRequestType === "export" ? "xuất" : "nhập"} kho</Label>
                                            <Input
                                                id="reason"
                                                placeholder={`Nhập lý do ${newRequestType === "export" ? "xuất" : "nhập"} kho`}
                                                value={reason}
                                                onChange={(e) => setReason(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="notes">Ghi chú (không bắt buộc)</Label>
                                        <Textarea
                                            id="notes"
                                            placeholder="Nhập ghi chú nếu có"
                                            className="h-20 mt-1"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                        />
                                    </div>

                                    <div className="border rounded-lg p-4">
                                        <h3 className="text-sm font-medium mb-4">Thêm sản phẩm vào yêu cầu</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <div>
                                                <Label htmlFor="product">Sản phẩm</Label>
                                                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                                                    <SelectTrigger id="product">
                                                        <SelectValue placeholder="Chọn sản phẩm" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {products.map((product) => (
                                                            <SelectItem key={product.id} value={product.id}>
                                                                {product.code} - {product.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label htmlFor="quantity">Số lượng</Label>
                                                <Input
                                                    id="quantity"
                                                    type="number"
                                                    min="1"
                                                    value={quantity}
                                                    onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 0)}
                                                />
                                            </div>

                                            <div className="flex items-end">
                                                <Button onClick={addProductToRequest} className="w-full">
                                                    Thêm sản phẩm
                                                </Button>
                                            </div>
                                        </div>

                                        {requestItems.length > 0 ? (
                                            <div className="border rounded-md">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Mã SP</TableHead>
                                                            <TableHead>Tên sản phẩm</TableHead>
                                                            <TableHead className="text-right">Số lượng</TableHead>
                                                            <TableHead className="text-right">Đơn vị</TableHead>
                                                            <TableHead className="text-right">Thao tác</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {requestItems.map((item) => (
                                                            <TableRow key={item.id}>
                                                                <TableCell>{item.productCode}</TableCell>
                                                                <TableCell>{item.productName}</TableCell>
                                                                <TableCell className="text-right">{item.quantity}</TableCell>
                                                                <TableCell className="text-right">{item.unit}</TableCell>
                                                                <TableCell className="text-right">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => removeProductFromRequest(item.id)}
                                                                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                                                    >
                                                                        <XCircle className="h-4 w-4" />
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 border rounded-md">
                                                <p className="text-muted-foreground">
                                                    Chưa có sản phẩm nào. Vui lòng thêm sản phẩm vào yêu cầu.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button variant="outline" onClick={resetForm}>
                                        Đặt lại
                                    </Button>
                                    <Button onClick={createNewRequest}>
                                        {newRequestType === "export" ? "Tạo yêu cầu xuất kho" : "Tạo yêu cầu nhập kho"}
                                    </Button>
                                </CardFooter>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Hướng dẫn sử dụng</CardTitle>
                                    <CardDescription>Thông tin để hoàn thành yêu cầu xuất nhập kho</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Lưu ý quan trọng</AlertTitle>
                                        <AlertDescription>
                                            Yêu cầu xuất/nhập kho sẽ cần được quản lý kho duyệt trước khi thực hiện. Vui lòng điền đầy đủ
                                            thông tin để việc duyệt yêu cầu được nhanh chóng.
                                        </AlertDescription>
                                    </Alert>

                                    <div>
                                        <h3 className="text-sm font-medium mb-2">Quy trình xuất/nhập kho</h3>
                                        <ol className="list-decimal ml-4 space-y-1 text-sm text-muted-foreground">
                                            <li>Tạo yêu cầu xuất/nhập kho với đầy đủ thông tin</li>
                                            <li>Quản lý kho xem xét và duyệt yêu cầu</li>
                                            <li>Sau khi được duyệt, bộ phận kho sẽ thực hiện xuất/nhập hàng</li>
                                            <li>Khi hoàn thành, trạng thái yêu cầu sẽ được cập nhật thành "Hoàn thành"</li>
                                        </ol>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </ResponsiveContainer>
            </div>
        </SalesLayout>
    )
}

export default SalesExports

