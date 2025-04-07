import { Badge } from "../../components/ui/badge"

interface PaymentStatusBadgeProps {
    status: string
}

export const PaymentStatusBadge = ({ status }: PaymentStatusBadgeProps) => {
    switch (status) {
        case "PAID":
            return <Badge className="bg-green-500">Đã thanh toán</Badge>
        case "PARTIALLY_PAID":
            return <Badge className="bg-yellow-500">Thanh toán một phần</Badge>
        case "UNPAID":
            return <Badge className="bg-red-500">Chưa thanh toán</Badge>
        default:
            return <Badge>{status}</Badge>
    }
}

