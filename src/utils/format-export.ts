import { format } from "date-fns"
import type { RequestExport } from "@/types/export-request"

// Format currency
export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

// Format date
export const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    try {
        return format(new Date(dateString), "dd/MM/yyyy")
    } catch (error) {
        console.log(error)
        return "Invalid date"
    }
}

// Sort date for requestDate
export const sortDate = (dateString: string | null) => {
    if (!dateString) return new Date(0) // Return earliest date for null values
    try {
        return new Date(dateString)
    } catch (error) {
        console.log(error)
        return new Date(0) // Return earliest date for invalid dates
    }
}

// Calculate total requested quantity
export const getTotalRequestedQuantity = (request: RequestExport) => {
    return request.requestExportDetails.reduce((total, item) => total + item.requestedQuantity, 0)
}

// Calculate total value of request
export const getTotalValue = (request: RequestExport) => {
    return request.requestExportDetails.reduce((total, item) => {
        return total + item.price * item.requestedQuantity
    }, 0)
}
