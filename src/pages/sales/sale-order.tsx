"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { get, put } from "@/api/axiosUtils"
import { isAuthenticated, isSalesManager, getToken } from "@/utils/auth-utils"
import { SalesLayout } from "@/layouts/sale-layout"
import { toast } from "sonner"
import { connection } from "@/lib/signalr-client"

// Import types
import type { OrderDetail, RequestProduct, SortField, SortDirection } from "@/types/sales-orders"

// Import components
import { OrderFilter } from "@/components/sales/order-filter"
import { OrderTable } from "@/components/sales/order-table"
import { OrderPagination } from "@/components/sales/order-pagination"
import { OrderDetailModal } from "@/components/sales/order-detail-modal"
import { LoadingState } from "@/components/sales/loading-state"
import { ErrorState } from "@/components/sales/error-state"
import { EmptyState } from "@/components/sales/empty-state"

// Import utilities
import { updateTotals } from "@/utils/order-utils"

export default function SalesOrders() {
  const navigate = useNavigate()
  // State cho danh sách đơn hàng
  const [orders, setOrders] = useState<RequestProduct[]>([])
  const [filteredOrders, setFilteredOrders] = useState<RequestProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<RequestProduct | null>(null)
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null)
  const [showOrderDetail, setShowOrderDetail] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(15)
  const [totalPages, setTotalPages] = useState(1)
  const [, setTotalProducts] = useState(0)
  const [, setTotalQuantity] = useState(0)
  const [detailsLoaded, setDetailsLoaded] = useState<Record<string, boolean>>({})

  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")


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

  const fetchOrders = async () => {
    setIsLoading(true)
    setError(null)
    setCurrentPage(1) // Reset to first page when fetching new data

    try {
      // Lấy token từ auth-service
      const token = getToken()

      if (!token) {
        navigate("/login")
        return
      }

      const response = await get<RequestProduct[]>("/request-products")

      if (response.success && Array.isArray(response.result)) {
        // Dữ liệu đã có đầy đủ thông tin từ API
        const ordersWithLoadingState = response.result.map((order) => ({
          ...order,
          isLoading: false,
        }))

        setOrders(ordersWithLoadingState)
        setFilteredOrders(ordersWithLoadingState)

        // Cập nhật tổng số sản phẩm và số lượng
        const { totalProductCount, totalQuantityCount } = updateTotals(ordersWithLoadingState)
        setTotalProducts(totalProductCount)
        setTotalQuantity(totalQuantityCount)

        // Đánh dấu tất cả đơn hàng đã được tải chi tiết
        const loadedDetails: Record<string, boolean> = {}
        ordersWithLoadingState.forEach((order) => {
          loadedDetails[order.requestProductId] = true
        })
        setDetailsLoaded(loadedDetails)
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

  // Fetch đơn hàng từ API với token
  useEffect(() => {
    fetchOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate])

  // Hàm cập nhật khi signalR
  useEffect(() => {
    const handleNewOrder = () => {
      // Gọi API để lấy danh sách đơn hàng mới nhất
      fetchOrders()
    }
    connection.on("ReceiveNotification", handleNewOrder)
    return () => {
      connection.off("ReceiveNotification", handleNewOrder)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
          order.requestCode.toLowerCase().includes(query) ||
          order.agencyName.toLowerCase().includes(query) ||
          (order.requestProductDetails &&
            order.requestProductDetails.some((detail) => detail.productName.toLowerCase().includes(query))),
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

    // Cập nhật tổng số trang
    setTotalPages(Math.ceil(filtered.length / itemsPerPage))
    setFilteredOrders(filtered)
  }, [orders, statusFilter, searchQuery, dateRange, itemsPerPage])

  // Calculate total pages whenever filtered orders change
  useEffect(() => {
    setTotalPages(Math.ceil(filteredOrders.length / itemsPerPage))
  }, [filteredOrders, itemsPerPage])

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSort = (field: SortField) => {
    // If clicking the same field, toggle direction
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // If clicking a new field, set it as the sort field and default to ascending
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Sắp xếp đơn hàng theo trạng thái và phân trang
  const sortedOrders = [...filteredOrders]
    .sort((a, b) => {
      // First apply the custom sort if a sort field is selected
      if (sortField === "status") {
        // Thứ tự ưu tiên: PENDING -> APPROVED -> COMPLETED -> CANCELLED
        const statusOrder = {
          Pending: 0,
          Approved: 1,
          Completed: 2,
          Canceled: 3,
        }

        const comparison = statusOrder[a.requestStatus] - statusOrder[b.requestStatus]
        return sortDirection === "asc" ? comparison : -comparison
      } else if (sortField === "createdAt") {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA
      } else {
        // Default sort by status if no sort field is selected
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return dateB - dateA // Default to newest first
      }
    })
    // Paginate the results
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Hiển thị chi tiết đơn hàng
  const handleViewOrderDetail = async (order: RequestProduct) => {
    try {
      setIsLoadingDetails(true)
      setShowOrderDetail(true)

      // Hiển thị dữ liệu cơ bản trước khi có kết quả API
      setSelectedOrder(order)
      setOrderDetail(null) // Reset orderDetail khi mở modal mới

      // Nếu đã tải chi tiết cho đơn hàng này, sử dụng dữ liệu có sẵn
      if (detailsLoaded[order.requestProductId]) {
        setOrderDetail(order)
        setIsLoadingDetails(false)
        return
      }

      // Lấy token từ auth-service
      const token = getToken()

      if (!token) {
        navigate("/login")
        return
      }

      // Gọi API để lấy chi tiết đơn hàng
      const response = await fetch(`https://minhlong.mlhr.org/api/request-products/${order.requestProductId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data && data.length > 0) {
        // API trả về một mảng, lấy phần tử đầu tiên
        const detail = data[0]

        // Cập nhật state với dữ liệu chi tiết từ API
        setOrderDetail(detail)

        // Cập nhật orders với chi tiết mới
        const updatedOrders = orders.map((o) =>
          o.requestProductId === order.requestProductId ? { ...o, ...detail } : o,
        )
        setOrders(updatedOrders)

        // Cập nhật filtered orders
        const updatedFilteredOrders = filteredOrders.map((o) =>
          o.requestProductId === order.requestProductId ? { ...o, ...detail } : o,
        )
        setFilteredOrders(updatedFilteredOrders)

        // Đánh dấu đã tải chi tiết cho đơn hàng này
        setDetailsLoaded((prev) => ({
          ...prev,
          [order.requestProductId]: true,
        }))
      } else {
        console.warn("Không thể tải chi tiết đơn hàng từ API. Sử dụng dữ liệu cơ bản.")
      }
    } catch (err) {
      console.error("Error fetching order details:", err)

      // Kiểm tra lỗi xác thực
      if (err instanceof Error && err.message.includes("401")) {
        navigate("/login")
        return
      }

      toast.error("Đã xảy ra lỗi khi tải chi tiết đơn hàng")
    } finally {
      setIsLoadingDetails(false)
    }
  }

  // Phê duyệt đơn hàng
  const handleApproveOrder = async (requestProductId: string) => {
    try {
      // Kiểm tra quyền SALES_MANAGER
      if (!isSalesManager()) {
        toast.error("Bạn không có quyền phê duyệt đơn hàng")
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
            ? {
              ...order,
              requestStatus: "Approved" as const,
              updatedAt: new Date().toISOString(),
              approvedBy: 4,
              approvedName: "Cao Kien Quoc", // Thêm tên người phê duyệt
            }
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
            approvedName: "Cao Kien Quoc",
          })
        }

        // Cập nhật orderDetail nếu có
        if (orderDetail && orderDetail.requestProductId === requestProductId) {
          setOrderDetail({
            ...orderDetail,
            requestStatus: "Approved",
            updatedAt: new Date().toISOString(),
            approvedBy: 4,
            approvedName: "Cao Kien Quoc",
          })
        }

        toast.success("Đơn hàng đã được phê duyệt thành công!")
      } else {
        toast.error("Không thể phê duyệt đơn hàng. Vui lòng thử lại sau.")
      }
    } catch (err) {
      console.error("Error approving order:", err)

      // Kiểm tra lỗi xác thực
      if (err instanceof Error && err.message.includes("401")) {
        navigate("/login")
        return
      }

      toast.error("Đã xảy ra lỗi khi phê duyệt đơn hàng")
    }
  }

  // Hủy đơn hàng
  const handleCancelOrder = async (requestProductId: string) => {
    try {
      // Kiểm tra quyền SALES_MANAGER
      if (!isSalesManager()) {
        toast.error("Bạn không có quyền hủy đơn hàng")
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
            ? {
              ...order,
              requestStatus: "Canceled" as const,
              updatedAt: new Date().toISOString(),
            }
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

        // Cập nhật orderDetail nếu có
        if (orderDetail && orderDetail.requestProductId === requestProductId) {
          setOrderDetail({
            ...orderDetail,
            requestStatus: "Canceled",
            updatedAt: new Date().toISOString(),
          })
        }

        toast.success("Đơn hàng đã được hủy thành công!")
      } else {
        toast.error("Không thể hủy đơn hàng. Vui lòng thử lại sau.")
      }
    } catch (err) {
      console.error("Error cancelling order:", err)

      // Kiểm tra lỗi xác thực
      if (err instanceof Error && err.message.includes("401")) {
        navigate("/login")
        return
      }

      toast.error("Đã xảy ra lỗi khi hủy đơn hàng")
    }
  }

  return (
    <SalesLayout>
      <div className="m-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold mb-4">Quản Lý đơn hàng</h1>
        </div>
        <div className="space-y-6">

          {/* <OrderSummaryCards
          ordersCount={filteredOrders.length}
          totalProducts={totalProducts}
          totalQuantity={totalQuantity}
        /> */}
          <OrderFilter
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
          />
          {isLoading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} />
          ) : filteredOrders.length === 0 ? (
            <EmptyState />
          ) : (
            <OrderTable
              orders={sortedOrders}
              detailsLoaded={detailsLoaded}
              onViewDetail={handleViewOrderDetail}
              onApprove={handleApproveOrder}
              onCancel={handleCancelOrder}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
          )}

          {!isLoading && !error && filteredOrders.length > 0 && (
            <OrderPagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          )}

          <OrderDetailModal
            isOpen={showOrderDetail}
            onClose={() => setShowOrderDetail(false)}
            isLoading={isLoadingDetails}
            selectedOrder={selectedOrder}
            orderDetail={orderDetail}
            onApprove={handleApproveOrder}
          />

        </div>
      </div>
    </SalesLayout>
  )
}

