"use client"

import { useState } from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { getToken } from "@/utils/auth-utils"

interface AgencyLevelDeleteDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    levelId: number | null
    levelName: string | null
    onAgencyLevelDeleted: () => void
}

export function AgencyLevelDeleteDialog({
    isOpen,
    onOpenChange,
    levelId,
    levelName,
    onAgencyLevelDeleted,
}: AgencyLevelDeleteDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false)

    // Handle delete confirmation
    const handleDelete = async () => {
        if (!levelId) return

        setIsDeleting(true)

        try {
            const token = getToken()
            if (!token) {
                throw new Error("Phiên đăng nhập hết hạn")
            }

            const response = await fetch(`https://minhlong.mlhr.org/api/AgencyLevel/${levelId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            })

            if (!response.ok) {
                // Try to get error message from response
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || `Error: ${response.status}`)
            }

            // Success
            toast.success("Xóa cấp độ đại lý thành công")

            // Close dialog
            onOpenChange(false)

            // Notify parent component
            onAgencyLevelDeleted()
        } catch (error) {
            console.error("Failed to delete agency level:", error)
            toast.error(error instanceof Error ? error.message : "Không thể xóa cấp độ đại lý")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận xóa cấp độ đại lý</AlertDialogTitle>
                    <AlertDialogDescription>
                        Bạn có chắc chắn muốn xóa cấp độ đại lý <strong>{levelName}</strong>? Hành động này không thể hoàn tác và có
                        thể ảnh hưởng đến các đại lý đang sử dụng cấp độ này.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault()
                            handleDelete()
                        }}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Đang xóa...
                            </>
                        ) : (
                            "Xóa"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
