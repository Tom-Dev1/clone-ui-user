"use client"

import { useAuth } from "@/contexts/AuthContext"
import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"


export function LoginForm() {
    const baseURL = `https://minhlong.mlhr.org`
    const navigate = useNavigate()
    const { login } = useAuth()
    const [userName, setUserName] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    // Check for remembered username on component mount
    useEffect(() => {
        const rememberedUsername = localStorage.getItem("remembered_username")
        if (rememberedUsername) {
            setUserName(rememberedUsername)
            setRememberMe(true)
        }
    }, [])

    async function onSubmit(event: React.FormEvent) {
        event.preventDefault()
        setError(null)
        setIsLoading(true)

        try {
            // Validate input
            if (!userName.trim()) {
                setError("Vui lòng nhập tên đăng nhập")
                setIsLoading(false)
                return
            }

            if (!password) {
                setError("Vui lòng nhập mật khẩu")
                setIsLoading(false)
                return
            }

            // Prepare login data
            const loginData = {
                userName,
                password,
            }

            console.log("Attempting login with:", { userName })

            // Call login API
            const response = await fetch(`${baseURL}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(loginData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || errorData.message || "Đăng nhập thất bại")
            }

            const data = await response.json()
            console.log(data);

            console.log("Login successful:", data)

            // Handle the response format
            if (data.token) {
                // Store the JWT token and use the AuthContext login
                await login(data.token.token)
                localStorage.setItem("auth_token", data.token.token)
                // Store the role name
                localStorage.setItem("role_name", data.token.roleName)

                // If remember me is checked, store the username
                if (rememberMe) {
                    localStorage.setItem("remembered_username", userName)
                } else {
                    localStorage.removeItem("remembered_username")
                }
            } else {
                setError("Đăng nhập thất bại: Không nhận được token")
            }
        } catch (error) {
            console.error("Login error:", error)

            if (error instanceof Error) {
                setError(error.message || "Đăng nhập thất bại. Vui lòng thử lại.")
            } else {
                setError("Đăng nhập thất bại. Vui lòng thử lại.")
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="grid gap-6">
            <form onSubmit={onSubmit}>
                <div className="grid gap-4">
                    {error && <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">{error}</div>}

                    <div className="grid gap-2">
                        <label htmlFor="userName" className="block text-sm font-medium">
                            Tên đăng nhập
                        </label>
                        <input
                            id="userName"
                            name="userName"
                            placeholder="Tên đăng nhập"
                            type="text"
                            autoCapitalize="none"
                            autoComplete="username"
                            autoCorrect="off"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            disabled={isLoading}
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm font-medium">
                                Mật khẩu
                            </label>
                            <button
                                type="button"
                                className="text-sm font-medium text-blue-600 hover:text-blue-500"
                                onClick={() => navigate("/forgot-password")}
                            >
                                Quên mật khẩu?
                            </button>
                        </div>
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoCapitalize="none"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                required
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                                type="button"
                                className="absolute right-0 top-0 h-full px-3 py-2"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                                        <line x1="2" x2="22" y1="2" y2="22"></line>
                                    </svg>
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                )}
                                <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            id="remember-me"
                            name="remember-me"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="remember-me" className="text-sm font-medium text-gray-700">
                            Ghi nhớ đăng nhập
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus:outline-none disabled:opacity-70"
                    >
                        {isLoading ? "Đang xử lý..." : "Đăng nhập"}
                    </button>
                </div>
            </form>
        </div>
    )
}

