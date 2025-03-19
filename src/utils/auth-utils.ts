import { UserRole } from "@/types/auth-type"

interface JwtPayload {
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": string
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": string
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": string
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string
    exp: number
}

interface UserInfo {
    id: string
    username: string
    email: string
    role: string
    roleName: string | null
    exp: number
}

/**
 * Giải mã JWT token
 * @param token JWT token cần giải mã
 * @returns Payload của token hoặc null nếu token không hợp lệ
 */
export function decodeToken(token: string): JwtPayload | null {
    try {
        const base64Url = token.split(".")[1]
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join(""),
        )

        return JSON.parse(jsonPayload)
    } catch (error) {
        console.error("Error decoding token:", error)
        return null
    }
}

/**
 * Kiểm tra xem người dùng đã đăng nhập hay chưa
 * @returns true nếu đã đăng nhập, false nếu chưa
 */
export function isAuthenticated(): boolean {
    return !!localStorage.getItem("auth_token")
}

/**
 * Lấy token xác thực
 * @returns Token xác thực hoặc null nếu chưa đăng nhập
 */
export function getToken(): string | null {
    return localStorage.getItem("auth_token")
}

/**
 * Lấy vai trò của người dùng
 * @returns Vai trò của người dùng hoặc null nếu chưa đăng nhập
 */
export function getUserRole(): string | null {
    const userInfo = getUserInfo()
    return userInfo ? userInfo.role : null
}

/**
 * Lấy tên vai trò của người dùng
 * @returns Tên vai trò của người dùng hoặc null nếu chưa đăng nhập
 */
export function getUserRoleName(): string | null {
    return localStorage.getItem("role_name")
}

/**
 * Lấy thông tin người dùng đã đăng nhập từ JWT token
 * @returns Thông tin người dùng hoặc null nếu chưa đăng nhập
 */
export function getUserInfo(): UserInfo | null {
    const token = getToken()
    if (!token) return null

    try {
        const payload = decodeToken(token)
        if (!payload) return null

        return {
            id: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
            username: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
            email: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"],
            role: payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
            roleName: localStorage.getItem("role_name"),
            exp: payload.exp,
        }
    } catch (error) {
        console.error("Error parsing user info:", error)
        return null
    }
}

/**
 * Kiểm tra xem token có hết hạn chưa
 * @returns true nếu token hết hạn, false nếu còn hạn
 */
export function isTokenExpired(): boolean {
    const userInfo = getUserInfo()
    if (!userInfo || !userInfo.exp) return true

    // Chuyển đổi thời gian hết hạn từ giây sang mili giây
    const expirationTime = userInfo.exp * 1000
    const currentTime = Date.now()

    return currentTime > expirationTime
}

/**
 * Đăng xuất người dùng
 */
export function logout(): void {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("role_name")
    localStorage.removeItem("user_info")
    // Không xóa remembered_username để giữ tính năng ghi nhớ đăng nhập
}

/**
 * Kiểm tra xem người dùng có quyền truy cập vào một trang cụ thể không
 * @param allowedRoles Danh sách các vai trò được phép truy cập
 * @returns true nếu có quyền, false nếu không
 */
export function hasPermission(allowedRoles: string[]): boolean {
    const role = getUserRole()
    return !!role && allowedRoles.includes(role)
}

/**
 * Kiểm tra xem người dùng có phải là quản lý bán hàng không
 * @returns true nếu là quản lý bán hàng, false nếu không
 */
export function isSalesManager(): boolean {
    const role = getUserRole()
    return role === UserRole.SALES_MANAGER
}

/**
 * Kiểm tra xem người dùng có phải là đại lý không
 * @returns true nếu là đại lý, false nếu không
 */
export function isAgency(): boolean {
    const role = getUserRole()
    return role === UserRole.AGENCY
}

/**
 * Get user's display name
 * @returns User's display name or a default value
 */
export function getUserDisplayName(): string {
    const userInfo = getUserInfo()
    if (!userInfo) return "Người dùng"

    // Try to get the most appropriate name field
    return userInfo.roleName || userInfo.username || userInfo.role || "Người dùng"
}

/**
 * Lấy header xác thực để gửi kèm request API
 * @returns Header xác thực hoặc object rỗng nếu chưa đăng nhập
 */
export function getAuthHeader(): Record<string, string> {
    const token = getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * Kiểm tra xác thực trước khi gọi API
 * @returns true nếu đã xác thực và token còn hạn, false nếu không
 */
export function checkAuthBeforeRequest(): boolean {
    if (!isAuthenticated()) {
        console.error("Bạn cần đăng nhập để thực hiện hành động này.")
        return false
    }

    if (isTokenExpired()) {
        console.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")
        logout()
        return false
    }

    return true
}

/**
 * Xử lý lỗi từ API
 * @param error Lỗi từ API
 */
interface ApiError {
    response?: {
        status: number;
        data?: { message?: string };
        statusText?: string;
    };
    request?: unknown;
    message?: string;
}

export function handleApiError(error: ApiError): void {
    if (error.response) {
        if (error.response.status === 401) {
            console.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")
            logout()
            // Chuyển hướng đến trang đăng nhập
            window.location.href = "/login"
        } else if (error.response.status === 403) {
            console.error("Bạn không có quyền thực hiện hành động này.")
        } else {
            console.error(`Lỗi ${error.response.status}: ${error.response.data?.message || error.response.statusText}`)
        }
    } else if (error.request) {
        console.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.")
    } else {
        console.error("Đã xảy ra lỗi:", error.message)
    }
}

/**
 * Kiểm tra quyền truy cập API
 * @param requiredRoles Danh sách các vai trò được phép truy cập
 * @returns true nếu có quyền, false nếu không
 */
export function checkApiPermission(requiredRoles: string[]): boolean {
    if (!checkAuthBeforeRequest()) {
        return false
    }

    if (!hasPermission(requiredRoles)) {
        console.error("Bạn không có quyền thực hiện hành động này.")
        return false
    }

    return true
}

/**
 * Thực hiện API call với kiểm tra quyền
 * @param requiredRoles Danh sách các vai trò được phép truy cập
 * @param apiCall Hàm gọi API
 * @returns Kết quả từ API hoặc null nếu không có quyền
 */
export async function withPermission<T>(requiredRoles: string[], apiCall: () => Promise<T>): Promise<T | null> {
    if (!checkApiPermission(requiredRoles)) {
        return null
    }

    try {
        return await apiCall()
    } catch (error) {
        handleApiError(error as ApiError)
        throw error
    }
}

