"use client"

import { useState, useEffect } from "react"
import { AgencyLayout } from "@/layouts/agency-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { PackageOpen } from "lucide-react"

// Import components

import { ReturnOrderDetailDialog } from "@/components/agency/return-order-detail-dialog"
import { LoadingState } from "@/components/agency/loading-state"
import { ErrorState } from "@/components/agency/error-state"

// Import types and utils
import type { ReturnRequest, SortDirection } from "@/types/return-order"
import { ReturnOrderTable } from "@/components/agency/return-order-table"
import { ReturnOrderPagination } from "@/components/agency/return-order-pagination"
import { ReturnOrderFilter } from "@/components/agency/return-order-filter"

export default function AgencyReturnOrder() {
    // State for return orders data
    const [returnOrders, setReturnOrders] = useState<ReturnRequest[]>([])
    const [filteredOrders, setFilteredOrders] = useState<ReturnRequest[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    // State for selected order and detail dialog
    const [selectedOrder, setSelectedOrder] = useState<ReturnRequest | null>(null)
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState<boolean>(false)

    // State for filters
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [statusFilter,] = useState<string>("all")
    const [dateRange, setDateRange] = useState<{
        from: Date | undefined
        to: Date | undefined
    }>({
        from: undefined,
        to: undefined,
    })

    // State for sorting
    const [sortField, setSortField] = useState<keyof ReturnRequest>("createdAt")
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

    // State for pagination
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [itemsPerPage] = useState<number>(10)
    const [totalPages, setTotalPages] = useState<number>(1)

    const token = localStorage.getItem("auth_token") || ""

    // Fetch return orders from API
    useEffect(() => {
        const fetchReturnOrders = async () => {
            try {
                setLoading(true)

                if (!token) {
                    throw new Error("Authentication token not found")
                }

                const response = await fetch("https://minhlong.mlhr.org/api/returns/agency-return", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                })

                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`)
                }

                const data = await response.json()
                setReturnOrders(data)
            } catch (err) {
                console.error("Failed to fetch return orders:", err)
                setError(err instanceof Error ? err.message : "An error occurred while fetching data")
                toast.error("Không thể tải dữ liệu đơn trả hàng")
            } finally {
                setLoading(false)
            }
        }

        fetchReturnOrders()
    }, [token])

    // Filter and sort return orders
    useEffect(() => {
        let filtered = [...returnOrders]

        // Filter by status
        if (statusFilter !== "all") {
            filtered = filtered.filter((order) => order.status === statusFilter)
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(
                (order) =>
                    order.returnRequestId.toLowerCase().includes(query) ||
                    order.orderId.toLowerCase().includes(query) ||
                    order.createdByUserName.toLowerCase().includes(query) ||
                    (order.note && order.note.toLowerCase().includes(query)) ||
                    order.details.some(
                        (detail) => detail.productName.toLowerCase().includes(query) || detail.reason.toLowerCase().includes(query),
                    ),
            )
        }

        // Filter by date range
        if (dateRange.from) {
            filtered = filtered.filter((order) => new Date(order.createdAt) >= dateRange.from!)
        }
        if (dateRange.to) {
            const toDateEnd = new Date(dateRange.to)
            toDateEnd.setHours(23, 59, 59, 999)
            filtered = filtered.filter((order) => new Date(order.createdAt) <= toDateEnd)
        }

        // Sort filtered orders
        filtered.sort((a, b) => {
            const aValue = a[sortField]
            const bValue = b[sortField]

            if (typeof aValue === "string" && typeof bValue === "string") {
                if (sortField === "createdAt") {
                    // For dates, compare timestamps
                    return sortDirection === "asc"
                        ? new Date(aValue).getTime() - new Date(bValue).getTime()
                        : new Date(bValue).getTime() - new Date(aValue).getTime()
                } else {
                    // For other strings
                    return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
                }
            }

            // Default comparison for non-string values
            return sortDirection === "asc" ? (aValue > bValue ? 1 : -1) : aValue < bValue ? 1 : -1
        })

        setFilteredOrders(filtered)
        setTotalPages(Math.ceil(filtered.length / itemsPerPage))
    }, [returnOrders, searchQuery, statusFilter, dateRange, sortField, sortDirection, itemsPerPage])

    // Handle sort change
    const handleSortChange = (field: keyof ReturnRequest) => {
        if (field === sortField) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortDirection("desc") // Default to descending for new sort field
        }
        setCurrentPage(1) // Reset to first page when sorting changes
    }

    // Handle view details
    const handleViewDetails = (order: ReturnRequest) => {
        setSelectedOrder(order)
        setIsDetailDialogOpen(true)
    }

    // Get paginated data
    const getPaginatedData = () => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return filteredOrders.slice(startIndex, endIndex)
    }

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    // Render loading state
    if (loading) {
        return (
            <AgencyLayout>
                <div className="container mx-auto py-6">
                    <LoadingState />
                </div>
            </AgencyLayout>
        )
    }

    // Render error state
    if (error) {
        return (
            <AgencyLayout>
                <div className="m-4">
                    <ErrorState message={error} onRetry={() => window.location.reload()} />
                </div>
            </AgencyLayout>
        )
    }

    return (
        <AgencyLayout>
            <div className="m-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Quản lý đơn trả hàng</h1>
                    <p className="text-muted-foreground">Xem và quản lý các đơn trả hàng của bạn</p>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle>Danh sách đơn trả hàng</CardTitle>
                        <CardDescription>Tổng số: {returnOrders.length} đơn trả hàng</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="all" className="space-y-4">
                            <div className="flex justify-between items-center">
                                <TabsList>
                                    <TabsTrigger value="all">Tất cả</TabsTrigger>
                                    <TabsTrigger value="Pending">Chờ duyệt</TabsTrigger>
                                    <TabsTrigger value="Approved">Đã duyệt</TabsTrigger>
                                    <TabsTrigger value="Completed">Hoàn thành</TabsTrigger>
                                    <TabsTrigger value="Rejected">Từ chối</TabsTrigger>
                                </TabsList>
                            </div>

                            <ReturnOrderFilter
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                                dateRange={dateRange}
                                setDateRange={setDateRange}
                            />

                            <TabsContent value="all" className="space-y-4">
                                {filteredOrders.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <PackageOpen className="h-12 w-12 text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-medium">Không tìm thấy đơn trả hàng</h3>
                                        <p className="text-muted-foreground mt-2 mb-4 max-w-md">
                                            Không có đơn trả hàng nào phù hợp với điều kiện tìm kiếm của bạn.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <ReturnOrderTable
                                            returnOrders={getPaginatedData()}
                                            sortField={sortField}
                                            sortDirection={sortDirection}
                                            onSortChange={handleSortChange}
                                            onViewDetails={handleViewDetails}
                                        />

                                        <ReturnOrderPagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={handlePageChange}
                                        />
                                    </>
                                )}
                            </TabsContent>

                            <TabsContent value="Pending" className="space-y-4">
                                {filteredOrders.filter(order => order.status === "Pending").length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <PackageOpen className="h-12 w-12 text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-medium">Không có đơn trả hàng đang chờ duyệt</h3>
                                    </div>
                                ) : (
                                    <>
                                        <ReturnOrderTable
                                            returnOrders={getPaginatedData().filter(order => order.status === "Pending")}
                                            sortField={sortField}
                                            sortDirection={sortDirection}
                                            onSortChange={handleSortChange}
                                            onViewDetails={handleViewDetails}
                                        />
                                        <ReturnOrderPagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={handlePageChange}
                                        />
                                    </>
                                )}
                            </TabsContent>

                            <TabsContent value="Approved" className="space-y-4">
                                {filteredOrders.filter(order => order.status === "Approved").length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <PackageOpen className="h-12 w-12 text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-medium">Không có đơn trả hàng đã được duyệt</h3>
                                    </div>
                                ) : (
                                    <>
                                        <ReturnOrderTable
                                            returnOrders={getPaginatedData().filter(order => order.status === "Approved")}
                                            sortField={sortField}
                                            sortDirection={sortDirection}
                                            onSortChange={handleSortChange}
                                            onViewDetails={handleViewDetails}
                                        />
                                        <ReturnOrderPagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={handlePageChange}
                                        />
                                    </>
                                )}
                            </TabsContent>

                            <TabsContent value="Completed" className="space-y-4">
                                {filteredOrders.filter(order => order.status === "Completed").length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <PackageOpen className="h-12 w-12 text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-medium">Không có đơn trả hàng đã hoàn thành</h3>
                                    </div>
                                ) : (
                                    <>
                                        <ReturnOrderTable
                                            returnOrders={getPaginatedData().filter(order => order.status === "Completed")}
                                            sortField={sortField}
                                            sortDirection={sortDirection}
                                            onSortChange={handleSortChange}
                                            onViewDetails={handleViewDetails}
                                        />
                                        <ReturnOrderPagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={handlePageChange}
                                        />
                                    </>
                                )}
                            </TabsContent>

                            <TabsContent value="Rejected" className="space-y-4">
                                {filteredOrders.filter(order => order.status === "Rejected").length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <PackageOpen className="h-12 w-12 text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-medium">Không có đơn trả hàng bị từ chối</h3>
                                    </div>
                                ) : (
                                    <>
                                        <ReturnOrderTable
                                            returnOrders={getPaginatedData().filter(order => order.status === "Rejected")}
                                            sortField={sortField}
                                            sortDirection={sortDirection}
                                            onSortChange={handleSortChange}
                                            onViewDetails={handleViewDetails}
                                        />
                                        <ReturnOrderPagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={handlePageChange}
                                        />
                                    </>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Return Order Detail Dialog */}
                <ReturnOrderDetailDialog
                    isOpen={isDetailDialogOpen}
                    onOpenChange={setIsDetailDialogOpen}
                    returnOrder={selectedOrder}
                />
            </div>
        </AgencyLayout>
    )
}
