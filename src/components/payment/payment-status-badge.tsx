import { Badge } from "../../components/ui/badge"

interface PaymentStatusBadgeProps {
    status: string
}

export const PaymentStatusBadge = ({ status }: PaymentStatusBadgeProps) => {
    switch (status) {
        case "PAID":
            return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 p-1 w-[130px]">
                <span className="text-center w-[130px]">Đã thanh toán</span>
            </Badge>


        case "PARTIALLY_PAID":
            return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 p-1 w-[130px]">
                <span className="text-center w-[130px]">Thanh toán một phần</span>
            </Badge>


        case "UNPAID":
            return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 p-1 w-[130px]">
                <span className="text-center w-[130px]">Chưa thanh toán</span>
            </Badge>

        default:
            return <Badge>{status}</Badge>
    }
}

