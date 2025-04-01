"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Input } from "../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { AgencyLayout } from "../../layouts/agency-layout";

import {
  ChevronDown,
  ChevronUp,
  Search,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Định nghĩa interface cho dữ liệu lịch sử thanh toán
interface PaymentHistory {
  paymentHistoryId: string;
  orderId: string;
  orderCode: string;
  agencyId: number;
  agencyName: string;
  paymentMethod: string;
  paymentDate: string;
  serieNumber: string;
  status: string;
  totalAmountPayment: number;
  remainingDebtAmount: number;
  paymentAmount: number;
  createdAt: string;
  updatedAt: string;
}


const AgencyPaymentHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentHistory[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State cho dialog thanh toán
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] =
    useState<boolean>(false);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [selectedPayment, setSelectedPayment] = useState<PaymentHistory | null>(
    null
  );
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Sorting state
  const [sortField, setSortField] =
    useState<keyof PaymentHistory>("paymentDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Search state
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(15);

  const token = localStorage.getItem("auth_token") || "";

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        setLoading(true);

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          "https://minhlong.mlhr.org/api/PaymentHistory/all",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch payment history");
        }

        const data = await response.json();
        setPaymentHistory(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentHistory();
  }, [navigate, token]);

  // Sort and filter data
  useEffect(() => {
    let result = [...paymentHistory];

    // Apply search filter
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      result = result.filter(
        (payment) =>
          payment.orderCode.toLowerCase().includes(lowerCaseSearch) ||
          payment.agencyName.toLowerCase().includes(lowerCaseSearch) ||
          payment.serieNumber.toLowerCase().includes(lowerCaseSearch) ||
          payment.paymentMethod.toLowerCase().includes(lowerCaseSearch)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle date fields
      if (
        sortField === "paymentDate" ||
        sortField === "createdAt" ||
        sortField === "updatedAt"
      ) {
        aValue = new Date(a[sortField]).getTime();
        bValue = new Date(b[sortField]).getTime();
      }

      // Handle numeric fields
      if (
        sortField === "totalAmountPayment" ||
        sortField === "remainingDebtAmount" ||
        sortField === "paymentAmount"
      ) {
        aValue = Number(a[sortField]);
        bValue = Number(b[sortField]);
      }

      if (aValue < bValue) {
        return sortDirection === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });

    setFilteredPayments(result);
    setCurrentPage(1);
  }, [paymentHistory, searchTerm, sortField, sortDirection]);

  // Handle sort change
  const handleSortChange = (field: keyof PaymentHistory) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  // Open payment dialog
  const openPaymentDialog = (payment: PaymentHistory) => {
    setSelectedPayment(payment);
    setPaymentAmount("");
    setIsPaymentDialogOpen(true);
  };

  // Handle payment
  const handlePayment = async () => {
    if (
      !selectedPayment ||
      !paymentAmount ||
      Number.parseFloat(paymentAmount) <= 0
    ) {
      toast.error("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    setActionLoading(true);
    try {
      const userId = user?.id;
      if (!userId) {
        throw new Error("Không tìm thấy thông tin người dùng");
      }

      const paymentData = {
        orderId: selectedPayment.orderId,
        agencyId: selectedPayment.agencyId,
        price: Number.parseFloat(paymentAmount),
        description: `${selectedPayment.orderCode}`,
      };
      console.log(paymentData);

      const response = await fetch(
        `https://minhlong.mlhr.org/api/Payment/${userId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paymentData),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const paymentResponse = await response.json();

      // Đóng dialog thanh toán
      setIsPaymentDialogOpen(false);

      // Kiểm tra xem có checkoutUrl không và chuyển hướng
      if (paymentResponse && paymentResponse.checkoutUrl) {
        // Chuyển hướng đến trang thanh toán
        window.location.href = paymentResponse.checkoutUrl;
      } else {
        // Nếu không có checkoutUrl, hiển thị thông báo lỗi
        console.error(
          "Không tìm thấy URL thanh toán trong phản hồi:",
          paymentResponse
        );
        toast.error("Không thể tạo liên kết thanh toán. Vui lòng thử lại sau.");

        // Cập nhật lại danh sách thanh toán
        const refreshResponse = await fetch(
          "https://minhlong.mlhr.org/api/PaymentHistory/all",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setPaymentHistory(data);
        }
      }
    } catch (err) {
      console.error("Failed to create payment:", err);
      toast.error("Không thể tạo thanh toán. Vui lòng thử lại sau.");
    } finally {
      setActionLoading(false);
    }
  };

  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPayments.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge className="bg-green-500">Đã thanh toán</Badge>;
      case "PARTIALLY_PAID":
        return <Badge className="bg-yellow-500">Thanh toán một phần</Badge>;
      case "UNPAID":
        return <Badge className="bg-red-500">Chưa thanh toán</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Render sort indicator
  const renderSortIndicator = (field: keyof PaymentHistory) => {
    if (sortField !== field) return null;

    return sortDirection === "asc" ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Đang tải...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <AgencyLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Lịch sử thanh toán đại lý</h1>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <Input
              placeholder="Tìm kiếm theo mã đơn hàng, đại lý, số serie hoặc phương thức thanh toán..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSortChange("orderCode")}
                >
                  <div className="flex items-center">
                    Mã đơn hàng
                    {renderSortIndicator("orderCode")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSortChange("agencyName")}
                >
                  <div className="flex items-center">
                    Đại lý
                    {renderSortIndicator("agencyName")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSortChange("paymentMethod")}
                >
                  <div className="flex items-center">
                    Phương thức
                    {renderSortIndicator("paymentMethod")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSortChange("paymentDate")}
                >
                  <div className="flex items-center">
                    Ngày thanh toán
                    {renderSortIndicator("paymentDate")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSortChange("serieNumber")}
                >
                  <div className="flex items-center">
                    Số serie
                    {renderSortIndicator("serieNumber")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSortChange("status")}
                >
                  <div className="flex items-center">
                    Trạng thái
                    {renderSortIndicator("status")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer text-right"
                  onClick={() => handleSortChange("totalAmountPayment")}
                >
                  <div className="flex items-center justify-end">
                    Tổng tiền
                    {renderSortIndicator("totalAmountPayment")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer text-right"
                  onClick={() => handleSortChange("paymentAmount")}
                >
                  <div className="flex items-center justify-end">
                    Đã thanh toán
                    {renderSortIndicator("paymentAmount")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer text-right"
                  onClick={() => handleSortChange("remainingDebtAmount")}
                >
                  <div className="flex items-center justify-end">
                    Còn nợ
                    {renderSortIndicator("remainingDebtAmount")}
                  </div>
                </TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    Không có dữ liệu thanh toán
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map((payment) => (
                  <TableRow key={payment.paymentHistoryId}>
                    <TableCell>{payment.orderCode}</TableCell>
                    <TableCell>{payment.agencyName}</TableCell>
                    <TableCell>{payment.paymentMethod}</TableCell>
                    <TableCell>
                      {format(
                        new Date(payment.paymentDate),
                        "dd/MM/yyyy HH:mm",
                        { locale: vi }
                      )}
                    </TableCell>
                    <TableCell>{payment.serieNumber}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(payment.totalAmountPayment)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(payment.paymentAmount)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(payment.remainingDebtAmount)}
                    </TableCell>
                    <TableCell>
                      {payment.status === "PARTIALLY_PAID" && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => openPaymentDialog(payment)}
                        >
                          Thanh toán
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-gray-500">
                Hiển thị {indexOfFirstItem + 1}-
                {Math.min(indexOfLastItem, filteredPayments.length)} của{" "}
                {filteredPayments.length} kết quả
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => paginate(1)}
                  disabled={currentPage === 1}
                >
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
                    let pageToShow;
                    if (totalPages <= 5) {
                      pageToShow = i + 1;
                    } else if (currentPage <= 3) {
                      pageToShow = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageToShow = totalPages - 4 + i;
                    } else {
                      pageToShow = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageToShow}
                        variant={
                          currentPage === pageToShow ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => paginate(pageToShow)}
                        className="w-8 h-8 p-0"
                      >
                        {pageToShow}
                      </Button>
                    );
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

        {/* Payment Dialog */}
        <Dialog
          open={isPaymentDialogOpen}
          onOpenChange={setIsPaymentDialogOpen}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Thanh toán đơn hàng</DialogTitle>
              <DialogDescription>
                Nhập số tiền bạn muốn thanh toán cho đơn hàng{" "}
                {selectedPayment?.orderCode}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="amount" className="text-left">
                  Số tiền
                </label>
                <Input
                  id="amount"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Nhập số tiền"
                  className="col-span-3"
                />
              </div>
              {selectedPayment && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <span className="text-right">Còn nợ</span>
                    <span className="col-span-3 font-medium">
                      {formatCurrency(selectedPayment.remainingDebtAmount)}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <span className="text-right">Tổng tiền</span>
                    <span className="col-span-3 font-medium">
                      {formatCurrency(selectedPayment.totalAmountPayment)}
                    </span>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsPaymentDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button onClick={handlePayment} disabled={actionLoading}>
                {actionLoading ? "Đang xử lý..." : "Thanh toán"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AgencyLayout>
  );
};

export default AgencyPaymentHistoryPage;
