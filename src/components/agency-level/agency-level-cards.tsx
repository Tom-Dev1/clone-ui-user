import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Percent, CreditCard, Clock } from "lucide-react"
import type { AgencyLevel } from "@/types/agency-level"
import { formatCurrency, getLevelColor } from "@/utils/agency-level-utils"

interface AgencyLevelCardsProps {
    agencyLevels: AgencyLevel[]
}

export function AgencyLevelCards({ agencyLevels }: AgencyLevelCardsProps) {
    if (agencyLevels.length === 0) {
        return null
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {agencyLevels.map((level) => (
                <Card key={level.levelId} className="overflow-hidden">
                    <div className={`h-2 ${getLevelColor(level.levelName).split(" ")[0]}`}></div>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>{level.levelName}</span>
                            <Badge variant="outline" className={getLevelColor(level.levelName)}>
                                Cấp {level.levelId}
                            </Badge>
                        </CardTitle>
                        <CardDescription>Chi tiết quyền lợi đại lý</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="p-2 rounded-full bg-green-100 mr-3">
                                        <Percent className="h-4 w-4 text-green-600" />
                                    </div>
                                    <span className="text-sm font-medium">Chiết khấu</span>
                                </div>
                                <span className="font-bold">{level.discountPercentage}%</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="p-2 rounded-full bg-green-100 mr-3">
                                        <CreditCard className="h-4 w-4 text-green-600" />
                                    </div>
                                    <span className="text-sm font-medium">Hạn mức tín dụng</span>
                                </div>
                                <span className="font-bold">{formatCurrency(level.creditLimit)}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="p-2 rounded-full bg-green-100 mr-3">
                                        <Clock className="h-4 w-4 text-green-600" />
                                    </div>
                                    <span className="text-sm font-medium">Thời hạn thanh toán</span>
                                </div>
                                <span className="font-bold">{level.paymentTerm} ngày</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
