"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface Warehouse {
    warehouseId: number
    warehouseName: string
    fullAddress: string
}

interface ExportRequestCreateDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    requestExportId: number | null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onCreateRequest: (request: any) => void
}

// Hàm lấy token từ localStorage
const getToken = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("auth_token")
    }
    return null
}

// Hàm fetch với authentication
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = getToken()
    if (!token) {
        throw new Error("Authentication token not found")
    }

    const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
    }

    const response = await fetch(url, {
        ...options,
        headers,
    })

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
    }

    return response.json()
}

const ExportRequestCreateDialog = ({
    open,
    onOpenChange,
    requestExportId,
    onCreateRequest,
}: ExportRequestCreateDialogProps) => {
    const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("")
    const [warehouses, setWarehouses] = useState<Warehouse[]>([])
    const [loadingWarehouses, setLoadingWarehouses] = useState<boolean>(false)
    const [warehouseError, setWarehouseError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [alertMessage, setAlertMessage] = useState<{
        type: "error" | "success" | null
        title: string
        message: string
    }>({ type: null, title: "", message: "" })

    // Fetch warehouses when dialog opens
    useEffect(() => {
        if (open) {
            fetchWarehouses()
        }
    }, [open])

    // Reset alert when dialog closes
    useEffect(() => {
        if (!open) {
            setAlertMessage({ type: null, title: "", message: "" })
        }
    }, [open])

    // Fetch warehouses from API
    const fetchWarehouses = async () => {
        try {
            setLoadingWarehouses(true)
            const data = await fetchWithAuth("https://minhlong.mlhr.org/api/warehouse")
            setWarehouses(data)
            setWarehouseError(null)

            // Set default warehouse if available
            if (data.length > 0 && !selectedWarehouseId) {
                setSelectedWarehouseId(data[0].warehouseId.toString())
            }
        } catch (err) {
            console.error("Error fetching warehouses:", err)
            setWarehouseError("Không thể tải danh sách kho. Vui lòng thử lại sau.")
        } finally {
            setLoadingWarehouses(false)
        }
    }

    // Xử lý liên kết yêu cầu xuất kho với kho
    const handleLinkWarehouse = async () => {
        if (!selectedWarehouseId || !requestExportId) {
            setAlertMessage({
                type: "error",
                title: "Lỗi",
                message: "Vui lòng chọn kho xuất hàng.",
            })
            return
        }

        try {
            setIsSubmitting(true)
            setAlertMessage({ type: null, title: "", message: "" })

            // Gọi API liên kết yêu cầu xuất kho với kho
            await fetchWithAuth(
                `https://minhlong.mlhr.org/api/WarehouseRequestExport/create?warehouseId=${selectedWarehouseId}&requestExportId=${requestExportId}`,
                {
                    method: "POST",
                },
            )

            setAlertMessage({
                type: "success",
                title: "Thành công",
                message: `Yêu cầu xuất kho #${requestExportId} đã được liên kết với kho.`,
            })

            // Gọi callback để cập nhật UI
            onCreateRequest({ requestExportId, warehouseId: selectedWarehouseId })

            // Đóng dialog sau 2 giây
            setTimeout(() => {
                onOpenChange(false)
            }, 2000)
        } catch (err) {
            console.error("Error linking warehouse to export request:", err)
            setAlertMessage({
                type: "error",
                title: "Lỗi",
                message: "Không thể liên kết yêu cầu xuất kho với kho. Vui lòng thử lại sau.",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Chọn kho xuất hàng</DialogTitle>
                    <DialogDescription>Chọn kho xuất hàng cho yêu cầu xuất kho #{requestExportId}</DialogDescription>
                </DialogHeader>

                {alertMessage.type && (
                    <Alert variant={alertMessage.type === "error" ? "destructive" : "default"} className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>{alertMessage.title}</AlertTitle>
                        <AlertDescription>{alertMessage.message}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="warehouse">Kho xuất hàng</Label>
                        {loadingWarehouses ? (
                            <div className="flex items-center space-x-2 h-10 px-3 border rounded-md">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm text-muted-foreground">Đang tải danh sách kho...</span>
                            </div>
                        ) : warehouseError ? (
                            <div className="text-red-500 text-sm">{warehouseError}</div>
                        ) : (
                            <Select value={selectedWarehouseId} onValueChange={setSelectedWarehouseId}>
                                <SelectTrigger id="warehouse">
                                    <SelectValue placeholder="Chọn kho xuất hàng" />
                                </SelectTrigger>
                                <SelectContent>
                                    {warehouses.map((warehouse) => (
                                        <SelectItem key={warehouse.warehouseId} value={warehouse.warehouseId.toString()}>
                                            {warehouse.warehouseName} - {warehouse.fullAddress}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                </div>

                <DialogFooter className="pt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Hủy
                    </Button>
                    <Button onClick={handleLinkWarehouse} disabled={isSubmitting || !selectedWarehouseId || !requestExportId}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            "Xác nhận"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ExportRequestCreateDialog

