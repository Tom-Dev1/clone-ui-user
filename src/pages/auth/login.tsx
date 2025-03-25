import { SiteHeader } from "@/components/site-header";
import { LoginForm } from "./login-formdata";


export function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <SiteHeader />
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">Đăng nhập</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Hoặc{" "}
                        <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                            đăng ký tài khoản mới
                        </a>
                    </p>
                </div>

                <LoginForm />
            </div>
        </div>
    )
}

