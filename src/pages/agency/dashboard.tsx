import { MonthlyRevenue } from "@/components/agency/dashboard/monthly-revenue"
import { TodayRevenue } from "@/components/agency/dashboard/today-revenue"
import { TotalDebt } from "@/components/agency/dashboard/total-debt"
import { TotalRevenue } from "@/components/agency/dashboard/total-revenue"
import { AgencyLayout } from "@/layouts/agency-layout"

export default function AgencyDashboard() {
    return (
        <AgencyLayout>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Đại lý - Dashboard</h1>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <TodayRevenue />
                    <MonthlyRevenue />
                    <TotalRevenue />
                    <TotalDebt />
                </div>


            </div>
        </AgencyLayout>
    )
}

