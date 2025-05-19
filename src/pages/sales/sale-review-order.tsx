"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/utils/api-utils";
import type { ReturnRequest } from "@/types/return-order";
import ReturnOrderTable from "@/components/sales/return-order-table";
import ReturnOrderFilter from "@/components/sales/return-order-filter";
import ReturnOrderDetailDialog from "@/components/sales/return-order-detail-dialog";
import ReturnOrderPagination from "@/components/sales/return-order-pagination";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { toast } from "sonner";
import { SalesLayout } from "@/layouts/sale-layout";
import { LoadingState } from "@/components/sales/loading-state";
import { ErrorState } from "@/components/sales/error-state";

export default function SaleReviewOrderPage() {
  const [returnOrders, setReturnOrders] = useState<ReturnRequest[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<ReturnRequest | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  // Sort state
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Fetch return orders
  const fetchReturnOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchWithAuth(
        "https://minhlong.mlhr.org/api/returns/return-requests/sale"
      );
      setReturnOrders(data);
      setTotalItems(data.length);
      setLoading(false);
    } catch (err) {
      console.error("Lỗi khi tải đơn trả hàng:", err);
      setError("Không thể tải đơn trả hàng. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchReturnOrders();
  }, []);

  // Apply filters, sorting, and pagination
  useEffect(() => {
    if (!returnOrders.length) {
      setFilteredOrders([]);
      setTotalItems(0);
      setCurrentPage(1); // Reset to page 1 if no orders
      return;
    }

    let result = [...returnOrders];

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(
        (order) => order.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Apply search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(
        (order) =>
          order.orderId.toLowerCase().includes(searchLower) ||
          order.createdByUserName.toLowerCase().includes(searchLower) ||
          order.details.some((detail) =>
            detail.productName.toLowerCase().includes(searchLower)
          )
      );
    }

    // Apply date filter
    if (dateRange.from) {
      result = result.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= dateRange.from!;
      });
    }

    if (dateRange.to) {
      result = result.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate <= dateRange.to!;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      let valueA, valueB;

      switch (sortField) {
        case "createdAt":
          valueA = new Date(a.createdAt).getTime();
          valueB = new Date(b.createdAt).getTime();
          break;
        case "status":
          valueA = a.status;
          valueB = b.status;
          break;
        case "createdByUserName":
          valueA = a.createdByUserName;
          valueB = b.createdByUserName;
          break;
        default:
          valueA = a.createdAt;
          valueB = b.createdAt;
      }

      if (sortDirection === "asc") {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    const newTotalItems = result.length;
    setTotalItems(newTotalItems);

    // Only reset currentPage if it exceeds the new totalPages
    const totalPages = Math.ceil(newTotalItems / itemsPerPage) || 1;
    if (currentPage > totalPages && newTotalItems > 0) {
      setCurrentPage(totalPages);
    }

    // Apply pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedResult = result.slice(startIndex, startIndex + itemsPerPage);

    setFilteredOrders(paginatedResult);
  }, [
    returnOrders,
    statusFilter,
    searchText,
    dateRange,
    sortField,
    sortDirection,
    itemsPerPage,
    currentPage, // Keep currentPage in dependencies to ensure pagination updates
  ]);

  // Handle approve return request
  const handleApproveReturn = async (returnRequestId: string) => {
    try {
      await fetchWithAuth(
        `https://minhlong.mlhr.org/api/returns/approve-Return-Request/${returnRequestId}`,
        {
          method: "PUT",
        }
      );

      // Update both returnOrders and filteredOrders
      setReturnOrders((prev) =>
        prev.map((order) =>
          order.returnRequestId === returnRequestId
            ? { ...order, status: "Approved" }
            : order
        )
      );

      setFilteredOrders((prev) =>
        prev.map((order) =>
          order.returnRequestId === returnRequestId
            ? { ...order, status: "Approved" }
            : order
        )
      );

      if (selectedOrder?.returnRequestId === returnRequestId) {
        setSelectedOrder({ ...selectedOrder, status: "Approved" });
      }

      toast.success("Đơn trả hàng đã được chấp nhận thành công");
    } catch (err) {
      console.error("Lỗi khi chấp nhận đơn trả hàng:", err);
      toast.error("Không thể chấp nhận đơn trả hàng. Vui lòng thử lại.");
    }
  };

  // Handle reject return request
  const handleRejectReturn = async (
    returnRequestId: string,
    reason: string
  ) => {
    try {
      await fetchWithAuth(
        `https://minhlong.mlhr.org/api/returns/reject-Return-Request/${returnRequestId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason }),
        }
      );

      // Update both returnOrders and filteredOrders
      setReturnOrders((prev) =>
        prev.map((order) =>
          order.returnRequestId === returnRequestId
            ? { ...order, status: "Rejected" }
            : order
        )
      );

      setFilteredOrders((prev) =>
        prev.map((order) =>
          order.returnRequestId === returnRequestId
            ? { ...order, status: "Rejected" }
            : order
        )
      );

      if (selectedOrder?.returnRequestId === returnRequestId) {
        setSelectedOrder({ ...selectedOrder, status: "Rejected" });
      }

      toast.success("Đơn trả hàng đã được từ chối thành công");
    } catch (err) {
      console.error("Lỗi khi từ chối đơn trả hàng:", err);
      toast.error("Không thể từ chối đơn trả hàng. Vui lòng thử lại.");
    }
  };

  // Handle order status update
  const handleStatusUpdate = async (
    returnRequestId: string,
    newStatus: string
  ) => {
    if (newStatus === "Approved") {
      return handleApproveReturn(returnRequestId);
    } else if (newStatus === "Rejected") {
      return handleRejectReturn(returnRequestId, "Cập nhật trạng thái");
    }

    try {
      await fetchWithAuth(
        `https://minhlong.mlhr.org/api/returns/${returnRequestId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      // Update both returnOrders and filteredOrders
      setReturnOrders((prev) =>
        prev.map((order) =>
          order.returnRequestId === returnRequestId
            ? { ...order, status: newStatus }
            : order
        )
      );

      setFilteredOrders((prev) =>
        prev.map((order) =>
          order.returnRequestId === returnRequestId
            ? { ...order, status: newStatus }
            : order
        )
      );

      if (selectedOrder?.returnRequestId === returnRequestId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }

      toast.success(
        `Trạng thái đơn trả hàng đã được cập nhật thành ${getStatusInVietnamese(
          newStatus
        )}`
      );
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái:", err);
      toast.error(
        "Không thể cập nhật trạng thái đơn trả hàng. Vui lòng thử lại."
      );
    }
  };

  // Get Vietnamese status
  const getStatusInVietnamese = (status: string) => {
    switch (status) {
      case "Pending":
        return "Chờ xử lý";
      case "Approved":
        return "Đã chấp nhận";
      case "Completed":
        return "Hoàn thành";
      case "Rejected":
        return "Từ chối";
      default:
        return status;
    }
  };

  // Handle view details
  const handleViewDetails = (order: ReturnRequest) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  // Handle sort change
  const handleSortChange = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1); // Reset to page 1 when sorting changes
  };

  // Handle filter change
  const handleFilterChange = (
    status: string,
    search: string,
    dates: { from: Date | undefined; to: Date | undefined }
  ) => {
    setStatusFilter(status);
    setSearchText(search);
    setDateRange(dates);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    const validatedPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validatedPage);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  if (loading)
    return (
      <SalesLayout>
        <LoadingState message="Đang tải đơn trả hàng..." />
      </SalesLayout>
    );

  if (error)
    return (
      <SalesLayout>
        <ErrorState message={error} />
      </SalesLayout>
    );

  return (
    <SalesLayout>
      <div className="m-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Quản Lý Đơn Trả Hàng</h1>
        </div>

        <Card>
          <CardHeader>
            <CardDescription>
              Xem xét và quản lý các yêu cầu trả hàng từ đại lý
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReturnOrderFilter
              onFilterChange={handleFilterChange}
              statusFilter={statusFilter}
              searchText={searchText}
              dateRange={dateRange}
            />

            <div className="mt-6">
              <ReturnOrderTable
                returnOrders={filteredOrders}
                onViewDetails={handleViewDetails}
                onApproveReturn={handleApproveReturn}
                onRejectReturn={handleRejectReturn}
                sortField={sortField}
                sortDirection={sortDirection}
                onSortChange={handleSortChange}
                getStatusInVietnamese={getStatusInVietnamese}
              />
            </div>

            <div className="mt-4">
              <ReturnOrderPagination
                currentPage={currentPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </div>
          </CardContent>
        </Card>

        {selectedOrder && (
          <ReturnOrderDetailDialog
            returnOrder={selectedOrder}
            open={isDetailOpen}
            onOpenChange={setIsDetailOpen}
            onStatusUpdate={handleStatusUpdate}
            onApproveReturn={handleApproveReturn}
            onRejectReturn={handleRejectReturn}
            getStatusInVietnamese={getStatusInVietnamese}
          />
        )}
      </div>
    </SalesLayout>
  );
}
