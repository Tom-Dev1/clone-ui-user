import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function Settings() {
    const [notifications, setNotifications] = useState({
        email: true,
        orders: true,
        promotions: false,
        news: true,
    })

    const [privacy, setPrivacy] = useState({
        showProfile: true,
        shareData: false,
    })

    const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target
        setNotifications((prev) => ({
            ...prev,
            [name]: checked,
        }))
    }

    const handlePrivacyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target
        setPrivacy((prev) => ({
            ...prev,
            [name]: checked,
        }))
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Cài đặt</h2>

            <div className="space-y-8">
                <div className="bg-white p-6 rounded-lg border">
                    <h3 className="text-lg font-medium mb-4">Thông báo</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Thông báo qua email</p>
                                <p className="text-sm text-muted-foreground">Nhận thông báo qua email</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="email"
                                    checked={notifications.email}
                                    onChange={handleNotificationChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Cập nhật đơn hàng</p>
                                <p className="text-sm text-muted-foreground">Nhận thông báo khi đơn hàng có cập nhật</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="orders"
                                    checked={notifications.orders}
                                    onChange={handleNotificationChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Khuyến mãi</p>
                                <p className="text-sm text-muted-foreground">Nhận thông báo về khuyến mãi và ưu đãi</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="promotions"
                                    checked={notifications.promotions}
                                    onChange={handleNotificationChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Tin tức và cập nhật</p>
                                <p className="text-sm text-muted-foreground">Nhận thông báo về tin tức và cập nhật mới</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="news"
                                    checked={notifications.news}
                                    onChange={handleNotificationChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border">
                    <h3 className="text-lg font-medium mb-4">Quyền riêng tư</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Hiển thị thông tin cá nhân</p>
                                <p className="text-sm text-muted-foreground">Cho phép người khác xem thông tin cá nhân của bạn</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="showProfile"
                                    checked={privacy.showProfile}
                                    onChange={handlePrivacyChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Chia sẻ dữ liệu</p>
                                <p className="text-sm text-muted-foreground">Cho phép chia sẻ dữ liệu mua hàng để cải thiện dịch vụ</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="shareData"
                                    checked={privacy.shareData}
                                    onChange={handlePrivacyChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border">
                    <h3 className="text-lg font-medium mb-4">Tài khoản</h3>
                    <div className="space-y-4">
                        <Button variant="outline">Đổi mật khẩu</Button>
                        <Button variant="destructive">Xóa tài khoản</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

