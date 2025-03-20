"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
    images: string[]
}

interface AddProductDialogProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (e: React.FormEvent) => Promise<void>
    product: ProductData
    setProduct: React.Dispatch<React.SetStateAction<ProductData>>
    categories: Category[]
    isSubmitting: boolean
    imageUrls: string[]
    imageFile: File | null
    uploadingImage: boolean
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
    handleSelectChange: (name: string, value: string) => void
    handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    handleUploadImage: () => Promise<void>
    handleRemoveImage: (index: number) => void
}

const AddProductDialog: React.FC<AddProductDialogProps> = ({

    onClose,
    onSubmit,
    product,
    categories,
    isSubmitting,
    imageUrls,
    imageFile,
    uploadingImage,
    handleInputChange,
    handleSelectChange,
    handleImageChange,
    handleUploadImage,
    handleRemoveImage,
}) => {
    return (
        <DialogContent className="max-w-3xl">
            <DialogHeader>
                <DialogTitle>Thêm sản phẩm mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="productCode">Mã sản phẩm</Label>
                            <Input
                                id="productCode"
                                name="productCode"
                                value={product.productCode}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="productName">Tên sản phẩm</Label>
                            <Input
                                id="productName"
                                name="productName"
                                value={product.productName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="unit">Đơn vị</Label>
                            <Input id="unit" name="unit" value={product.unit} onChange={handleInputChange} required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="defaultExpiration">Hạn sử dụng mặc định (ngày)</Label>
                            <Input
                                id="defaultExpiration"
                                name="defaultExpiration"
                                type="number"
                                value={product.defaultExpiration}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="categoryId">Danh mục</Label>
                            <Select
                                onValueChange={(value) => handleSelectChange("categoryId", value)}
                                value={product.categoryId.toString()}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn danh mục" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.categoryId} value={category.categoryId.toString()}>
                                            {category.categoryName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="description">Mô tả</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={product.description}
                                onChange={handleInputChange}
                                rows={4}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Hình ảnh</Label>
                            <div className="flex items-center gap-2">
                                <Input type="file" accept="image/*" onChange={handleImageChange} disabled={uploadingImage} />
                                <Button type="button" onClick={handleUploadImage} disabled={!imageFile || uploadingImage} size="sm">
                                    {uploadingImage ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></div>
                                            Đang tải
                                        </>
                                    ) : (
                                        "Tải lên"
                                    )}
                                </Button>
                            </div>

                            {imageUrls.length > 0 && (
                                <div className="mt-4 grid grid-cols-3 gap-2">
                                    {imageUrls.map((url, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={url || "/placeholder.svg"}
                                                alt={`Uploaded ${index + 1}`}
                                                className="w-full h-24 object-cover rounded-md"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-1 right-1 h-6 w-6"
                                                onClick={() => handleRemoveImage(index)}
                                            >
                                                &times;
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button type="submit" disabled={isSubmitting || product.categoryId === 0}>
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
    )
}

export default AddProductDialog

