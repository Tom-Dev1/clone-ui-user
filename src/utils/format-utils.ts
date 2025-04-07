// Utility functions for formatting
export const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    })
}

export const formatNumber = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num)
}

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount)
}

