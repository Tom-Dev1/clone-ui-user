
import type React from "react"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "@/hooks/use-auth"

export default function Register() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const { register } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        // Validate form
        if (password !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp")
            return
        }

        if (password.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự")
            return
        }

        setIsLoading(true)

        try {
            await register(name, email, password)
            navigate("/dashboard", { replace: true })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">Đăng ký tài khoản</h2>
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                        Hoặc{" "}
                        <Link to="/login" className="font-medium text-primary hover:text-primary/90">
                            đăng nhập nếu đã có tài khoản
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">{error}</div>}

                    <div className="space-y-4 rounded-md">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium">
                                Họ và tên
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-input px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                placeholder="Họ và tên"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-input px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                placeholder="Email"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium">
                                Mật khẩu
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-input px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                placeholder="Mật khẩu"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium">
                                Xác nhận mật khẩu
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-input px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                placeholder="Xác nhận mật khẩu"
                            />
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            id="terms"
                            name="terms"
                            type="checkbox"
                            required
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="terms" className="ml-2 block text-sm text-muted-foreground">
                            Tôi đồng ý với{" "}
                            <a href="#" className="text-primary hover:underline">
                                Điều khoản dịch vụ
                            </a>{" "}
                            và{" "}
                            <a href="#" className="text-primary hover:underline">
                                Chính sách bảo mật
                            </a>
                        </label>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus:outline-none disabled:opacity-70"
                        >
                            {isLoading ? "Đang xử lý..." : "Đăng ký"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

