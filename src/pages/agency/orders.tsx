import { useState, useEffect } from "react"
import { AgencyLayout } from "@/layouts/agency-layout"
import { useAuth } from "@/contexts/AuthContext"
import { connection } from "@/lib/signalr-client"
// Import types
import type { Order } from "@/types/agency-orders"
import type { SortDirection } from "@/types/agency-orders"

// Import components
import { OrderSearchFilter } from "@/components/agency/order-search-filter"
import { OrderTable } from "@/components/agency/order-table"
import { OrderPagination } from "@/components/agency/order-pagination"
import { OrderDetailDialog } from "@/components/agency/order-detail-dialog"
import { PaymentDialog } from "@/components/agency/payment-dialog"
import { CancelOrderDialog } from "@/components/agency/cancel-order-dialog"
import { ReturnRequestDialog } from "@/components/agency/return-request-dialog"
import { LoadingState } from "@/components/agency/loading-state"
import { ErrorState } from "@/components/agency/error-state"

// Import utilities
import { formatDate } from "@/utils/date-utils"
import { toast } from "sonner"
import { filterOrders, sortOrders } from "@/utils/orderAgency-utils"

const AgencyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState<boolean>(false)
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<boolean>(false)

  // State for sorting
  const [sortField, setSortField] = useState<string>("orderDate")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  // State for pagination
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [itemsPerPage] = useState<number>(15)

  // State for payment dialog
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState<boolean>(false)
  const [paymentAmount, setPaymentAmount] = useState<string>("")
  const [orderToPayment, setOrderToPayment] = useState<Order | null>(null)
  const [paymentDescription, setPaymentDescription] = useState<string>("")

  // State for return request dialog
  const [isReturnRequestDialogOpen, setIsReturnRequestDialogOpen] = useState<boolean>(false)
  const [isSubmittingReturn, setIsSubmittingReturn] = useState<boolean>(false)
  const [orderForReturn, setOrderForReturn] = useState<Order | null>(null)

  const { user } = useAuth()
  const token = localStorage.getItem("auth_token") || ""

  // Fetch orders from API
  const fetchOrders = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("https://minhlong.mlhr.org/api/orders/my-orders", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      setOrders(data)
      setFilteredOrders(data)
    } catch (err) {
      console.error("Failed to fetch orders:", err)
      setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchOrders()
    }
  }, [token])
  // Listen for SignalR notifications
  useEffect(() => {
    const handleNewOrder = () => {
      // Refresh orders when notification received
      fetchOrders()
    }
    connection.on("ReceiveNotification", handleNewOrder)
    return () => {
      connection.off("ReceiveNotification", handleNewOrder)
    }
  }, [])

  // Fetch orders on component mount

  // Filter and sort orders when dependencies change
  useEffect(() => {
    if (orders.length > 0) {
      // First filter the orders
      const filtered = filterOrders(orders, searchTerm, statusFilter)

      // Then sort the filtered results
      const sorted = sortOrders(filtered, sortField, sortDirection)

      setFilteredOrders(sorted)
      // Reset to first page when filters change
      setCurrentPage(1)
    }
  }, [searchTerm, statusFilter, orders, sortField, sortDirection])

  // Calculate pagination values
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem)

  // Handle sort change
  const handleSortChange = (field: string) => {
    if (field === sortField) {
      // If clicking the same field, toggle direction
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // If clicking a new field, set it as the sort field and default to desc
      setSortField(field)
      setSortDirection("desc")
    }
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // View order details
  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order)
    setIsDialogOpen(true)
  }

  // Open payment dialog
  const handlePaymentClick = (order: Order) => {
    setOrderToPayment(order)
    setPaymentAmount("")
    setPaymentDescription(`${order.orderCode}`)
    setIsPaymentDialogOpen(true)
  }

  // Process payment
  const handlePayment = async () => {
    if (!orderToPayment || !paymentAmount || Number.parseFloat(paymentAmount) <= 0) {
      alert("Vui lòng nhập số tiền hợp lệ")
      return
    }

    setActionLoading(true)
    try {
      const userId = user?.id
      if (!userId) {
        throw new Error("Không tìm thấy thông tin người dùng")
      }

      const paymentData = {
        orderId: orderToPayment.orderId,
        agencyId: orderToPayment.agencyId,
        price: Number.parseFloat(paymentAmount),
        description: paymentDescription,
      }

      const response = await fetch(`https://minhlong.mlhr.org/api/Payment/${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const paymentResponse = await response.json()

      // Close payment dialog
      setIsPaymentDialogOpen(false)

      // Check if there's a checkout URL and redirect
      if (paymentResponse && paymentResponse.checkoutUrl) {
        window.location.href = paymentResponse.checkoutUrl
      } else {
        console.error("Không tìm thấy URL thanh toán trong phản hồi:", paymentResponse)
        alert("Không thể tạo liên kết thanh toán. Vui lòng thử lại sau.")
        // Refresh orders
        fetchOrders()
      }
    } catch (err) {
      console.error("Failed to pay for order:", err)
      alert("Không thể thanh toán đơn hàng. Vui lòng thử lại sau.")
    } finally {
      setActionLoading(false)
    }
  }

  // Open cancel order dialog
  const handleCancelClick = (orderId: string) => {
    setOrderToCancel(orderId)
    setIsAlertDialogOpen(true)
  }

  // Cancel order
  const handleCancelOrder = async () => {
    if (!orderToCancel) return

    setActionLoading(true)
    try {
      const response = await fetch(`https://minhlong.mlhr.org/api/orders/${orderToCancel}/cancel`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      // Refresh orders after successful cancellation
      fetchOrders()
      alert("Hủy đơn hàng thành công!")
    } catch (err) {
      console.error("Failed to cancel order:", err)
      alert("Không thể hủy đơn hàng. Vui lòng thử lại sau.")
    } finally {
      setActionLoading(false)
      setIsAlertDialogOpen(false)
      setOrderToCancel(null)
    }
  }

  // Open return request dialog
  const handleReturnRequestClick = (order: Order) => {
    setOrderForReturn(order)
    setIsReturnRequestDialogOpen(true)
  }

  // Handle return request submission
  const handleSubmitReturn = async (formData: FormData) => {
    try {
      setIsSubmittingReturn(true)

      const response = await fetch("https://minhlong.mlhr.org/api/returns/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to submit return request')
      }

      // Close dialog and show success message
      setIsReturnRequestDialogOpen(false)
      toast.success("Yêu cầu trả hàng đã được gửi thành công!")

      // Refresh orders after successful submission
      fetchOrders()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Failed to submit return request:", err)
      toast.error(err.message || "Không thể gửi yêu cầu trả hàng. Vui lòng thử lại sau.")
    } finally {
      setIsSubmittingReturn(false)
    }
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
        <div className="container mx-auto py-6">
          <ErrorState message={error} onRetry={fetchOrders} />
        </div>
      </AgencyLayout>
    )
  }

  return (
    <AgencyLayout>
      <div className="m-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Quản lý đơn hàng của tôi</h1>
          <p className="text-gray-500 mt-1">Xem lại đơn hàng mà bạn đã yêu cầu</p>
        </div>

        <div className="bg-white p-4 rounded-md shadow-sm">
          {/* Search and filter */}
          <OrderSearchFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />

          {/* Orders table */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Không tìm thấy đơn hàng nào</p>
            </div>
          ) : (
            <>
              <OrderTable
                orders={currentItems}
                sortField={sortField}
                sortDirection={sortDirection}
                onSortChange={handleSortChange}
                onViewDetails={handleViewOrderDetails}
                onPayment={handlePaymentClick}
                onCancel={handleCancelClick}
                onReturnRequest={handleReturnRequestClick}
                actionLoading={actionLoading}
                formatDate={formatDate}
              />

              {/* Pagination */}
              <OrderPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredOrders.length}
                itemsPerPage={itemsPerPage}
                indexOfFirstItem={indexOfFirstItem}
                indexOfLastItem={indexOfLastItem}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>

        {/* Order detail dialog */}
        <OrderDetailDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          selectedOrder={selectedOrder}
          onPayment={handlePaymentClick}
          onCancel={handleCancelClick}
          actionLoading={actionLoading}
          formatDate={formatDate}
        />

        {/* Payment dialog */}
        <PaymentDialog
          isOpen={isPaymentDialogOpen}
          onOpenChange={setIsPaymentDialogOpen}
          orderToPayment={orderToPayment}
          paymentAmount={paymentAmount}
          onPaymentAmountChange={setPaymentAmount}
          paymentDescription={paymentDescription}
          onPaymentDescriptionChange={setPaymentDescription}
          onPaymentSubmit={handlePayment}
          actionLoading={actionLoading}
        />

        {/* Cancel order dialog */}
        <CancelOrderDialog
          isOpen={isAlertDialogOpen}
          onOpenChange={setIsAlertDialogOpen}
          onConfirm={handleCancelOrder}
          actionLoading={actionLoading}
        />

        {/* Return request dialog */}
        <ReturnRequestDialog
          isOpen={isReturnRequestDialogOpen}
          onOpenChange={setIsReturnRequestDialogOpen}
          selectedOrder={orderForReturn}
          onSubmitReturn={handleSubmitReturn}
          isSubmitting={isSubmittingReturn}
        />
      </div>
    </AgencyLayout>
  )
}

export default AgencyOrders
