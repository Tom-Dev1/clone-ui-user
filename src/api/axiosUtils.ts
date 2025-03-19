import type { AxiosResponse, AxiosRequestConfig } from "axios"
import { getAuthHeader } from "@/utils/auth-utils"
import api from "./apiConfig"

export interface ApiResponse<T> {
    success: boolean
    message?: string
    result: T
}

export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
        // Thêm header xác thực
        const authHeader = getAuthHeader()
        const requestConfig: AxiosRequestConfig = {
            ...config,
            headers: {
                ...config?.headers,
                ...authHeader,
            },
        }

        const response: AxiosResponse<T> = await api.get(url, requestConfig)

        return {
            success: true,
            result: response.data,
        }
    } catch (error: Error | unknown) {
        const err = error as Error
        console.error(`GET request failed for ${url}:`, err)

        return {
            success: false,
            message: err.message || "An error occurred",
            result: {} as T,
        }
    }
}

export async function post<T, D = unknown>(url: string, data: D, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
        // Thêm header xác thực
        const token = localStorage.getItem("auth_token")

        // Tạo headers với token
        const headers = {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(config?.headers || {}),
        }

        // Tạo config mới với headers đã cập nhật
        const requestConfig = {
            ...config,
            headers,
        }

        const response: AxiosResponse<T> = await api.post(url, data, requestConfig)

        return {
            success: true,
            result: response.data,
        }
    } catch (error: Error | unknown) {
        const err = error as Error
        console.error(`GET request failed for ${url}:`, err)

        return {
            success: false,
            message: err.message || "An error occurred",
            result: {} as T,
        }
    }
}

// Cập nhật hàm put để đảm bảo token được gửi đúng cách
export async function put<T,>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
        // Lấy token từ localStorage
        const token = localStorage.getItem("auth_token")

        // Tạo headers với token
        const headers = {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(config?.headers || {}),
        }

        // Tạo config mới với headers đã cập nhật
        const updatedConfig = {
            ...config,
            headers,
        }

        const response: AxiosResponse<T> = await api.put(url, updatedConfig)

        return {
            success: true,
            result: response.data,
        }
    } catch (error: Error | unknown) {
        const err = error as Error
        console.error(`GET request failed for ${url}:`, err)

        return {
            success: false,
            message: err.message || "An error occurred",
            result: {} as T,
        }
    }
}

export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
        // Thêm header xác thực
        const authHeader = getAuthHeader()
        const requestConfig: AxiosRequestConfig = {
            ...config,
            headers: {
                ...config?.headers,
                ...authHeader,
            },
        }

        const response: AxiosResponse<T> = await api.delete(url, requestConfig)

        return {
            success: true,
            result: response.data,
        }
    } catch (error: Error | unknown) {
        const err = error as Error
        console.error(`GET request failed for ${url}:`, err)

        return {
            success: false,
            message: err.message || "An error occurred",
            result: {} as T,
        }
    }
}

export default ApiResponse

