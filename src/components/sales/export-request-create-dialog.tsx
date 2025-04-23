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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { fetchWithAuth } from "@/utils/api-utils"
import type { RequestExport } from "@/types/export-request"

interface Warehouse {
    warehouseId: number
    warehouseName: string
}

interface ExportRequestCreateDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    requestExportId: number | null
    onCreateRequest: (requestData: RequestExport) => void
}

export const ExportRequestCreateDialog = ({
    open,
    onOpenChange,
    requestExportId,
    onCreateRequest,
}: ExportRequestCreateDialogProps) => {
    const [warehouses, setWarehouses] = useState<Warehouse[]>([])
    const [selectedWarehouse, setSelectedWarehouse] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    // Fetch warehouses when dialog opens
    useEffect(() => {
        if (open) {
            fetchWarehouses()
        } else {
            // Reset state when dialog closes
            setSelectedWarehouse("")
            setError(null)
        }
    }, [open])

    const fetchWarehouses = async () => {
        try {
            setLoading(true)
            const data = await fetchWithAuth("https://minhlong.mlhr.org/api/warehouse")
            setWarehouses(data)
            setError(null)
        } catch (err) {
            console.error("Error fetching warehouses:", err)
            setError("Failed to load warehouses. Please try again later.")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async () => {
        if (!selectedWarehouse) {
            setError("Please select a warehouse")
            return
        }

        if (!requestExportId) {
            setError("No export request selected")
            return
        }

        try {
            setLoading(true)
            // Call API to link warehouse with export request
            const response = await fetchWithAuth(
                `https://minhlong.mlhr.org/api/RequestExport/${requestExportId}/warehouse/${selectedWarehouse}`,
                {
                    method: "PUT",
                },
            )

            // Call onCreateRequest with the response data
            onCreateRequest(response)
        } catch (err) {
            console.error("Error creating export request:", err)
            setError("Failed to create export request. Please try again later.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Chọn kho để xuất hàng</DialogTitle>
                    <DialogDescription>Chọn kho để xuất hàng cho yêu cầu #{requestExportId}</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="warehouse" className="text-right">
                            Kho
                        </Label>
                        <div className="col-span-3">
                            <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn kho" />
                                </SelectTrigger>
                                <SelectContent>
                                    {warehouses.map((warehouse) => (
                                        <SelectItem key={warehouse.warehouseId} value={warehouse.warehouseId.toString()}>
                                            {warehouse.warehouseName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading || !selectedWarehouse}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý
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
