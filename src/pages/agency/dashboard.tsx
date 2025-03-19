import { AgencyLayout } from "@/layouts/agency-layout"

export default function AgencyDashboard() {
    return (
        <AgencyLayout>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Đại lý - Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900">Đơn hàng của bạn</h3>
                        <p className="text-3xl font-bold mt-2">24</p>
                        <div className="flex justify-between mt-4">
                            <div>
                                <p className="text-sm text-gray-500">Đang xử lý</p>
                                <p className="text-lg font-medium">5</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Đã giao</p>
                                <p className="text-lg font-medium">19</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900">Tổng chi tiêu</h3>
                        <p className="text-3xl font-bold mt-2">18.5M ₫</p>
                        <p className="text-sm text-green-600 mt-1">+5% so với tháng trước</p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900">Điểm thưởng</h3>
                        <p className="text-3xl font-bold mt-2">1,250</p>
                        <p className="text-sm text-gray-500 mt-1">Tương đương 250.000 ₫</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Đơn hàng gần đây</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Mã đơn
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ngày đặt
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Trạng thái
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tổng tiền
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    <tr>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">#ORD-2023-0045</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">15/08/2023</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Hoàn thành
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">2.800.000 ₫</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">#ORD-2023-0044</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">10/08/2023</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                Đang giao
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">1.500.000 ₫</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">#ORD-2023-0043</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">05/08/2023</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Hoàn thành
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">3.200.000 ₫</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Sản phẩm đề xuất</h3>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-gray-200 rounded-md mr-4"></div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-medium text-gray-900">Phân bón hữu cơ cao cấp</h4>
                                    <p className="text-sm text-gray-500">Giá đại lý: 180.000 ₫</p>
                                </div>
                                <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">Đặt hàng</button>
                            </div>

                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-gray-200 rounded-md mr-4"></div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-medium text-gray-900">Hạt giống rau sạch</h4>
                                    <p className="text-sm text-gray-500">Giá đại lý: 45.000 ₫</p>
                                </div>
                                <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">Đặt hàng</button>
                            </div>

                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-gray-200 rounded-md mr-4"></div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-medium text-gray-900">Thuốc bảo vệ thực vật</h4>
                                    <p className="text-sm text-gray-500">Giá đại lý: 120.000 ₫</p>
                                </div>
                                <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">Đặt hàng</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AgencyLayout>
    )
}

