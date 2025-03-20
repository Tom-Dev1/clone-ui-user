import { Button } from "@/components/ui/button"
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

interface DeleteConfirmDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: string
    isDeleting: boolean
}

const DeleteConfirmDialog = ({

    onClose,
    onConfirm,
    title,
    description,
    isDeleting,
}: DeleteConfirmDialogProps) => {
    return (
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-between sm:justify-between">
                <Button variant="outline" onClick={onClose} disabled={isDeleting}>
                    Hủy
                </Button>
                <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
                    {isDeleting ? (
                        <>
                            <span className="animate-spin mr-2">&#8635;</span>
                            Đang xóa...
                        </>
                    ) : (
                        "Xác nhận xóa"
                    )}
                </Button>
            </DialogFooter>
        </DialogContent>
    )
}

export default DeleteConfirmDialog

