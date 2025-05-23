"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

interface ReturnOrderPaginationProps {
    currentPage: number
    totalItems: number
    itemsPerPage: number
    onPageChange: (page: number) => void
    onItemsPerPageChange: (items: number) => void
}

export default function ReturnOrderPagination({
    currentPage,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
}: ReturnOrderPaginationProps) {
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1
    const startItem = (currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(currentPage * itemsPerPage, totalItems)

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1)
        }
    }

    const handlePrevPage = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1)
        }
    }

    const handleFirstPage = () => {
        if (currentPage !== 1) {
            onPageChange(1)
        }
    }

    const handleLastPage = () => {
        if (currentPage !== totalPages) {
            onPageChange(totalPages)
        }
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
                Hiển thị {totalItems > 0 ? startItem : 0} - {endItem} trên tổng số {totalItems} đơn trả hàng
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center">
                    <label htmlFor="items-per-page" className="text-sm mr-2">
                        Hiển thị:
                    </label>
                    <Select
                        value={itemsPerPage.toString()}
                        onValueChange={(value) => onItemsPerPageChange(Number.parseInt(value))}
                    >
                        <SelectTrigger id="items-per-page" className="h-8 w-[70px]">
                            <SelectValue placeholder={itemsPerPage.toString()} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleFirstPage}
                        disabled={currentPage === 1}
                    >
                        <ChevronsLeft className="h-4 w-4" />
                        <span className="sr-only">Trang đầu</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Trang trước</span>
                    </Button>

                    <span className="text-sm mx-2">
                        Trang {currentPage} / {totalPages || 1}
                    </span>

                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages || totalPages === 0}
                    >
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Trang sau</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleLastPage}
                        disabled={currentPage === totalPages || totalPages === 0}
                    >
                        <ChevronsRight className="h-4 w-4" />
                        <span className="sr-only">Trang cuối</span>
                    </Button>
                </div>
            </div>
        </div>
    )
}
