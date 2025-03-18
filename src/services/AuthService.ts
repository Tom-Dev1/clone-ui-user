import { RegisterRequest } from "@/types/auth-type"
import { post } from "../api/axiosUtils"

interface RegisterResponse {
    success: boolean
    message: string | null
    error: string

}

interface LoginResponse {
    success: boolean
    message: string
    userId?: string
    token?: string
    user?: {
        id: string
        email: string
        fullName: string
        userType: string
    }
}

class AuthService {
    private static instance: AuthService
    private constructor() { }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService()
        }
        return AuthService.instance
    }

    /**
     * Đăng ký tài khoản mới
     * @param registerData Dữ liệu đăng ký
     * @returns Promise với kết quả đăng ký
     */
    public async register(registerData: RegisterRequest): Promise<RegisterResponse> {
        try {
            const response = await post<RegisterRequest>("/auth/register", registerData)


            return {
                success: true,
                message: response.message || null,
                error: ''
            }
        } catch (error) {
            console.error("Registration error:", error)
            return {
                success: false,
                message: null,
                error: error instanceof Error ? error.message : "Đăng ký thất bại. Vui lòng thử lại sau.",
            }
        }
    }

    /**
     * Đăng nhập
     * @param email Email người dùng
     * @param password Mật khẩu
     * @returns Promise với kết quả đăng nhập
     */
    public async login(email: string, password: string): Promise<LoginResponse> {
        try {
            // Gọi API đăng nhập
            const response = await post<LoginResponse, { email: string; password: string }>("/api/auth/login", {
                email,
                password,
            })

            // Nếu đăng nhập thành công và có token, lưu token vào localStorage
            if (response.success && response.result.token) {
                localStorage.setItem("auth_token", response.result.token)
            }

            return response.result
        } catch (error) {
            console.error("Login error:", error)
            return {
                success: false,
                message: error instanceof Error ? error.message : "Đăng nhập thất bại. Vui lòng thử lại sau.",
            }
        }
    }

    /**
     * Đăng xuất
     */
    public logout(): void {
        // Xóa token khỏi localStorage
        localStorage.removeItem("auth_token")
    }

    /**
     * Kiểm tra xem người dùng đã đăng nhập hay chưa
     * @returns true nếu đã đăng nhập, false nếu chưa
     */
    public isAuthenticated(): boolean {
        return !!localStorage.getItem("auth_token")
    }

    /**
     * Lấy token xác thực
     * @returns Token xác thực hoặc null nếu chưa đăng nhập
     */
    public getToken(): string | null {
        return localStorage.getItem("auth_token")
    }
}

export default AuthService.getInstance()

