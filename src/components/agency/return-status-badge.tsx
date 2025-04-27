import { Badge } from "@/components/ui/badge"

interface ReturnStatusBadgeProps {
    status: string
}

export const ReturnStatusBadge = ({ status }: ReturnStatusBadgeProps) => {
    switch (status) {
        case "Pending":
            return (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    Chờ duyệt
                </Badge>
            )
        case "Approved":
            return (
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                    Đã duyệt
                </Badge>
            )
        case "Completed":
            return (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    Hoàn thành
                </Badge>
            )
        case "Rejected":
            return (
                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                    Từ chối
                </Badge>
            )
        default:
            return (
                <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                    {status}
                </Badge>
            )
    }
}
