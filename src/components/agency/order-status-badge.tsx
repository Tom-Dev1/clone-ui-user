import { Badge } from "@/components/ui/badge"

interface OrderStatusBadgeProps {
    status: string
}

export const OrderStatusBadge = ({ status }: OrderStatusBadgeProps) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "default"

    switch (status) {
        case "WaitPaid":
            variant = "outline"
            return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 p-1 w-[100px]">
                <span className="text-center w-[100px]">Chờ thanh toán</span>
            </Badge>
        case "Paid":
            variant = "default"
            return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 p-1 w-[100px]">
                <span className="text-center w-[100px]">Đã duyệt</span>
            </Badge>
        case "Processing":
            variant = "secondary"
            return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 p-1 w-[100px]">
                <span className="text-center w-[100px]">Đang xử lý</span>
            </Badge>


        case "Delivery":
            variant = "secondary"
            return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 p-1 w-[100px]">
                <span className="text-center w-[100px]">Đang giao hàng</span>
            </Badge>

        case "Canceled":
            variant = "destructive"
            return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 p-1 w-[100px]">
                <span className="text-center w-[100px]">Từ chối</span>
            </Badge>
        default:
            return <Badge variant={variant} className="p-2 w-[103px] ">{status}</Badge>
    }
}

