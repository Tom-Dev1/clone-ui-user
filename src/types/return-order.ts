// Define types for the return order data
export interface ReturnRequestImage {
  returnRequestImageId: number;
  imageUrl: string;
}

export interface ReturnRequestDetail {
  returnRequestDetailId: string;
  orderDetailId: string;
  productName: string;
  reason: string;
  quantityReturned: number;
  images: ReturnRequestImage[];
}

export interface ReturnRequest {
  returnRequestId: string;
  orderId: string;
  orderCode: string;
  returnRequestCode: string;
  createdAt: string;
  createdByUserName: string;
  status: string;
  note: string;
  details: ReturnRequestDetail[];
  images: ReturnRequestImage[];
  reason: string;
}

export type SortDirection = "asc" | "desc";
