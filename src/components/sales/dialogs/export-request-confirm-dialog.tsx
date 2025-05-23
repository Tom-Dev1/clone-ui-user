"use client"

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

interface ExportRequestConfirmDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    requestId: number | null
    requestCode: string
    onConfirm: () => void
    isLoading: boolean
}

export const ExportRequestConfirmDialog = ({
    isOpen,
    onOpenChange,
    requestCode,
    onConfirm,
    isLoading,
}: ExportRequestConfirmDialogProps) => {
    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận yêu cầu xuất kho</AlertDialogTitle>
                    <AlertDialogDescription>
                        Bạn có chắc chắn muốn tạo yêu cầu xuất kho cho kho chính với mã yêu cầu {requestCode} không?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault()
                            onConfirm()
                        }}
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700 focus:ring-green-600"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Đang xử lý...
                            </>
                        ) : (
                            "Xác nhận"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
