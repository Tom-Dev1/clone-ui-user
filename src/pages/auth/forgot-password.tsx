
import type React from "react"

import { useState } from "react"
import { Link } from "react-router-dom"

export default function ForgotPassword() {
    const [email, setEmail] = useState("")
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            // In a real app, you would call your API to send a password reset email
            // This is just a mock implementation
            await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
            setIsSubmitted(true)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">Quên mật khẩu</h2>
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                        Nhập email của bạn và chúng tôi sẽ gửi cho bạn liên kết để đặt lại mật khẩu
                    </p>
                </div>

                {isSubmitted ? (
                    <div className="rounded-md bg-green-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-green-800">Email đã được gửi</h3>
                                <div className="mt-2 text-sm text-green-700">
                                    <p>
                                        Chúng tôi đã gửi email hướng dẫn đặt lại mật khẩu đến {email}. Vui lòng kiểm tra hộp thư của bạn.
                                    </p>
                                </div>
                                <div className="mt-4">
                                    <Link to="/login" className="text-sm font-medium text-primary hover:text-primary/90">
                                        Quay lại trang đăng nhập
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">{error}</div>}

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
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus:outline-none disabled:opacity-70"
                            >
                                {isLoading ? "Đang xử lý..." : "Gửi liên kết đặt lại mật khẩu"}
                            </button>
                        </div>

                        <div className="flex items-center justify-center">
                            <Link to="/login" className="text-sm font-medium text-primary hover:text-primary/90">
                                Quay lại trang đăng nhập
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}

