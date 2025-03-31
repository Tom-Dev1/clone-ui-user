"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog } from "@/components/ui/dialog";
import {
  Plus,
  Edit,
  Trash,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import DeleteConfirmDialog from "./dialogs/DeleteConfirmDialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import AddProductDialog from "./dialogs/AddProductDialog";
import ViewProductDialog from "./dialogs/ViewProductDialog";
import EditProductDialog from "./dialogs/EditProductDialog";
import { formatCurrency } from "@/utils/utils";
import { toast } from "sonner";
// import { formatCurrencyVND } from "@/utils/format-price"

// Cập nhật interface Product để phù hợp với cấu trúc dữ liệu mới
interface Product {
  productId: number;
  productCode: string;
  productName: string;
  unit: string;
  defaultExpiration: number;
  categoryId: number;
  description: string;
  taxId: number;
  createdBy: string;
  createdDate: string;
  createdByName?: string;
  updatedBy?: string;
  updatedByName: string;
  updatedDate?: string;
  availableStock: number;
  images: string[];
  price: number;
  status?: string;
}

interface Category {
  categoryId: number;
  categoryName: string;
  sortOrder: number;
  notes: string;
  isActive: boolean;
  createdBy: string;
  createdDate: string;
}

interface ProductData {
  productCode: string;
  productName: string;
  unit: string;
  defaultExpiration: number;
  categoryId: number;
  description: string;
  taxId: number;
}

type SortDirection = "asc" | "desc";

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState<string>("createdDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc"); // Mặc định sắp xếp giảm dần (mới nhất trước)

  const [newProduct, setNewProduct] = useState<ProductData>({
    productCode: "",
    productName: "",
    unit: "Bao", // Default to "Bao"
    defaultExpiration: 720,
    categoryId: 0,
    description: "",
    taxId: 1,
  });

  const [editProduct, setEditProduct] = useState<ProductData>({
    productCode: "",
    productName: "",
    unit: "",
    defaultExpiration: 30,
    categoryId: 0,
    description: "",
    taxId: 1,
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [editImageUrls, setEditImageUrls] = useState<string[]>([]);
  const [editSelectedFiles, setEditSelectedFiles] = useState<File[]>([]);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Khi component mount hoặc khi trang, số lượng mỗi trang thay đổi
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [currentPage, itemsPerPage]);

  // Khi search term thay đổi, reset về trang 1
  useEffect(() => {
    if (searchTerm) {
      setCurrentPage(1);
    }
    applyFiltersAndSort();
  }, [searchTerm, products, sortField, sortDirection]);

  // Hàm áp dụng bộ lọc và sắp xếp
  const applyFiltersAndSort = () => {
    if (products.length === 0) return;

    // Lọc sản phẩm theo search term
    let result = [...products];
    if (searchTerm) {
      result = result.filter(
        (product) =>
          product.productName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.productCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sắp xếp sản phẩm
    result = sortProducts(result);

    // Cập nhật tổng số mục và tổng số trang
    setTotalItems(result.length);
    setTotalPages(Math.ceil(result.length / itemsPerPage));

    // Áp dụng phân trang
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedResult = result.slice(
      startIndex,
      Math.min(startIndex + itemsPerPage, result.length)
    );

    setFilteredProducts(paginatedResult);
  };

  // Hàm sắp xếp sản phẩm
  const sortProducts = (productsToSort: Product[]) => {
    return [...productsToSort].sort((a, b) => {
      let valueA, valueB;

      switch (sortField) {
        case "createdDate":
          valueA = new Date(a.createdDate).getTime();
          valueB = new Date(b.createdDate).getTime();
          break;
        case "price":
          valueA = a.price;
          valueB = b.price;
          break;
        case "availableStock":
          valueA = a.availableStock;
          valueB = b.availableStock;
          break;
        case "productName":
          valueA = a.productName.toLowerCase();
          valueB = b.productName.toLowerCase();
          break;
        default:
          valueA = new Date(a.createdDate).getTime();
          valueB = new Date(b.createdDate).getTime();
      }

      return sortDirection === "asc"
        ? valueA > valueB
          ? 1
          : -1
        : valueA < valueB
        ? 1
        : -1;
    });
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("auth_token");

    if (!token) {
      toast.error("Lỗi: Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.");
      setIsLoading(false);
      return;
    }

    try {
      // Sử dụng API hiện có, không thêm tham số sắp xếp vào URL vì API không hỗ trợ
      const response = await fetch(
        `https://minhlong.mlhr.org/api/product?page=${currentPage}&pageSize=${itemsPerPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch products: ${response.status} ${response.statusText}`
        );
      }

      const responseData = await response.json();

      // Kiểm tra định dạng phản hồi
      if (responseData.items && Array.isArray(responseData.items)) {
        // API trả về cấu trúc phân trang
        const validProducts = responseData.items.filter(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (item: any) =>
            item &&
            typeof item === "object" &&
            "productId" in item &&
            "productName" in item
        );

        setProducts(validProducts);
        setTotalItems(responseData.totalItems || validProducts.length);
        setTotalPages(
          responseData.totalPages ||
            Math.ceil(validProducts.length / itemsPerPage)
        );

        // Sắp xếp và lọc sẽ được áp dụng trong useEffect
      } else if (Array.isArray(responseData)) {
        // API trả về mảng trực tiếp (định dạng cũ)
        const validProducts = responseData.filter(
          (item) =>
            item &&
            typeof item === "object" &&
            "productId" in item &&
            "productName" in item
        );

        setProducts(validProducts);
        setTotalItems(validProducts.length);
        setTotalPages(Math.ceil(validProducts.length / itemsPerPage));

        // Sắp xếp và lọc sẽ được áp dụng trong useEffect
      } else {
        console.error("API response format is not recognized:", responseData);
        setProducts([]);
        setFilteredProducts([]);
        setTotalItems(0);
        setTotalPages(1);
        toast.error(
          "Lỗi: Định dạng dữ liệu không hợp lệ. Vui lòng thử lại sau."
        );
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Lỗi: Có lỗi xảy ra khi tải sản phẩm. Vui lòng thử lại sau.");
      setProducts([]);
      setFilteredProducts([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    try {
      const response = await fetch(
        "https://minhlong.mlhr.org/api/product-category",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();
      setCategories(data.filter((cat: Category) => cat.isActive));
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error(
        "Lỗi: Không thể tải danh sách danh mục. Vui lòng thử lại sau."
      );
    }
  };

  const handleViewProductDetail = (product: Product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setEditProduct({
      productCode: product.productCode,
      productName: product.productName,
      unit: product.unit,
      defaultExpiration: product.defaultExpiration,
      categoryId: product.categoryId,
      description: product.description || "",
      taxId: product.taxId || 1,
    });
    setEditImageUrls(product.images || []);
    setEditSelectedFiles([]);
    setIsEditDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      console.error("Invalid date format:", dateString);
      return "N/A";
    }
  };

  const handleNewProductInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewProduct({
      ...newProduct,
      [name]:
        name === "defaultExpiration" ? Number.parseInt(value) || 0 : value,
    });
  };

  const handleEditProductInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditProduct({
      ...editProduct,
      [name]:
        name === "defaultExpiration" ? Number.parseInt(value) || 0 : value,
    });
  };

  const handleNewProductSelectChange = (name: string, value: string) => {
    setNewProduct({
      ...newProduct,
      [name]: name === "categoryId" ? Number.parseInt(value) : value,
    });
  };

  const handleEditProductSelectChange = (name: string, value: string) => {
    setEditProduct({
      ...editProduct,
      [name]: name === "categoryId" ? Number.parseInt(value) : value,
    });
  };

  const handleAddProduct = async (
    productData: ProductData,
    imageFiles: File[]
  ) => {
    setIsSubmitting(true);

    const token = localStorage.getItem("auth_token");
    if (!token) {
      toast.error("Lỗi: Bạn chưa đăng nhập");
      setIsSubmitting(false);
      return;
    }

    try {
      // Tạo FormData để gửi cả dữ liệu sản phẩm và file ảnh
      const formData = new FormData();

      // Thêm thông tin sản phẩm vào FormData
      formData.append("productCode", productData.productCode);
      formData.append("productName", productData.productName);
      formData.append("unit", productData.unit);
      formData.append(
        "defaultExpiration",
        productData.defaultExpiration.toString()
      );
      formData.append("categoryId", productData.categoryId.toString());
      formData.append("description", productData.description || "");
      formData.append("taxId", productData.taxId.toString());

      // Thêm các file ảnh vào FormData
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      console.log("Sending product data with images");

      const response = await fetch("https://minhlong.mlhr.org/api/product", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Không cần set Content-Type khi sử dụng FormData, browser sẽ tự động set
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to add product");
      }

      await response.json();
      toast.success("Thành công: Đã thêm sản phẩm mới");

      setNewProduct({
        productCode: "",
        productName: "",
        unit: "Bao",
        defaultExpiration: 30,
        categoryId: 0,
        description: "",
        taxId: 1,
      });
      setSelectedFiles([]);
      setIsAddDialogOpen(false);

      fetchProducts();
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Lỗi: Không thể thêm sản phẩm. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setIsSubmitting(true);

    const token = localStorage.getItem("auth_token");
    if (!token) {
      toast.error("Lỗi: Bạn chưa đăng nhập");
      setIsSubmitting(false);
      return;
    }

    try {
      // Tạo FormData để gửi cả dữ liệu sản phẩm và file ảnh
      const formData = new FormData();

      // Thêm thông tin sản phẩm vào FormData
      formData.append("productCode", editProduct.productCode);
      formData.append("productName", editProduct.productName);
      formData.append("unit", editProduct.unit);
      formData.append(
        "defaultExpiration",
        editProduct.defaultExpiration.toString()
      );
      formData.append("categoryId", editProduct.categoryId.toString());
      formData.append("description", editProduct.description || "");
      formData.append("taxId", editProduct.taxId.toString());

      // Thêm các URL ảnh hiện tại vào FormData
      editImageUrls.forEach((url) => {
        formData.append("existingImages", url);
      });

      // Thêm các file ảnh mới vào FormData
      editSelectedFiles.forEach((file) => {
        formData.append("images", file);
      });

      console.log("Updating product with ID:", selectedProduct.productId);

      const response = await fetch(
        `https://minhlong.mlhr.org/api/product/${selectedProduct.productId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            // Không cần set Content-Type khi sử dụng FormData, browser sẽ tự động set
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to update product: ${response.status} ${response.statusText}`
        );
      }

      await response.json();
      toast.success("Thành công: Đã cập nhật sản phẩm");

      setIsEditDialogOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Lỗi: Không thể cập nhật sản phẩm. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    const token = localStorage.getItem("auth_token");

    if (!token) {
      toast.error("Lỗi: Bạn chưa đăng nhập");
      setIsDeleting(false);
      return;
    }

    try {
      const response = await fetch(
        `https://minhlong.mlhr.org/api/product/${productToDelete.productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      toast.success("Thành công: Đã xóa sản phẩm");
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Lỗi: Không thể xóa sản phẩm. Vui lòng thử lại sau.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setEditSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveEditImage = (imageUrlToRemove: string) => {
    const updatedImageUrls = editImageUrls.filter(
      (url) => url !== imageUrlToRemove
    );
    setEditImageUrls(updatedImageUrls);
  };

  const handleRemoveEditNewFile = (index: number) => {
    const updatedFiles = [...editSelectedFiles];
    updatedFiles.splice(index, 1);
    setEditSelectedFiles(updatedFiles);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Hàm xử lý thay đổi trường sắp xếp
  const handleSortChange = (field: string) => {
    if (field === sortField) {
      // Nếu đã sắp xếp theo trường này, đảo ngược hướng sắp xếp
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Nếu sắp xếp theo trường mới, mặc định sắp xếp giảm dần
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Hàm hiển thị biểu tượng sắp xếp
  const renderSortIcon = (field: string) => {
    if (field !== sortField) {
      return <ArrowUpDown className="h-4 w-4 ml-1 inline" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4 ml-1 inline" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1 inline" />
    );
  };

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
              setCurrentPage(1);
              fetchProducts();
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
                  <TableHead className="w-[120px] text-center">
                    Mã sản phẩm
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSortChange("productName")}
                  >
                    Tên sản phẩm {renderSortIcon("productName")}
                  </TableHead>
                  <TableHead className="w-[120px] text-center">
                    Đơn vị
                  </TableHead>
                  <TableHead
                    className="text-right cursor-pointer"
                    onClick={() => handleSortChange("price")}
                  >
                    Giá {renderSortIcon("price")}
                  </TableHead>
                  <TableHead
                    className="w-[120px] text-right cursor-pointer"
                    onClick={() => handleSortChange("availableStock")}
                  >
                    Tồn kho {renderSortIcon("availableStock")}
                  </TableHead>
                  <TableHead
                    className="w-[180px] text-center cursor-pointer"
                    onClick={() => handleSortChange("createdDate")}
                  >
                    Ngày Tạo {renderSortIcon("createdDate")}
                  </TableHead>
                  <TableHead className="w-[180px] text-center">
                    Người tạo
                  </TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.productId}>
                      <TableCell className="w-[180px] text-center">
                        {product.productCode || "N/A"}
                      </TableCell>
                      <TableCell>{product.productName || "N/A"}</TableCell>
                      <TableCell className="w-[120px] text-center">
                        {product.unit || "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(product.price || 0)} đ
                      </TableCell>

                      <TableCell className="w-[120px] text-right">
                        {product.availableStock}
                      </TableCell>
                      <TableCell className="w-[180px] text-center">
                        {formatDate(product.createdDate)}
                      </TableCell>
                      <TableCell className="w-[180px] text-center">
                        {product.createdByName || "N/A"}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewProductDetail(product)}
                          >
                            Chi tiết
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
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
                    <TableCell colSpan={8} className="text-center py-8">
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
                    e.preventDefault();
                    if (currentPage > 1) handlePageChange(currentPage - 1);
                  }}
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>

              {/* First page */}
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(1);
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
                      e.preventDefault();
                      handlePageChange(currentPage - 1);
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
                      e.preventDefault();
                      handlePageChange(currentPage);
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
                      e.preventDefault();
                      handlePageChange(currentPage + 1);
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
                      e.preventDefault();
                      handlePageChange(totalPages);
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
                    e.preventDefault();
                    if (currentPage < totalPages)
                      handlePageChange(currentPage + 1);
                  }}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
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
              setIsDialogOpen(false);
              handleEditProduct(selectedProduct);
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
  );
};

export default ProductList;
