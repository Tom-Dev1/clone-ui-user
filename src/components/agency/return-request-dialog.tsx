"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
    orderId: z.string().min(1, "Order ID is required"),
    orderDetailId: z.string().min(1, "Phải chọn sản phẩm"),
    quantity: z.number().min(1, "Số lượng tối thiểu là 1"),
    reason: z.string().min(1, "Phải nhập lý do trả hàng!"),
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
    const [selectedProductQuantity, setSelectedProductQuantity] = useState<number | null>(null)

    // Initialize the form with base schema
    const form = useForm<ReturnRequestFormValues>({
        resolver: zodResolver(baseReturnRequestSchema),
        defaultValues: {
            orderId: selectedOrder?.orderId || "",

            orderDetailId: "",
            quantity: 1,
            reason: "",
        },
    })

    // Update form values when selected order changes
    useEffect(() => {
        if (selectedOrder) {
            form.setValue("orderId", selectedOrder.orderId)
            // Reset other fields
            form.setValue("orderDetailId", "")
            form.setValue("quantity", 1)
            form.setValue("reason", "")

            setSelectedProductQuantity(null)
        }
    }, [selectedOrder, form])

    // Handle product selection change
    const handleProductChange = (productId: string) => {
        if (selectedOrder) {
            const selectedProduct = selectedOrder.orderDetails.find((detail) => detail.orderDetailId === productId)
            if (selectedProduct) {
                const maxQuantity = selectedProduct.quantity
                setSelectedProductQuantity(maxQuantity)

                // Update form with new product selection
                form.setValue("orderDetailId", productId)

                // Set quantity to 1 (default starting value)
                form.setValue("quantity", 1)
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

        // Validate quantity against selected product max quantity
        if (selectedProductQuantity !== null && values.quantity > selectedProductQuantity) {
            form.setError("quantity", {
                type: "max",
                message: `Quantity cannot exceed ${selectedProductQuantity}`,
            })
            return
        }

        // Validate that at least one image is selected
        if (selectedImages.length === 0) {
            // Show error message
            toast.error("Vui lòng tải lên ít nhất một hình ảnh để tiếp tục.")
            return
        }

        try {
            // Create FormData object
            const formData = new FormData()
            formData.append("orderId", values.orderId)
            formData.append("orderDetailId", values.orderDetailId)
            formData.append("quantity", values.quantity.toString())
            formData.append("reason", values.reason)


            // Append images
            selectedImages.forEach((image) => {
                formData.append("images", image)
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

    // Validate quantity when it changes
    const validateQuantity = (value: number) => {
        if (selectedProductQuantity !== null && value > selectedProductQuantity) {
            return selectedProductQuantity
        }
        return value
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Yêu cầu trả hàng</DialogTitle>
                    <DialogDescription>Tạo yêu cầu trả hàng cho đơn hàng {selectedOrder?.orderCode}</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="orderDetailId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sản phẩm</FormLabel>
                                    <Select
                                        onValueChange={(value) => {
                                            handleProductChange(value)
                                        }}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn sản phẩm cần trả" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {selectedOrder?.orderDetails.map((detail) => (
                                                <SelectItem key={detail.orderDetailId} value={detail.orderDetailId}>
                                                    {detail.productName} - SL: {detail.quantity}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>Chọn sản phẩm bạn muốn trả lại</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="quantity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Số lượng</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="1"
                                            {...field}
                                            onChange={(e) => {
                                                const value = Number.parseInt(e.target.value, 10) || 0
                                                // Ensure value doesn't exceed max quantity if a product is selected
                                                const validValue = validateQuantity(value)
                                                field.onChange(validValue)
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Nhập số lượng sản phẩm cần trả
                                        {selectedProductQuantity !== null && ` (tối đa: ${selectedProductQuantity})`}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="reason"
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


                        <div className="space-y-2">
                            <FormLabel>Hình ảnh (tùy chọn)</FormLabel>
                            <div className="flex items-center gap-2">
                                <label
                                    htmlFor="image-upload"
                                    className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-md cursor-pointer hover:bg-gray-50"
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
                                                alt={`Preview ${index + 1}`}
                                                className="h-20 w-20 object-cover rounded-md"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
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
