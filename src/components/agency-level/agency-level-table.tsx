"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Eye, Pencil, MoreHorizontal, Trash2 } from "lucide-react"
import type { AgencyLevel } from "@/types/agency-level"
import { formatCurrency, getLevelColor } from "@/utils/agency-level-utils"

interface AgencyLevelTableProps {
    agencyLevels: AgencyLevel[]
    onViewLevel: (levelId: number) => void
    onEditLevel: (levelId: number) => void
    onDeleteLevel: (levelId: number, levelName: string) => void
}

export function AgencyLevelTable({ agencyLevels, onViewLevel, onEditLevel, onDeleteLevel }: AgencyLevelTableProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Danh sách cấp độ đại lý</CardTitle>
                <CardDescription>Chi tiết về các cấp độ đại lý và quyền lợi tương ứng</CardDescription>
            </CardHeader>
            <CardContent>
                {agencyLevels.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>Chưa có cấp độ đại lý nào. Hãy thêm cấp độ đại lý mới.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">ID</TableHead>
                                    <TableHead>Tên cấp độ</TableHead>
                                    <TableHead>Chiết khấu</TableHead>
                                    <TableHead>Hạn mức tín dụng</TableHead>
                                    <TableHead>Thời hạn thanh toán</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {agencyLevels.map((level) => (
                                    <TableRow key={level.levelId}>
                                        <TableCell className="font-medium">{level.levelId}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={getLevelColor(level.levelName)}>
                                                {level.levelName}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{level.discountPercentage}%</TableCell>
                                        <TableCell>{formatCurrency(level.creditLimit)}</TableCell>
                                        <TableCell>{level.paymentTerm} ngày</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Mở menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => onViewLevel(level.levelId)}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        <span>Xem chi tiết</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => onEditLevel(level.levelId)}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        <span>Chỉnh sửa</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => onDeleteLevel(level.levelId, level.levelName)}
                                                        className="text-red-600 focus:text-red-600"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        <span>Xóa</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
