import { Badge } from "@/components/ui/badge"

interface ReturnStatusBadgeProps {
    status: string
    getStatusInVietnamese: (status: string) => string
}

export default function ReturnStatusBadge({ status, getStatusInVietnamese }: ReturnStatusBadgeProps) {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "pending":
                return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
            case "approved":
                return "bg-blue-100 text-blue-800 hover:bg-blue-100"
            case "completed":
                return "bg-green-100 text-green-800 hover:bg-green-100"
            case "rejected":
                return "bg-red-100 text-red-800 hover:bg-red-100"
            default:
                return "bg-gray-100 text-gray-800 hover:bg-gray-100"
        }
    }

    return (
        <Badge className={`${getStatusColor(status)} border-none`} variant="outline">
            {getStatusInVietnamese(status)}
        </Badge>
    )
}
