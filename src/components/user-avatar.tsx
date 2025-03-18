import { cn } from "@/lib/utils"
import { getUserDisplayName } from "@/utils/auth-utils"
import { User } from "lucide-react"


interface UserAvatarProps {
    size?: "sm" | "md" | "lg"
    showInitial?: boolean
    className?: string
}

export function UserAvatar({ size = "md", showInitial = true, className }: UserAvatarProps) {
    // Get user's initial from the auth utils
    const displayName = getUserDisplayName()
    const initial = displayName.charAt(0).toUpperCase()

    const sizeClasses = {
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
    }

    return (
        <div
            className={cn(
                "rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold",
                sizeClasses[size],
                className,
            )}
            title={displayName}
        >
            {showInitial ? initial : <User className="h-4 w-4" />}
        </div>
    )
}

