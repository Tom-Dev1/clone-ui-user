import { Loader2 } from "lucide-react"

interface LoadingStateProps {
    message?: string
}

export const LoadingState = ({ message = "Đang tải dữ liệu..." }: LoadingStateProps) => {
    return (
        <div className="text-center py-8 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <p>{message}</p>
        </div>
    )
}

