"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  CirclePlus,
  Eye,
  Filter,
  Search,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { SalesLayout } from "@/layouts/sale-layout";
import ExportRequestCreateDialog from "@/components/sales/dialogs/export-request-detail-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { connection } from "@/lib/signalr-client";

// Cập nhật interface để phù hợp với cấu trúc API mới
interface RequestExportDetail {
  requestExportDetailId: number;
  productId: number;
  productName: string;
  unit: string;
  price: number;
  requestedQuantity: number;
}

interface RequestExport {
  requestExportId: number;
  orderId: string;
  requestExportCode: string;
  agencyName: string;
  approvedByName: string;
  status: string;
  approvedDate: string;
  note: string;
  requestExportDetails: RequestExportDetail[];
}

// Giữ lại interface ApiProduct để sử dụng cho các sản phẩm từ API product
interface ApiProduct {
  productId: number;
  productCode: string;
  productName: string;
  unit: string;
  defaultExpiration: number;
  categoryId: number;
  description: string;
  taxId: number;
  createdBy: string;
  createdDate: string;
  availableStock: number;
  price: number;
  images: string[];
}

// Sửa hàm getToken để lấy auth_token thay vì auto_token
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  return null;
};

// Đảm bảo fetchWithAuth sử dụng Bearer token đúng cách
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  if (!token) {
    throw new Error("Authentication token not found");
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return response.json();
};

const SalesExports = () => {
  const [exportRequests, setExportRequests] = useState<RequestExport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RequestExport | null>(
    null
  );
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [, setLoadingProducts] = useState<boolean>(false);
  const [, setProductError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [filteredRequests, setFilteredRequests] = useState<RequestExport[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [baseRequestId, setBaseRequestId] = useState<number | null>(null);
  const [alertMessage, setAlertMessage] = useState<{
    type: "error" | "success" | null;
    title: string;
    message: string;
  }>({ type: null, title: "", message: "" });

  // New state for sorting and pagination
  const [sortField, setSortField] = useState<string>("approvedDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Check for authentication token
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setAuthError("Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.");
      setLoading(false);
    }
  }, []);

  const fetchExportRequests = async () => {
    if (authError) return;

    try {
      setLoading(true);
      // Sửa lại API call để sắp xếp và phân trang đúng
      const response = await fetchWithAuth(
        `https://minhlong.mlhr.org/api/RequestExport/all`
      );

      // Lưu toàn bộ dữ liệu
      setExportRequests(response);

      // Tính toán tổng số mục và tổng số trang
      setTotalItems(response.length);
      setTotalPages(Math.ceil(response.length / pageSize));

      setError(null);
    } catch (err) {
      console.error("Error fetching export requests:", err);
      setError("Failed to load export requests. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch export requests from API
  useEffect(() => {
    fetchExportRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authError]);
  // Hàm cập nhật khi signalR
  useEffect(() => {
    const handleNewOrder = () => {
      // Gọi API để lấy danh sách đơn hàng mới nhất
      fetchExportRequests();
    };
    connection.on("ReceiveNotification", handleNewOrder);
    return () => {
      connection.off("ReceiveNotification", handleNewOrder);
    };
  }, []);
  // Fetch products for displaying product details
  useEffect(() => {
    const fetchProducts = async () => {
      if (authError) return;

      try {
        setLoadingProducts(true);
        const data = await fetchWithAuth(
          "https://minhlong.mlhr.org/api/product"
        );
        setProducts(data);
        setProductError(null);
      } catch (err) {
        console.error("Error fetching products:", err);
        setProductError("Failed to load products. Please try again later.");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [authError]);

  // Filter, sort, and paginate export requests
  useEffect(() => {
    let filtered = [...exportRequests];

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((request) => request.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (request) =>
          request.orderId.toLowerCase().includes(query) ||
          request.requestExportCode.toLowerCase().includes(query) ||
          (request.note && request.note.toLowerCase().includes(query)) ||
          request.requestExportId.toString().includes(query) ||
          request.agencyName.toLowerCase().includes(query)
      );
    }

    // Filter by date range
    if (dateRange.from) {
      filtered = filtered.filter((request) => {
        if (!request.approvedDate) return false;
        return new Date(request.approvedDate) >= dateRange.from!;
      });
    }
    if (dateRange.to) {
      filtered = filtered.filter((request) => {
        if (!request.approvedDate) return false;
        return new Date(request.approvedDate) <= dateRange.to!;
      });
    }

    // Sort the filtered data
    filtered = sortData(filtered, sortField, sortDirection);

    // Update total items and pages
    setTotalItems(filtered.length);
    setTotalPages(Math.ceil(filtered.length / pageSize));

    // Apply pagination
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = filtered.slice(startIndex, startIndex + pageSize);

    setFilteredRequests(paginatedData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    exportRequests,
    statusFilter,
    searchQuery,
    dateRange,
    sortField,
    sortDirection,
    currentPage,
    pageSize,
  ]);

  // Sort function
  const sortData = (
    data: RequestExport[],
    field: string,
    direction: "asc" | "desc"
  ) => {
    return [...data].sort((a, b) => {
      let valueA, valueB;

      // Xác định giá trị để so sánh dựa trên trường
      switch (field) {
        case "approvedDate":
          valueA = a.approvedDate ? new Date(a.approvedDate).getTime() : 0;
          valueB = b.approvedDate ? new Date(b.approvedDate).getTime() : 0;
          break;
        case "status":
          valueA = a.status || "";
          valueB = b.status || "";
          break;
        case "totalValue":
          valueA = getTotalValue(a);
          valueB = getTotalValue(b);
          break;
        default:
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          valueA = (a as any)[field] || "";
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          valueB = (b as any)[field] || "";
      }

      // So sánh các giá trị
      if (typeof valueA === "string" && typeof valueB === "string") {
        return direction === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      } else {
        return direction === "asc"
          ? valueA > valueB
            ? 1
            : -1
          : valueA < valueB
          ? 1
          : -1;
      }
    });
  };

  // Clear alert after 5 seconds
  useEffect(() => {
    if (alertMessage.type) {
      const timer = setTimeout(() => {
        setAlertMessage({ type: null, title: "", message: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  const handleViewDetails = (request: RequestExport) => {
    setSelectedRequest(request);
    setDetailsOpen(true);
  };

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc"); // Mặc định sắp xếp giảm dần khi chọn trường mới
    }
    setCurrentPage(1); // Reset về trang đầu tiên khi thay đổi sắp xếp
  };

  // Render sort icon
  const renderSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    );
  };

  // Cập nhật hàm handleCreateRequest để chỉ hiển thị thông báo thành công
  const handleCreateRequest = async (requestData: RequestExport) => {
    try {
      // Refresh danh sách yêu cầu sau khi tạo thành công
      const fetchExportRequests = async () => {
        try {
          setLoading(true);
          const data = await fetchWithAuth(
            "https://minhlong.mlhr.org/api/RequestExport/all"
          );
          setExportRequests(data);
          setTotalItems(data.length);
          setTotalPages(Math.ceil(data.length / pageSize));
          setError(null);
        } catch (err) {
          console.error("Error fetching export requests:", err);
          setError("Failed to load export requests. Please try again later.");
        } finally {
          setLoading(false);
        }
      };

      // Hiển thị thông báo thành công
      setAlertMessage({
        type: "success",
        title: "Thành công",
        message: `Yêu cầu xuất kho #${requestData.requestExportId} đã được liên kết với kho.`,
      });

      // Gọi API để lấy danh sách yêu cầu mới
      fetchExportRequests();

      // Đóng dialog
      setCreateDialogOpen(false);
      setBaseRequestId(null);
    } catch (err) {
      console.error("Error handling export request:", err);
      setAlertMessage({
        type: "error",
        title: "Lỗi",
        message:
          "Không thể cập nhật danh sách yêu cầu xuất kho. Vui lòng thử lại sau.",
      });
    }
  };

  const handleCreateBasedOn = (requestId: number) => {
    setBaseRequestId(requestId);
    setCreateDialogOpen(true);
  };

  // Get product by ID - Không cần thay đổi vì vẫn sử dụng API product
  const getProduct = (productId: number) => {
    return products.find((p) => p.productId === productId);
  };

  // Các hàm lấy thông tin sản phẩm - Không cần thay đổi vì vẫn sử dụng API product
  // hoặc có thể sử dụng thông tin trực tiếp từ requestExportDetails nếu có

  const getProductCode = (productId: number) => {
    const product = getProduct(productId);
    return product ? product.productCode : "N/A";
  };

  const getProductImage = (productId: number) => {
    const product = getProduct(productId);
    return product && product.images && product.images.length > 0
      ? product.images[0]
      : null;
  };

  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "Requested":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Chờ duyệt
          </Badge>
        );
      case "Approved":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Đã duyệt
          </Badge>
        );
      case "Processing":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Đang xử lý
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch (error) {
      console.log(error);
      return "Invalid date";
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Calculate total requested quantity
  const getTotalRequestedQuantity = (request: RequestExport) => {
    return request.requestExportDetails.reduce(
      (total, item) => total + item.requestedQuantity,
      0
    );
  };

  // Calculate total value of request - Cập nhật để sử dụng price từ requestExportDetails
  const getTotalValue = (request: RequestExport) => {
    return request.requestExportDetails.reduce((total, item) => {
      return total + item.price * item.requestedQuantity;
    }, 0);
  };

  if (authError) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{authError}</p>
          <Button onClick={() => (window.location.href = "/login")}>
            Đăng nhập
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Đang tải yêu cầu xuất kho...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <SalesLayout>
      <div className="bg-white max-h[90vh] m-4">
        {alertMessage.type && (
          <Alert
            variant={alertMessage.type === "error" ? "destructive" : "default"}
            className="mb-6"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{alertMessage.title}</AlertTitle>
            <AlertDescription>{alertMessage.message}</AlertDescription>
          </Alert>
        )}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Quản Lý Yêu Cầu Xuất Kho</h1>
        </div>
        <Tabs defaultValue="all" className="space-y-6 ">
          <div className=" mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList>
              <TabsTrigger value="all" onClick={() => setStatusFilter("all")}>
                Tất cả
              </TabsTrigger>
              <TabsTrigger
                value="Requested"
                onClick={() => setStatusFilter("Requested")}
              >
                Chờ duyệt
              </TabsTrigger>
              <TabsTrigger
                value="Approved"
                onClick={() => setStatusFilter("Approved")}
              >
                Đã duyệt
              </TabsTrigger>
              <TabsTrigger
                value="Processing"
                onClick={() => setStatusFilter("Processing")}
              >
                Đang xử lý
              </TabsTrigger>
            </TabsList>

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
                                {dateRange.from ? (
                                  format(dateRange.from, "dd/MM/yyyy")
                                ) : (
                                  <span>Chọn ngày</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={dateRange.from}
                                onSelect={(date) =>
                                  setDateRange({ ...dateRange, from: date })
                                }
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
                                {dateRange.to ? (
                                  format(dateRange.to, "dd/MM/yyyy")
                                ) : (
                                  <span>Chọn ngày</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={dateRange.to}
                                onSelect={(date) =>
                                  setDateRange({ ...dateRange, to: date })
                                }
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
                        onClick={() =>
                          setDateRange({ from: undefined, to: undefined })
                        }
                      >
                        Xóa bộ lọc
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Add page size selector and export button */}
          <div className="flex justify-between items-center gap-2  mb-4">
            <div className="text-sm text-muted-foreground ">
              Hiển thị {filteredRequests.length} / {totalItems} yêu cầu
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Hiển thị" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 hàng</SelectItem>
                  <SelectItem value="30">30 hàng</SelectItem>
                  <SelectItem value="50">50 hàng</SelectItem>
                  <SelectItem value="100">100 hàng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="all" className="space-y-4">
            {filteredRequests.length === 0 ? (
              <div className="bg-muted/20 rounded-lg p-8 text-center">
                <ClipboardList className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">
                  Không tìm thấy yêu cầu xuất kho
                </h3>
                <p className="text-muted-foreground mb-4">
                  Không có yêu cầu xuất kho nào phù hợp với điều kiện tìm kiếm.
                </p>
                <Button
                  onClick={() => {
                    setStatusFilter("all");
                    setSearchQuery("");
                    setDateRange({ from: undefined, to: undefined });
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
                        <TableHead className="w-[120px] text-center">
                          Mã yêu cầu
                        </TableHead>
                        <TableHead className="w-[170px] text-center">
                          Mã phiếu xuất
                        </TableHead>
                        <TableHead className="w-[160px] text-center">
                          Đại lý
                        </TableHead>
                        <TableHead
                          className="w-[160px] text-center cursor-pointer"
                          onClick={() => handleSort("approvedDate")}
                        >
                          <div className="flex items-center justify-center">
                            Ngày duyệt
                            {renderSortIcon("approvedDate")}
                          </div>
                        </TableHead>
                        <TableHead className="text-center">Ghi chú</TableHead>
                        <TableHead className="w-[100px] text-center">
                          Số SP
                        </TableHead>
                        <TableHead className="w-[100px] text-center">
                          Tổng SL
                        </TableHead>
                        <TableHead
                          className="w-[120px] text-center cursor-pointer"
                          onClick={() => handleSort("totalValue")}
                        >
                          <div className="flex items-center justify-center">
                            Tổng giá trị
                            {renderSortIcon("totalValue")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="w-[120px] text-center cursor-pointer"
                          onClick={() => handleSort("status")}
                        >
                          <div className="flex items-center justify-center">
                            Trạng thái
                            {renderSortIcon("status")}
                          </div>
                        </TableHead>
                        <TableHead className="w-[120px] text-center">
                          Thao tác
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.map((request) => (
                        <TableRow key={request.requestExportId}>
                          <TableCell className="font-medium text-center">
                            {request.requestExportId}
                          </TableCell>
                          <TableCell className="w-[170px] text-center">
                            {request.requestExportCode}
                          </TableCell>
                          <TableCell className="w-[160px] text-center">
                            {request.agencyName}
                          </TableCell>
                          <TableCell className="w-[160px] text-center">
                            {formatDate(request.approvedDate)}
                          </TableCell>
                          <TableCell>
                            {request.note || "Không có ghi chú"}
                          </TableCell>
                          <TableCell className="w-[120px] text-center">
                            {request.requestExportDetails.length}
                          </TableCell>
                          <TableCell className="w-[120px] text-center">
                            {getTotalRequestedQuantity(request)}
                          </TableCell>
                          <TableCell className="w-[120px] text-right">
                            {formatCurrency(getTotalValue(request))}
                          </TableCell>
                          <TableCell className="w-[120px] text-center">
                            {renderStatusBadge(request.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-around">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewDetails(request)}
                                title="Xem chi tiết"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {request.status !== "Approved" &&
                                request.status !== "Requested" && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleCreateBasedOn(
                                        request.requestExportId
                                      )
                                    }
                                    title="Tạo yêu cầu dựa trên yêu cầu này"
                                  >
                                    <CirclePlus className="h-4 w-4" />
                                  </Button>
                                )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Cải thiện phân trang */}
            {filteredRequests.length > 0 && totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground w-32">
                  Trang {currentPage} / {totalPages}
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {/* Hiển thị các số trang */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;

                      // Tính toán số trang hiển thị xung quanh trang hiện tại
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => setCurrentPage(pageNum)}
                            isActive={currentPage === pageNum}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
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

      {/* Dialog for viewing export request details */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="flex flex-col min-w-[100vh] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Chi tiết yêu cầu xuất kho</DialogTitle>
            <DialogDescription>
              Mã yêu cầu: {selectedRequest?.requestExportId} -{" "}
              {selectedRequest?.requestExportCode}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <ScrollArea className="flex-1 overflow-y-auto">
              <div className="space-y-6 py-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Thông tin yêu cầu
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="grid grid-cols-2 gap-1 text-sm text-left">
                        <dt className="text-muted-foreground">Mã yêu cầu:</dt>
                        <dd>{selectedRequest.requestExportId}</dd>

                        <dt className="text-muted-foreground">
                          Mã phiếu xuất:
                        </dt>
                        <dd>{selectedRequest.requestExportCode}</dd>

                        <dt className="text-muted-foreground">Đại lý:</dt>
                        <dd>{selectedRequest.agencyName}</dd>

                        <dt className="text-muted-foreground">Trạng thái:</dt>
                        <dd>{renderStatusBadge(selectedRequest.status)}</dd>

                        <dt className="text-muted-foreground">Người duyệt:</dt>
                        <dd>
                          {selectedRequest.approvedByName || "Chưa duyệt"}
                        </dd>

                        <dt className="text-muted-foreground">Ngày duyệt:</dt>
                        <dd>{formatDate(selectedRequest.approvedDate)}</dd>

                        {selectedRequest.note && (
                          <>
                            <dt className="text-muted-foreground">Ghi chú:</dt>
                            <dd>{selectedRequest.note}</dd>
                          </>
                        )}
                      </dl>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Thông tin tổng hợp
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="grid grid-cols-2 gap-1 text-sm">
                        <dt className="text-muted-foreground">
                          Số lượng sản phẩm:
                        </dt>
                        <dd>{selectedRequest.requestExportDetails.length}</dd>

                        <dt className="text-muted-foreground">
                          Tổng số lượng:
                        </dt>
                        <dd>{getTotalRequestedQuantity(selectedRequest)}</dd>

                        <dt className="text-muted-foreground">Tổng giá trị:</dt>
                        <dd className="font-medium">
                          {formatCurrency(getTotalValue(selectedRequest))}
                        </dd>
                      </dl>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      Danh sách sản phẩm
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[60px]"></TableHead>
                          <TableHead className="w-[80px]">Mã SP</TableHead>
                          <TableHead>Tên sản phẩm</TableHead>
                          <TableHead className="w-[80px]">Đơn vị</TableHead>
                          <TableHead className="w-[100px]">Số lượng</TableHead>
                          <TableHead className="w-[120px]">Đơn giá</TableHead>
                          <TableHead className="w-[120px]">
                            Thành tiền
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedRequest.requestExportDetails.map((item) => {
                          const totalPrice =
                            item.price * item.requestedQuantity;
                          const productImage = getProductImage(item.productId);

                          return (
                            <TableRow key={item.requestExportDetailId}>
                              <TableCell>
                                <Avatar className="h-10 w-10">
                                  {productImage ? (
                                    <AvatarImage
                                      src={productImage}
                                      alt={item.productName}
                                    />
                                  ) : (
                                    <AvatarFallback>
                                      {getProductCode(item.productId).substring(
                                        0,
                                        2
                                      )}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                              </TableCell>
                              <TableCell>
                                {getProductCode(item.productId)}
                              </TableCell>
                              <TableCell>{item.productName}</TableCell>
                              <TableCell>{item.unit}</TableCell>
                              <TableCell>{item.requestedQuantity}</TableCell>
                              <TableCell>
                                {formatCurrency(item.price)}
                              </TableCell>
                              <TableCell>
                                {formatCurrency(totalPrice)}
                              </TableCell>
                            </TableRow>
                          );
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
            {selectedRequest &&
              selectedRequest.status !== "Requested" &&
              selectedRequest.status !== "Approved" && (
                <Button
                  onClick={() => {
                    setDetailsOpen(false);
                    handleCreateBasedOn(selectedRequest!.requestExportId);
                  }}
                >
                  Chọn kho để xuất hàng
                </Button>
              )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for creating new export request */}
      <ExportRequestCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        requestExportId={baseRequestId}
        onCreateRequest={handleCreateRequest}
      />
    </SalesLayout>
  );
};

export default SalesExports;
