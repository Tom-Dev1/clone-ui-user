import OrderDashboard from "@/components/agency/dashboard/order-chart"

import { AgencyLayout } from "@/layouts/agency-layout"

export default function AgencyDashboard() {
    return (
        <AgencyLayout>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Đại lý - Dashboard</h1>

                {/* Charts */}
                <OrderDashboard />

            </div>
        </AgencyLayout>
    )
}

