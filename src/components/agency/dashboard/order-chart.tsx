"use client"

import { useState, useMemo, useEffect } from 'react';
import { Search, DollarSign, Package, TrendingUp, BarChart3 } from 'lucide-react';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Order, STATUS_AGENCY_ORDER } from '@/types/agency-orders';
import { TodayRevenue } from './today-revenue';
import { MonthlyRevenue } from './monthly-revenue';
import { TotalRevenue } from './total-revenue';
import { TotalDebt } from './total-debt';

// Define status labels and colors
const statusLabels: Record<STATUS_AGENCY_ORDER, string> = {
    'WaitPaid': 'Chờ thanh toán',
    'Paid': 'Đã thanh toán',
    'WaitingDelivery': 'Chờ xuất kho',
    'Exported': 'Đã xuất kho',
    'Canceled': 'Từ chối'
};

const statusColors: Record<STATUS_AGENCY_ORDER, string> = {
    'WaitPaid': 'bg-gray-100 text-gray-800',
    'Paid': 'bg-green-100 text-green-800',
    'WaitingDelivery': 'bg-blue-100 text-blue-800',
    'Exported': 'bg-yellow-100 text-yellow-800',
    'Canceled': 'bg-red-100 text-red-800'
};

const getStatusColor = (status: STATUS_AGENCY_ORDER): string => {
    switch (status) {
        case 'WaitPaid': return '#9CA3AF';
        case 'Paid': return '#34D399';
        case 'WaitingDelivery': return '#60A5FA';
        case 'Exported': return '#FCD34D';
        case 'Canceled': return '#F87171';
        default: return '#9CA3AF';
    }
};

export default function OrderDashboard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<STATUS_AGENCY_ORDER | 'All'>('All');
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const token = localStorage.getItem("auth_token") || "";
    const [loading, setLoading] = useState(false);
    const [selectedYear, setSelectedYear] = useState<number>(2024);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await fetch("https://minhlong.mlhr.org/api/orders/my-orders", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();
            setOrders(data);
        } catch (err) {
            console.error("Failed to fetch orders:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchOrders();
        }
    }, [token]);

    // Statistics calculations
    const stats = useMemo(() => {
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, order) => sum + order.finalPrice, 0);
        const totalDiscount = orders.reduce((sum, order) => sum + (order.totalPrice - order.finalPrice), 0);
        const statusCounts = orders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {} as Record<STATUS_AGENCY_ORDER, number>);

        return {
            totalOrders,
            totalRevenue,
            totalDiscount,
            statusCounts
        };
    }, [orders]);

    // Chart data preparation
    const chartData = useMemo(() => {
        // Generate all months for the selected year
        const generateMonthlyData = () => {
            // Define the structure of a monthly data point
            interface MonthlyDataPoint {
                date: string;
                monthNumber: number;
                revenue: number;
                orders: number;
                discount: number;
            }

            const months: MonthlyDataPoint[] = [];
            for (let i = 0; i < 12; i++) {
                const month = i + 1; // month is 1-indexed
                const date = new Date(selectedYear, i, 1); // Use 0-indexed month for Date constructor
                months.push({
                    date: date.toISOString().split('T')[0],
                    monthNumber: month,
                    revenue: 0,
                    orders: 0,
                    discount: 0
                });
            }

            // Add actual data if available
            orders.forEach(order => {
                const orderDate = new Date(order.orderDate);
                if (orderDate.getFullYear() === selectedYear) {
                    const monthIndex = orderDate.getMonth();
                    // Ensure monthIndex is within bounds (0-11)
                    if (monthIndex >= 0 && monthIndex < 12) {
                        months[monthIndex].revenue += order.finalPrice;
                        months[monthIndex].orders += 1;
                        months[monthIndex].discount += (order.totalPrice - order.finalPrice);
                    }
                }
            });

            return months;
        };

        // Process daily data for 2025
        const processDailyData = () => {
            const dailyRevenue = orders.reduce((acc, order) => {
                const orderDate = new Date(order.orderDate);
                if (orderDate.getFullYear() === 2025) {
                    const dateKey = orderDate.toISOString().split('T')[0];
                    if (!acc[dateKey]) {
                        acc[dateKey] = {
                            date: dateKey,
                            revenue: 0,
                            orders: 0,
                            discount: 0
                        };
                    }
                    acc[dateKey].revenue += order.finalPrice;
                    acc[dateKey].orders += 1;
                    acc[dateKey].discount += (order.totalPrice - order.finalPrice);
                }
                return acc;
            }, {} as Record<string, { date: string; revenue: number; orders: number; discount: number }>);

            // Convert to array and sort by date
            return Object.values(dailyRevenue)
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        };

        const revenueData = selectedYear === 2024 ? generateMonthlyData() : processDailyData();

        // Sort monthly data for 2024 to ensure correct order
        if (selectedYear === 2024) {
            revenueData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        }

        // Status pie chart data
        const statusData = Object.entries(stats.statusCounts).map(([status, count]) => ({
            name: statusLabels[status as STATUS_AGENCY_ORDER],
            value: count,
            color: getStatusColor(status as STATUS_AGENCY_ORDER)
        }));

        // Agency performance data
        const agencyPerformance = orders.reduce((acc, order) => {
            if (!acc[order.agencyName]) {
                acc[order.agencyName] = { name: order.agencyName, revenue: 0, orders: 0 };
            }
            acc[order.agencyName].revenue += order.finalPrice;
            acc[order.agencyName].orders += 1;
            return acc;
        }, {} as Record<string, { name: string; revenue: number; orders: number }>);

        const agencyData = Object.values(agencyPerformance).sort((a, b) => b.revenue - a.revenue);

        // Sales performance data
        const salesPerformance = orders.reduce((acc, order) => {
            if (!acc[order.salesName]) {
                acc[order.salesName] = { name: order.salesName, revenue: 0, orders: 0 };
            }
            acc[order.salesName].revenue += order.finalPrice;
            acc[order.salesName].orders += 1;
            return acc;
        }, {} as Record<string, { name: string; revenue: number; orders: number }>);

        const salesData = Object.values(salesPerformance).sort((a, b) => b.revenue - a.revenue);

        return {
            revenueData,
            statusData,
            agencyData,
            salesData
        };
    }, [orders, stats.statusCounts, selectedYear]);

    // Filtered orders
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchesSearch =
                (order.orderCode?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (order.agencyName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (order.salesName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (order.requestCode?.toLowerCase() || '').includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'All' || order.status === statusFilter;

            const matchesDate = (!dateRange.from || order.orderDate >= dateRange.from) &&
                (!dateRange.to || order.orderDate <= dateRange.to);

            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [orders, searchTerm, statusFilter, dateRange]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center py-12">
                        <Package className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Đang tải dữ liệu...</h3>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="">
            <div className=" mx-auto">

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <TodayRevenue />
                    <MonthlyRevenue />
                    <TotalRevenue />
                    <TotalDebt />
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                            </div>
                            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Package className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </div>


                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Tổng giảm giá</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalDiscount)}</p>
                            </div>
                            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                                <DollarSign className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                    </div>


                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Revenue Trend Chart */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Xu hướng doanh thu</h3>
                            <div className="flex items-center gap-2">
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                                    className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                                >
                                    <option value={2024}>2024</option>
                                    <option value={2025}>2025</option>
                                </select>
                                <TrendingUp className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={chartData.revenueData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey={selectedYear === 2024 ? 'monthNumber' : 'date'}
                                    tickFormatter={(value) => {
                                        if (selectedYear === 2024) {
                                            return `T${value}`; // Value is now the month number (1-12)
                                        }
                                        const date = new Date(value);
                                        return `${date.getDate()}/${date.getMonth() + 1}`;
                                    }}
                                />
                                <YAxis
                                    yAxisId="left"
                                    tickFormatter={(value) => {
                                        if (value >= 1000000) {
                                            return `${(value / 1000000).toFixed(1)}Triệu`;
                                        }
                                        return `${(value / 1000).toFixed(0)}K`;
                                    }}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tickFormatter={(value) => `${value}`}
                                />
                                <Tooltip
                                    formatter={(value: number, name: string) => [
                                        name === 'revenue' ? formatCurrency(value) : formatCurrency(value),
                                        name === 'revenue' ? 'Doanh thu' : 'Doanh thu'
                                    ]}
                                    labelFormatter={(value) => {
                                        const date = new Date(value);
                                        if (selectedYear === 2024) {
                                            return `Tháng: ${date.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}`;
                                        }
                                        return `Ngày: ${date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}`;
                                    }}
                                />
                                <Legend />
                                <Area
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#3B82F6"
                                    fill="#3B82F6"
                                    fillOpacity={0.1}
                                    strokeWidth={2}
                                    name="Doanh thu"
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="orders"
                                    stroke="#10B981"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    name="Số đơn"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Status Distribution Pie Chart */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Phân bố trạng thái</h3>
                            <BarChart3 className="h-5 w-5 text-green-600" />
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={chartData.statusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {chartData.statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [value, 'Số đơn']} />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Status Summary */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm font-medium text-gray-700 mb-2">Tổng số đơn: <span className="font-semibold text-gray-900">{stats.totalOrders}</span></p>
                            <ul className="list-disc list-inside text-sm text-gray-600">
                                {Object.entries(stats.statusCounts).map(([status, count]) => (
                                    <li key={status} className="flex items-center">
                                        <span className={`inline-block w-3 h-3 rounded-full mr-2 ${statusColors[status as STATUS_AGENCY_ORDER]}`}></span>
                                        <span>{statusLabels[status as STATUS_AGENCY_ORDER]}: </span><span className="font-semibold"> {count}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                    </div>
                </div>



                {/* Daily Orders and Revenue Comparison
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">So sánh đơn hàng và doanh thu theo ngày</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={chartData.revenueData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(value) => new Date(value).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })}
                            />
                            <YAxis yAxisId="left" orientation="left" tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip
                                formatter={(value: number, name: string) => {
                                    if (name === 'revenue') return [formatCurrency(value), 'Doanh thu'];
                                    if (name === 'discount') return [formatCurrency(value), 'Giảm giá'];
                                    return [value, 'Số đơn'];
                                }}
                                labelFormatter={(value) => `Ngày: ${formatDate(value)}`}
                            />
                            <Legend />
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="revenue"
                                stroke="#3B82F6"
                                strokeWidth={3}
                                name="Doanh thu"
                                dot={{ r: 4 }}
                            />
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="discount"
                                stroke="#EF4444"
                                strokeWidth={2}
                                name="Giảm giá"
                                strokeDasharray="5 5"
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="orders"
                                stroke="#10B981"
                                strokeWidth={2}
                                name="Số đơn hàng"
                                dot={{ r: 3 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div> */}

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm đơn hàng..."
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                            <select
                                className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as STATUS_AGENCY_ORDER | 'All')}
                            >
                                <option value="All">Tất cả trạng thái</option>
                                {Object.entries(statusLabels).map(([status, label]) => (
                                    <option key={status} value={status}>{label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
                            <input
                                type="date"
                                className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={dateRange.from}
                                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                            />

                        </div>

                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
                            <input
                                type="date"
                                className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={dateRange.to}
                                min={dateRange.from || undefined}
                                onChange={(e) => {
                                    const selectedDate = e.target.value;
                                    if (!dateRange.from || selectedDate >= dateRange.from) {
                                        setDateRange(prev => ({ ...prev, to: selectedDate }));
                                    }
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                        <p className="text-sm text-gray-600">
                            Hiển thị {filteredOrders.length} trong tổng số {orders.length} đơn hàng
                        </p>

                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Mã đơn hàng
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ngày đặt
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Đại lý
                                    </th>

                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tổng tiền
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Giảm giá
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thành tiền
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Trạng thái
                                    </th>

                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredOrders.map((order) => (
                                    <tr key={order.orderId} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{order.orderCode}</div>
                                                <div className="text-sm text-gray-500">{order.requestCode}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatDate(order.orderDate)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {order.agencyName}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatCurrency(order.totalPrice)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                                            -{order.discount}%
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {formatCurrency(order.finalPrice)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap flex justify-center">
                                            <h1 className={` w-28 px-2 py-2 text-xs font-semibold rounded-full ${statusColors[order.status]} text-center`}>
                                                {statusLabels[order.status]}
                                            </h1>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {filteredOrders.length === 0 && (
                    <div className="text-center py-12">
                        <Package className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Không có đơn hàng</h3>
                        <p className="mt-1 text-sm text-gray-500">Không tìm thấy đơn hàng nào phù hợp với bộ lọc hiện tại.</p>
                    </div>
                )}
            </div>
        </div>
    );
}