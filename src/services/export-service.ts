import axios from "axios"

// Define interfaces for the data structure
export interface RequestExportDetail {
    requestExportDetailId: number
    productId: number
    requestedQuantity: number
}

export interface RequestExport {
    requestExportId: number
    orderId: string
    requestedBy: number
    approvedBy: number | null
    status: "Processing" | "Requested" | "Approved"
    approvedDate: string | null
    note: string | null
    requestExportDetails: RequestExportDetail[]
}

const API_URL = "https://minhlong.mlhr.org/api"

export const ExportService = {
    getAllExportRequests: async (): Promise<RequestExport[]> => {
        const token = localStorage.getItem("auth_token")

        if (!token) {
            throw new Error("Authentication token not found")
        }

        const response = await axios.get(`${API_URL}/RequestExport/all`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        return response.data
    },

    getExportRequestById: async (id: number): Promise<RequestExport> => {
        const token = localStorage.getItem("auth_token")

        if (!token) {
            throw new Error("Authentication token not found")
        }

        const response = await axios.get(`${API_URL}/RequestExport/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        return response.data
    },

    // You can add more methods here as needed, such as:
    // - createExportRequest
    // - updateExportRequest
    // - approveExportRequest
    // - rejectExportRequest
}

export default ExportService

