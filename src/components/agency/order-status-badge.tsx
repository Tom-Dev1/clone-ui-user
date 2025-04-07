import { Badge } from "@/components/ui/badge"

interface OrderStatusBadgeProps {
    status: string
}

export const OrderStatusBadge = ({ status }: OrderStatusBadgeProps) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "default"

    switch (status) {
        case "WaitPaid":
            variant = "outline"
            return <Badge variant={variant} className="p-2 w-[103px] ">Chờ thanh toán</Badge>
        case "Paid":
            variant = "default"
            return <Badge className="bg-green-500 hover:bg-green-600 text-white p-2 w-[103px]">Đã thanh toán</Badge>
        case "Processing":
            variant = "secondary"
            return <Badge variant={variant} className="p-2 w-[103px] " >Đang xử lý</Badge>
        case "Delivery":
            variant = "secondary"
            return <Badge variant={variant} className="p-2 w-[103px] ">Đang giao hàng</Badge>
        case "Canceled":
            variant = "destructive"
            return <Badge variant={variant} className="p-2 w-[103px] " > <span className="text-center  w-[103px]">Đã hủy</span></Badge>
        default:
            return <Badge variant={variant} className="p-2 w-[103px] ">{status}</Badge>
    }
}

