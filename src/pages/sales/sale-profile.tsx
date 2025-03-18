import type React from "react"
import { useState, useEffect, useCallback } from "react"
import {
    getCurrentUserProfile,
    updateUserProfile,
    type UserProfile,
    type UserUpdateRequest,
} from "@/services/user-service"
import { LocationSelector } from "@/components/location-selector"
import { SalesLayout } from "@/layouts/sale-layout"

interface LocationData {
    provinceId: number | null
    districtId: number | null
    wardId: number | null
    provinceName: string
    districtName: string
    wardName: string
}

// Add the following interface for tracking touched fields
interface TouchedFields {
    fullName: boolean
    email: boolean
    phone: boolean
    agencyName: boolean
    street: boolean
}

// Add the following interface for validation errors
interface ValidationErrors {
    fullName?: string
    email?: string
    phone?: string
    agencyName?: string
    street?: string
    location?: string
}

export default function SalesProfile() {
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
    const [touched, setTouched] = useState<TouchedFields>({
        fullName: false,
        email: false,
        phone: false,
        agencyName: false,
        street: false,
    })

    const [formData, setFormData] = useState({
        username: "",
        fullName: "",
        email: "",
        phone: "",
        agencyName: "",
        street: "",
        wardName: "",
        districtName: "",
        provinceName: "",
    })

    const [locationData, setLocationData] = useState<LocationData>({
        provinceId: null,
        districtId: null,
        wardId: null,
        provinceName: "",
        districtName: "",
        wardName: "",
    })

    // Add validation function
    const validateField = useCallback(
        (name: string, value: string): string | undefined => {
            switch (name) {
                case "fullName":
                    if (!value.trim()) return "Họ tên là bắt buộc"
                    return undefined

                case "email":
                    if (!value.trim()) return "Email là bắt buộc"
                    if (!/\S+@\S+\.\S+/.test(value)) return "Email không hợp lệ"
                    return undefined

                case "phone":
                    if (!value.trim()) return "Số điện thoại là bắt buộc"
                    if (!/^\d{10}$/.test(value)) return "Số điện thoại phải có đúng 10 số"
                    return undefined

                case "agencyName":
                    if (userProfile?.userType === "AGENCY" && !value.trim()) return "Tên đại lý là bắt buộc"
                    return undefined

                case "street":
                    if (!value.trim()) return "Địa chỉ là bắt buộc"
                    return undefined

                default:
                    return undefined
            }
        },
        [userProfile?.userType],
    )

    // Fetch user profile on component mount
    useEffect(() => {
        async function loadUserProfile() {
            setIsLoading(true)
            try {
                const profile = await getCurrentUserProfile()

                if (profile) {
                    setUserProfile(profile)

                    // Initialize form data with profile values
                    setFormData({
                        username: profile.username || "",
                        fullName: profile.fullName || "",
                        email: profile.email || "",
                        phone: profile.phone || "",
                        agencyName: profile.agencyName || "",
                        street: profile.street || "",
                        wardName: profile.wardName || "",
                        districtName: profile.districtName || "",
                        provinceName: profile.provinceName || "",
                    })

                    // Initialize location data
                    setLocationData({
                        provinceId: null, // We don't have IDs from the profile
                        districtId: null,
                        wardId: null,
                        provinceName: profile.provinceName || "",
                        districtName: profile.districtName || "",
                        wardName: profile.wardName || "",
                    })
                } else {
                    setError("Could not find user profile information")
                }
            } catch (err) {
                console.error("Error loading profile:", err)
                setError("Failed to load profile information")
            } finally {
                setIsLoading(false)
            }
        }

        loadUserProfile()
    }, [])

    // Update handleChange to include validation
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))

        // Mark field as touched
        if (!touched[name as keyof TouchedFields]) {
            setTouched((prev) => ({
                ...prev,
                [name]: true,
            }))
        }

        // Validate field
        const fieldError = validateField(name, value)
        setValidationErrors((prev) => ({
            ...prev,
            [name]: fieldError,
        }))
    }

    // Add blur handler for validation
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name } = e.target

        // Mark field as touched
        setTouched((prev) => ({
            ...prev,
            [name]: true,
        }))

        // Validate field
        const fieldError = validateField(name, formData[name as keyof typeof formData])
        setValidationErrors((prev) => ({
            ...prev,
            [name]: fieldError,
        }))
    }

    // Add function to validate the entire form
    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {}
        let isValid = true

        // Validate each field
        Object.keys(formData).forEach((key) => {
            if (key === "username") return // Skip username as it's not editable

            const fieldName = key as keyof typeof formData
            const error = validateField(fieldName, formData[fieldName])

            if (error) {
                newErrors[fieldName as keyof ValidationErrors] = error
                isValid = false
            }
        })

        // Validate location data
        if (!formData.provinceName || !formData.districtName || !formData.wardName) {
            newErrors.location = "Vui lòng chọn đầy đủ thông tin địa điểm"
            isValid = false
        }

        setValidationErrors(newErrors)
        return isValid
    }

    // Update handleSubmit to include validation
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Mark all fields as touched
        setTouched({
            fullName: true,
            email: true,
            phone: true,
            agencyName: true,
            street: true,
        })

        // Validate form
        if (!validateForm()) {
            // Scroll to the first error
            const firstError = document.querySelector(".text-red-500")
            if (firstError) {
                firstError.scrollIntoView({ behavior: "smooth", block: "center" })
            }
            return
        }

        setIsSubmitting(true)
        setError(null)
        setSuccessMessage(null)

        try {
            // Prepare update data
            const updateData: UserUpdateRequest = {
                username: formData.username,
                email: formData.email,
                phone: formData.phone,
                fullName: formData.fullName,
                agencyName: formData.agencyName || "",
                street: formData.street,
                wardName: formData.wardName,
                districtName: formData.districtName,
                provinceName: formData.provinceName,
            }

            // Call API to update profile
            const success = await updateUserProfile(updateData)

            if (success) {
                setSuccessMessage("Thông tin cá nhân đã được cập nhật thành công")

                // Update the user profile state with new data
                if (userProfile) {
                    setUserProfile({
                        ...userProfile,
                        ...updateData,
                    })
                }

                setIsEditing(false)
            } else {
                setError("Không thể cập nhật thông tin cá nhân. Vui lòng thử lại sau.")
            }
        } catch (err) {
            console.error("Error updating profile:", err)
            setError("Đã xảy ra lỗi khi cập nhật thông tin cá nhân")
        } finally {
            setIsSubmitting(false)
        }
    }

    // Format full address
    const getFullAddress = () => {
        if (!userProfile) return ""

        const parts = [userProfile.street, userProfile.wardName, userProfile.districtName, userProfile.provinceName].filter(
            Boolean,
        )

        return parts.join(", ")
    }

    // Handler for location changes
    const handleLocationChange = (newLocation: LocationData) => {
        setLocationData(newLocation)
        setFormData((prev) => ({
            ...prev,
            provinceName: newLocation.provinceName,
            districtName: newLocation.districtName,
            wardName: newLocation.wardName,
        }))
    }

    if (isLoading) {
        return (
            <SalesLayout>
                <div className="p-6">
                    <h1 className="text-2xl font-bold mb-6">Hồ sơ cá nhân</h1>
                    <div className="bg-white shadow-sm rounded-lg p-6 flex justify-center items-center h-64">
                        <div className="animate-pulse flex flex-col items-center">
                            <div className="rounded-full bg-gray-200 h-20 w-20 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-32"></div>
                        </div>
                    </div>
                </div>
            </SalesLayout>
        )
    }

    if (error && !userProfile) {
        return (
            <SalesLayout>
                <div className="p-6">
                    <h1 className="text-2xl font-bold mb-6">Hồ sơ cá nhân</h1>
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <div className="text-red-500 text-center">
                            <p>{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Thử lại
                            </button>
                        </div>
                    </div>
                </div>
            </SalesLayout>
        )
    }

    return (
        <SalesLayout>
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Hồ sơ cá nhân</h1>

                {successMessage && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">{successMessage}</div>}

                {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center">
                                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-2xl font-bold">
                                    {userProfile?.fullName?.charAt(0) || userProfile?.username?.charAt(0) || "U"}
                                </div>
                                <div className="ml-4">
                                    <h2 className="text-xl font-bold">{userProfile?.fullName}</h2>
                                    <p className="text-gray-600">{userProfile?.position}</p>
                                </div>
                            </div>

                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Chỉnh sửa
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                                    {isEditing ? (
                                        <>
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                className={`w-full px-3 py-2 border ${touched.fullName && validationErrors.fullName ? "border-red-300" : "border-gray-300"
                                                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                                            />
                                            {touched.fullName && validationErrors.fullName && (
                                                <p className="text-red-500 text-xs mt-1">{validationErrors.fullName}</p>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-gray-900">{userProfile?.fullName}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
                                    <p className="text-gray-900">{userProfile?.username}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    {isEditing ? (
                                        <>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                className={`w-full px-3 py-2 border ${touched.email && validationErrors.email ? "border-red-300" : "border-gray-300"
                                                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                                            />
                                            {touched.email && validationErrors.email && (
                                                <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-gray-900">{userProfile?.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                    {isEditing ? (
                                        <>
                                            <input
                                                type="text"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder="10 số (VD: 0912345678)"
                                                className={`w-full px-3 py-2 border ${touched.phone && validationErrors.phone ? "border-red-300" : "border-gray-300"
                                                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                                            />
                                            {touched.phone && validationErrors.phone && (
                                                <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-gray-900">{userProfile?.phone}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại tài khoản</label>
                                    <p className="text-gray-900">{userProfile?.userType}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Chức vụ</label>
                                    <p className="text-gray-900">{userProfile?.position}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phòng ban</label>
                                    <p className="text-gray-900">{userProfile?.department}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                                    <p className={`text-${userProfile?.isApproved ? "green" : "red"}-600`}>
                                        {userProfile?.isApproved ? "Đã phê duyệt" : "Chưa phê duyệt"}
                                    </p>
                                </div>

                                {userProfile?.userType === "AGENCY" && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên đại lý</label>
                                        {isEditing ? (
                                            <>
                                                <input
                                                    type="text"
                                                    name="agencyName"
                                                    value={formData.agencyName}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    className={`w-full px-3 py-2 border ${touched.agencyName && validationErrors.agencyName ? "border-red-300" : "border-gray-300"
                                                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                                                />
                                                {touched.agencyName && validationErrors.agencyName && (
                                                    <p className="text-red-500 text-xs mt-1">{validationErrors.agencyName}</p>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-gray-900">{userProfile?.agencyName}</p>
                                        )}
                                    </div>
                                )}

                                {!isEditing && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                                        <p className="text-gray-900">{getFullAddress()}</p>
                                    </div>
                                )}
                            </div>

                            {isEditing && (
                                <>
                                    <div className="mt-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                                        <input
                                            type="text"
                                            name="street"
                                            value={formData.street}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="Số nhà, đường"
                                            className={`w-full px-3 py-2 border ${touched.street && validationErrors.street ? "border-red-300" : "border-gray-300"
                                                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-4`}
                                        />
                                        {touched.street && validationErrors.street && (
                                            <p className="text-red-500 text-xs mt-1">{validationErrors.street}</p>
                                        )}

                                        <label className="block text-sm font-medium text-gray-700 mb-1">Chọn địa điểm</label>
                                        <LocationSelector onLocationChange={handleLocationChange} initialValues={locationData} />
                                        {validationErrors.location && (
                                            <p className="text-red-500 text-xs mt-1">{validationErrors.location}</p>
                                        )}
                                    </div>

                                    <div className="flex justify-end space-x-2 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                            disabled={isSubmitting}
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                                        </button>
                                    </div>
                                </>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </SalesLayout>
    )
}

