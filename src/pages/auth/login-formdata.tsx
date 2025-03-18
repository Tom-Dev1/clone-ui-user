"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios, { type AxiosError } from "axios"
import { type TokenResponse, UserRole } from "@/types/auth-type"
import { decodeToken } from "@/utils/auth-utils"

export function Login() {
    const baseURL = `https://minhlong.mlhr.org`

    const navigate = useNavigate()
    const [userName, setUserName] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)

    // Check for remembered username on component mount
    useEffect(() => {
        const rememberedUsername = localStorage.getItem("remembered_username")
        if (rememberedUsername) {
            setUserName(rememberedUsername)
            setRememberMe(true)
        }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
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
            const response = await axios.post<TokenResponse>(`${baseURL}/api/auth/login`, loginData)

            console.log("Login successful:", response.data)

            // Handle the new response format
            if (response.data.token) {
                // Store the JWT token
                localStorage.setItem("auth_token", response.data.token.token)

                // Store the role name
                localStorage.setItem("role_name", response.data.token.roleName)

                // If remember me is checked, store the username
                if (rememberMe) {
                    localStorage.setItem("remembered_username", userName)
                } else {
                    localStorage.removeItem("remembered_username")
                }

                // Decode token to get role
                const payload = decodeToken(response.data.token.token)
                const role = payload ? payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] : null

                // Redirect based on role
                if (role === UserRole.SALES_MANAGER) {
                    navigate("/sales/dashboard")
                } else if (role === UserRole.AGENCY) {
                    navigate("/agency/dashboard")
                } else {
                    // Nếu không phải vai trò cụ thể, chuyển hướng đến trang chung
                    navigate("/dashboard")
                }
            } else {
                setError("Đăng nhập thất bại: Không nhận được token")
            }
        } catch (error) {
            console.error("Login error:", error)

            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError

                if (axiosError.response) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const responseData = axiosError.response.data as any

                    // Check for error message in different formats
                    const errorMessage = responseData.error || responseData.message || "Đăng nhập thất bại"
                    setError(errorMessage)

                    // Handle specific error cases
                    if (axiosError.response.status === 401) {
                        setError("Tên đăng nhập hoặc mật khẩu không chính xác")
                    } else if (axiosError.response.status === 403) {
                        setError("Tài khoản của bạn đã bị khóa hoặc chưa được kích hoạt")
                    }
                } else if (axiosError.request) {
                    setError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.")
                } else {
                    setError(`Lỗi: ${axiosError.message}`)
                }
            } else {
                setError("Đăng nhập thất bại. Vui lòng thử lại.")
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
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

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">{error}</div>}

                    <div className="space-y-4 rounded-md">
                        <div>
                            <label htmlFor="userName" className="block text-sm font-medium">
                                Tên đăng nhập
                            </label>
                            <input
                                id="userName"
                                name="userName"
                                type="text"
                                autoComplete="username"
                                required
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Tên đăng nhập"
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
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                                Ghi nhớ đăng nhập
                            </label>
                        </div>

                        <div className="text-sm">
                            <a href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                                Quên mật khẩu?
                            </a>
                        </div>
                    </div>

                    <div>
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
        </div>
    )
}

