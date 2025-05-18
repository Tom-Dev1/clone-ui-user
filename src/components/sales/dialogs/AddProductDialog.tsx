"use client"

import type React from "react"
import { useState, useEffect } from "react"
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

    productName: string
    unit: string
    defaultExpiration: number
    categoryId: number
    description: string
    taxId: number
}

interface AddProductDialogProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (productData: ProductData, imageFiles: File[]) => Promise<void>
    product: ProductData
    setProduct: React.Dispatch<React.SetStateAction<ProductData>>
    categories: Category[]
    isSubmitting: boolean
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
    handleSelectChange: (name: string, value: string) => void
    selectedFiles: File[]
    setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>
}

const AddProductDialog: React.FC<AddProductDialogProps> = ({

    onClose,
    onSubmit,
    product,
    categories,
    isSubmitting,
    handleInputChange,
    handleSelectChange,
    selectedFiles,
    setSelectedFiles,
}) => {
    // Tạo preview URLs cho các file đã chọn
    const [previewUrls, setPreviewUrls] = useState<string[]>([])

    // Cập nhật preview URLs khi selectedFiles thay đổi
    useEffect(() => {
        const newPreviewUrls = selectedFiles.map((file) => URL.createObjectURL(file))
        setPreviewUrls(newPreviewUrls)

        // Cleanup function để giải phóng URLs khi component unmount
        return () => {
            newPreviewUrls.forEach((url) => URL.revokeObjectURL(url))
        }
    }, [selectedFiles])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files)
            setSelectedFiles((prev) => [...prev, ...newFiles])
        }
    }

    const handleRemoveFile = (index: number) => {
        const updatedFiles = [...selectedFiles]
        updatedFiles.splice(index, 1)
        setSelectedFiles(updatedFiles)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await onSubmit(product, selectedFiles)
    }

    return (
        <DialogContent className="max-w-3xl">
            <DialogHeader>
                <DialogTitle>Thêm sản phẩm mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    <div className="space-y-4">


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
                            <Select onValueChange={(value) => handleSelectChange("unit", value)} value={product.unit}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn đơn vị" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Bao">Bao</SelectItem>
                                    <SelectItem value="Chai">Chai</SelectItem>
                                </SelectContent>
                            </Select>
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
                            <Label>Hình ảnh sản phẩm</Label>
                            <Input type="file" accept="image/*" onChange={handleFileChange} multiple />

                            {previewUrls.length > 0 && (
                                <div className="mt-4 grid grid-cols-3 gap-2">
                                    {previewUrls.map((url, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={url || "/placeholder.svg"}
                                                alt={`Product image ${index + 1}`}
                                                className="w-full h-24 object-cover rounded-md"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-1 right-1 h-6 w-6"
                                                onClick={() => handleRemoveFile(index)}
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

