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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

interface Category {
  categoryId: number;
  categoryName: string;
  sortOrder: number;
  notes: string;
  isActive: boolean;
  createdBy: string;
  createdDate: string;
}

interface CategoryFormData {
  categoryName: string;
  parentCategoryId: number;
  sortOrder: number;
  notes: string;
  isActive: boolean;
}

const CategoryList = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCategory, setNewCategory] = useState<CategoryFormData>({
    categoryName: "",
    parentCategoryId: 1,
    sortOrder: 0,
    notes: "",
    isActive: true,
  });
  const [editCategory, setEditCategory] = useState<CategoryFormData>({
    categoryName: "",
    parentCategoryId: 1,
    sortOrder: 1,
    notes: "",
    isActive: true,
  });
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      const filtered = categories.filter(
        (category) =>
          category.categoryName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          category.categoryId.toString().includes(searchTerm)
      );
      setFilteredCategories(filtered);
    }
  }, [searchTerm, categories]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fetchCategories = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("auth_token");
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
      setCategories(data);
      setFilteredCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Không thể tải danh mục. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewCategoryDetail = (category: Category) => {
    setSelectedCategory(category);
    setIsDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditCategory({
      categoryName: category.categoryName,
      parentCategoryId: 1, // Assuming default value
      sortOrder: category.sortOrder,
      notes: category.notes || "",
      isActive: category.isActive,
    });
    setSelectedCategory(category);
    setIsEditDialogOpen(true);
  };

  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    formType: "new" | "edit"
  ) => {
    const { name, value } = e.target;
    const setValue = formType === "new" ? setNewCategory : setEditCategory;
    const currentValue = formType === "new" ? newCategory : editCategory;

    setValue({
      ...currentValue,
      [name]: name === "sortOrder" ? Number.parseInt(value) || 0 : value,
    });
  };

  const handleSwitchChange = (checked: boolean, formType: "new" | "edit") => {
    const setValue = formType === "new" ? setNewCategory : setEditCategory;
    const currentValue = formType === "new" ? newCategory : editCategory;

    setValue({
      ...currentValue,
      isActive: checked,
    });
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const token = localStorage.getItem("auth_token");
    if (!token) {
      toast.error("Bạn chưa đăng nhập");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(
        "https://minhlong.mlhr.org/api/product-category",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newCategory),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add category");
      }

      await response.json();
      toast.success("Đã thêm danh mục thành công");

      // Reset form and close dialog
      setNewCategory({
        categoryName: "",
        parentCategoryId: 1,
        sortOrder: 0,
        notes: "",
        isActive: true,
      });
      setIsAddDialogOpen(false);

      // Refresh categories list
      fetchCategories();
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Không thể thêm danh mục. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;

    setIsSubmitting(true);

    const token = localStorage.getItem("auth_token");
    if (!token) {
      toast.error("Bạn chưa đăng nhập");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(
        `https://minhlong.mlhr.org/api/product-category${selectedCategory.categoryId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editCategory),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update category");
      }

      await response.json();
      toast.success("Đã cập nhật danh mục thành công");

      // Reset form and close dialog
      setEditCategory({
        categoryName: "",
        parentCategoryId: 1,
        sortOrder: 0,
        notes: "",
        isActive: true,
      });
      setSelectedCategory(null);
      setIsEditDialogOpen(false);

      // Refresh categories list
      fetchCategories();
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Không thể cập nhật danh mục. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    setIsSubmitting(true);

    const token = localStorage.getItem("auth_token");
    console.log(token);

    if (!token) {
      toast.error("Bạn chưa đăng nhập");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(
        `https://minhlong.mlhr.org/api/product-category${categoryToDelete.categoryId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete category");
      }

      toast.success("Đã xóa danh mục thành công");

      // Reset and close dialog
      setCategoryToDelete(null);
      setIsDeleteDialogOpen(false);

      // Refresh categories list
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Không thể xóa danh mục. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="w-1/3">
          <Input
            placeholder="Tìm kiếm danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>Thêm loại</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Thêm danh mục mới</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddCategory}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="categoryName" className="text-right">
                      Tên danh mục
                    </Label>
                    <Input
                      id="categoryName"
                      name="categoryName"
                      value={newCategory.categoryName}
                      onChange={(e) => handleInputChange(e, "new")}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="sortOrder" className="text-right">
                      Thứ tự
                    </Label>
                    <Input
                      id="sortOrder"
                      name="sortOrder"
                      type="number"
                      value={newCategory.sortOrder}
                      onChange={(e) => handleInputChange(e, "new")}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="notes" className="text-right">
                      Ghi chú
                    </Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={newCategory.notes}
                      onChange={(e) => handleInputChange(e, "new")}
                      className="col-span-3"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="isActive" className="text-right">
                      Hoạt động
                    </Label>
                    <div className="flex items-center space-x-2 col-span-3">
                      <Switch
                        id="isActive"
                        checked={newCategory.isActive}
                        onCheckedChange={(checked) =>
                          handleSwitchChange(checked, "new")
                        }
                      />
                      <Label htmlFor="isActive">
                        {newCategory.isActive ? "Hoạt động" : "Không hoạt động"}
                      </Label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></div>
                        Đang xử lý
                      </>
                    ) : (
                      "Lưu"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Button onClick={fetchCategories} variant="outline">
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
                  <TableHead>ID</TableHead>
                  <TableHead>Tên danh mục</TableHead>
                  <TableHead>Thứ tự</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <TableRow key={category.categoryId}>
                      <TableCell>{category.categoryId}</TableCell>
                      <TableCell>{category.categoryName}</TableCell>
                      <TableCell>{category.sortOrder}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            category.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {category.isActive ? "Hoạt động" : "Không hoạt động"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleViewCategoryDetail(category)}
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditCategory(category)}
                            title="Sửa"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteCategory(category)}
                            className="text-red-500 hover:text-red-700"
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Không tìm thấy danh mục nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {selectedCategory && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Chi tiết danh mục</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  ID danh mục
                </h3>
                <p>{selectedCategory.categoryId}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Tên danh mục
                </h3>
                <p className="text-lg font-semibold">
                  {selectedCategory.categoryName}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Thứ tự sắp xếp
                </h3>
                <p>{selectedCategory.sortOrder}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Trạng thái
                </h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    selectedCategory.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {selectedCategory.isActive ? "Hoạt động" : "Không hoạt động"}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Ngày tạo</h3>
                <p>{formatDate(selectedCategory.createdDate)}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Ghi chú
                </h3>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {selectedCategory.notes || "Không có ghi chú"}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        {selectedCategory && (
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Sửa danh mục</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateCategory}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-categoryName" className="text-right">
                    Tên danh mục
                  </Label>
                  <Input
                    id="edit-categoryName"
                    name="categoryName"
                    value={editCategory.categoryName}
                    onChange={(e) => handleInputChange(e, "edit")}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-sortOrder" className="text-right">
                    Thứ tự
                  </Label>
                  <Input
                    id="edit-sortOrder"
                    name="sortOrder"
                    type="number"
                    value={editCategory.sortOrder}
                    onChange={(e) => handleInputChange(e, "edit")}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-notes" className="text-right">
                    Ghi chú
                  </Label>
                  <Textarea
                    id="edit-notes"
                    name="notes"
                    value={editCategory.notes}
                    onChange={(e) => handleInputChange(e, "edit")}
                    className="col-span-3"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-isActive" className="text-right">
                    Hoạt động
                  </Label>
                  <div className="flex items-center space-x-2 col-span-3">
                    <Switch
                      id="edit-isActive"
                      checked={editCategory.isActive}
                      onCheckedChange={(checked) =>
                        handleSwitchChange(checked, "edit")
                      }
                    />
                    <Label htmlFor="edit-isActive">
                      {editCategory.isActive ? "Hoạt động" : "Không hoạt động"}
                    </Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></div>
                      Đang xử lý
                    </>
                  ) : (
                    "Cập nhật"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        {categoryToDelete && (
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Xác nhận xóa</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa danh mục "
                {categoryToDelete.categoryName}"? Hành động này không thể hoàn
                tác.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></div>
                    Đang xử lý
                  </>
                ) : (
                  "Xóa"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default CategoryList;
