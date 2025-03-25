"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog } from "@/components/ui/dialog"
import { Plus, Edit, Trash } from "lucide-react"
import DeleteConfirmDialog from "./dialogs/DeleteConfirmDialog"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

import AddProductDialog from "./dialogs/AddProductDialog"
import ViewProductDialog from "./dialogs/ViewProductDialog"
import EditProductDialog from "./dialogs/EditProductDialog"

interface Product {
    productId: number
    productCode: string
    productName: string
    unit: string
    defaultExpiration: number
    categoryId: number
    description: string
    taxId: number
    createdBy: string
    createdDate: string
    updatedBy: string
    updatedDate: string
    availableStock: number
    images: string[]
    price?: number
    status?: string
}

interface Category {
    categoryId: number
    categoryName: string
    sortOrder: number
    notes: string
    isActive: boolean
    createdBy: string
    createdDate: string
}

interface ProductData {
    productCode: string
    productName: string
    unit: string
    defaultExpiration: number
    categoryId: number
    description: string
    taxId: number
}

const ProductList = () => {
    const [products, setProducts] = useState<Product[]>([])
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage,] = useState(15)
    const [totalItems, setTotalItems] = useState(0)
    const [totalPages, setTotalPages] = useState(1)

    const [newProduct, setNewProduct] = useState<ProductData>({
        productCode: "",
        productName: "",
        unit: "Bao", // Default to "Bao"
        defaultExpiration: 30,
        categoryId: 0,
        description: "",
        taxId: 1,
    })

    const [editProduct, setEditProduct] = useState<ProductData>({
        productCode: "",
        productName: "",
        unit: "",
        defaultExpiration: 30,
        categoryId: 0,
        description: "",
        taxId: 1,
    })

    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [editImageUrls, setEditImageUrls] = useState<string[]>([])
    const [editSelectedFiles, setEditSelectedFiles] = useState<File[]>([])

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [productToDelete, setProductToDelete] = useState<Product | null>(null)

    useEffect(() => {
        fetchProducts(currentPage, itemsPerPage)
        fetchCategories()
    }, [currentPage, itemsPerPage])


    console.log(totalItems);


    useEffect(() => {
        if (products.length > 0) {
            if (searchTerm) {
                // When searching, show all matching results without pagination
                const filtered = products.filter(
                    (product) =>
                        product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        product.productCode.toLowerCase().includes(searchTerm.toLowerCase()),
                )
                setFilteredProducts(filtered)
                setTotalItems(filtered.length)
                setTotalPages(Math.ceil(filtered.length / itemsPerPage))
            } else {
                // When not searching, apply pagination
                const startIndex = (currentPage - 1) * itemsPerPage
                const paginatedProducts = products.slice(startIndex, startIndex + itemsPerPage)
                setFilteredProducts(paginatedProducts)
                setTotalItems(products.length)
                setTotalPages(Math.ceil(products.length / itemsPerPage))
            }
        }
    }, [searchTerm, products, currentPage, itemsPerPage])

    const fetchProducts = async (page = currentPage, pageSize = itemsPerPage) => {
        setIsLoading(true)
        const token = localStorage.getItem("auth_token")

        if (!token) {
            alert("Lỗi: Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.")
            setIsLoading(false)
            return
        }

        try {
            const response = await fetch(`https://minhlong.mlhr.org/api/product?page=${page}&pageSize=${pageSize}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (!response.ok) {
                throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`)
            }

            const responseData = await response.json()

            // Check if the response has pagination metadata
            if (responseData.items && Array.isArray(responseData.items)) {
                // API returns paginated data structure
                setTotalItems(responseData.totalItems || responseData.items.length)
                setTotalPages(responseData.totalPages || Math.ceil(responseData.items.length / pageSize))

                const validProducts = responseData.items.filter(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (item: any) => item && typeof item === "object" && "productId" in item && "productName" in item,
                )

                setProducts(validProducts)
                setFilteredProducts(validProducts)
            } else if (Array.isArray(responseData)) {
                // API returns array directly (old format)
                const validProducts = responseData.filter(
                    (item) => item && typeof item === "object" && "productId" in item && "productName" in item,
                )

                setTotalItems(validProducts.length)
                setTotalPages(Math.ceil(validProducts.length / pageSize))

                // Manual pagination if API doesn't support it
                const startIndex = (page - 1) * pageSize
                const paginatedProducts = validProducts.slice(startIndex, startIndex + pageSize)

                setProducts(validProducts) // Keep all products for filtering
                setFilteredProducts(paginatedProducts)
            } else {
                console.error("API response format is not recognized:", responseData)
                setProducts([])
                setFilteredProducts([])
                alert("Lỗi: Định dạng dữ liệu không hợp lệ. Vui lòng thử lại sau.")
            }
        } catch (error) {
            console.error("Error fetching products:", error)
            alert("Lỗi: Có lỗi xảy ra khi tải sản phẩm. Vui lòng thử lại sau.")
            setProducts([])
            setFilteredProducts([])
        } finally {
            setIsLoading(false)
        }
    }

    const fetchCategories = async () => {
        const token = localStorage.getItem("auth_token")
        if (!token) return

        try {
            const response = await fetch("https://minhlong.mlhr.org/api/product-category", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (!response.ok) {
                throw new Error("Failed to fetch categories")
            }

            const data = await response.json()
            setCategories(data.filter((cat: Category) => cat.isActive))
        } catch (error) {
            console.error("Error fetching categories:", error)
            alert("Lỗi: Không thể tải danh sách danh mục. Vui lòng thử lại sau.")
        }
    }

    const handleViewProductDetail = (product: Product) => {
        setSelectedProduct(product)
        setIsDialogOpen(true)
    }

    const handleEditProduct = (product: Product) => {
        setSelectedProduct(product)
        setEditProduct({
            productCode: product.productCode,
            productName: product.productName,
            unit: product.unit,
            defaultExpiration: product.defaultExpiration,
            categoryId: product.categoryId,
            description: product.description || "",
            taxId: product.taxId || 1,
        })
        setEditImageUrls(product.images || [])
        setEditSelectedFiles([])
        setIsEditDialogOpen(true)
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A"
        const date = new Date(dateString)
        return date.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const handleNewProductInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setNewProduct({
            ...newProduct,
            [name]: name === "defaultExpiration" ? Number.parseInt(value) || 0 : value,
        })
    }

    const handleEditProductInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setEditProduct({
            ...editProduct,
            [name]: name === "defaultExpiration" ? Number.parseInt(value) || 0 : value,
        })
    }

    const handleNewProductSelectChange = (name: string, value: string) => {
        setNewProduct({
            ...newProduct,
            [name]: name === "categoryId" ? Number.parseInt(value) : value,
        })
    }

    const handleEditProductSelectChange = (name: string, value: string) => {
        setEditProduct({
            ...editProduct,
            [name]: name === "categoryId" ? Number.parseInt(value) : value,
        })
    }

    const handleAddProduct = async (productData: ProductData, imageFiles: File[]) => {
        setIsSubmitting(true)

        const token = localStorage.getItem("auth_token")
        if (!token) {
            alert("Lỗi: Bạn chưa đăng nhập")
            setIsSubmitting(false)
            return
        }

        try {
            // Tạo FormData để gửi cả dữ liệu sản phẩm và file ảnh
            const formData = new FormData()

            // Thêm thông tin sản phẩm vào FormData
            formData.append("productCode", productData.productCode)
            formData.append("productName", productData.productName)
            formData.append("unit", productData.unit)
            formData.append("defaultExpiration", productData.defaultExpiration.toString())
            formData.append("categoryId", productData.categoryId.toString())
            formData.append("description", productData.description || "")
            formData.append("taxId", productData.taxId.toString())

            // Thêm các file ảnh vào FormData
            imageFiles.forEach((file) => {
                formData.append("images", file)
            })

            console.log("Sending product data with images")

            const response = await fetch("https://minhlong.mlhr.org/api/product", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    // Không cần set Content-Type khi sử dụng FormData, browser sẽ tự động set
                },
                body: formData,
            })

            if (!response.ok) {
                throw new Error("Failed to add product")
            }

            await response.json()
            alert("Thành công: Đã thêm sản phẩm mới")

            setNewProduct({
                productCode: "",
                productName: "",
                unit: "Bao",
                defaultExpiration: 30,
                categoryId: 0,
                description: "",
                taxId: 1,
            })
            setSelectedFiles([])
            setIsAddDialogOpen(false)

            fetchProducts()
        } catch (error) {
            console.error("Error adding product:", error)
            alert("Lỗi: Không thể thêm sản phẩm. Vui lòng thử lại sau.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdateProduct = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedProduct) return

        setIsSubmitting(true)

        const token = localStorage.getItem("auth_token")
        if (!token) {
            alert("Lỗi: Bạn chưa đăng nhập")
            setIsSubmitting(false)
            return
        }

        try {
            // Tạo FormData để gửi cả dữ liệu sản phẩm và file ảnh
            const formData = new FormData()

            // Thêm thông tin sản phẩm vào FormData
            formData.append("productCode", editProduct.productCode)
            formData.append("productName", editProduct.productName)
            formData.append("unit", editProduct.unit)
            formData.append("defaultExpiration", editProduct.defaultExpiration.toString())
            formData.append("categoryId", editProduct.categoryId.toString())
            formData.append("description", editProduct.description || "")
            formData.append("taxId", editProduct.taxId.toString())

            // Thêm các URL ảnh hiện tại vào FormData
            editImageUrls.forEach((url) => {
                formData.append("existingImages", url)
            })

            // Thêm các file ảnh mới vào FormData
            editSelectedFiles.forEach((file) => {
                formData.append("images", file)
            })

            console.log("Updating product with ID:", selectedProduct.productId)

            const response = await fetch(`https://minhlong.mlhr.org/api/product/${selectedProduct.productId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    // Không cần set Content-Type khi sử dụng FormData, browser sẽ tự động set
                },
                body: formData,
            })

            if (!response.ok) {
                throw new Error(`Failed to update product: ${response.status} ${response.statusText}`)
            }

            await response.json()
            alert("Thành công: Đã cập nhật sản phẩm")

            setIsEditDialogOpen(false)
            fetchProducts()
        } catch (error) {
            console.error("Error updating product:", error)
            alert("Lỗi: Không thể cập nhật sản phẩm. Vui lòng thử lại sau.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteProduct = (product: Product) => {
        setProductToDelete(product)
        setIsDeleteDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!productToDelete) return

        setIsDeleting(true)
        const token = localStorage.getItem("auth_token")

        if (!token) {
            alert("Lỗi: Bạn chưa đăng nhập")
            setIsDeleting(false)
            return
        }

        try {
            const response = await fetch(`https://minhlong.mlhr.org/api/product/${productToDelete.productId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (!response.ok) {
                throw new Error("Failed to delete product")
            }

            alert("Thành công: Đã xóa sản phẩm")
            setIsDeleteDialogOpen(false)
            setProductToDelete(null)
            fetchProducts()
        } catch (error) {
            console.error("Error deleting product:", error)
            alert("Lỗi: Không thể xóa sản phẩm. Vui lòng thử lại sau.")
        } finally {
            setIsDeleting(false)
        }
    }

    const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files)
            setEditSelectedFiles((prev) => [...prev, ...newFiles])
        }
    }

    const handleRemoveEditImage = (imageUrlToRemove: string) => {
        const updatedImageUrls = editImageUrls.filter((url) => url !== imageUrlToRemove)
        setEditImageUrls(updatedImageUrls)
    }

    const handleRemoveEditNewFile = (index: number) => {
        const updatedFiles = [...editSelectedFiles]
        updatedFiles.splice(index, 1)
        setEditSelectedFiles(updatedFiles)
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div className="w-1/3">
                    <Input
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <Button onClick={() => setIsAddDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Thêm sản phẩm
                        </Button>
                        {isAddDialogOpen && (
                            <AddProductDialog
                                isOpen={isAddDialogOpen}
                                onClose={() => setIsAddDialogOpen(false)}
                                onSubmit={handleAddProduct}
                                product={newProduct}
                                setProduct={setNewProduct}
                                categories={categories}
                                isSubmitting={isSubmitting}
                                handleInputChange={handleNewProductInputChange}
                                handleSelectChange={handleNewProductSelectChange}
                                selectedFiles={selectedFiles}
                                setSelectedFiles={setSelectedFiles}
                            />
                        )}
                    </Dialog>
                    <Button
                        onClick={() => {
                            setCurrentPage(1)
                            fetchProducts(1, itemsPerPage)
                        }}
                        variant="outline"
                    >
                        Làm mới
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Mã sản phẩm</TableHead>
                                    <TableHead>Tên sản phẩm</TableHead>
                                    <TableHead>Đơn vị</TableHead>
                                    <TableHead>Tồn kho</TableHead>
                                    <TableHead>Ngày cập nhật</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map((product) => (
                                        <TableRow key={product.productId}>
                                            <TableCell>{product.productCode || "N/A"}</TableCell>
                                            <TableCell>{product.productName || "N/A"}</TableCell>
                                            <TableCell>{product.unit || "N/A"}</TableCell>
                                            <TableCell>{product.availableStock}</TableCell>
                                            <TableCell>{formatDate(product.updatedDate)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => handleViewProductDetail(product)}>
                                                        Chi tiết
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
                                                        <Edit className="h-4 w-4 mr-1" />
                                                        Sửa
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-red-500 hover:bg-red-50"
                                                        onClick={() => handleDeleteProduct(product)}
                                                    >
                                                        <Trash className="h-4 w-4 mr-1" />
                                                        Xóa
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            Không tìm thấy sản phẩm nào
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {!isLoading && filteredProducts.length > 0 && totalPages > 1 && (
                <div className="mt-4">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        if (currentPage > 1) handlePageChange(currentPage - 1)
                                    }}
                                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                                />
                            </PaginationItem>

                            {/* First page */}
                            <PaginationItem>
                                <PaginationLink
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        handlePageChange(1)
                                    }}
                                    isActive={currentPage === 1}
                                >
                                    1
                                </PaginationLink>
                            </PaginationItem>

                            {/* Ellipsis after first page if needed */}
                            {currentPage > 3 && (
                                <PaginationItem>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            )}

                            {/* Pages before current */}
                            {currentPage > 2 && (
                                <PaginationItem>
                                    <PaginationLink
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            handlePageChange(currentPage - 1)
                                        }}
                                    >
                                        {currentPage - 1}
                                    </PaginationLink>
                                </PaginationItem>
                            )}

                            {/* Current page (if not first or last) */}
                            {currentPage !== 1 && currentPage !== totalPages && (
                                <PaginationItem>
                                    <PaginationLink
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            handlePageChange(currentPage)
                                        }}
                                        isActive
                                    >
                                        {currentPage}
                                    </PaginationLink>
                                </PaginationItem>
                            )}

                            {/* Pages after current */}
                            {currentPage < totalPages - 1 && (
                                <PaginationItem>
                                    <PaginationLink
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            handlePageChange(currentPage + 1)
                                        }}
                                    >
                                        {currentPage + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            )}

                            {/* Ellipsis before last page if needed */}
                            {currentPage < totalPages - 2 && (
                                <PaginationItem>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            )}

                            {/* Last page (if not the first page) */}
                            {totalPages > 1 && (
                                <PaginationItem>
                                    <PaginationLink
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            handlePageChange(totalPages)
                                        }}
                                        isActive={currentPage === totalPages}
                                    >
                                        {totalPages}
                                    </PaginationLink>
                                </PaginationItem>
                            )}

                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        if (currentPage < totalPages) handlePageChange(currentPage + 1)
                                    }}
                                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                {selectedProduct && isDialogOpen && (
                    <ViewProductDialog
                        product={selectedProduct}
                        onClose={() => setIsDialogOpen(false)}
                        onEdit={() => {
                            setIsDialogOpen(false)
                            handleEditProduct(selectedProduct)
                        }}
                        formatDate={formatDate}
                    />
                )}
            </Dialog>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                {selectedProduct && isEditDialogOpen && (
                    <EditProductDialog
                        isOpen={isEditDialogOpen}
                        onClose={() => setIsEditDialogOpen(false)}
                        onSubmit={handleUpdateProduct}
                        product={editProduct}
                        setProduct={setEditProduct}
                        categories={categories}
                        isSubmitting={isSubmitting}
                        imageUrls={editImageUrls}
                        selectedFiles={editSelectedFiles}
                        handleInputChange={handleEditProductInputChange}
                        handleSelectChange={handleEditProductSelectChange}
                        handleImageChange={handleEditImageChange}
                        handleRemoveImage={handleRemoveEditImage}
                        handleRemoveFile={handleRemoveEditNewFile}
                    />
                )}
            </Dialog>
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                {productToDelete && (
                    <DeleteConfirmDialog
                        isOpen={isDeleteDialogOpen}
                        onClose={() => setIsDeleteDialogOpen(false)}
                        onConfirm={handleConfirmDelete}
                        title="Xác nhận xóa sản phẩm"
                        description={`Bạn có chắc chắn muốn xóa sản phẩm "${productToDelete.productName}" không? Hành động này không thể hoàn tác.`}
                        isDeleting={isDeleting}
                    />
                )}
            </Dialog>
        </div>
    )
}

export default ProductList

