import { get } from "@/api/axiosUtils";
import { OrderStatusCards } from "@/components/sales/dashboard/order-status-cards";
// import { OrderSummaryCards } from "@/components/sales/order-summary-cards";
import { SalesLayout } from "@/layouts/sale-layout";
import { getToken } from "@/utils/auth-utils";
// import { updateTotals } from "@/utils/order-utils";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface ExportRequest {
    requestDate: string;
    finalPrice: number;
    status: string;
}

interface GroupedData {
    requestDate: string;
    finalPrice: number;
}

interface StatusData {
    status: string;
    count: number;
    originalStatus: string;
}

export default function SalesDashboard() {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [groupedData, setGroupedData] = useState<GroupedData[]>([])
    const [selectedYear, setSelectedYear] = useState('2025')
    const [statusData, setStatusData] = useState<StatusData[]>([])

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        })
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "Requested":
                return "Chờ duyệt"
            case "Approved":
                return "Đã duyệt"
            case "Processing":
                return "Chờ xử lý"
            case "Partially_Exported":
                return "Trả một phần"
            case "Canceled":
                return "Đã hủy"
            default:
                return status
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Requested":
                return "#fef3c7" // yellow-50
            case "Approved":
                return "#dcfce7" // green-50
            case "Processing":
                return "#dbeafe" // blue-50
            case "Partially_Exported":
                return "#fee2e2" // red-50
            case "Canceled":
                return "#fee2e2" // red-50
            default:
                return "#8884d8"
        }
    }

    const getStatusBorderColor = (status: string) => {
        switch (status) {
            case "Requested":
                return "#fde68a" // yellow-200
            case "Approved":
                return "#86efac" // green-200
            case "Processing":
                return "#93c5fd" // blue-200
            case "Partially_Exported":
                return "#fca5a5" // red-200
            case "Canceled":
                return "#fca5a5" // red-200
            default:
                return "#8884d8"
        }
    }

    const fetchExportData = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const token = getToken()

            if (!token) {
                navigate("/login")
                return
            }

            const response = await get<ExportRequest[]>("/RequestExport/manage-by-sales")

            if (response.success && Array.isArray(response.result)) {
                // Format data for chart
                const formattedData = response.result.map(item => ({
                    ...item,
                    requestDate: formatDate(item.requestDate)
                }))

                // Group data by date and sum finalPrice
                const grouped = formattedData.reduce((acc: { [key: string]: number }, curr) => {
                    const date = curr.requestDate
                    acc[date] = (acc[date] || 0) + curr.finalPrice
                    return acc
                }, {})

                // Convert grouped data to array format
                const groupedArray = Object.entries(grouped).map(([requestDate, finalPrice]) => ({
                    requestDate,
                    finalPrice
                }))

                // Sort by date
                groupedArray.sort((a, b) => {
                    const dateA = new Date(a.requestDate.split('/').reverse().join('-'))
                    const dateB = new Date(b.requestDate.split('/').reverse().join('-'))
                    return dateA.getTime() - dateB.getTime()
                })

                setGroupedData(groupedArray)

                // Process status data
                const statusCount = formattedData.reduce((acc: { [key: string]: number }, curr) => {
                    acc[curr.status] = (acc[curr.status] || 0) + 1
                    return acc
                }, {})

                // Ensure all statuses are included with count 0 if no data
                const allStatuses = ["Requested", "Approved", "Processing", "Partially_Exported", "Canceled"]
                const statusArray = allStatuses.map(status => ({
                    status: getStatusLabel(status),
                    count: statusCount[status] || 0,
                    originalStatus: status
                }))

                setStatusData(statusArray)
            } else {
                setError("Không thể tải dữ liệu xuất hàng")
            }
        } catch (err) {
            console.error("Error fetching export data:", err)
            if (err instanceof Error && err.message.includes("401")) {
                navigate("/login")
                return
            }
            setError("Đã xảy ra lỗi khi tải dữ liệu xuất hàng")
        } finally {
            setIsLoading(false)
        }
    }

    // Filter and transform data based on selected year
    const getDisplayData = () => {
        if (selectedYear === '2024') {
            // Create array of all months for 2024
            const months = Array.from({ length: 12 }, (_, i) => {
                const month = i + 1
                return {
                    requestDate: `Tháng ${month}`,
                    finalPrice: 0
                }
            })

            // Filter data for 2024 and sum by month
            const yearData = groupedData.filter(item => {
                const [, , year] = item.requestDate.split('/')
                return year === '2024'
            })

            // Sum data by month
            yearData.forEach(item => {
                const [, month] = item.requestDate.split('/')
                const monthIndex = parseInt(month) - 1
                months[monthIndex].finalPrice += item.finalPrice
            })

            return months
        } else {
            // For 2025, show daily data
            return groupedData.filter(item => {
                const [, , year] = item.requestDate.split('/')
                return year === '2025'
            })
        }
    }

    useEffect(() => {
        fetchExportData()
    }, [])

    return (
        <SalesLayout>
            <div className="m-4">
                <h1 className="text-2xl font-bold mb-6">Tổng quan</h1>
                <OrderStatusCards />

                {/* Export Data Chart */}
                <div className="mt-8 bg-white p-6 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Biểu đồ xuất hàng</h2>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                        </select>
                    </div>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        </div>
                    ) : error ? (
                        <div className="text-red-500 text-center">{error}</div>
                    ) : (
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={getDisplayData()}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="requestDate"
                                        tickFormatter={(value) => value}
                                    />
                                    <YAxis
                                        tickFormatter={(value) => `${(value / 1000).toLocaleString('vi-VN')}K`}
                                    />
                                    <Tooltip
                                        formatter={(value) => [`${Number(value).toLocaleString('vi-VN')} VNĐ`, 'Tổng giá trị xuất hàng']}
                                        labelFormatter={(label) => {
                                            if (selectedYear === '2024') {
                                                return `${label} năm 2024`
                                            }
                                            const [day, month, year] = label.split('/')
                                            return `${day}/${month}/${year}`
                                        }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="finalPrice"
                                        stroke="#8884d8"
                                        name="Tổng giá trị xuất hàng"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Status Chart */}
                <div className="mt-8 bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Thống kê trạng thái đơn hàng</h2>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        </div>
                    ) : error ? (
                        <div className="text-red-500 text-center">{error}</div>
                    ) : (
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={statusData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="status"
                                        tickFormatter={(value) => value}
                                    />
                                    <YAxis
                                        tickFormatter={(value) => value.toLocaleString('vi-VN')}
                                    />
                                    <Tooltip
                                        formatter={(value) => [`${value} đơn`, 'Số lượng']}
                                    />
                                    <Legend />
                                    <Bar
                                        dataKey="count"
                                        name="Số lượng đơn hàng"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={getStatusColor(entry.originalStatus)}
                                                stroke={getStatusBorderColor(entry.originalStatus)}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>
        </SalesLayout>
    )
}

