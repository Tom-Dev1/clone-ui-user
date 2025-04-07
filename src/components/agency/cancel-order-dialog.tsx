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

interface CancelOrderDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
    actionLoading: boolean
}

export const CancelOrderDialog = ({ isOpen, onOpenChange, onConfirm, actionLoading }: CancelOrderDialogProps) => {
    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận hủy đơn hàng</AlertDialogTitle>
                    <AlertDialogDescription>
                        Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={actionLoading}>Hủy bỏ</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm} disabled={actionLoading}>
                        Xác nhận
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

