"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"

// Define user type
interface User {
    id: string
    name: string
    email: string
    role: string
}

// Define auth context type
interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (email: string, password: string) => Promise<void>
    register: (name: string, email: string, password: string) => Promise<void>
    logout: () => Promise<void>
}

// Create auth context with default values
const AuthContext = createContext<AuthContextType>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    login: async () => { },
    register: async () => { },
    logout: async () => { },
})

// Auth provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Check if user is logged in on initial load
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // In a real app, you would check with your API
                const storedUser = localStorage.getItem("user")
                if (storedUser) {
                    setUser(JSON.parse(storedUser))
                }
            } catch (error) {
                console.error("Failed to check authentication:", error)
            } finally {
                setIsLoading(false)
            }
        }

        checkAuth()
    }, [])

    // Login function
    const login = async (email: string,) => {
        setIsLoading(true)
        try {
            // In a real app, you would call your API
            // This is just a mock implementation
            const mockUser: User = {
                id: "1",
                name: "Test User",
                email,
                role: "user",
            }

            setUser(mockUser)
            localStorage.setItem("user", JSON.stringify(mockUser))
        } catch (error) {
            console.error("Login failed:", error)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    // Register function
    const register = async (name: string, email: string) => {
        setIsLoading(true)
        try {
            // In a real app, you would call your API
            // This is just a mock implementation
            const mockUser: User = {
                id: "1",
                name,
                email,
                role: "user",
            }

            setUser(mockUser)
            localStorage.setItem("user", JSON.stringify(mockUser))
        } catch (error) {
            console.error("Registration failed:", error)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    // Logout function
    const logout = async () => {
        setIsLoading(true)
        try {
            // In a real app, you would call your API
            setUser(null)
            localStorage.removeItem("user")
        } catch (error) {
            console.error("Logout failed:", error)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext)

