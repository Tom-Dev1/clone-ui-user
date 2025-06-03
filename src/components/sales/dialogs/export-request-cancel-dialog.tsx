"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { Loader2 } from "lucide-react"

interface ExportRequestCancelDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    requestId: number
    onCancel: (reason: string) => void
    isLoading: boolean
}

export const ExportRequestCancelDialog = ({
    isOpen,
    onOpenChange,
    onCancel,
    isLoading,
}: ExportRequestCancelDialogProps) => {
    const [reason, setReason] = useState("")

    const handleSubmit = () => {
        onCancel(reason)
        onOpenChange(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Hủy yêu cầu xuất kho</DialogTitle>
                    <DialogDescription>
                        Vui lòng nhập lý do hủy yêu cầu xuất kho
                    </DialogDescription>
                </DialogHeader>
                <div className="">
                    <div className="">

                        <Textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="col-span-3"
                            placeholder="Nhập lý do hủy..."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                        Đóng
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleSubmit}
                        disabled={isLoading || !reason.trim()}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            "Xác nhận hủy"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
} 