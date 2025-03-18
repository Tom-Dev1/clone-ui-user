import { Navigate, Outlet } from "react-router-dom"
import { hasPermission } from "@/utils/auth-utils"

interface RoleGuardProps {
    allowedRoles: string[]
    redirectPath?: string
}

export const RoleGuard = ({ allowedRoles, redirectPath = "/unauthorized" }: RoleGuardProps) => {
    const hasAccess = hasPermission(allowedRoles)

    if (!hasAccess) {
        return <Navigate to={redirectPath} replace />
    }

    return <Outlet />
}

