import type { AxiosResponse } from 'axios'
import api from './apiConfig'

export interface ApiResponse<T> {
    success: boolean
    message?: string
    result: T
}

export async function get<T>(url: string): Promise<ApiResponse<T>> {
    try {
        const response: AxiosResponse<T> = await api.get(url)

        return {
            success: true,
            result: response.data,
        }
    } catch (error: unknown) {
        const err = error as Error
        console.error(`GET request failed for ${url}:`, err)

        return {
            success: false,
            message: err.message || 'An error occurred',
            result: {} as T,
        }
    }
}

export async function post<T, D = unknown>(url: string, data: D): Promise<ApiResponse<T>> {
    try {
        const response: AxiosResponse<T> = await api.post(url, data)

        return {
            success: true,
            result: response.data,
        }
    } catch (error: unknown) {
        const err = error as Error
        console.error(`POST request failed for ${url}:`, err)

        return {
            success: false,
            message: err.message || 'An error occurred',
            result: {} as T,
        }
    }
}

export async function put<T, D = unknown>(url: string, data: D): Promise<ApiResponse<T>> {
    try {
        const response: AxiosResponse<T> = await api.put(url, data)

        return {
            success: true,
            result: response.data,
        }
    } catch (error: unknown) {
        const err = error as Error
        console.error(`PUT request failed for ${url}:`, err)

        return {
            success: false,
            message: err.message || 'An error occurred',
            result: {} as T,
        }
    }
}

export async function del<T>(url: string): Promise<ApiResponse<T>> {
    try {
        const response: AxiosResponse<T> = await api.delete(url)

        return {
            success: true,
            result: response.data,
        }
    } catch (error: unknown) {
        const err = error as Error
        console.error(`DELETE request failed for ${url}:`, err)

        return {
            success: false,
            message: err.message || 'An error occurred',
            result: {} as T,
        }
    }
}


export default ApiResponse
