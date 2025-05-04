import { get } from "@/api/axiosUtils";
import { OrderStatusCards } from "@/components/sales/dashboard/order-status-cards";
import { SalesMetrics } from "@/components/sales/dashboard/sales-metrics";
import { OrderSummaryCards } from "@/components/sales/order-summary-cards";
import { SalesLayout } from "@/layouts/sale-layout";
import { RequestProduct } from "@/types/sales-orders";
import { getToken } from "@/utils/auth-utils";
import { updateTotals } from "@/utils/order-utils";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SalesDashboard() {
    const navigate = useNavigate()

    const [, setIsLoading] = useState(true)
    const [, setError] = useState<string | null>(null)
    const [totalProducts, setTotalProducts] = useState(0)
    const [totalQuantity, setTotalQuantity] = useState(0)

    const fetchOrders = async () => {
        setIsLoading(true)
        setError(null)

        try {
            // Lấy token từ auth-service
            const token = getToken()

            if (!token) {
                navigate("/login")
                return
            }

            const response = await get<RequestProduct[]>("/request-products")

            if (response.success && Array.isArray(response.result)) {
                // Dữ liệu đã có đầy đủ thông tin từ API
                const ordersWithLoadingState = response.result.map((order) => ({
                    ...order,
                    isLoading: false,
                }))

                // Cập nhật tổng số sản phẩm và số lượng
                const { totalProductCount, totalQuantityCount } = updateTotals(ordersWithLoadingState)
                setTotalProducts(totalProductCount)
                setTotalQuantity(totalQuantityCount)

                // Đánh dấu tất cả đơn hàng đã được tải chi tiết
                const loadedDetails: Record<string, boolean> = {}
                ordersWithLoadingState.forEach((order) => {
                    loadedDetails[order.requestProductId] = true
                })
            } else {
                setError("Không thể tải dữ liệu đơn hàng")
            }
        } catch (err) {
            console.error("Error fetching orders:", err)

            // Kiểm tra lỗi xác thực
            if (err instanceof Error && err.message.includes("401")) {
                navigate("/login")
                return
            }

            setError("Đã xảy ra lỗi khi tải dữ liệu đơn hàng")
        } finally {
            setIsLoading(false)
        }
    }
    useEffect(() => {
        fetchOrders()
    }, [])

    return (
        <SalesLayout>
            <div className="m-4">
                <h1 className="text-2xl font-bold mb-6">Tổng quan</h1>
                <OrderStatusCards />
                {/* Summary Cards */}
                <div className="mt-5">
                    <OrderSummaryCards
                        totalProducts={totalProducts}
                        totalQuantity={totalQuantity}
                    />
                </div>
                <div className="mb-8">
                    <SalesMetrics />
                </div>

                {/* Recent Orders Table */}
                {/* <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <h3 className="text-lg font-medium p-6 pb-0">Đơn hàng gần đây</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Mã đơn hàng
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Ngày đặt
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Trạng thái
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Tổng tiền
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#ORD-2023001</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">3/18/2025</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            Đã giao hàng
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">250.000 đ</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#ORD-2023002</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">3/18/2025</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            Đã giao hàng
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">500.000 đ</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#ORD-2023003</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">3/18/2025</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            Đã giao hàng
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">750.000 đ</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div> */}
            </div>
        </SalesLayout>
    )
}

