"use client"

import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react"
import { Button } from "../../components/ui/button"

interface PaymentPaginationProps {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    onPageChange: (page: number) => void
}

export const PaymentPagination = ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
}: PaymentPaginationProps) => {
    const indexOfFirstItem = (currentPage - 1) * itemsPerPage + 1
    const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalItems)

    if (totalPages <= 1) return null

    return (
        <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-gray-500">
                Hiển thị {indexOfFirstItem}-{indexOfLastItem} của {totalItems} kết quả
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
                        let pageToShow
                        if (totalPages <= 5) {
                            pageToShow = i + 1
                        } else if (currentPage <= 3) {
                            pageToShow = i + 1
                        } else if (currentPage >= totalPages - 2) {
                            pageToShow = totalPages - 4 + i
                        } else {
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

