"use client"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"

export function Dashboard() {
    const { user, userDetails, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    console.log(user?.id, user?.email);

    return (
        <div className="container mx-auto py-8">
            <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

                <div className="mb-6 p-4 bg-gray-50 rounded-md">
                    <h2 className="text-lg font-semibold mb-3">User Information</h2>
                    <div className="space-y-2">
                        <p>
                            <span className="font-medium">ID:</span> {user?.id}
                        </p>
                        <p>
                            <span className="font-medium">Username:</span> {user?.username}
                        </p>
                        <p>
                            <span className="font-medium">Email:</span> {user?.email}
                        </p>
                        <p>
                            <span className="font-medium">Role:</span> {user?.role}
                        </p>
                    </div>
                </div>

                {userDetails && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-md">
                        <h2 className="text-lg font-semibold mb-3">Additional User Details</h2>
                        <div className="space-y-2">
                            <p>
                                <span className="font-medium">User Type:</span> {userDetails.userType}
                            </p>
                            <p>
                                <span className="font-medium">Phone:</span> {userDetails.phone}
                            </p>
                            <p>
                                <span className="font-medium">Status:</span> {userDetails.status ? "Active" : "Inactive"}
                            </p>
                            <p>
                                <span className="font-medium">Email Verified:</span> {userDetails.verifyEmail ? "Yes" : "No"}
                            </p>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 focus:outline-none"
                >
                    Logout
                </button>
            </div>
        </div>
    )
}

