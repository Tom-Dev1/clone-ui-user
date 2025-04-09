import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Diamond, Percent, CreditCard, Clock } from "lucide-react"
import type { AgencyLevel } from "@/types/agency-level"
import { formatCurrency } from "@/utils/agency-level-utils"

interface AgencyLevelStatsProps {
    agencyLevels: AgencyLevel[]
}

export function AgencyLevelStats({ agencyLevels }: AgencyLevelStatsProps) {
    // Calculate max values
    const maxDiscount = agencyLevels.length > 0 ? Math.max(...agencyLevels.map((level) => level.discountPercentage)) : 0
    const maxCreditLimit = agencyLevels.length > 0 ? Math.max(...agencyLevels.map((level) => level.creditLimit)) : 0
    const maxPaymentTerm = agencyLevels.length > 0 ? Math.max(...agencyLevels.map((level) => level.paymentTerm)) : 0

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                        <Diamond className="h-4 w-4 mr-2" />
                        Tổng số cấp độ
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{agencyLevels.length}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                        <Percent className="h-4 w-4 mr-2" />
                        Chiết khấu cao nhất
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{maxDiscount}%</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Hạn mức cao nhất
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{formatCurrency(maxCreditLimit)}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Thời hạn thanh toán tối đa
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{maxPaymentTerm} ngày</p>
                </CardContent>
            </Card>
        </div>
    )
}
