import axios, {
    type AxiosInstance,
    type AxiosError,
    type AxiosResponse,
    type InternalAxiosRequestConfig
} from "axios"

// Get API URL from Vite environment variables
const apiUrl = import.meta.env.VITE_API_URL;

// Create Axios instance
const api: AxiosInstance = axios.create({
    baseURL: apiUrl,
    timeout: 10000, // Increased timeout to 10 seconds for more reliable API calls
    headers: {
        "Content-Type": "application/json",
    },
})

// Request interceptor
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Get token from localStorage
        const token = localStorage.getItem('auth_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    (error: AxiosError) => {
        return Promise.reject(error)
    },
)

// Response interceptor
api.interceptors.response.use(
    (response: AxiosResponse) => {
        // You can transform the response data here if needed
        return response
    },
    (error: AxiosError) => {
        // Handle response errors
        if (error.response) {
            console.error("Response error:", error.response.data)
            console.error("Status:", error.response.status)
            console.error("Headers:", error.response.headers)

            // Handle specific status codes
            if (error.response.status === 401) {
                // Handle unauthorized (e.g., redirect to login)
                localStorage.removeItem('auth_token')

                // Optionally redirect to login
                // window.location.href = '/login'
            }
        } else if (error.request) {
            // The request was made but no response was received
            console.error("Request error:", error.request)
        } else {
            console.error("Error:", error.message)
        }

        return Promise.reject(error)
    },
)

export default api
