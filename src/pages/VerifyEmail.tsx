"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

export function VerifyEmail() {
    const { user, userDetails, isAuthenticated, isLoading } = useAuth()
    const navigate = useNavigate()
    const [otp, setOtp] = useState("")
    const [isOtpSent, setIsOtpSent] = useState(false)
    const [isVerifying, setIsVerifying] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [countdown, setCountdown] = useState(0)
    const baseURL = "https://minhlong.mlhr.org"

    // Redirect if not authenticated or if email is already verified
    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                navigate("/login")
            } else if (userDetails && userDetails.verifyEmail === true) {
                // If email is already verified, redirect to dashboard
                navigate("/dashboard")
            }
        }
    }, [isLoading, isAuthenticated, userDetails, navigate])

    // Handle countdown for resend button
    useEffect(() => {
        let timer: NodeJS.Timeout
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000)
        }
        return () => {
            if (timer) clearTimeout(timer)
        }
    }, [countdown])

    // Send OTP to user's email
    const sendOtp = async () => {
        if (!user || !userDetails) return

        try {
            setError(null)
            setIsVerifying(true)

            const response = await fetch(`${baseURL}/api/send-otp-email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({
                    email: user.email,
                    userName: userDetails.username,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || "Failed to send OTP")
            }

            setIsOtpSent(true)
            setCountdown(60) // 60 seconds countdown for resend
        } catch (error) {
            console.error("Error sending OTP:", error)
            setError(error instanceof Error ? error.message : "Failed to send OTP")
        } finally {
            setIsVerifying(false)
        }
    }

    // Verify OTP
    const verifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        try {
            setError(null)
            setIsVerifying(true)

            const response = await fetch(`${baseURL}/api/check-otp-email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({
                    otpRequest: otp,
                    email: user.email,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || "Invalid OTP")
            }

            // OTP verification successful
            // Force reload user details to get updated verifyEmail status
            window.location.href = "/dashboard"
        } catch (error) {
            console.error("Error verifying OTP:", error)
            setError(error instanceof Error ? error.message : "Failed to verify OTP")
        } finally {
            setIsVerifying(false)
        }
    }

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">Xác thực email</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">Vui lòng xác thực email của bạn để tiếp tục</p>
                </div>

                {error && <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-4">{error}</div>}

                {!isOtpSent ? (
                    <div className="mt-8 space-y-6">
                        <p className="text-center text-gray-700">
                            Chúng tôi cần xác thực email của bạn trước khi bạn có thể tiếp tục.
                        </p>
                        <p className="text-center text-gray-700">
                            Nhấn nút bên dưới để nhận mã OTP qua email <strong>{user?.email}</strong>
                        </p>
                        <div>
                            <button
                                onClick={sendOtp}
                                disabled={isVerifying}
                                className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus:outline-none disabled:opacity-70"
                            >
                                {isVerifying ? "Đang gửi..." : "Gửi mã OTP"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={verifyOtp}>
                        <div>
                            <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                                Mã OTP
                            </label>
                            <input
                                id="otp"
                                name="otp"
                                type="text"
                                required
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Nhập mã OTP 6 số"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <p className="mt-2 text-sm text-gray-500">Mã OTP đã được gửi đến email {user?.email}</p>
                        </div>

                        <div className="flex flex-col space-y-4">
                            <button
                                type="submit"
                                disabled={isVerifying || otp.length !== 6}
                                className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus:outline-none disabled:opacity-70"
                            >
                                {isVerifying ? "Đang xác thực..." : "Xác thực"}
                            </button>

                            <button
                                type="button"
                                onClick={sendOtp}
                                disabled={isVerifying || countdown > 0}
                                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                            >
                                {countdown > 0 ? `Gửi lại mã sau ${countdown} giây` : "Gửi lại mã OTP"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}

