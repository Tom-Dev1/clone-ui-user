import { cn } from "@/utils/utils"
import type { ReactNode } from "react"

interface PageHeaderProps {
    title: string
    description?: string
    children?: ReactNode
    className?: string
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
    return (
        <div className={cn("mb-8", className)}>
            <h1 className="text-3xl font-bold">{title}</h1>
            {description && <p className="text-muted-foreground mt-2">{description}</p>}
            {children}
        </div>
    )
}

