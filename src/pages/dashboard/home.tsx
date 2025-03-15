export default function DashboardHome() {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Tổng quan</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-muted p-6 rounded-lg">
                    <h3 className="font-medium text-lg mb-2">Đơn hàng</h3>
                    <p className="text-3xl font-bold">12</p>
                    <p className="text-sm text-muted-foreground mt-1">Tháng này</p>
                </div>

                <div className="bg-muted p-6 rounded-lg">
                    <h3 className="font-medium text-lg mb-2">Sản phẩm đã mua</h3>
                    <p className="text-3xl font-bold">24</p>
                    <p className="text-sm text-muted-foreground mt-1">Tổng số</p>
                </div>

                <div className="bg-muted p-6 rounded-lg">
                    <h3 className="font-medium text-lg mb-2">Đơn hàng đang giao</h3>
                    <p className="text-3xl font-bold">3</p>
                    <p className="text-sm text-muted-foreground mt-1">Đang vận chuyển</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg border">
                    <h3 className="font-medium text-lg mb-4">Hoạt động gần đây</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-medium text-primary">{item}</span>
                                </div>
                                <div>
                                    <p className="font-medium">Đơn hàng #{2023000 + item} đã được giao</p>
                                    <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border">
                    <h3 className="font-medium text-lg mb-4">Thông báo</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-medium text-primary">!</span>
                                </div>
                                <div>
                                    <p className="font-medium">Khuyến mãi mới cho khách hàng thân thiết</p>
                                    <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <h3 className="text-xl font-bold mb-4">Đơn hàng gần đây</h3>
            <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted">
                        <tr>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                            >
                                Mã đơn hàng
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                            >
                                Ngày đặt
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                            >
                                Trạng thái
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                            >
                                Tổng tiền
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-border">
                        {[1, 2, 3].map((order) => (
                            <tr key={order}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">#ORD-{2023000 + order}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                    {new Date().toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        Đã giao hàng
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                    {(order * 250000).toLocaleString()} ₫
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

