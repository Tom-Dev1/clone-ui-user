"use client"

import { useState, useEffect } from "react"
import { Loader2, AlertCircle, CheckCircle2, XCircle, Eye } from "lucide-react"
import { toast } from "sonner"
import { getToken } from "@/utils/auth-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

// Define the interface for upgrade requests
interface UpgradeRequest {
    agencyPromotionRequestId: string
    agencyId: number
    agencyName: string
    currentLevelId: number
    suggestedLevelId: number
    totalScore: number
    status: string
    createdAt: string
    reviewedAt?: string
    reviewedBy?: string
    // Keep these fields for UI display
    currentLevelName?: string
    suggestedLevelName?: string
    notes?: string
}

export function AgencyLevelUpgradeRequests() {
    const [upgradeRequests, setUpgradeRequests] = useState<UpgradeRequest[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedRequest, setSelectedRequest] = useState<UpgradeRequest | null>(null)
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
    const [rejectReason, setRejectReason] = useState("")

    // Fetch upgrade requests
    const fetchUpgradeRequests = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const token = getToken()
            if (!token) {
                throw new Error("Phiên đăng nhập hết hạn")
            }

            const response = await fetch("https://minhlong.mlhr.org/api/AgencyScore/managed", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            })

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`)
            }

            const data = await response.json()

            // Fetch level names for display (you'll need to implement this)
            const enrichedData = await Promise.all(
                data.map(async (request: UpgradeRequest) => {
                    // You can fetch level names from your existing agency levels data
                    // or from another API endpoint if available
                    const currentLevelName = await getLevelName(request.currentLevelId)
                    const suggestedLevelName = await getLevelName(request.suggestedLevelId)

                    return {
                        ...request,
                        currentLevelName,
                        suggestedLevelName,
                    }
                }),
            )

            setUpgradeRequests(enrichedData)
        } catch (error) {
            console.error("Failed to fetch upgrade requests:", error)
            setError(error instanceof Error ? error.message : "Không thể tải dữ liệu yêu cầu nâng cấp")
            toast.error("Không thể tải dữ liệu yêu cầu nâng cấp")
        } finally {
            setIsLoading(false)
        }
    }

    // Add a helper function to get level names
    const getLevelName = async (levelId: number): Promise<string> => {
        // This is a placeholder - you should implement this based on your data
        // You could use the agencyLevels state from the parent component
        // or make an API call to get the level name

        // For now, return a placeholder
        const levelNames: Record<number, string> = {
            1: "Đại lý Cấp 1",
            2: "Đại lý Cấp 2",
            3: "Đại lý Cấp 3",
            4: "Đại lý Cấp 4",
        }

        return levelNames[levelId] || `Cấp ${levelId}`
    }

    useEffect(() => {
        fetchUpgradeRequests()
    }, [])

    // Handle view request details
    const handleViewRequest = (request: UpgradeRequest) => {
        setSelectedRequest(request)
        setIsViewDialogOpen(true)
    }

    // Handle approve request
    const handleApproveRequest = (request: UpgradeRequest) => {
        setSelectedRequest(request)
        setIsApproveDialogOpen(true)
    }

    // Handle reject request
    const handleRejectRequest = (request: UpgradeRequest) => {
        setSelectedRequest(request)
        setIsRejectDialogOpen(true)
    }

    // Confirm approve request
    const confirmApproveRequest = async (fromViewDialog = false) => {
        if (!selectedRequest) return

        try {
            const token = getToken()
            if (!token) {
                throw new Error("Phiên đăng nhập hết hạn")
            }

            const response = await fetch(
                `https://minhlong.mlhr.org/api/AgencyScore/approve/${selectedRequest.agencyPromotionRequestId}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                },
            )

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`)
            }

            // Update local state to reflect the change
            setUpgradeRequests((prev) =>
                prev.map((req) =>
                    req.agencyPromotionRequestId === selectedRequest.agencyPromotionRequestId
                        ? { ...req, status: "Approved", reviewedAt: new Date().toISOString() }
                        : req,
                ),
            )

            toast.success(`Đã duyệt yêu cầu nâng cấp cho ${selectedRequest.agencyName}`)

            // Close the appropriate dialog
            if (fromViewDialog) {
                setIsViewDialogOpen(false)
            } else {
                setIsApproveDialogOpen(false)
            }

            fetchUpgradeRequests() // Refresh the data
        } catch (error) {
            console.error("Failed to approve request:", error)
            toast.error("Không thể duyệt yêu cầu nâng cấp")
        }
    }

    // Confirm reject request
    const confirmRejectRequest = async () => {
        if (!selectedRequest) return

        try {
            const token = getToken()
            if (!token) {
                throw new Error("Phiên đăng nhập hết hạn")
            }

            const response = await fetch(
                `https://minhlong.mlhr.org/api/AgencyScore/reject/${selectedRequest.agencyPromotionRequestId}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ reason: rejectReason }),
                },
            )

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`)
            }

            // Update local state to reflect the change
            setUpgradeRequests((prev) =>
                prev.map((req) =>
                    req.agencyPromotionRequestId === selectedRequest.agencyPromotionRequestId
                        ? { ...req, status: "Rejected", notes: rejectReason, reviewedAt: new Date().toISOString() }
                        : req,
                ),
            )

            toast.success(`Đã từ chối yêu cầu nâng cấp cho ${selectedRequest.agencyName}`)
            setIsRejectDialogOpen(false)
            setRejectReason("")
            fetchUpgradeRequests() // Refresh the data
        } catch (error) {
            console.error("Failed to reject request:", error)
            toast.error("Không thể từ chối yêu cầu nâng cấp")
        }
    }

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date)
    }

    // Get status badge
    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case "pending":
                return (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        Chờ duyệt
                    </Badge>
                )
            case "approved":
                return (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Đã duyệt
                    </Badge>
                )
            case "rejected":
                return (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        Từ chối
                    </Badge>
                )
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Yêu cầu nâng cấp đại lý</h3>
                        <Button variant="outline" onClick={fetchUpgradeRequests}>
                            Làm mới
                        </Button>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin mr-2" />
                            <p>Đang tải dữ liệu yêu cầu nâng cấp...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center">
                            <AlertCircle className="h-5 w-5 mr-2" />
                            <span>{error}</span>
                        </div>
                    ) : upgradeRequests.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">Không có yêu cầu nâng cấp nào</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Đại lý</TableHead>
                                        <TableHead>Cấp hiện tại</TableHead>
                                        <TableHead>Cấp đề xuất</TableHead>
                                        <TableHead>Điểm số</TableHead>
                                        <TableHead>Ngày yêu cầu</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead className="text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {upgradeRequests.map((request) => (
                                        <TableRow key={request.agencyPromotionRequestId}>
                                            <TableCell className="font-medium">{request.agencyName}</TableCell>
                                            <TableCell>{request.currentLevelName || `Cấp ${request.currentLevelId}`}</TableCell>
                                            <TableCell>{request.suggestedLevelName || `Cấp ${request.suggestedLevelId}`}</TableCell>
                                            <TableCell>{request.totalScore}</TableCell>
                                            <TableCell>{formatDate(request.createdAt)}</TableCell>
                                            <TableCell>{getStatusBadge(request.status)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleViewRequest(request)}
                                                        title="Xem chi tiết"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>

                                                    {request.status.toLowerCase() === "pending" && (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                onClick={() => handleApproveRequest(request)}
                                                                title="Duyệt yêu cầu"
                                                            >
                                                                <CheckCircle2 className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                onClick={() => handleRejectRequest(request)}
                                                                title="Từ chối yêu cầu"
                                                            >
                                                                <XCircle className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* View Request Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Chi tiết yêu cầu nâng cấp</DialogTitle>
                        <DialogDescription>Thông tin chi tiết về yêu cầu nâng cấp đại lý</DialogDescription>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Đại lý</p>
                                    <p className="font-medium">{selectedRequest.agencyName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Trạng thái</p>
                                    <div>{getStatusBadge(selectedRequest.status)}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Cấp hiện tại</p>
                                    <p className="font-medium">
                                        {selectedRequest.currentLevelName || `Cấp ${selectedRequest.currentLevelId}`}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Cấp đề xuất</p>
                                    <p className="font-medium">
                                        {selectedRequest.suggestedLevelName || `Cấp ${selectedRequest.suggestedLevelId}`}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Điểm số</p>
                                <p className="font-medium">{selectedRequest.totalScore}</p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Ngày yêu cầu</p>
                                <p className="font-medium">{formatDate(selectedRequest.createdAt)}</p>
                            </div>

                            {selectedRequest.reviewedAt && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Ngày duyệt</p>
                                    <p className="font-medium">{formatDate(selectedRequest.reviewedAt)}</p>
                                </div>
                            )}

                            {selectedRequest.reviewedBy && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Người duyệt</p>
                                    <p className="font-medium">{selectedRequest.reviewedBy}</p>
                                </div>
                            )}

                            {selectedRequest.notes && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Ghi chú</p>
                                    <p className="font-medium">{selectedRequest.notes}</p>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                            Đóng
                        </Button>

                        {selectedRequest &&
                            (selectedRequest.status.toLowerCase() === "pending") && (
                                <Button
                                    onClick={() => confirmApproveRequest(true)}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    {selectedRequest.status.toLowerCase() === "pending" ? "Duyệt yêu cầu" : "Duyệt lại yêu cầu"}
                                </Button>
                            )}

                        {selectedRequest && selectedRequest.status.toLowerCase() === "pending" && (
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    setIsViewDialogOpen(false)
                                    handleRejectRequest(selectedRequest)
                                }}
                            >
                                Từ chối
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Approve Request Dialog */}
            <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Duyệt yêu cầu nâng cấp</DialogTitle>
                        <DialogDescription>Bạn có chắc chắn muốn duyệt yêu cầu nâng cấp này?</DialogDescription>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Đại lý</p>
                                <p className="font-medium">{selectedRequest.agencyName}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Cấp hiện tại</p>
                                    <p className="font-medium">
                                        {selectedRequest.currentLevelName || `Cấp ${selectedRequest.currentLevelId}`}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Cấp đề xuất</p>
                                    <p className="font-medium">
                                        {selectedRequest.suggestedLevelName || `Cấp ${selectedRequest.suggestedLevelId}`}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Điểm số</p>
                                <p className="font-medium">{selectedRequest.totalScore}</p>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
                            Hủy
                        </Button>
                        <Button onClick={() => confirmApproveRequest()}>Xác nhận duyệt</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Request Dialog */}
            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Từ chối yêu cầu nâng cấp</DialogTitle>
                        <DialogDescription>Vui lòng nhập lý do từ chối yêu cầu nâng cấp này</DialogDescription>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Đại lý</p>
                                <p className="font-medium">{selectedRequest.agencyName}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Cấp hiện tại</p>
                                    <p className="font-medium">
                                        {selectedRequest.currentLevelName || `Cấp ${selectedRequest.currentLevelId}`}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Cấp đề xuất</p>
                                    <p className="font-medium">
                                        {selectedRequest.suggestedLevelName || `Cấp ${selectedRequest.suggestedLevelId}`}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Điểm số</p>
                                <p className="font-medium">{selectedRequest.totalScore}</p>
                            </div>

                            <div>
                                <label htmlFor="reject-reason" className="text-sm font-medium">
                                    Lý do từ chối
                                </label>
                                <textarea
                                    id="reject-reason"
                                    className="w-full mt-1 p-2 border rounded-md"
                                    rows={3}
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Nhập lý do từ chối yêu cầu nâng cấp"
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                            Hủy
                        </Button>
                        <Button variant="destructive" onClick={confirmRejectRequest} disabled={!rejectReason.trim()}>
                            Xác nhận từ chối
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
