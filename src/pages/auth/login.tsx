
import { useAuth } from "@/hooks/use-auth"
import type React from "react"

import { useState } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"

interface LocationState {
    from?: string
}

export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const { login } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const state = location.state as LocationState
    const from = state?.from || "/dashboard"

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            await login(email, password)
            navigate(from, { replace: true })
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : String(err))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">Đăng nhập vào tài khoản</h2>
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                        Hoặc{" "}
                        <Link to="/register" className="font-medium text-primary hover:text-primary/90">
                            đăng ký tài khoản mới
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">{error}</div>}

                    <div className="space-y-4 rounded-md">
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
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-input px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                placeholder="Mật khẩu"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-muted-foreground">
                                Ghi nhớ đăng nhập
                            </label>
                        </div>

                        <div className="text-sm">
                            <Link to="/forgot-password" className="font-medium text-primary hover:text-primary/90">
                                Quên mật khẩu?
                            </Link>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus:outline-none disabled:opacity-70"
                        >
                            {isLoading ? "Đang xử lý..." : "Đăng nhập"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

