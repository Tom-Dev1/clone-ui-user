import { SalesLayout } from "@/layouts/sale-layout";

export default function SalesDashboard() {
    return (
        <SalesLayout>
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Tổng quan</h1>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h3 className="text-gray-700 font-medium mb-2">Đơn hàng</h3>
                        <p className="text-3xl font-bold">12</p>
                        <p className="text-sm text-gray-500 mt-1">Tháng này</p>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h3 className="text-gray-700 font-medium mb-2">Sản phẩm đã mua</h3>
                        <p className="text-3xl font-bold">24</p>
                        <p className="text-sm text-gray-500 mt-1">Tổng số</p>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h3 className="text-gray-700 font-medium mb-2">Đơn hàng đang giao</h3>
                        <p className="text-3xl font-bold">3</p>
                        <p className="text-sm text-gray-500 mt-1">Đang vận chuyển</p>
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Recent Activities */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-medium mb-4">Hoạt động gần đây</h3>
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500 mr-3">
                                    1
                                </div>
                                <div>
                                    <p className="font-medium">Đơn hàng #2023001 đã được giao</p>
                                    <p className="text-sm text-gray-500">3/18/2025</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500 mr-3">
                                    2
                                </div>
                                <div>
                                    <p className="font-medium">Đơn hàng #2023002 đã được giao</p>
                                    <p className="text-sm text-gray-500">3/18/2025</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500 mr-3">
                                    3
                                </div>
                                <div>
                                    <p className="font-medium">Đơn hàng #2023003 đã được giao</p>
                                    <p className="text-sm text-gray-500">3/18/2025</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-medium mb-4">Thông báo</h3>
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500 mr-3">
                                    i
                                </div>
                                <div>
                                    <p className="font-medium">Khuyến mãi mới cho khách hàng thân thiết</p>
                                    <p className="text-sm text-gray-500">3/18/2025</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500 mr-3">
                                    i
                                </div>
                                <div>
                                    <p className="font-medium">Khuyến mãi mới cho khách hàng thân thiết</p>
                                    <p className="text-sm text-gray-500">3/18/2025</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500 mr-3">
                                    i
                                </div>
                                <div>
                                    <p className="font-medium">Khuyến mãi mới cho khách hàng thân thiết</p>
                                    <p className="text-sm text-gray-500">3/18/2025</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Orders Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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
                </div>
            </div>
        </SalesLayout>
    )
}

