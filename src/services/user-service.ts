import { get, put } from "@/api/axiosUtils"
import { getUserInfo } from "@/utils/auth-utils"

export interface UserProfile {
    registerId: number
    username: string
    email: string
    password?: string
    phone: string
    userType: string
    fullName: string
    position: string
    department: string
    agencyName: string
    street: string
    wardName: string
    districtName: string
    provinceName: string
    isApproved: boolean
}

export interface UserUpdateRequest {
    username: string
    email: string
    password?: string
    phone: string
    fullName: string
    agencyName: string
    street: string
    wardName: string
    districtName: string
    provinceName: string
}

export async function fetchAllUsers(): Promise<UserProfile[]> {
    try {
        const response = await get<UserProfile[]>("auth")
        return response.success ? response.result : []
    } catch (error) {
        console.error("Error fetching users:", error)
        return []
    }
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
        // Get current user info from JWT token
        const userInfo = getUserInfo()
        if (!userInfo || !userInfo.username) {
            console.error("No user info available")
            return null
        }

        // Fetch all users
        const users = await fetchAllUsers()
        if (!users || users.length === 0) {
            console.error("No users returned from API")
            return null
        }

        // Find the current user by matching username
        const currentUser = users.find((user) => user.username.toLowerCase() === userInfo.username.toLowerCase())

        return currentUser || null
    } catch (error) {
        console.error("Error getting current user profile:", error)
        return null
    }
}

export async function updateUserProfile(): Promise<boolean> {
    try {
        const response = await put<UserUpdateRequest>("user",)
        return response.success
    } catch (error) {
        console.error("Error updating user profile:", error)
        return false
    }
}

