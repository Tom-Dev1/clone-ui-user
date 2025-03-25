import type React from "react"

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    // Generate page numbers to display
    const getPageNumbers = () => {
        const pageNumbers = []
        const maxPagesToShow = 5

        if (totalPages <= maxPagesToShow) {
            // Show all pages if total pages is less than max pages to show
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i)
            }
        } else {
            // Always show first page
            pageNumbers.push(1)

            // Calculate start and end of page range
            let start = Math.max(2, currentPage - 1)
            let end = Math.min(totalPages - 1, currentPage + 1)

            // Adjust if at the beginning
            if (currentPage <= 3) {
                end = Math.min(totalPages - 1, 4)
            }

            // Adjust if at the end
            if (currentPage >= totalPages - 2) {
                start = Math.max(2, totalPages - 3)
            }

            // Add ellipsis after first page if needed
            if (start > 2) {
                pageNumbers.push("...")
            }

            // Add middle pages
            for (let i = start; i <= end; i++) {
                pageNumbers.push(i)
            }

            // Add ellipsis before last page if needed
            if (end < totalPages - 1) {
                pageNumbers.push("...")
            }

            // Always show last page
            pageNumbers.push(totalPages)
        }

        return pageNumbers
    }

    if (totalPages <= 1) return null

    return (
        <div className="flex justify-center items-center space-x-2">
            {/* Previous button */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${currentPage === 1
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
            >
                &laquo;
            </button>

            {/* Page numbers */}
            {getPageNumbers().map((page, index) => (
                <button
                    key={index}
                    onClick={() => (typeof page === "number" ? onPageChange(page) : null)}
                    disabled={page === "..."}
                    className={`px-3 py-1 rounded ${page === currentPage
                        ? "bg-blue-500 text-white"
                        : page === "..."
                            ? "bg-transparent cursor-default"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                >
                    {page}
                </button>
            ))}

            {/* Next button */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${currentPage === totalPages
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
            >
                &raquo;
            </button>
        </div>
    )
}

export default Pagination

