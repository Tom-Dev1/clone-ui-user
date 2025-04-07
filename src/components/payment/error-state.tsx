interface ErrorStateProps {
    message: string
}

export const ErrorState = ({ message }: ErrorStateProps) => {
    return <div className="flex justify-center items-center h-screen text-red-500">{message}</div>
}
