"use client"

import type React from "react"

import { useState } from "react"
import { AgencyLayout } from "@/layouts/agency-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { getUserInfo } from "@/utils/auth-utils"
import { Camera, Save, User, Lock, MapPin, Phone, Mail, Globe } from "lucide-react"

export default function AgencyProfile() {
    const userInfo = getUserInfo()
    const [isEditing, setIsEditing] = useState(false)
    const [profileImage, setProfileImage] = useState("/placeholder.svg?height=200&width=200")

    // Form states
    const [personalInfo, setPersonalInfo] = useState({
        fullName: userInfo?.username || "Nguyễn Văn A",
        email: userInfo?.email || "nguyenvana@example.com",
        phone: "0912345678",
        address: "123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh",
        idNumber: "079123456789",
        dateOfBirth: "1990-01-01",
        gender: "male",
    })

    const [businessInfo, setBusinessInfo] = useState({
        businessName: "Cửa hàng Điện máy ABC",
        businessType: "retail",
        taxCode: "0123456789",
        businessAddress: "456 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
        businessPhone: "02838123456",
        businessEmail: "contact@abcstore.com",
        website: "https://abcstore.com",
        establishedDate: "2015-05-10",
        employeeCount: "10-50",
        businessDescription:
            "Chuyên kinh doanh các sản phẩm điện tử, điện máy chính hãng với đa dạng mẫu mã và giá cả cạnh tranh.",
    })

    const [bankInfo, setBankInfo] = useState({
        accountName: "NGUYEN VAN A",
        accountNumber: "1234567890",
        bankName: "Vietcombank",
        bankBranch: "Chi nhánh TP. Hồ Chí Minh",
        swiftCode: "BFTVVNVX",
    })

    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        smsNotifications: true,
        orderUpdates: true,
        promotions: true,
        systemUpdates: true,
        paymentReminders: true,
    })

    const [passwordInfo, setPasswordInfo] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })

    const handleEditToggle = () => {
        setIsEditing(!isEditing)
        if (isEditing) {
            console.log("Saving changes...");

        }
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                if (e.target?.result) {
                    setProfileImage(e.target.result as string)
                }
            }
            reader.readAsDataURL(file)
        }
    }

    const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setPersonalInfo((prev) => ({ ...prev, [name]: value }))
    }

    const handleBusinessInfoChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target
        setBusinessInfo((prev) => ({ ...prev, [name]: value }))
    }

    const handleBankInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setBankInfo((prev) => ({ ...prev, [name]: value }))
    }

    const handleNotificationChange = (name: string, checked: boolean) => {
        setNotificationSettings((prev) => ({ ...prev, [name]: checked }))
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setPasswordInfo((prev) => ({ ...prev, [name]: value }))
    }

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (passwordInfo.newPassword !== passwordInfo.confirmPassword) {
            console.log("Passwords do not match");

            return
        }

        // Simulate password change
        console.log("Changing password...");


        setPasswordInfo({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        })
    }

    return (
        <AgencyLayout>
            <div className="container mx-auto py-6 px-4 md:px-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Hồ sơ đại lý</h1>
                        <p className="text-muted-foreground">Quản lý thông tin cá nhân và cài đặt tài khoản của bạn</p>
                    </div>
                    <Button onClick={handleEditToggle} className={isEditing ? "bg-green-600 hover:bg-green-700" : ""}>
                        {isEditing ? (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Lưu thông tin
                            </>
                        ) : (
                            <>
                                <User className="mr-2 h-4 w-4" />
                                Chỉnh sửa
                            </>
                        )}
                    </Button>
                </div>

                <Tabs defaultValue="personal" className="w-full">
                    <TabsList className="grid grid-cols-5 w-full md:w-auto">
                        <TabsTrigger value="personal">Thông tin cá nhân</TabsTrigger>
                        <TabsTrigger value="business">Thông tin doanh nghiệp</TabsTrigger>
                        <TabsTrigger value="bank">Tài khoản ngân hàng</TabsTrigger>
                        <TabsTrigger value="notifications">Thông báo</TabsTrigger>
                        <TabsTrigger value="password">Đổi mật khẩu</TabsTrigger>
                    </TabsList>

                    {/* Thông tin cá nhân */}
                    <TabsContent value="personal">
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin cá nhân</CardTitle>
                                <CardDescription>Quản lý thông tin cá nhân của bạn</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="relative">
                                        <Avatar className="h-24 w-24">
                                            <AvatarImage src={profileImage} alt="Avatar" />
                                            <AvatarFallback>{personalInfo.fullName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        {isEditing && (
                                            <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1 cursor-pointer">
                                                <label htmlFor="avatar-upload" className="cursor-pointer">
                                                    <Camera className="h-4 w-4" />
                                                    <input
                                                        id="avatar-upload"
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handleImageUpload}
                                                    />
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-center">
                                        <h3 className="font-medium text-lg">{personalInfo.fullName}</h3>
                                        <p className="text-muted-foreground">Đại lý</p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Họ và tên</Label>
                                        <Input
                                            id="fullName"
                                            name="fullName"
                                            value={personalInfo.fullName}
                                            onChange={handlePersonalInfoChange}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={personalInfo.email}
                                            onChange={handlePersonalInfoChange}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Số điện thoại</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            value={personalInfo.phone}
                                            onChange={handlePersonalInfoChange}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="idNumber">Số CMND/CCCD</Label>
                                        <Input
                                            id="idNumber"
                                            name="idNumber"
                                            value={personalInfo.idNumber}
                                            onChange={handlePersonalInfoChange}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                                        <Input
                                            id="dateOfBirth"
                                            name="dateOfBirth"
                                            type="date"
                                            value={personalInfo.dateOfBirth}
                                            onChange={handlePersonalInfoChange}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="gender">Giới tính</Label>
                                        <Select
                                            value={personalInfo.gender}
                                            onValueChange={(value) => setPersonalInfo((prev) => ({ ...prev, gender: value }))}
                                            disabled={!isEditing}
                                        >
                                            <SelectTrigger id="gender">
                                                <SelectValue placeholder="Chọn giới tính" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">Nam</SelectItem>
                                                <SelectItem value="female">Nữ</SelectItem>
                                                <SelectItem value="other">Khác</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="address">Địa chỉ</Label>
                                        <Input
                                            id="address"
                                            name="address"
                                            value={personalInfo.address}
                                            onChange={handlePersonalInfoChange}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Thông tin doanh nghiệp */}
                    <TabsContent value="business">
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin doanh nghiệp</CardTitle>
                                <CardDescription>Quản lý thông tin doanh nghiệp/cửa hàng của bạn</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="businessName">Tên doanh nghiệp</Label>
                                        <Input
                                            id="businessName"
                                            name="businessName"
                                            value={businessInfo.businessName}
                                            onChange={handleBusinessInfoChange}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="businessType">Loại hình kinh doanh</Label>
                                        <Select
                                            value={businessInfo.businessType}
                                            onValueChange={(value) => setBusinessInfo((prev) => ({ ...prev, businessType: value }))}
                                            disabled={!isEditing}
                                        >
                                            <SelectTrigger id="businessType">
                                                <SelectValue placeholder="Chọn loại hình kinh doanh" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="retail">Bán lẻ</SelectItem>
                                                <SelectItem value="wholesale">Bán buôn</SelectItem>
                                                <SelectItem value="mixed">Kết hợp</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="taxCode">Mã số thuế</Label>
                                        <Input
                                            id="taxCode"
                                            name="taxCode"
                                            value={businessInfo.taxCode}
                                            onChange={handleBusinessInfoChange}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="establishedDate">Ngày thành lập</Label>
                                        <Input
                                            id="establishedDate"
                                            name="establishedDate"
                                            type="date"
                                            value={businessInfo.establishedDate}
                                            onChange={handleBusinessInfoChange}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="businessAddress">Địa chỉ doanh nghiệp</Label>
                                        <div className="flex items-center space-x-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="businessAddress"
                                                name="businessAddress"
                                                value={businessInfo.businessAddress}
                                                onChange={handleBusinessInfoChange}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="businessPhone">Số điện thoại doanh nghiệp</Label>
                                        <div className="flex items-center space-x-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="businessPhone"
                                                name="businessPhone"
                                                value={businessInfo.businessPhone}
                                                onChange={handleBusinessInfoChange}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="businessEmail">Email doanh nghiệp</Label>
                                        <div className="flex items-center space-x-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="businessEmail"
                                                name="businessEmail"
                                                type="email"
                                                value={businessInfo.businessEmail}
                                                onChange={handleBusinessInfoChange}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="website">Website</Label>
                                        <div className="flex items-center space-x-2">
                                            <Globe className="h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="website"
                                                name="website"
                                                value={businessInfo.website}
                                                onChange={handleBusinessInfoChange}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="employeeCount">Số lượng nhân viên</Label>
                                        <Select
                                            value={businessInfo.employeeCount}
                                            onValueChange={(value) => setBusinessInfo((prev) => ({ ...prev, employeeCount: value }))}
                                            disabled={!isEditing}
                                        >
                                            <SelectTrigger id="employeeCount">
                                                <SelectValue placeholder="Chọn số lượng nhân viên" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1-9">1-9</SelectItem>
                                                <SelectItem value="10-50">10-50</SelectItem>
                                                <SelectItem value="51-200">51-200</SelectItem>
                                                <SelectItem value="201+">201+</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="businessDescription">Mô tả doanh nghiệp</Label>
                                        <Textarea
                                            id="businessDescription"
                                            name="businessDescription"
                                            value={businessInfo.businessDescription}
                                            onChange={handleBusinessInfoChange}
                                            disabled={!isEditing}
                                            rows={4}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tài khoản ngân hàng */}
                    <TabsContent value="bank">
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin tài khoản ngân hàng</CardTitle>
                                <CardDescription>Quản lý thông tin tài khoản ngân hàng để nhận thanh toán</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="accountName">Tên chủ tài khoản</Label>
                                        <Input
                                            id="accountName"
                                            name="accountName"
                                            value={bankInfo.accountName}
                                            onChange={handleBankInfoChange}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="accountNumber">Số tài khoản</Label>
                                        <Input
                                            id="accountNumber"
                                            name="accountNumber"
                                            value={bankInfo.accountNumber}
                                            onChange={handleBankInfoChange}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bankName">Tên ngân hàng</Label>
                                        <Select
                                            value={bankInfo.bankName}
                                            onValueChange={(value) => setBankInfo((prev) => ({ ...prev, bankName: value }))}
                                            disabled={!isEditing}
                                        >
                                            <SelectTrigger id="bankName">
                                                <SelectValue placeholder="Chọn ngân hàng" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Vietcombank">Vietcombank</SelectItem>
                                                <SelectItem value="BIDV">BIDV</SelectItem>
                                                <SelectItem value="Agribank">Agribank</SelectItem>
                                                <SelectItem value="Techcombank">Techcombank</SelectItem>
                                                <SelectItem value="VPBank">VPBank</SelectItem>
                                                <SelectItem value="MBBank">MBBank</SelectItem>
                                                <SelectItem value="ACB">ACB</SelectItem>
                                                <SelectItem value="TPBank">TPBank</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bankBranch">Chi nhánh</Label>
                                        <Input
                                            id="bankBranch"
                                            name="bankBranch"
                                            value={bankInfo.bankBranch}
                                            onChange={handleBankInfoChange}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="swiftCode">Mã Swift (nếu có)</Label>
                                        <Input
                                            id="swiftCode"
                                            name="swiftCode"
                                            value={bankInfo.swiftCode}
                                            onChange={handleBankInfoChange}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <p className="text-sm text-muted-foreground">
                                    Thông tin tài khoản ngân hàng của bạn được bảo mật và chỉ được sử dụng cho mục đích thanh toán.
                                </p>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    {/* Thông báo */}
                    <TabsContent value="notifications">
                        <Card>
                            <CardHeader>
                                <CardTitle>Cài đặt thông báo</CardTitle>
                                <CardDescription>Quản lý cách bạn nhận thông báo từ hệ thống</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="emailNotifications">Thông báo qua email</Label>
                                            <p className="text-sm text-muted-foreground">Nhận thông báo qua email</p>
                                        </div>
                                        <Switch
                                            id="emailNotifications"
                                            checked={notificationSettings.emailNotifications}
                                            onCheckedChange={(checked) => handleNotificationChange("emailNotifications", checked)}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="smsNotifications">Thông báo qua SMS</Label>
                                            <p className="text-sm text-muted-foreground">Nhận thông báo qua tin nhắn SMS</p>
                                        </div>
                                        <Switch
                                            id="smsNotifications"
                                            checked={notificationSettings.smsNotifications}
                                            onCheckedChange={(checked) => handleNotificationChange("smsNotifications", checked)}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="orderUpdates">Cập nhật đơn hàng</Label>
                                            <p className="text-sm text-muted-foreground">Nhận thông báo khi có cập nhật về đơn hàng</p>
                                        </div>
                                        <Switch
                                            id="orderUpdates"
                                            checked={notificationSettings.orderUpdates}
                                            onCheckedChange={(checked) => handleNotificationChange("orderUpdates", checked)}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="promotions">Khuyến mãi và ưu đãi</Label>
                                            <p className="text-sm text-muted-foreground">Nhận thông báo về khuyến mãi và ưu đãi mới</p>
                                        </div>
                                        <Switch
                                            id="promotions"
                                            checked={notificationSettings.promotions}
                                            onCheckedChange={(checked) => handleNotificationChange("promotions", checked)}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="systemUpdates">Cập nhật hệ thống</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Nhận thông báo về các cập nhật và thay đổi của hệ thống
                                            </p>
                                        </div>
                                        <Switch
                                            id="systemUpdates"
                                            checked={notificationSettings.systemUpdates}
                                            onCheckedChange={(checked) => handleNotificationChange("systemUpdates", checked)}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="paymentReminders">Nhắc nhở thanh toán</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Nhận thông báo nhắc nhở khi có khoản thanh toán đến hạn
                                            </p>
                                        </div>
                                        <Switch
                                            id="paymentReminders"
                                            checked={notificationSettings.paymentReminders}
                                            onCheckedChange={(checked) => handleNotificationChange("paymentReminders", checked)}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Đổi mật khẩu */}
                    <TabsContent value="password">
                        <Card>
                            <CardHeader>
                                <CardTitle>Đổi mật khẩu</CardTitle>
                                <CardDescription>Cập nhật mật khẩu của bạn để bảo mật tài khoản</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                                        <Input
                                            id="currentPassword"
                                            name="currentPassword"
                                            type="password"
                                            value={passwordInfo.currentPassword}
                                            onChange={handlePasswordChange}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">Mật khẩu mới</Label>
                                        <Input
                                            id="newPassword"
                                            name="newPassword"
                                            type="password"
                                            value={passwordInfo.newPassword}
                                            onChange={handlePasswordChange}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                                        <Input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            value={passwordInfo.confirmPassword}
                                            onChange={handlePasswordChange}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full md:w-auto">
                                        <Lock className="mr-2 h-4 w-4" />
                                        Cập nhật mật khẩu
                                    </Button>
                                </form>
                            </CardContent>
                            <CardFooter>
                                <p className="text-sm text-muted-foreground">
                                    Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
                                </p>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AgencyLayout>
    )
}

