"use client"

import { MoreHorizontal, Eye, CheckCircle, XCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import type { RequestProduct } from "@/types/sales-orders"

interface OrderActionMenuProps {
    order: RequestProduct
    onViewDetail: (order: RequestProduct) => void
    onApprove: (requestProductId: string) => void
    onCancel: (requestProductId: string) => void
}

export const OrderActionMenu = ({ order, onViewDetail, onApprove, onCancel }: OrderActionMenuProps) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Mở menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewDetail(order)} className="cursor-pointer">
                    <Eye className="mr-2 h-4 w-4" />
                    <span>Chi tiết</span>
                </DropdownMenuItem>

                {order.requestStatus === "Pending" && (
                    <>
                        <DropdownMenuItem
                            onClick={() => onApprove(order.requestProductId)}
                            className="cursor-pointer text-green-600 hover:text-green-700 focus:text-green-700"
                        >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            <span>Duyệt</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={() => onCancel(order.requestProductId)}
                            className="cursor-pointer text-red-600 hover:text-red-700 focus:text-red-700"
                        >
                            <XCircle className="mr-2 h-4 w-4" />
                            <span>Hủy</span>
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

