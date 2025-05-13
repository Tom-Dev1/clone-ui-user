"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AgencyLayout } from "../../layouts/agency-layout"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

// Import types
import type { PaymentHistory } from "@/types/payment-history"
import type { SortDirection } from "@/types/payment-history"

// Import components
import { PaymentSearch } from "@/components/payment/payment-search"
import { PaymentTable } from "@/components/payment/payment-table"
import { PaymentPagination } from "@/components/payment/payment-pagination"
import { PaymentDialog } from "@/components/payment/payment-dialog"
import { PaymentDetailDialog } from "@/components/payment/payment-detail-dialog"
import { LoadingState } from "@/components/payment/loading-state"
import { ErrorState } from "@/components/payment/error-state"

const AgencyPaymentHistoryPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([])
  const [filteredPayments, setFilteredPayments] = useState<PaymentHistory[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // State cho dialog thanh toán
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState<boolean>(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState<boolean>(false)
  const [paymentAmount, setPaymentAmount] = useState<string>("")
  const [selectedPayment, setSelectedPayment] = useState<PaymentHistory | null>(null)
  const [actionLoading, setActionLoading] = useState<boolean>(false)

  // Sorting state
  const [sortField, setSortField] = useState<keyof PaymentHistory>("paymentDate")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  // Search state
  const [searchTerm, setSearchTerm] = useState<string>("")

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [itemsPerPage] = useState<number>(8) // Changed from 15 to 8 items per page

  const token = localStorage.getItem("auth_token") || ""

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        setLoading(true)

        if (!token) {
          navigate("/login")
          return
        }

        const response = await fetch("https://minhlong.mlhr.org/api/PaymentHistory/my-payment-history", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch payment history")
        }

        const data = await response.json()
        setPaymentHistory(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentHistory()
  }, [navigate, token])

  // Sort and filter data
  useEffect(() => {
    let result = [...paymentHistory]

    // Apply search filter
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase()
      result = result.filter(
        (payment) =>
          payment.orderCode.toLowerCase().includes(lowerCaseSearch) ||
          payment.agencyName.toLowerCase().includes(lowerCaseSearch) ||
          payment.serieNumber.toLowerCase().includes(lowerCaseSearch) ||
          payment.paymentMethod.toLowerCase().includes(lowerCaseSearch),
      )
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]

      // Handle date fields
      if (
        sortField === "paymentDate" ||
        sortField === "createdAt" ||
        sortField === "updatedAt" ||
        sortField === "dueDate"
      ) {
        aValue = new Date(a[sortField]).getTime()
        bValue = new Date(b[sortField]).getTime()
      }

      // Handle numeric fields
      if (sortField === "totalAmountPayment" || sortField === "remainingDebtAmount" || sortField === "paymentAmount") {
        aValue = Number(a[sortField])
        bValue = Number(b[sortField])
      }

      if (aValue < bValue) {
        return sortDirection === "asc" ? -1 : 1
      }
      if (aValue > bValue) {
        return sortDirection === "asc" ? 1 : -1
      }
      return 0
    })

    setFilteredPayments(result)
    setCurrentPage(1)
  }, [paymentHistory, searchTerm, sortField, sortDirection])

  // Handle sort change
  const handleSortChange = (field: keyof PaymentHistory) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
    if (searchTerm !== "") {
      setCurrentPage(1)
    }
  }

  // Open payment detail dialog
  const openPaymentDetailDialog = (payment: PaymentHistory) => {
    setSelectedPayment(payment)
    setIsDetailDialogOpen(true)
  }

  // Open payment dialog directly
  const openPaymentDialog = (payment: PaymentHistory) => {
    setSelectedPayment(payment)
    setPaymentAmount("")
    setIsPaymentDialogOpen(true)
  }

  // Handle payment
  const handlePayment = async () => {
    if (!selectedPayment || !paymentAmount || Number.parseFloat(paymentAmount) <= 0) {
      toast.error("Vui lòng nhập số tiền hợp lệ")
      return
    }

    setActionLoading(true)
    try {
      const userId = user?.id
      if (!userId) {
        throw new Error("Không tìm thấy thông tin người dùng")
      }

      const paymentData = {
        orderId: selectedPayment.orderId,
        agencyId: selectedPayment.agencyId,
        price: Number.parseFloat(paymentAmount),
        description: `${selectedPayment.orderCode}`,
      }
      console.log(paymentData)

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

      // Đóng dialog thanh toán
      setIsPaymentDialogOpen(false)
      setIsDetailDialogOpen(false)

      // Kiểm tra xem có checkoutUrl không và chuyển hướng
      if (paymentResponse && paymentResponse.checkoutUrl) {
        // Chuyển hướng đến trang thanh toán
        window.location.href = paymentResponse.checkoutUrl
      } else {
        // Nếu không có checkoutUrl, hiển thị thông báo lỗi
        console.error("Không tìm thấy URL thanh toán trong phản hồi:", paymentResponse)
        toast.error("Không thể tạo liên kết thanh toán. Vui lòng thử lại sau.")

        // Cập nhật lại danh sách thanh toán
        const refreshResponse = await fetch("https://minhlong.mlhr.org/api/PaymentHistory/all", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (refreshResponse.ok) {
          const data = await refreshResponse.json()
          setPaymentHistory(data)
        }
      }
    } catch (err) {
      console.error("Failed to create payment:", err)
      toast.error("Không thể tạo thanh toán. Vui lòng thử lại sau.")
    } finally {
      setActionLoading(false)
    }
  }

  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredPayments.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage)

  // Change page
  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  if (loading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState message={error} />
  }

  return (
    <AgencyLayout>
      <div className="m-4">
        <h1 className="text-2xl font-bold mb-6">Lịch sử thanh toán đại lý</h1>

        {/* Search */}
        <PaymentSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        {/* Table */}
        <div className="rounded-md border shadow-sm">
          <PaymentTable
            payments={currentItems}
            sortField={sortField}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
            onPaymentClick={openPaymentDialog}
            onViewDetail={openPaymentDetailDialog}
          />

          {/* Pagination */}
          <PaymentPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredPayments.length}
            itemsPerPage={itemsPerPage}
            onPageChange={paginate}
          />
        </div>

        {/* Payment Detail Dialog */}
        <PaymentDetailDialog
          isOpen={isDetailDialogOpen}
          onOpenChange={setIsDetailDialogOpen}
          selectedPayment={selectedPayment}
          onPaymentSubmit={handlePayment}
          isLoading={actionLoading}
        />

        {/* Payment Dialog */}
        <PaymentDialog
          isOpen={isPaymentDialogOpen}
          onOpenChange={setIsPaymentDialogOpen}
          selectedPayment={selectedPayment}
          paymentAmount={paymentAmount}
          onPaymentAmountChange={setPaymentAmount}
          onPaymentSubmit={handlePayment}
          isLoading={actionLoading}
        />
      </div>
    </AgencyLayout>
  )
}

export default AgencyPaymentHistoryPage
