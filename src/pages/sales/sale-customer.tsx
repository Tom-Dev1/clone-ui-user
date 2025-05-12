"use client"

import { useState, useEffect } from "react"
import { SalesLayout } from "@/layouts/sale-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Loader2, Search, Users, Building, MoreHorizontal, Eye, Mail, Phone, MapPin, ArrowUpDown } from "lucide-react"
import { toast } from "sonner"
import { getToken } from "@/utils/auth-utils"

// Define the Agency type
interface Agency {
    agencyId: number
    agencyName: string
    createdAt: string
    email: string
    phone: string
    address: string
}

// Define the AgencyDetailProps type
interface AgencyDetailProps {
    agency: Agency
    onClose: () => void
}

// Agency Detail Component
const AgencyDetail = ({ agency, onClose }: AgencyDetailProps) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Chi tiết đại lý</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            ✕
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center space-x-4">
                            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                                <Building className="h-8 w-8 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">{agency.agencyName}</h3>
                                <p className="text-sm text-gray-500">ID: {agency.agencyId}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 rounded-full bg-blue-100">
                                        <Mail className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Email</p>
                                        <p className="font-medium">{agency.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 rounded-full bg-blue-100">
                                        <Phone className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Số điện thoại</p>
                                        <p className="font-medium">{agency.phone}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-start space-x-3">
                                <div className="p-2 rounded-full bg-blue-100">
                                    <MapPin className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Địa chỉ</p>
                                    <p className="font-medium">{agency.address}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-full bg-blue-100">
                                    <Users className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Ngày tạo</p>
                                    <p className="font-medium">
                                        {format(new Date(agency.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <Button onClick={onClose}>Đóng</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

type SortField = "agencyName" | "createdAt"
type SortOrder = "asc" | "desc"

const SaleCustomer = () => {
    const [agencies, setAgencies] = useState<Agency[]>([])
    const [filteredAgencies, setFilteredAgencies] = useState<Agency[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null)
    const [showDetail, setShowDetail] = useState(false)
    const [sortField, setSortField] = useState<SortField>("createdAt")
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

    // Fetch agencies data
    useEffect(() => {
        const fetchAgencies = async () => {
            try {
                setLoading(true)
                const token = getToken()

                if (!token) {
                    setError("Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.")
                    setLoading(false)
                    return
                }

                const response = await fetch("https://minhlong.mlhr.org/api/manage-agency", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                })

                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`)
                }

                const data = await response.json()
                setAgencies(data)
                setFilteredAgencies(data)
                setError(null)
            } catch (err) {
                console.error("Error fetching agencies:", err)
                setError("Không thể tải dữ liệu đại lý. Vui lòng thử lại sau.")
                toast.error("Không thể tải dữ liệu đại lý")
            } finally {
                setLoading(false)
            }
        }

        fetchAgencies()
    }, [])

    // Sort agencies
    const sortAgencies = (agencies: Agency[]) => {
        return [...agencies].sort((a, b) => {
            if (sortField === "agencyName") {
                return sortOrder === "asc"
                    ? a.agencyName.localeCompare(b.agencyName)
                    : b.agencyName.localeCompare(a.agencyName)
            } else {
                return sortOrder === "asc"
                    ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                    : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            }
        })
    }

    // Filter agencies based on search term
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredAgencies(sortAgencies(agencies))
        } else {
            const lowercasedSearch = searchTerm.toLowerCase()
            const filtered = agencies.filter(
                (agency) =>
                    agency.agencyName.toLowerCase().includes(lowercasedSearch) ||
                    agency.email.toLowerCase().includes(lowercasedSearch) ||
                    agency.phone.includes(lowercasedSearch) ||
                    agency.address.toLowerCase().includes(lowercasedSearch),
            )
            setFilteredAgencies(sortAgencies(filtered))
        }
        setCurrentPage(1)
    }, [searchTerm, agencies, sortField, sortOrder])

    // Calculate pagination
    const totalPages = Math.ceil(filteredAgencies.length / itemsPerPage)
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentItems = filteredAgencies.slice(indexOfFirstItem, indexOfLastItem)

    // Handle page change
    const handlePageChange = (page: number) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page)
        }
    }

    // View agency details
    const handleViewAgencyDetails = (agency: Agency) => {
        setSelectedAgency(agency)
        setShowDetail(true)
    }

    // Format date
    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), "dd/MM/yyyy", { locale: vi })
        } catch (error) {
            console.error("Error formatting date:", error)
            return dateString
        }
    }

    // Handle sort
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortOrder("asc")
        }
    }

    if (loading) {
        return (
            <SalesLayout>
                <div className="m-4 flex items-center justify-center min-h-[60vh]">
                    <div className="flex flex-col items-center">
                        <Loader2 className="h-8 w-8 animate-spin mb-4" />
                        <p>Đang tải dữ liệu đại lý...</p>
                    </div>
                </div>
            </SalesLayout>
        )
    }

    if (error) {
        return (
            <SalesLayout>
                <div className="container mx-auto py-6 px-4 md:px-6">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center">
                        <span>{error}</span>
                    </div>
                    <div className="mt-4 flex justify-center">
                        <Button onClick={() => window.location.reload()}>Thử lại</Button>
                    </div>
                </div>
            </SalesLayout>
        )
    }

    return (
        <SalesLayout>
            <div className="m-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">Quản lý đại lý</h1>
                </div>

                <Card className="mb-6">
                    <CardHeader className="pb-3">
                        <CardTitle>Tổng quan</CardTitle>
                        <CardDescription>Thông tin tổng quan về đại lý</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 rounded-full bg-green-100">
                                        <Users className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Tổng số đại lý</p>
                                        <p className="text-2xl font-bold">{agencies.length}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle>Danh sách đại lý</CardTitle>
                        <CardDescription>Quản lý thông tin đại lý</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <Input
                                    placeholder="Tìm kiếm theo tên, email, số điện thoại hoặc địa chỉ..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {filteredAgencies.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Building className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                <p>Không tìm thấy đại lý nào phù hợp với tìm kiếm của bạn.</p>
                            </div>
                        ) : (
                            <>
                                <div className="rounded-md border overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => handleSort("agencyName")}
                                                        className="flex items-center gap-1"
                                                    >
                                                        Tên đại lý
                                                        <ArrowUpDown className="h-4 w-4" />
                                                    </Button>
                                                </TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Số điện thoại</TableHead>
                                                <TableHead>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => handleSort("createdAt")}
                                                        className="flex items-center gap-1"
                                                    >
                                                        Ngày tạo
                                                        <ArrowUpDown className="h-4 w-4" />
                                                    </Button>
                                                </TableHead>
                                                <TableHead>Thao tác</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {currentItems.map((agency) => (
                                                <TableRow key={agency.agencyId}>
                                                    <TableCell>{agency.agencyName}</TableCell>
                                                    <TableCell>{agency.email}</TableCell>
                                                    <TableCell>{agency.phone}</TableCell>
                                                    <TableCell>{formatDate(agency.createdAt)}</TableCell>
                                                    <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                                    <span className="sr-only">Mở menu</span>
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => handleViewAgencyDetails(agency)}>
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    <span>Xem chi tiết</span>
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {totalPages > 1 && (
                                    <div className="mt-4 flex justify-center">
                                        <Pagination>
                                            <PaginationContent>
                                                <PaginationItem>
                                                    <PaginationPrevious
                                                        onClick={() => handlePageChange(currentPage - 1)}
                                                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                                    />
                                                </PaginationItem>

                                                {/* First page */}
                                                {currentPage > 2 && (
                                                    <PaginationItem>
                                                        <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
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
                                                        <PaginationLink onClick={() => handlePageChange(currentPage - 1)}>
                                                            {currentPage - 1}
                                                        </PaginationLink>
                                                    </PaginationItem>
                                                )}

                                                {/* Current page */}
                                                <PaginationItem>
                                                    <PaginationLink isActive>{currentPage}</PaginationLink>
                                                </PaginationItem>

                                                {/* Next page if not on last page */}
                                                {currentPage < totalPages && (
                                                    <PaginationItem>
                                                        <PaginationLink onClick={() => handlePageChange(currentPage + 1)}>
                                                            {currentPage + 1}
                                                        </PaginationLink>
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
                                                        <PaginationLink onClick={() => handlePageChange(totalPages)}>{totalPages}</PaginationLink>
                                                    </PaginationItem>
                                                )}

                                                <PaginationItem>
                                                    <PaginationNext
                                                        onClick={() => handlePageChange(currentPage + 1)}
                                                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                                    />
                                                </PaginationItem>
                                            </PaginationContent>
                                        </Pagination>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Agency Detail Modal */}
                {showDetail && selectedAgency && <AgencyDetail agency={selectedAgency} onClose={() => setShowDetail(false)} />}
            </div>
        </SalesLayout>
    )
}

export default SaleCustomer
