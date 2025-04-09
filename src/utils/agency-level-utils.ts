// Format currency
export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
    }).format(amount)
}

// Get level color based on level name
export const getLevelColor = (levelName: string) => {
    if (levelName.includes("Kim Cương")) return "bg-blue-100 text-blue-800 border-blue-200"
    if (levelName.includes("Vàng")) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    if (levelName.includes("Bạc")) return "bg-gray-100 text-gray-800 border-gray-200"
    if (levelName.includes("Đồng")) return "bg-amber-100 text-amber-800 border-amber-200"
    return "bg-green-100 text-green-800 border-green-200"
}
