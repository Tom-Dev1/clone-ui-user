"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"

interface HoverButtonProps {
    title: string
    href?: string
    active?: boolean
    mobile?: boolean
    onClick?: () => void
}

export default function HoverButton({ title, href, active = false, mobile = false, onClick }: HoverButtonProps) {
    const buttonContent = (
        <>
            <div className="text-base font-semibold text-gray-700  mt-0.5">{title}</div>
            <Plus className="h-4 w-4 ml-1 transition-transform duration-500 ease-in-out group-hover:rotate-180" />
        </>
    )

    const buttonClasses = cn(
        "group transition-all duration-300 ",
        active ? "" : "",
        mobile ? "w-full justify-start text-sm font-medium" : "text-sm font-medium",
    )

    if (href) {
        return (
            <Button variant="ghost" size={mobile ? "default" : "sm"} className={buttonClasses} asChild>
                <Link to={href}>{buttonContent}</Link>
            </Button>
        )
    }

    return (
        <Button variant="ghost" size={mobile ? "default" : "sm"} className={buttonClasses} onClick={onClick}>
            {buttonContent}
        </Button>
    )
}

