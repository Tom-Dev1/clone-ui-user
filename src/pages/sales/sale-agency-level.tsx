"use client"

import { useState, useEffect } from "react"
import { SalesLayout } from "@/layouts/sale-layout"
import { getToken } from "@/utils/auth-utils"
import { Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import type { AgencyLevel } from "@/types/agency-level"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Import components
import { AgencyLevelDialog } from "@/components/agency-level/agency-level-dialog"
import { AgencyLevelTable } from "@/components/agency-level/agency-level-table"
import { AgencyLevelCards } from "@/components/agency-level/agency-level-cards"
import { AgencyLevelStats } from "@/components/agency-level/agency-level-stats"
import { AgencyLevelViewDialog } from "@/components/agency-level/agency-level-view-dialog"
import { AgencyLevelUpdateDialog } from "@/components/agency-level/agency-level-update-dialog"
import { AgencyLevelDeleteDialog } from "@/components/agency-level/agency-level-delete-dialog"
import { AgencyLevelUpgradeRequests } from "@/components/agency-level/agency-level-upgrade-requests"

export default function SaleAgencyLevel() {
    const [agencyLevels, setAgencyLevels] = useState<AgencyLevel[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("manage")

    // State for view dialog
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
    const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null)

    // State for update dialog
    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
    const [selectedLevelForUpdate, setSelectedLevelForUpdate] = useState<number | null>(null)

    // State for delete dialog
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedLevelForDelete, setSelectedLevelForDelete] = useState<number | null>(null)
    const [selectedLevelNameForDelete, setSelectedLevelNameForDelete] = useState<string | null>(null)

    // Fetch agency levels from API
    const fetchAgencyLevels = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const token = getToken()
            if (!token) {
                throw new Error("Phiên đăng nhập hết hạn")
            }

            const response = await fetch("https://minhlong.mlhr.org/api/AgencyLevel", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            })

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`)
            }

            const data = await response.json()
            setAgencyLevels(data)
        } catch (error) {
            console.error("Failed to fetch agency levels:", error)
            setError(error instanceof Error ? error.message : "Không thể tải dữ liệu cấp độ đại lý")
            toast.error("Không thể tải dữ liệu cấp độ đại lý")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchAgencyLevels()
    }, [])

    // Handle view level
    const handleViewLevel = (levelId: number) => {
        setSelectedLevelId(levelId)
        setIsViewDialogOpen(true)
    }

    // Handle edit level
    const handleEditLevel = (levelId: number) => {
        setSelectedLevelForUpdate(levelId)
        setIsUpdateDialogOpen(true)
    }

    // Handle delete level
    const handleDeleteLevel = (levelId: number, levelName: string) => {
        setSelectedLevelForDelete(levelId)
        setSelectedLevelNameForDelete(levelName)
        setIsDeleteDialogOpen(true)
    }

    return (
        <SalesLayout>
            <div className="container mx-auto py-6 px-4 md:px-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Quản lý cấp độ đại lý</h1>
                        <p className="text-muted-foreground">Xem thông tin về các cấp độ đại lý và quyền lợi tương ứng</p>
                    </div>

                    {activeTab === "manage" && <AgencyLevelDialog onAgencyLevelAdded={fetchAgencyLevels} />}
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                    <TabsList>
                        <TabsTrigger value="manage">Quản lý cấp độ</TabsTrigger>
                        <TabsTrigger value="upgrade">Duyệt lên cấp cho đại lý</TabsTrigger>
                    </TabsList>

                    <TabsContent value="manage">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                                <p>Đang tải dữ liệu cấp độ đại lý...</p>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center">
                                <AlertCircle className="h-5 w-5 mr-2" />
                                <span>{error}</span>
                            </div>
                        ) : (
                            <>
                                {/* Overview Cards */}
                                <AgencyLevelStats agencyLevels={agencyLevels} />

                                {/* Agency Levels Table */}
                                <AgencyLevelTable
                                    agencyLevels={agencyLevels}
                                    onViewLevel={handleViewLevel}
                                    onEditLevel={handleEditLevel}
                                    onDeleteLevel={handleDeleteLevel}
                                />

                                {/* Detailed Cards */}
                                <AgencyLevelCards agencyLevels={agencyLevels} />
                            </>
                        )}
                    </TabsContent>

                    <TabsContent value="upgrade">
                        <AgencyLevelUpgradeRequests />
                    </TabsContent>
                </Tabs>

                {/* View Dialog */}
                <AgencyLevelViewDialog isOpen={isViewDialogOpen} onOpenChange={setIsViewDialogOpen} levelId={selectedLevelId} />

                {/* Update Dialog */}
                <AgencyLevelUpdateDialog
                    isOpen={isUpdateDialogOpen}
                    onOpenChange={setIsUpdateDialogOpen}
                    levelId={selectedLevelForUpdate}
                    onAgencyLevelUpdated={fetchAgencyLevels}
                />

                {/* Delete Dialog */}
                <AgencyLevelDeleteDialog
                    isOpen={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                    levelId={selectedLevelForDelete}
                    levelName={selectedLevelNameForDelete}
                    onAgencyLevelDeleted={fetchAgencyLevels}
                />
            </div>
        </SalesLayout>
    )
}
