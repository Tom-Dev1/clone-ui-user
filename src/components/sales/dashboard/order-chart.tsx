import { TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState } from "react";

interface OrderChartProps {
    data: {
        date: string;
        count: number;
    }[];
    isLoading?: boolean;
    error?: string | null;
}

export function OrderChart({ data, isLoading, error }: OrderChartProps) {
    const [selectedYear, setSelectedYear] = useState('2024');

    const getDisplayData = () => {
        if (selectedYear === '2024') {
            // Create array of all months for 2024
            const months = Array.from({ length: 12 }, (_, i) => {
                const month = i + 1;
                const date = new Date(2024, month - 1, 1);
                return {
                    date: date.toLocaleDateString('vi-VN', { month: 'short' }),
                    count: 0
                };
            });

            // Filter data for 2024 and sum by month
            const yearData = data.filter(item => {
                const [, , year] = item.date.split('/');
                return year === '2024';
            });

            // Sum data by month
            yearData.forEach(item => {
                const [, month] = item.date.split('/');
                const monthIndex = parseInt(month) - 1;
                months[monthIndex].count += item.count;
            });

            return months;
        } else {
            // For 2025, show daily data
            return data
                .filter(item => {
                    const [, , year] = item.date.split('/');
                    return year === '2025';
                })
                .map(item => ({
                    date: new Date(item.date.split('/').reverse().join('-')).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
                    count: item.count
                }));
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">Xu hướng đơn hàng</h3>
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
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
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={getDisplayData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(value) => value}
                        />
                        <YAxis tickFormatter={(value) => value.toLocaleString('vi-VN')} />
                        <Tooltip
                            formatter={(value) => [`${value} đơn`, 'Số lượng']}
                            labelFormatter={(label) => {
                                if (selectedYear === '2024') {
                                    return `${label} năm 2024`;
                                }
                                return `Ngày: ${label}`;
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="count"
                            stroke="#3B82F6"
                            fill="#3B82F6"
                            fillOpacity={0.1}
                            strokeWidth={2}
                            name="Số lượng đơn hàng"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            )}
        </div>
    );
} 