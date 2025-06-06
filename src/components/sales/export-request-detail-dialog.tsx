"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { RequestExport } from "@/types/export-request";
import { formatCurrency } from "@/utils/format-utils";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/utils/api-utils";
import type { ApiProduct } from "@/types/export-request";
import { formatDate, getTotalRequestedQuantity } from "@/utils/format-export";

interface ExportRequestDetailDialogProps {
  detailsOpen: boolean;
  setDetailsOpen: (open: boolean) => void;
  selectedRequest: RequestExport | null;
  onConfirm?: () => void;
  openConfirmDialog: (requestId: number) => void;
  onOpenCancelDialog: (requestId: number) => void;
}

export const ExportRequestDetailDialog = ({
  openConfirmDialog,
  detailsOpen,
  setDetailsOpen,
  selectedRequest,
  onOpenCancelDialog,
}: ExportRequestDetailDialogProps) => {
  const [products, setProducts] = useState<ApiProduct[]>([]);

  // Fetch products for displaying product details
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await fetchWithAuth(
          "https://minhlong.mlhr.org/api/product"
        );
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    if (detailsOpen) {
      fetchProducts();
    }
  }, [detailsOpen]);

  // Get product by ID
  const getProduct = (productId: number) => {
    return products.find((p) => p.productId === productId);
  };

  // Get product code
  const getProductCode = (productId: number) => {
    const product = getProduct(productId);
    return product ? product.productCode : "N/A";
  };

  // Get product image
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
            Chờ xử lý
          </Badge>
        );
      case "Partially_Exported":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Trả một phần
          </Badge>
        );
      case "Canceled":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            <h1 className="text-center  w-16">Đã hủy</h1>
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleCancelClick = () => {
    if (!selectedRequest) return;
    onOpenCancelDialog(selectedRequest.requestExportId);
  };

  return (
    <>
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="flex flex-col min-w-[100vh] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Chi tiết yêu cầu xuất kho</DialogTitle>
            <DialogDescription></DialogDescription>
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
                        <dt className="text-muted-foreground">
                          Mã phiếu xuất:
                        </dt>
                        <dd>{selectedRequest.requestExportCode}</dd>
                        <dt className="text-muted-foreground">Mã đơn hàng:</dt>
                        <dd>{selectedRequest.orderCode}</dd>
                        <dt className="text-muted-foreground">Đại lý:</dt>
                        <dd>{selectedRequest.agencyName}</dd>

                        <dt className="text-muted-foreground">Trạng thái:</dt>
                        <dd>{renderStatusBadge(selectedRequest.status)}</dd>
                        {selectedRequest.status === "Canceled" && (
                          <>
                            <dt className="text-muted-foreground">
                              Lý do hủy:
                            </dt>
                            <dd>{selectedRequest.reason}</dd>
                          </>
                        )}
                        <dt className="text-muted-foreground">Kho: </dt>
                        <dd>{selectedRequest.warehouseName || "Chưa duyệt"}</dd>

                        <dt className="text-muted-foreground">Ngày duyệt:</dt>
                        <dd>{formatDate(selectedRequest.requestDate)}</dd>
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

                        <dt className="text-muted-foreground">Tổng tiền:</dt>
                        <dd className="font-medium line-through text-gray-400">
                          {formatCurrency(selectedRequest.totalPrice)}
                        </dd>

                        <dt className="text-muted-foreground">Giảm giá:</dt>
                        <dd className="font-medium">
                          {selectedRequest.discount}%
                        </dd>

                        <div className="border-t border-gray-200 my-4"></div>
                        <div className="border-t border-gray-200 my-4"></div>

                        <dt className="text-muted-foreground">Thành tiền:</dt>
                        <dd className="font-medium">
                          {formatCurrency(selectedRequest.finalPrice)}
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
                          <TableHead className="w-[120px]">Tạm tính</TableHead>
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
                                      src={productImage || "/placeholder.svg"}
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

          <DialogFooter>
            {selectedRequest && selectedRequest.status === "Processing" && (
              <Button variant="destructive" onClick={handleCancelClick}>
                Hủy yêu cầu
              </Button>
            )}
            {selectedRequest && selectedRequest.status === "Processing" && (
              <Button
                className="bg-green-500 hover:bg-green-600"
                onClick={() =>
                  openConfirmDialog(selectedRequest.requestExportId)
                }
              >
                Yêu cầu xuất kho
              </Button>
            )}
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
