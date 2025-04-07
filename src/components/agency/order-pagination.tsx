"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

interface OrderPaginationProps {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    indexOfFirstItem: number
    indexOfLastItem: number
    onPageChange: (page: number) => void
}

export const OrderPagination = ({
    currentPage,
    totalPages,
    totalItems,

    indexOfFirstItem,
    indexOfLastItem,
    onPageChange,
}: OrderPaginationProps) => {
    if (totalPages <= 1) return null

    return (
        <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
                Hiển thị {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} của {totalItems} đơn hàng
            </div>
            <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => onPageChange(1)} disabled={currentPage === 1}>
                    <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Hiển thị 5 trang xung quanh trang hiện tại
                        let pageToShow
                        if (totalPages <= 5) {
                            // Nếu tổng số trang <= 5, hiển thị tất cả các trang
                            pageToShow = i + 1
                        } else if (currentPage <= 3) {
                            // Nếu đang ở gần đầu, hiển thị 5 trang đầu tiên
                            pageToShow = i + 1
                        } else if (currentPage >= totalPages - 2) {
                            // Nếu đang ở gần cuối, hiển thị 5 trang cuối cùng
                            pageToShow = totalPages - 4 + i
                        } else {
                            // Nếu đang ở giữa, hiển thị 2 trang trước và 2 trang sau
                            pageToShow = currentPage - 2 + i
                        }

                        return (
                            <Button
                                key={pageToShow}
                                variant={currentPage === pageToShow ? "default" : "outline"}
                                size="sm"
                                onClick={() => onPageChange(pageToShow)}
                                className="w-8 h-8 p-0"
                            >
                                {pageToShow}
                            </Button>
                        )
                    })}
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                >
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

