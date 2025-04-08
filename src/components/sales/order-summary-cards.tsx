import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart } from "lucide-react"
import { formatNumber } from "../../utils/format-utils"

interface OrderSummaryCardsProps {
    ordersCount: number
    totalProducts: number
    totalQuantity: number
}

export const OrderSummaryCards = ({ ordersCount, totalProducts, totalQuantity }: OrderSummaryCardsProps) => {
    return (
        <>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center">
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Tổng đơn hàng
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{formatNumber(ordersCount)}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center">
                            <Package className="h-4 w-4 mr-2" />
                            Tổng loại sản phẩm
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{formatNumber(totalProducts)}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center">
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Tổng số lượng
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{formatNumber(totalQuantity)}</p>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}

