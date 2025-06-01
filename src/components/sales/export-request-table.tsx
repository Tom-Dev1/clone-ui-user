"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, Eye, } from "lucide-react"
import type { RequestExport } from "@/types/export-request"
import { formatCurrency, formatDate, getTotalRequestedQuantity } from "@/utils/format-export"

interface ExportRequestTableProps {
    filteredRequests: RequestExport[]
    sortField: string
    sortDirection: "asc" | "desc"
    handleSort: (field: string) => void
    handleViewDetails: (request: RequestExport) => void
}

export const ExportRequestTable = ({
    filteredRequests,
    sortField,
    sortDirection,
    handleSort,
    handleViewDetails,

}: ExportRequestTableProps) => {
    // Render sort icon
    const renderSortIcon = (field: string) => {
        if (sortField !== field) return null
        return sortDirection === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
    }

    // Render status badge
    const renderStatusBadge = (status: string) => {
        switch (status) {
            case "Requested":
                return (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        Chờ duyệt
                    </Badge>
                )
            case "Approved":
                return (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Đã duyệt
                    </Badge>
                )
            case "Processing":
                return (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Chờ xử lý
                    </Badge>
                )
            case "Partially_Exported":
                return (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        Trả một phần
                    </Badge>
                )
            case "Canceled":
                return (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        <h1 className="text-center  w-16">Đã hủy</h1>
                    </Badge>
                )
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <div className="bg-white rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[170px] text-center">Mã phiếu xuất</TableHead>
                            <TableHead className="w-[160px] text-center">Đại lý</TableHead>
                            <TableHead className="w-[160px] text-center cursor-pointer" onClick={() => handleSort("requestDate")}>
                                <div className="flex items-center justify-center">
                                    Ngày duyệt
                                    {renderSortIcon("requestDate")}
                                </div>
                            </TableHead>
                            <TableHead className="w-[100px] text-center">Số SP</TableHead>
                            <TableHead className="w-[100px] text-center">Tổng SL</TableHead>
                            <TableHead className="w-[120px] text-center cursor-pointer" onClick={() => handleSort("totalValue")}>
                                <div className="flex items-center justify-center">
                                    Tổng giá trị
                                    {renderSortIcon("totalValue")}
                                </div>
                            </TableHead>
                            <TableHead className="w-[120px] text-center cursor-pointer" onClick={() => handleSort("status")}>
                                <div className="flex items-center justify-center">
                                    Trạng thái
                                    {renderSortIcon("status")}
                                </div>
                            </TableHead>
                            <TableHead className="w-[120px] text-center">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredRequests.map((request) => (
                            <TableRow key={request.requestExportId}>
                                <TableCell className="w-[170px] text-center">{request.requestExportCode}</TableCell>
                                <TableCell className="w-[160px] text-center">{request.agencyName}</TableCell>
                                <TableCell className="w-[160px] text-center">{formatDate(request.requestDate)}</TableCell>
                                <TableCell className="w-[120px] text-center">{request.requestExportDetails.length}</TableCell>
                                <TableCell className="w-[120px] text-center">{getTotalRequestedQuantity(request)}</TableCell>
                                <TableCell className="w-[120px] text-right">{formatCurrency(request.finalPrice)}</TableCell>
                                <TableCell className="w-[120px] text-center">{renderStatusBadge(request.status)}</TableCell>
                                <TableCell className="w-[120px] text-center">

                                    <div className="flex items-center justify-center cursor-pointer" onClick={() => handleViewDetails(request)}>
                                        <Eye className="w-4 h-4 mr-2" />
                                        <span>Xem chi tiết</span>
                                    </div>

                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
