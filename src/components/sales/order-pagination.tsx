"use client"

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

interface OrderPaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
}

export const OrderPagination = ({ currentPage, totalPages, onPageChange }: OrderPaginationProps) => {
    return (
        <div className="mt-4 flex justify-center">
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                    </PaginationItem>

                    {/* First page */}
                    {currentPage > 2 && (
                        <PaginationItem>
                            <PaginationLink onClick={() => onPageChange(1)}>1</PaginationLink>
                        </PaginationItem>
                    )}

                    {/* Ellipsis if needed */}
                    {currentPage > 3 && (
                        <PaginationItem>
                            <PaginationEllipsis />
                        </PaginationItem>
                    )}

                    {/* Previous page if not on first page */}
                    {currentPage > 1 && (
                        <PaginationItem>
                            <PaginationLink onClick={() => onPageChange(currentPage - 1)}>{currentPage - 1}</PaginationLink>
                        </PaginationItem>
                    )}

                    {/* Current page */}
                    <PaginationItem>
                        <PaginationLink isActive>{currentPage}</PaginationLink>
                    </PaginationItem>

                    {/* Next page if not on last page */}
                    {currentPage < totalPages && (
                        <PaginationItem>
                            <PaginationLink onClick={() => onPageChange(currentPage + 1)}>{currentPage + 1}</PaginationLink>
                        </PaginationItem>
                    )}

                    {/* Ellipsis if needed */}
                    {currentPage < totalPages - 2 && (
                        <PaginationItem>
                            <PaginationEllipsis />
                        </PaginationItem>
                    )}

                    {/* Last page if not already showing */}
                    {currentPage < totalPages - 1 && (
                        <PaginationItem>
                            <PaginationLink onClick={() => onPageChange(totalPages)}>{totalPages}</PaginationLink>
                        </PaginationItem>
                    )}

                    <PaginationItem>
                        <PaginationNext
                            onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    )
}

