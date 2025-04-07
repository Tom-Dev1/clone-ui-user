"use client"

import { Search } from "lucide-react"
import { Input } from "../../components/ui/input"

interface PaymentSearchProps {
    searchTerm: string
    onSearchChange: (value: string) => void
}

export const PaymentSearch = ({ searchTerm, onSearchChange }: PaymentSearchProps) => {
    return (
        <div className="mb-6">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                    placeholder="Tìm kiếm theo mã đơn hàng, đại lý, số serie hoặc phương thức thanh toán..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10"
                />
            </div>
        </div>
    )
}

