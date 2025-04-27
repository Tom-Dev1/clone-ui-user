"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

interface ReturnOrderPaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
}

export const ReturnOrderPagination = ({ currentPage, totalPages, onPageChange }: ReturnOrderPaginationProps) => {
    if (totalPages <= 1) return null

    return (
        <div className="flex items-center justify-center space-x-2 py-4">
            <Button variant="outline" size="icon" onClick={() => onPageChange(1)} disabled={currentPage === 1}>
                <ChevronsLeft className="h-4 w-4" />
                <span className="sr-only">Trang đầu</span>
            </Button>
            <Button variant="outline" size="icon" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Trang trước</span>
            </Button>

            <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber: number

                    if (totalPages <= 5) {
                        // If 5 or fewer pages, show all
                        pageNumber = i + 1
                    } else if (currentPage <= 3) {
                        // If near the start
                        pageNumber = i + 1
                    } else if (currentPage >= totalPages - 2) {
                        // If near the end
                        pageNumber = totalPages - 4 + i
                    } else {
                        // If in the middle
                        pageNumber = currentPage - 2 + i
                    }

                    return (
                        <Button
                            key={pageNumber}
                            variant={currentPage === pageNumber ? "default" : "outline"}
                            size="icon"
                            onClick={() => onPageChange(pageNumber)}
                            className="w-9 h-9"
                        >
                            {pageNumber}
                        </Button>
                    )
                })}
            </div>

            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Trang sau</span>
            </Button>
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
            >
                <ChevronsRight className="h-4 w-4" />
                <span className="sr-only">Trang cuối</span>
            </Button>
        </div>
    )
}
