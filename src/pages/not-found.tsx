import { Link } from "react-router-dom"

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted">
            <div className="text-center">
                <h1 className="text-9xl font-bold text-primary">404</h1>
                <h2 className="mt-4 text-3xl font-bold tracking-tight">Không tìm thấy trang</h2>
                <p className="mt-2 text-lg text-muted-foreground">
                    Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
                </p>
                <div className="mt-6">
                    <Link
                        to="/"
                        className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        Quay lại trang chủ
                    </Link>
                </div>
            </div>
        </div>
    )
}
