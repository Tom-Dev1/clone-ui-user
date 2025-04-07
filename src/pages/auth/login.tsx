import { SiteHeader } from "@/components/site-header";
import { LoginForm } from "./login-formdata";


export function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-100 to-white">
            <div
                className="fixed inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center bg-no-repeat bg-fixed"
                style={{
                    backgroundImage:
                        "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2532&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
                    opacity: 0.5,
                }}
            ></div>
            <SiteHeader />
            <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 z-10">
                <div className="w-full max-w-md">
                    <LoginForm />
                </div>

                <div className="mt-8 text-center text-sm text-gray-500 z-10">
                    <p>© 2025 CapstoneSupply. Tất cả các quyền được bảo lưu.</p>
                </div>
            </div>
        </div>
    )
}
