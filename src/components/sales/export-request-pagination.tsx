"use client"

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import type { RequestExport } from "@/types/export-request"

interface ExportRequestPaginationProps {
    currentPage: number
    totalPages: number
    totalItems: number
    filteredRequests: RequestExport[]
    setCurrentPage: (page: number) => void
}

export const ExportRequestPagination = ({
    currentPage,
    totalPages,
    totalItems,
    filteredRequests,
    setCurrentPage,
}: ExportRequestPaginationProps) => {
    return (
        <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground w-[200px]">
                Hiển thị {filteredRequests.length} / {totalItems} yêu cầu
            </div>
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                    </PaginationItem>

                    {/* Display page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum

                        // Calculate page numbers to display around current page
                        if (totalPages <= 5) {
                            pageNum = i + 1
                        } else if (currentPage <= 3) {
                            pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i
                        } else {
                            pageNum = currentPage - 2 + i
                        }

                        return (
                            <PaginationItem key={pageNum}>
                                <PaginationLink onClick={() => setCurrentPage(pageNum)} isActive={currentPage === pageNum}>
                                    {pageNum}
                                </PaginationLink>
                            </PaginationItem>
                        )
                    })}

                    <PaginationItem>
                        <PaginationNext
                            onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    )
}
