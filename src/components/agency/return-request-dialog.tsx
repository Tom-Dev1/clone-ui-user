"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Upload, X } from "lucide-react"
import type { Order } from "@/types/agency-orders"
import { toast } from "sonner"

// Define the base form schema with Zod
const baseReturnRequestSchema = z.object({
    orderId: z.string().min(1, "Vui lòng nhập mã đơn hàng"),
    items: z.array(
        z.object({
            orderDetailId: z.string().min(1, "Phải chọn sản phẩm"),
            quantity: z.number().min(1, { message: 'Số lượng tối thiểu là 1' }),
            reason: z.string().min(1, "Phải nhập lý do trả hàng!"),
        }),
    ),
})

type ReturnRequestFormValues = z.infer<typeof baseReturnRequestSchema>

interface ReturnRequestDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    selectedOrder: Order | null
    onSubmitReturn: (formData: FormData) => Promise<void>
    isSubmitting: boolean
}

export function ReturnRequestDialog({
    isOpen,
    onOpenChange,
    selectedOrder,
    onSubmitReturn,
    isSubmitting,
}: ReturnRequestDialogProps) {
    const [selectedImages, setSelectedImages] = useState<File[]>([])
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
    const [productQuantities, setProductQuantities] = useState<Record<string, number>>({})

    // Initialize the form with base schema
    const form = useForm<ReturnRequestFormValues>({
        resolver: zodResolver(baseReturnRequestSchema),
        defaultValues: {
            orderId: selectedOrder?.orderId || "",
            items: [
                {
                    orderDetailId: "",
                    quantity: 1,
                    reason: "",
                },
            ],
        },
    })

    // Update form values when selected order changes
    useEffect(() => {
        if (selectedOrder) {
            form.setValue("orderId", selectedOrder.orderId)

            // Get the first product from order details
            const firstProduct = selectedOrder.orderDetails[0]

            // Initialize items array with the first product
            form.setValue("items", [
                {
                    orderDetailId: firstProduct?.orderDetailId || "",
                    quantity: 1,
                    reason: "",
                },
            ])

            // Initialize product quantities
            const quantities: Record<string, number> = {}
            selectedOrder.orderDetails.forEach((detail) => {
                quantities[detail.orderDetailId] = detail.quantity
            })
            setProductQuantities(quantities)
        }
    }, [selectedOrder, form])

    // Handle dialog close
    const handleClose = useCallback(() => {
        onOpenChange(false)
        // Reset form after a short delay
        setTimeout(() => {
            form.reset()
            setSelectedImages([])
            setImagePreviewUrls([])
        }, 100)
    }, [form, onOpenChange])

    // Add new return item
    const addReturnItem = useCallback(() => {
        const currentItems = form.getValues("items")
        const selectedProductIds = currentItems.map((item) => item.orderDetailId)

        // Find the first available product that hasn't been selected
        const availableProduct = selectedOrder?.orderDetails.find(
            (detail) => !selectedProductIds.includes(detail.orderDetailId),
        )

        if (!availableProduct) {
            toast.error("Không còn sản phẩm nào để thêm vào yêu cầu trả hàng")
            return
        }

        const newItems = [
            ...currentItems,
            {
                orderDetailId: availableProduct.orderDetailId,
                quantity: 1,
                reason: "",
            },
        ]

        form.setValue("items", newItems, { shouldValidate: true })
    }, [form, selectedOrder])

    // Remove return item
    const removeReturnItem = useCallback(
        (index: number) => {
            const currentItems = form.getValues("items")
            const newItems = currentItems.filter((_, i) => i !== index)
            form.setValue("items", newItems, { shouldValidate: true })
        },
        [form],
    )

    // Handle product selection change
    const handleProductChange = (productId: string, index: number) => {
        if (selectedOrder) {
            const selectedProduct = selectedOrder.orderDetails.find((detail) => detail.orderDetailId === productId)
            if (selectedProduct) {
                const currentItems = form.getValues("items")
                currentItems[index].orderDetailId = productId
                currentItems[index].quantity = 1
                form.setValue("items", currentItems)
            }
        }
    }

    // Handle image selection
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files)
            setSelectedImages((prev) => [...prev, ...newFiles])

            // Create preview URLs for the new images
            const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file))
            setImagePreviewUrls((prev) => [...prev, ...newPreviewUrls])
        }
    }

    // Remove an image
    const removeImage = (index: number) => {
        setSelectedImages((prev) => prev.filter((_, i) => i !== index))

        // Revoke the object URL to avoid memory leaks
        URL.revokeObjectURL(imagePreviewUrls[index])
        setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index))
    }

    // Handle form submission
    const onSubmit = async (values: ReturnRequestFormValues) => {
        if (!selectedOrder) return

        // Validate that at least one image is selected
        if (selectedImages.length === 0) {
            toast.error("Vui lòng tải lên ít nhất một hình ảnh để tiếp tục.")
            return
        }

        try {
            // Create FormData object
            const formData = new FormData()
            formData.append("OrderId", values.orderId)

            // Convert items to the required format
            const itemsJson = values.items.map((item) => ({
                orderDetailId: item.orderDetailId,
                quantity: item.quantity,
                reason: item.reason,
            }))

            // Convert to escaped JSON string
            formData.append("ItemsJson", JSON.stringify(itemsJson))

            // Append images
            selectedImages.forEach((image) => {
                formData.append("Images", image)
            })

            // Submit the form
            await onSubmitReturn(formData)

            // Reset form and close dialog on success
            form.reset()
            setSelectedImages([])
            setImagePreviewUrls([])
        } catch (error) {
            console.error("Error submitting return request:", error)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Yêu cầu trả hàng</DialogTitle>
                    <DialogDescription>Tạo yêu cầu trả hàng cho đơn hàng {selectedOrder?.orderCode}</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {form.getValues("items").map((_, index) => (
                            <div key={index} className="space-y-4 p-4 border rounded-lg relative">
                                {index > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => removeReturnItem(index)}
                                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                        aria-label="Remove item"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}

                                <FormField
                                    control={form.control}
                                    name={`items.${index}.orderDetailId`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Sản phẩm</FormLabel>
                                            <Select onValueChange={(value) => handleProductChange(value, index)} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Chọn sản phẩm cần trả">
                                                            {field.value
                                                                ? selectedOrder?.orderDetails.find((detail) => detail.orderDetailId === field.value)
                                                                    ?.productName
                                                                : "Chọn sản phẩm cần trả"}
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {selectedOrder?.orderDetails
                                                        .filter((detail) => {
                                                            // Always show the currently selected product for this field
                                                            if (detail.orderDetailId === field.value) return true

                                                            // Show products that aren't selected in other items
                                                            // or have remaining quantity available
                                                            const isSelectedInOtherItems = form
                                                                .getValues("items")
                                                                .some((item, i) => i !== index && item.orderDetailId === detail.orderDetailId)

                                                            // If the product has quantity > 0 and isn't selected elsewhere, show it
                                                            return !isSelectedInOtherItems && productQuantities[detail.orderDetailId] > 0
                                                        })
                                                        .map((detail) => (
                                                            <SelectItem key={detail.orderDetailId} value={detail.orderDetailId}>
                                                                {detail.productName} - SL còn lại: {productQuantities[detail.orderDetailId] || 0}
                                                            </SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name={`items.${index}.quantity`}
                                    rules={{
                                        required: 'Vui lòng nhập số lượng',
                                        min: {
                                            value: 1,
                                            message: 'Số lượng phải lớn hơn hoặc bằng 1'
                                        }
                                    }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Số lượng</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    onWheel={(e) => e.currentTarget.blur()}
                                                    onKeyDown={(e) => {
                                                        if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                                            e.preventDefault()
                                                        }
                                                    }}
                                                    {...field}
                                                    onChange={(e) => {
                                                        const value = Number.parseInt(e.target.value, 10) || 0
                                                        const selectedProductId = form.getValues(`items.${index}.orderDetailId`)
                                                        const maxQuantity = productQuantities[selectedProductId] || 0
                                                        field.onChange(Math.min(Math.max(0, value), maxQuantity))
                                                    }}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Nhập số lượng sản phẩm cần trả
                                                {field.value &&
                                                    form.getValues(`items.${index}.orderDetailId`) &&
                                                    ` (tối đa: ${productQuantities[form.getValues(`items.${index}.orderDetailId`)] || 0})`}
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name={`items.${index}.reason`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Lý do trả hàng</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Nhập lý do trả hàng..." className="resize-none" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        ))}

                        <Button type="button" variant="outline" onClick={addReturnItem} className="w-full">
                            + Thêm sản phẩm trả
                        </Button>

                        <div className="space-y-2">
                            <FormLabel>Hình ảnh</FormLabel>
                            <div className="flex items-center gap-2">
                                <label
                                    htmlFor="image-upload"
                                    className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                                >
                                    <Upload className="h-4 w-4" />
                                    <span>Tải ảnh lên</span>
                                    <Input
                                        id="image-upload"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </label>
                                <span className="text-sm text-muted-foreground">{selectedImages.length} ảnh đã chọn</span>
                            </div>

                            {imagePreviewUrls.length > 0 && (
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                    {imagePreviewUrls.map((url, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={url || "/placeholder.svg"}
                                                alt={`Hình ảnh ${index + 1}`}
                                                className="h-20 w-20 object-cover rounded-md"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                aria-label="Xóa ảnh"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                                Hủy
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý
                                    </>
                                ) : (
                                    "Gửi yêu cầu"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
