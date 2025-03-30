import type React from "react"
import { Button } from "@/components/ui/button"
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Edit } from "lucide-react"

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
    createdByName?: string
    updatedBy?: string
    updatedByName: string
    updatedDate?: string
    availableStock: number
    images: string[]
    price: number
    status?: string
}

interface ViewProductDialogProps {
    product: Product
    onClose: () => void
    onEdit: () => void
    formatDate: (dateString: string) => string
}

const ViewProductDialog: React.FC<ViewProductDialogProps> = ({ product, onClose, onEdit, formatDate }) => {
    return (
        <DialogContent className="max-w-3xl">
            <DialogHeader>
                <DialogTitle>Chi tiết sản phẩm</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="">
                    {product.images && product.images.length > 0 ? (
                        <Carousel className="w-full ml-8">
                            <CarouselContent>
                                {product.images.map((image, index) => (
                                    <CarouselItem key={index}>
                                        <div className="p-1">
                                            <img
                                                src={image || "/placeholder.svg"}
                                                alt={`${product.productName} - Ảnh ${index + 1}`}
                                                className="w-full h-64 object-cover rounded-md"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement
                                                    target.src = "/placeholder.svg?height=300&width=300"
                                                }}
                                            />
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                        </Carousel>
                    ) : (
                        <img
                            src="/placeholder.svg?height=300&width=300"
                            alt={product.productName || "Sản phẩm"}
                            className="w-full h-64 object-cover rounded-md"
                        />
                    )}
                </div>

                <div className="space-y-4 ml-16">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Mã sản phẩm</h3>
                        <p>{product.productCode}</p>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Tên sản phẩm</h3>
                        <p className="text-lg font-semibold">{product.productName}</p>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Đơn vị</h3>
                        <p>{product.unit}</p>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Tồn kho</h3>
                        <p className="text-lg font-semibold">{product.availableStock}</p>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Hạn sử dụng mặc định</h3>
                        <p>{product.defaultExpiration} ngày</p>
                    </div>
                </div>
            </div>

            <div className="mt-4 space-y-4">
                <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Mô tả</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{product.description || "Không có mô tả"}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Ngày tạo</h3>
                        <p className="text-sm">{formatDate(product.createdDate)}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Người  tạo</h3>
                        <p className="text-sm">{product.createdByName}</p>
                    </div>
                </div>
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={onClose}>
                    Đóng
                </Button>
                <Button onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-1" />
                    Sửa
                </Button>
            </DialogFooter>
        </DialogContent>
    )
}

export default ViewProductDialog

