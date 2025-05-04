"use client"

import { SalesOrderCount } from "./sales-order-count"
import { SalesRevenue } from "./sales-revenue"

export function SalesMetrics() {
    return (
        <div className="space-y-2">
            <h2 className="text-xl font-semibold">Chỉ số bán hàng</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <SalesOrderCount />

                <SalesRevenue />
            </div>
        </div>
    )
}
