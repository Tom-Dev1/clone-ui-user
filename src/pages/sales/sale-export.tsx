"use client"

import { useState, useEffect } from "react"
import { SalesLayout } from "@/layouts/sale-layout"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Loader2, ClipboardList } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { connection } from "@/lib/signalr-client"

// Import components
import { ExportRequestFilter } from "@/components/sales/export-request-filter"
import { ExportRequestTable } from "@/components/sales/export-request-table"
import { ExportRequestPagination } from "@/components/sales/export-request-pagination"

// Import types and utils
import type { RequestExport } from "@/types/export-request"
import { fetchWithAuth } from "@/utils/api-utils"
import { sortData } from "@/utils/sort-utils"
import { ExportRequestDetailDialog } from "@/components/sales/export-request-detail-dialog"
import { ExportRequestConfirmDialog } from "@/components/sales/dialogs/export-request-confirm-dialog"

const SalesExports = () => {
  const [exportRequests, setExportRequests] = useState<RequestExport[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<RequestExport | null>(null)
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })
  const [filteredRequests, setFilteredRequests] = useState<RequestExport[]>([])
  const [authError, setAuthError] = useState<string | null>(null)
  const [alertMessage, setAlertMessage] = useState<{
    type: "error" | "success" | null
    title: string
    message: string
  }>({ type: null, title: "", message: "" })

  // Sorting and pagination state
  const [sortField, setSortField] = useState<string>("requestDate")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize] = useState<number>(15)
  const [totalItems, setTotalItems] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(1)

  // Add new state for the confirmation dialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [selectedRequestForMainWarehouse, setSelectedRequestForMainWarehouse] = useState<number | null>(null)
  const [isConfirmLoading, setIsConfirmLoading] = useState(false)

  // Check for authentication token
  useEffect(() => {
    const token = getToken()
    if (!token) {
      setAuthError("Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.")
      setLoading(false)
    }
  }, [])

  const fetchExportRequests = async () => {
    if (authError) return

    try {
      setLoading(true)
      const response = await fetchWithAuth(`https://minhlong.mlhr.org/api/RequestExport/manage-by-sales`)

      // Save all data
      setExportRequests(response)

      // Calculate total items and pages
      setTotalItems(response.length)
      setTotalPages(Math.ceil(response.length / pageSize))

      setError(null)
    } catch (err) {
      console.error("Error fetching export requests:", err)
      setError("Failed to load export requests. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  // Fetch export requests from API
  useEffect(() => {
    fetchExportRequests()
  }, [authError])

  // Listen for SignalR notifications
  useEffect(() => {
    const handleNewOrder = () => {
      fetchExportRequests()
    }
    connection.on("ReceiveNotification", handleNewOrder)
    return () => {
      connection.off("ReceiveNotification", handleNewOrder)
    }
  }, [])

  // Filter, sort, and paginate export requests
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
          request.requestExportCode.toLowerCase().includes(query) ||
          (request.note && request.note.toLowerCase().includes(query)) ||
          request.requestExportId.toString().includes(query) ||
          request.agencyName.toLowerCase().includes(query),
      )
    }

    // Filter by date range
    if (dateRange.from) {
      filtered = filtered.filter((request) => {
        if (!request.requestDate) return false
        return new Date(request.requestDate) >= dateRange.from!
      })
    }
    if (dateRange.to) {
      filtered = filtered.filter((request) => {
        if (!request.requestDate) return false
        return new Date(request.requestDate) <= dateRange.to!
      })
    }

    // Sort the filtered data
    filtered = sortData(filtered, sortField, sortDirection)

    // Update total items and pages
    setTotalItems(filtered.length)
    setTotalPages(Math.ceil(filtered.length / pageSize))

    // Apply pagination
    const startIndex = (currentPage - 1) * pageSize
    const paginatedData = filtered.slice(startIndex, startIndex + pageSize)

    setFilteredRequests(paginatedData)
  }, [exportRequests, statusFilter, searchQuery, dateRange, sortField, sortDirection, currentPage, pageSize])

  // Clear alert after 5 seconds
  useEffect(() => {
    if (alertMessage.type) {
      const timer = setTimeout(() => {
        setAlertMessage({ type: null, title: "", message: "" })
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [alertMessage])

  const handleViewDetails = (request: RequestExport) => {
    setSelectedRequest(request)
    setDetailsOpen(true)
  }

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc") // Default to descending when selecting a new field
    }
    setCurrentPage(1) // Reset to first page when changing sort
  }

  // Add the handler function for creating export request for main warehouse
  const handleCreateForMainWarehouse = (requestId: number) => {
    setSelectedRequestForMainWarehouse(requestId)
    setConfirmDialogOpen(true)
  }

  // Add the function to handle the confirmation
  const handleConfirmCreateForMainWarehouse = async () => {
    if (!selectedRequestForMainWarehouse) return

    setIsConfirmLoading(true)
    try {
      // Get the authentication token
      const token = getToken()
      if (!token) {
        throw new Error("Authentication token not found")
      }

      // Make the POST request with the token in the headers
      const response = await fetch(
        `https://minhlong.mlhr.org/api/RequestExport/create-for-main-warehouse/${selectedRequestForMainWarehouse}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      // Parse the response
      // Show success message
      setAlertMessage({
        type: "success",
        title: "Thành công",
        message: "Yêu cầu xuất kho đã được tạo thành công.",
      })

      // Refresh export requests list
      await fetchExportRequests()
    } catch (err) {
      console.error("Error creating export request for main warehouse:", err)
      setAlertMessage({
        type: "error",
        title: "Lỗi",
        message: "Không thể tạo yêu cầu xuất kho. Vui lòng thử lại sau.",
      })
    } finally {
      setIsConfirmLoading(false)
      setConfirmDialogOpen(false)
      setSelectedRequestForMainWarehouse(null)
    }
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
      <div className="bg-white max-h-[90vh] m-4">
        {alertMessage.type && (
          <Alert variant={alertMessage.type === "error" ? "destructive" : "default"} className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{alertMessage.title}</AlertTitle>
            <AlertDescription>{alertMessage.message}</AlertDescription>
          </Alert>
        )}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Quản Lý Yêu Cầu Xuất Kho</h1>
        </div>
        <Tabs defaultValue="all" className="space-y-6">
          <ExportRequestFilter
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            dateRange={dateRange}
            setDateRange={setDateRange}
          />

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
              <ExportRequestTable
                filteredRequests={filteredRequests}
                sortField={sortField}
                sortDirection={sortDirection}
                handleSort={handleSort}
                handleViewDetails={handleViewDetails}

                handleCreateForMainWarehouse={handleCreateForMainWarehouse}
              />
            )}

            {filteredRequests.length > 0 && totalPages > 1 && (
              <ExportRequestPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                filteredRequests={filteredRequests}
                setCurrentPage={setCurrentPage}
              />
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
      </div>

      <ExportRequestDetailDialog
        detailsOpen={detailsOpen}
        setDetailsOpen={setDetailsOpen}
        selectedRequest={selectedRequest}
        onConfirm={handleConfirmCreateForMainWarehouse}
        openConfirmDialog={(requestId) => {
          setSelectedRequestForMainWarehouse(requestId)
          setConfirmDialogOpen(true)
        }}
      />

      {/* Add the new dialog component */}
      <ExportRequestConfirmDialog
        isOpen={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        requestId={selectedRequestForMainWarehouse}
        onConfirm={handleConfirmCreateForMainWarehouse}
        isLoading={isConfirmLoading}
      />
    </SalesLayout>
  )
}

// Helper function to get token
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token")
  }
  return null
}

export default SalesExports
