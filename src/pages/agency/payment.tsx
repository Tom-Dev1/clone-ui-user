"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Input } from "../../components/ui/input"
import { Skeleton } from "../../components/ui/skeleton"
import { AgencyLayout } from "../../layouts/agency-layout"
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

// Định nghĩa interface cho dữ liệu lịch sử thanh toán
interface PaymentHistory {
    paymentHistoryId: string
    orderId: string
    orderCode: string
    agencyId: number
    agencyName: string
    paymentMethod: string
    paymentDate: string
    serieNumber: string
    status: string
    totalAmountPayment: number
    remainingDebtAmount: number
    paymentAmount: number
    createdAt: string
    updatedAt: string
}

// Định nghĩa kiểu cho hướng sắp xếp
type SortDirection = "asc" | "desc"

const AgencyPaymentHistoryPage: React.FC = () => {
    const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([])
    const [filteredPaymentHistory, setFilteredPaymentHistory] = useState<PaymentHistory[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState<string>("")

    // State cho sắp xếp
    const [sortField, setSortField] = useState<string>("paymentDate")
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

    // State cho phân trang
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [itemsPerPage] = useState<number>(15)

    const token = localStorage.getItem("auth_token") || ""
    const navigate = useNavigate()

    // Hàm để lấy lịch sử thanh toán
    const fetchPaymentHistory = async () => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch("https://minhlong.mlhr.org/api/PaymentHistory/all", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            })

            if (!response.ok) {
                if (response.status === 401) {
                    navigate("/login")
                    return
                }
                throw new Error(`Error: ${response.status}`)
            }

            const data = await response.json()
            setPaymentHistory(data)
            setFilteredPaymentHistory(data)
        } catch (err) {
            console.error("Failed to fetch payment history:", err)
            setError("Không thể tải lịch sử thanh toán. Vui lòng thử lại sau.")
        } finally {
            setLoading(false)
        }
    }

    // Gọi API khi component được mount
    useEffect(() => {
        if (token) {
            fetchPaymentHistory()
        } else {
            navigate("/login")
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token])

    // Hàm sắp xếp lịch sử thanh toán
    const sortPaymentHistory = (data: PaymentHistory[], field: string, direction: SortDirection): PaymentHistory[] => {
        return [...data].sort((a, b) => {
            let compareResult = 0

            switch (field) {
                case "orderCode":
                    compareResult = a.orderCode.localeCompare(b.orderCode)
                    break
                case "agencyName":
                    compareResult = a.agencyName.localeCompare(b.agencyName)
                    break
                case "paymentDate":
                    compareResult = new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime()
                    break
                case "paymentMethod":
                    compareResult = a.paymentMethod.localeCompare(b.paymentMethod)
                    break
                case "status":
                    compareResult = a.status.localeCompare(b.status)
                    break
                case "paymentAmount":
                    compareResult = a.paymentAmount - b.paymentAmount
                    break
                case "remainingDebtAmount":
                    compareResult = a.remainingDebtAmount - b.remainingDebtAmount
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

    // Lọc và sắp xếp lịch sử thanh toán khi searchTerm, sortField hoặc sortDirection thay đổi
    useEffect(() => {
        if (paymentHistory.length > 0) {
            let filtered = [...paymentHistory]

            // Lọc theo từ khóa tìm kiếm
            if (searchTerm.trim() !== "") {
                const searchTermLower = searchTerm.toLowerCase()
                filtered = filtered.filter(
                    (payment) =>
                        payment.orderCode.toLowerCase().includes(searchTermLower) ||
                        payment.agencyName.toLowerCase().includes(searchTermLower) ||
                        payment.serieNumber.toLowerCase().includes(searchTermLower) ||
                        payment.paymentMethod.toLowerCase().includes(searchTermLower),
                )
            }

            // Sắp xếp dữ liệu
            filtered = sortPaymentHistory(filtered, sortField, sortDirection)

            setFilteredPaymentHistory(filtered)
            // Reset về trang đầu tiên khi thay đổi bộ lọc
            setCurrentPage(1)
        }
    }, [searchTerm, paymentHistory, sortField, sortDirection])

    // Tính toán các giá trị cho phân trang
    const totalPages = Math.ceil(filteredPaymentHistory.length / itemsPerPage)
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentItems = filteredPaymentHistory.slice(indexOfFirstItem, indexOfLastItem)

    // Hàm để thay đổi trang
    const paginate = (pageNumber: number) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber)
        }
    }

    // Hàm để hiển thị trạng thái thanh toán
    const renderStatusBadge = (status: string) => {
        let variant: "default" | "secondary" | "destructive" | "outline" = "default"

        switch (status) {
            case "PAID":
                variant = "default"
                return <Badge variant={variant}>Đã thanh toán</Badge>
            case "PARTIALLY_PAID":
                variant = "secondary"
                return <Badge variant={variant}>Thanh toán một phần</Badge>
            case "UNPAID":
                variant = "destructive"
                return <Badge variant={variant}>Chưa thanh toán</Badge>
            default:
                return <Badge variant={variant}>{status}</Badge>
        }
    }

    // Hàm để định dạng ngày tháng đơn giản
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString("vi-VN") + " " + date.toLocaleTimeString("vi-VN")
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
                        <Button onClick={fetchPaymentHistory}>Thử lại</Button>
                    </div>
                </div>
            </AgencyLayout>
        )
    }

    return (
        <AgencyLayout>
            <div className="m-4">
                <div className="mb-4">
                    <h1 className="text-2xl font-bold">Lịch sử thanh toán đại lý</h1>
                    <p className="text-gray-500 mt-1">Xem lại lịch sử thanh toán của các đơn hàng</p>
                </div>

                <div className="bg-white p-4 rounded-md shadow-sm">
                    <div className="mb-6">
                        <Input
                            placeholder="Tìm kiếm theo mã đơn hàng, đại lý, số serie, phương thức thanh toán..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full"
                        />
                    </div>

                    {filteredPaymentHistory.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">Không tìm thấy lịch sử thanh toán nào</p>
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
                                        <TableHead className="cursor-pointer" onClick={() => handleSortChange("agencyName")}>
                                            <div className="flex items-center">
                                                Đại lý
                                                {renderSortIcon("agencyName")}
                                            </div>
                                        </TableHead>
                                        <TableHead className="cursor-pointer" onClick={() => handleSortChange("paymentMethod")}>
                                            <div className="flex items-center">
                                                Phương thức
                                                {renderSortIcon("paymentMethod")}
                                            </div>
                                        </TableHead>
                                        <TableHead className="cursor-pointer" onClick={() => handleSortChange("paymentDate")}>
                                            <div className="flex items-center">
                                                Ngày thanh toán
                                                {renderSortIcon("paymentDate")}
                                            </div>
                                        </TableHead>
                                        <TableHead>Số serie</TableHead>
                                        <TableHead className="cursor-pointer" onClick={() => handleSortChange("status")}>
                                            <div className="flex items-center">
                                                Trạng thái
                                                {renderSortIcon("status")}
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-right cursor-pointer" onClick={() => handleSortChange("paymentAmount")}>
                                            <div className="flex items-center justify-end">
                                                Số tiền thanh toán
                                                {renderSortIcon("paymentAmount")}
                                            </div>
                                        </TableHead>
                                        <TableHead
                                            className="text-right cursor-pointer"
                                            onClick={() => handleSortChange("remainingDebtAmount")}
                                        >
                                            <div className="flex items-center justify-end">
                                                Số tiền còn nợ
                                                {renderSortIcon("remainingDebtAmount")}
                                            </div>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentItems.map((payment) => (
                                        <TableRow key={payment.paymentHistoryId}>
                                            <TableCell className="font-medium">{payment.orderCode}</TableCell>
                                            <TableCell>{payment.agencyName}</TableCell>
                                            <TableCell>{payment.paymentMethod}</TableCell>
                                            <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                                            <TableCell>{payment.serieNumber}</TableCell>
                                            <TableCell>{renderStatusBadge(payment.status)}</TableCell>
                                            <TableCell className="text-right">{payment.paymentAmount.toLocaleString("vi-VN")} đ</TableCell>
                                            <TableCell className="text-right">
                                                {payment.remainingDebtAmount.toLocaleString("vi-VN")} đ
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Phân trang */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-4">
                                    <div className="text-sm text-gray-500">
                                        Hiển thị {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredPaymentHistory.length)} của{" "}
                                        {filteredPaymentHistory.length} giao dịch
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
            </div>
        </AgencyLayout>
    )
}

export default AgencyPaymentHistoryPage

