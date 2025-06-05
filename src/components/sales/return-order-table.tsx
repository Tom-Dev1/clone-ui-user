"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, ArrowUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ReturnRequest } from "@/types/return-order";
import ReturnStatusBadge from "./return-status-badge";
import { formatDate } from "@/utils/date-utils";
import { toast } from "sonner";

interface ReturnOrderTableProps {
  returnOrders: ReturnRequest[];
  onViewDetails: (order: ReturnRequest) => void;
  onApproveReturn: (returnRequestId: string) => void;
  onRejectReturn?: (returnRequestId: string, reason: string) => void;
  sortField: string;
  sortDirection: "asc" | "desc";
  onSortChange: (field: string) => void;
  getStatusInVietnamese: (status: string) => string;
}

export default function ReturnOrderTable({
  returnOrders,
  onViewDetails,
  onRejectReturn,
  sortField,
  sortDirection,
  onSortChange,
  getStatusInVietnamese,
}: ReturnOrderTableProps) {
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedReturnRequestId, setSelectedReturnRequestId] = useState<
    string | null
  >(null);
  const [isRejecting, setIsRejecting] = useState(false);

  // Get sort icon
  const getSortIcon = (field: string) => {
    if (field !== sortField) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortDirection === "asc" ? (
      <ArrowUpDown className="ml-2 h-4 w-4 text-primary" />
    ) : (
      <ArrowUpDown className="ml-2 h-4 w-4 text-primary rotate-180" />
    );
  };

  // Get total quantity for an order
  const getTotalQuantity = (order: ReturnRequest) => {
    return order.details.reduce(
      (total, detail) => total + detail.quantityReturned,
      0
    );
  };

  // Get product names as a comma-separated string
  const getProductNames = (order: ReturnRequest) => {
    return order.details.map((detail) => detail.productName).join(", ");
  };

  const handleRejectSubmit = async () => {
    if (selectedReturnRequestId && rejectReason.trim() && onRejectReturn) {
      setIsRejecting(true);
      try {
        await onRejectReturn(selectedReturnRequestId, rejectReason);
        setIsRejectDialogOpen(false);
        setRejectReason("");
        setSelectedReturnRequestId(null);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra khi từ chối đơn trả hàng"
        );
      } finally {
        setIsRejecting(false);
      }
    } else {
      toast.error("Vui lòng nhập lý do từ chối");
    }
  };

  if (returnOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md bg-muted/10">
        <p className="text-muted-foreground">Không tìm thấy đơn trả hàng nào</p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">
                <Button
                  variant="ghost"
                  className="p-0 font-medium"
                  onClick={() => onSortChange("orderCode")}
                >
                  Mã đơn hàng{" "}
                  {sortField === "orderCode" && getSortIcon("orderCode")}
                </Button>
              </TableHead>
              <TableHead>Sản phẩm</TableHead>
              <TableHead className="text-center">Số lượng</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="p-0 font-medium"
                  onClick={() => onSortChange("createdByUserName")}
                >
                  Đại lý{" "}
                  {sortField === "createdByUserName" &&
                    getSortIcon("createdByUserName")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="p-0 font-medium"
                  onClick={() => onSortChange("createdAt")}
                >
                  Ngày tạo{" "}
                  {sortField === "createdAt" && getSortIcon("createdAt")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="p-0 font-medium"
                  onClick={() => onSortChange("status")}
                >
                  Trạng thái {sortField === "status" && getSortIcon("status")}
                </Button>
              </TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {returnOrders.map((order) => (
              <TableRow key={order.returnRequestId}>
                <TableCell className="font-medium">{order.orderCode}</TableCell>
                <TableCell>{getProductNames(order)}</TableCell>
                <TableCell className="text-center">
                  {getTotalQuantity(order)}
                </TableCell>
                <TableCell>{order.createdByUserName}</TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell>
                  <ReturnStatusBadge
                    status={order.status}
                    getStatusInVietnamese={getStatusInVietnamese}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Mở menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewDetails(order)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Xem chi tiết
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Từ chối đơn trả hàng</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Lý do từ chối</Label>
              <Input
                id="reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối đơn trả hàng"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Hủy
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={handleRejectSubmit}
              disabled={!rejectReason.trim() || isRejecting}
            >
              {isRejecting ? "Đang xử lý..." : "Xác nhận từ chối"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
