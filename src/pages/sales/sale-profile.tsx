"use client"

import { useState, useEffect } from "react"
import { SalesLayout } from "@/layouts/sale-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { getUserInfo, getToken } from "@/utils/auth-utils"
import { User, Mail, Phone } from "lucide-react"
import { toast } from "sonner"

interface UserData {
    userId: string
    username: string
    email: string
    password: string
    userType: string
    phone: string
    status: boolean
    verifyEmail: boolean
    position: string,
    department: string,

}

export default function SaleProfile() {
    const userInfo = getUserInfo()
    const [userData, setUserData] = useState<UserData | null>(null)
    const [profileImage] = useState("/placeholder.svg?height=200&width=200")

    // Fetch user data from API
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (!userInfo?.id) {
                    toast.error("Không tìm thấy thông tin người dùng")

                    return
                }

                const token = getToken()
                if (!token) {
                    toast.error("Phiên đăng nhập hết hạn")

                    return
                }

                const response = await fetch(`https://minhlong.mlhr.org/api/get-info-user/${userInfo.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                })

                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`)
                }

                const data = await response.json()
                setUserData(data)
            } catch (error) {
                console.error("Failed to fetch user data:", error)
                toast.error("Không thể tải thông tin người dùng")

            }
        }

        fetchUserData()
    }, [userInfo?.id])



    return (
        <SalesLayout>
            <div className="container mx-auto py-6 px-4 md:px-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">Hồ sơ nhân viên kinh doanh</h1>
                    <p className="text-muted-foreground">Thông tin cá nhân của bạn</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Thông tin cá nhân</CardTitle>
                        <CardDescription>Thông tin tài khoản của bạn</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col items-center space-y-4">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={profileImage} alt="Avatar" />
                                <AvatarFallback>{userData?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                            </Avatar>
                            <div className="text-center">
                                <h3 className="font-medium text-lg">{userData?.username || "Chưa có thông tin"}</h3>
                                <p className="text-muted-foreground">{userData?.department || "Nhân viên kinh doanh"}</p>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <User className="h-5 w-5 text-gray-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Tên người dùng</p>
                                    <p className="text-base">{userData?.username || "Chưa có thông tin"}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Mail className="h-5 w-5 text-gray-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Email</p>
                                    <p className="text-base">{userData?.email || "Chưa có thông tin"}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Phone className="h-5 w-5 text-gray-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Số điện thoại</p>
                                    <p className="text-base">{userData?.phone || "Chưa có thông tin"}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <div className="h-5 w-5 flex items-center justify-center text-gray-500">
                                    <span className="text-lg">✓</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Trạng thái tài khoản</p>
                                    <p className="text-base">{userData?.status ? "Đang hoạt động" : "Không hoạt động"}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <div className="h-5 w-5 flex items-center justify-center text-gray-500">
                                    <span className="text-lg">✉</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Xác thực email</p>
                                    <p className="text-base">{userData?.verifyEmail ? "Đã xác thực" : "Chưa xác thực"}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </SalesLayout>
    )
}

