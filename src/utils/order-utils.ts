import { RequestProduct } from "../types/sales-orders";

// Utility functions for order calculations
export const getTotalQuantity = (order: RequestProduct) => {
    if (!order.requestProductDetails || !Array.isArray(order.requestProductDetails)) {
        return 0;
    }
    return order.requestProductDetails.reduce(
        (total, detail) => total + detail.quantity,
        0
    );
};

export const getTotalProductTypes = (order: RequestProduct) => {
    if (!order.requestProductDetails || !Array.isArray(order.requestProductDetails)) {
        return 0;
    }
    return order.requestProductDetails.length;
};

export const getTotalOrderValue = (order: RequestProduct) => {
    if (!order.requestProductDetails || !Array.isArray(order.requestProductDetails)) {
        return 0;
    }
    return order.requestProductDetails.reduce(
        (total, detail) => total + detail.unitPrice * detail.quantity,
        0
    );
};

export const updateTotals = (ordersList: RequestProduct[]) => {
    let totalProductCount = 0;
    let totalQuantityCount = 0;

    ordersList.forEach((order) => {
        if (order.requestProductDetails && order.requestProductDetails.length > 0) {
            totalProductCount += order.requestProductDetails.length;
            totalQuantityCount += order.requestProductDetails.reduce(
                (sum, detail) => sum + detail.quantity,
                0
            );
        }
    });

    return { totalProductCount, totalQuantityCount };
};
