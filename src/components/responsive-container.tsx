import { cn } from "@/utils/utils"
import type { ReactNode } from "react"

interface ResponsiveContainerProps {
    children: ReactNode
    className?: string
    fullWidth?: boolean
    maxWidth?: "default" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full"
}

export function ResponsiveContainer({
    children,
    className,
    fullWidth = false,
    maxWidth = "default",
}: ResponsiveContainerProps) {
    const maxWidthClasses = {
        default: "max-w-7xl",
        sm: "max-w-screen-sm",
        md: "max-w-screen-md",
        lg: "max-w-screen-lg",
        xl: "max-w-screen-xl",
        "2xl": "max-w-screen-2xl",
        "3xl": "max-w-[1920px]",
        "4xl": "max-w-[2560px]",
        full: "max-w-full",
    }

    return (
        <div className={cn("mx-auto px-3 sm:px-3 lg:px-3", !fullWidth && maxWidthClasses[maxWidth], className)}>
            {children}
        </div>
    )
}

