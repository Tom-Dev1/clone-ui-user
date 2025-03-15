export default function Orders() {
    // Sample order data
    const orders = [
        {
            id: "ORD-2023001",
            date: "15/03/2023",
            status: "Đã giao hàng",
            statusColor: "green",
            total: 250000,
            items: [
                { name: "Thuốc trừ sâu A", quantity: 2, price: 75000 },
                { name: "Phân bón B", quantity: 1, price: 100000 },
            ],
        },
        {
            id: "ORD-2023002",
            date: "20/04/2023",
            status: "Đang giao hàng",
            statusColor: "blue",
            total: 500000,
            items: [
                { name: "Thuốc trừ cỏ C", quantity: 3, price: 80000 },
                { name: "Thuốc dưỡng D", quantity: 2, price: 130000 },
            ],
        },
        {
            id: "ORD-2023003",
            date: "05/05/2023",
            status: "Đã hủy",
            statusColor: "red",
            total: 180000,
            items: [{ name: "Thuốc trừ ốc E", quantity: 1, price: 180000 }],
        },
    ]

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Đơn hàng của tôi</h2>

            <div className="space-y-6">
                {orders.map((order) => (
                    <div key={order.id} className="bg-white p-6 rounded-lg border">
                        <div className="flex flex-col md:flex-row justify-between mb-4 pb-4 border-b">
                            <div>
                                <h3 className="font-medium">Mã đơn hàng: {order.id}</h3>
                                <p className="text-sm text-muted-foreground">Ngày đặt: {order.date}</p>
                            </div>
                            <div className="mt-2 md:mt-0">
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${order.statusColor === "green"
                                            ? "bg-green-100 text-green-800"
                                            : order.statusColor === "blue"
                                                ? "bg-blue-100 text-blue-800"
                                                : "bg-red-100 text-red-800"
                                        }`}
                                >
                                    {order.status}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3 mb-4">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between items-center">
                                    <div className="flex items-start gap-3">
                                        <div className="w-12 h-12 bg-muted rounded flex-shrink-0"></div>
                                        <div>
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-sm text-muted-foreground">Số lượng: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <p className="font-medium">{item.price.toLocaleString()} ₫</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t">
                            <p className="font-medium">Tổng tiền:</p>
                            <p className="text-lg font-bold text-primary">{order.total.toLocaleString()} ₫</p>
                        </div>

                        <div className="mt-4 flex justify-end space-x-2">
                            <button className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted">Chi tiết</button>
                            {order.status !== "Đã hủy" && order.status !== "Đã giao hàng" && (
                                <button className="px-4 py-2 border border-red-300 text-red-600 rounded-md text-sm font-medium hover:bg-red-50">
                                    Hủy đơn
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

