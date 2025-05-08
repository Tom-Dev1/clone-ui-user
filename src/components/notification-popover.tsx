"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { fetchWithAuth } from "@/utils/api-utils"
import { getToken } from "@/utils/auth-utils"

// Define notification types
type NotificationType = "all" | "unread" | "read"

// Match the API response structure
interface Notification {
    notificationId: string
    userId: string
    title: string
    message: string
    url: string
    isRead: boolean
    createdAt: string
}

export function NotificationPopover() {
    const [open, setOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [activeTab, setActiveTab] = useState<NotificationType>("all")
    const [hasUnread, setHasUnread] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [authError, setAuthError] = useState<string | null>(null)


    // Check authentication
    useEffect(() => {
        const token = getToken()
        if (!token) {
            setAuthError("Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.")
            setLoading(false)
        }
    }, [])

    // Fetch notifications from API
    const fetchNotifications = async () => {
        if (authError) return

        try {
            setLoading(true)
            // Use the exact API endpoint provided
            const response = await fetchWithAuth(`https://minhlong.mlhr.org/api/Notification/my-notification`)

            setNotifications(response)

            // Check if there are any unread notifications
            setHasUnread(response.some((notification: Notification) => !notification.isRead))

            setError(null)
        } catch (err) {
            console.error("Error fetching notifications:", err)
            setError("Failed to load notifications. Please try again later.")
        } finally {
            setLoading(false)
        }
    }

    // Fetch notifications when component mounts or auth state changes
    useEffect(() => {
        fetchNotifications()
    }, [authError])

    // Mark notification as read in the API
    const markAsRead = async (notificationId: string) => {
        try {
            // Use the exact API endpoint provided for marking as read
            await fetchWithAuth(`https://minhlong.mlhr.org/api/Notification/mark-as-read/${notificationId}`, {
                method: "POST",
            })

            // Update local state
            setNotifications((prev) =>
                prev.map((notification) =>
                    notification.notificationId === notificationId ? { ...notification, isRead: true } : notification,
                ),
            )

            // Update hasUnread state
            const stillHasUnread = notifications.some(
                (notification) => notification.notificationId !== notificationId && !notification.isRead,
            )
            setHasUnread(stillHasUnread)
        } catch (err) {
            console.error("Error marking notification as read:", err)
            // Optionally show an error message to the user
        }
    }

    // Handle notification click - mark as read and navigate to URL if provided
    const handleNotificationClick = async (notification: Notification) => {
        // Mark as read if not already read
        if (!notification.isRead) {
            await markAsRead(notification.notificationId)
        }


    }

    // Filter notifications based on active tab
    const filteredNotifications = notifications.filter((notification) => {
        if (activeTab === "all") return true
        if (activeTab === "unread") return !notification.isRead
        if (activeTab === "read") return notification.isRead
        return true
    })

    // Format timestamp
    const formatTimestamp = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

        if (diffInSeconds < 60) return `${diffInSeconds} giây trước`
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`
        return `${Math.floor(diffInSeconds / 86400)} ngày trước`
    }

    // Refresh notifications when popover is opened
    useEffect(() => {
        if (open) {
            fetchNotifications()
        }
    }, [open])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {hasUnread && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />}
                    <span className="sr-only">Thông báo</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[380px] p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-medium">Thông báo</h3>
                </div>

                {error && <div className="p-4 text-sm text-red-500">{error}</div>}

                {authError && <div className="p-4 text-sm text-red-500">{authError}</div>}

                {loading && !error && !authError ? (
                    <div className="flex justify-center items-center p-8">
                        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                    </div>
                ) : (
                    <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as NotificationType)}>
                        <div className="border-b px-4">
                            <TabsList className="h-10 w-full justify-start rounded-none bg-transparent p-0">
                                <TabsTrigger
                                    value="all"
                                    className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                                >
                                    Tất cả
                                </TabsTrigger>
                                <TabsTrigger
                                    value="unread"
                                    className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                                >
                                    Chưa đọc
                                </TabsTrigger>
                                <TabsTrigger
                                    value="read"
                                    className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                                >
                                    Đã đọc
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="all" className="p-0">
                            <NotificationList
                                notifications={filteredNotifications}
                                formatTimestamp={formatTimestamp}
                                onNotificationClick={handleNotificationClick}
                            />
                        </TabsContent>

                        <TabsContent value="unread" className="p-0">
                            <NotificationList
                                notifications={filteredNotifications}
                                formatTimestamp={formatTimestamp}
                                onNotificationClick={handleNotificationClick}
                            />
                        </TabsContent>

                        <TabsContent value="read" className="p-0">
                            <NotificationList
                                notifications={filteredNotifications}
                                formatTimestamp={formatTimestamp}
                                onNotificationClick={handleNotificationClick}
                            />
                        </TabsContent>
                    </Tabs>
                )}
            </PopoverContent>
        </Popover>
    )
}

interface NotificationListProps {
    notifications: Notification[]
    formatTimestamp: (dateString: string) => string
    onNotificationClick: (notification: Notification) => void
}

function NotificationList({ notifications, formatTimestamp, onNotificationClick }: NotificationListProps) {
    if (notifications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <Bell className="h-10 w-10 text-muted-foreground mb-3 opacity-40" />
                <p className="text-sm text-muted-foreground">Không có thông báo nào</p>
            </div>
        )
    }

    return (
        <ScrollArea className="h-[300px]">
            <div className="divide-y">
                {notifications.map((notification) => (
                    <div
                        key={notification.notificationId}
                        className={cn(
                            "flex gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer",
                            !notification.isRead && "bg-muted/30",
                        )}
                        onClick={() => onNotificationClick(notification)}
                    >
                        <div className="w-2 flex-shrink-0">
                            {!notification.isRead && <div className="h-2 w-2 mt-2 rounded-full bg-blue-500" />}
                        </div>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-start justify-between">
                                <p className={cn("text-sm font-medium", !notification.isRead && "font-semibold")}>
                                    {notification.title}
                                </p>
                                <span className="text-xs text-muted-foreground">{formatTimestamp(notification.createdAt)}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    )
}
