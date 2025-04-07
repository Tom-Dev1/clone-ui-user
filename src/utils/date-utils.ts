export const formatDate = (dateString: string) => {
    try {
        const date = new Date(dateString)
        return date.toLocaleDateString("vi-VN") + " "
    } catch (error) {
        console.log("Error formatting date:", error)
        return dateString
    }
}