// Define types for the payment history data
export interface PaymentHistory {
    paymentHistoryId: string
    orderId: string
    orderCode: string
    agencyId: number
    agencyName: string
    paymentMethod: string
    paymentDate: string
    serieNumber: string
    status: string
    totalAmountPayment: number
    remainingDebtAmount: number
    paymentAmount: number
    dueDate: string
    debtStatus: string
    createdAt: string
    updatedAt: string
}

export type SortDirection = "asc" | "desc"

