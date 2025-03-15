import type React from "react"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"

export default function Profile() {
    const { user } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: "0912345678", // Example data
        address: "123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh", // Example data
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // In a real app, you would call your API to update the user profile
        console.log("Updated profile:", formData)
        setIsEditing(false)
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Hồ sơ cá nhân</h2>
                <Button variant={isEditing ? "outline" : "default"} onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? "Hủy" : "Chỉnh sửa"}
                </Button>
            </div>

            <div className="bg-white p-6 rounded-lg border">
                {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium mb-1">
                                    Họ và tên
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md"
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium mb-1">
                                    Số điện thoại
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md"
                                />
                            </div>
                            <div>
                                <label htmlFor="address" className="block text-sm font-medium mb-1">
                                    Địa chỉ
                                </label>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                                Hủy
                            </Button>
                            <Button type="submit">Lưu thay đổi</Button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="md:w-1/3">
                                <div className="aspect-square w-full max-w-[200px] mx-auto bg-muted rounded-full flex items-center justify-center">
                                    <span className="text-4xl font-bold text-muted-foreground">{user?.name?.charAt(0) || "U"}</span>
                                </div>
                            </div>
                            <div className="md:w-2/3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Họ và tên</h3>
                                        <p className="text-lg">{user?.name}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                                        <p className="text-lg">{user?.email}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Số điện thoại</h3>
                                        <p className="text-lg">0912345678</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Địa chỉ</h3>
                                        <p className="text-lg">123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="border-t pt-6">
                            <h3 className="font-medium text-lg mb-4">Bảo mật</h3>
                            <Button variant="outline">Đổi mật khẩu</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

