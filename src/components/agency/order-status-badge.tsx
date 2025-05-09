import { Badge } from "@/components/ui/badge"

interface OrderStatusBadgeProps {
    status: string
}

export const OrderStatusBadge = ({ status }: OrderStatusBadgeProps) => {

    switch (status) {
        case "WaitPaid":
            return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 p-1 w-[100px]">
                <span className="text-center w-[100px]">Chờ thanh toán</span>
            </Badge>
        case "Paid":
            return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 p-1 w-[100px]">
                <span className="text-center w-[100px]">Đã thanh toán</span>
            </Badge>
        case "WaitingDelivery":
            return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 p-1 w-[100px]">
                <span className="text-center w-[100px]">Chờ xuất kho</span>
            </Badge>

        case "Exported":
            return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 p-1 w-[100px]">
                <span className="text-center w-[100px]">Đã xuất kho</span>
            </Badge>

        case "Canceled":
            return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 p-1 w-[100px]">
                <span className="text-center w-[100px]">Từ chối</span>
            </Badge>
        default:
            return <Badge className="p-2 w-[103px] ">{status}</Badge>
    }
}

