import type { DebtStatus } from "@/types/payment-history"

interface DebtStatusBadgeProps {
    status: DebtStatus
}

export const DebtStatusBadge = ({ status }: DebtStatusBadgeProps) => {
    switch (status) {
        case "StillValid":
            return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Còn hạn</span>
        case "NearDue":
            return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Sắp đến hạn</span>
        case "Overdue":
            return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Quá hạn</span>
        default:
            return null
    }
}
