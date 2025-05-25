// Define types for the application
export interface OrderDetail {
    orderDetailId: string;
    orderId: string;
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    unit: string;
    createdAt: string;
}

export interface Order {
    orderId: string;
    orderCode: string;
    orderDate: string;
    discount: number;
    agencyId: number;
    finalPrice: number;
    totalPrice: number;
    status: STATUS_AGENCY_ORDER
    salesName: string;
    agencyName: string;
    requestCode: string;
    orderDetails: OrderDetail[];
}


export type STATUS_AGENCY_ORDER = 'Exported' | 'Paid' | 'Canceled' | 'WaitingDelivery' | 'WaitPaid'

// Define type for sort direction
export type SortDirection = "asc" | "desc";
