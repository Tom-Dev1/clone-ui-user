export const getToken = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("auth_token")
    }
    return null
}

// Fetch with authentication
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = getToken()
    if (!token) {
        throw new Error("Authentication token not found")
    }

    const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
    }

    const response = await fetch(url, {
        ...options,
        headers,
    })

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
    }

    return response.json()
}