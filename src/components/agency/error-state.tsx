"use client"

import { Button } from "@/components/ui/button"

interface ErrorStateProps {
    message: string
    onRetry: () => void
}

export const ErrorState = ({ message, onRetry }: ErrorStateProps) => {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <p className="text-red-500 mb-4">{message}</p>
            <Button onClick={onRetry}>Thử lại</Button>
        </div>
    )
}

