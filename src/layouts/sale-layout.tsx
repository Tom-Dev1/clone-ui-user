import type React from "react";
import { type ReactNode, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { UserAvatar } from "@/components/user-avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Menu,
  Home,
  LayoutDashboard,
  Package,
  FileText,
  User,
  LogOut,
  CreditCard,
  CheckCheck,
  MessageCircleMore,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationPopover } from "@/components/notification-popover";
import { connection } from "@/lib/signalr-client";

interface SalesLayoutProps {
  children: ReactNode;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

interface UnreadCountResponse {
  unreadCount: number;
}

export function SalesLayout({ children }: SalesLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { logout } = useAuth();
  const nameDis = localStorage.getItem('name')
  // Fetch unread messages count
  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        "https://minhlong.mlhr.org/api/chat/chat/unread-count",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data: UnreadCountResponse = await response.json();
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  useEffect(() => {
    if (isDesktop) {
      setOpen(false);
    }
  }, [isDesktop]);

  useEffect(() => {
    // Fetch initial unread count
    fetchUnreadCount();

    // Setup SignalR connection
    const startConnection = async () => {
      try {
        // Listen for MessagesRead event
        connection.on("MessagesRead", () => {
          fetchUnreadCount(); // Refetch unread count when messages are read
        });

        // You might also want to listen for new message events
        connection.on("NewMessage", () => {
          fetchUnreadCount(); // Refetch when new messages arrive
        });
      } catch (error) {
        console.error("Error starting SignalR connection:", error);
      }
    };

    startConnection();

    // Cleanup
    return () => {
      connection.off("MessagesRead");
      connection.off("NewMessage");
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const navItems: NavItem[] = [
    {
      title: "Tổng quan",
      href: "/sales/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Yêu cầu xuất kho",
      href: "/sales/export",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "Duyệt trả hàng",
      href: "/sales/review-order",
      icon: <CheckCheck className="h-5 w-5" />,
    },
    {
      title: "Sản phẩm",
      href: "/sales/product",
      icon: <Package className="h-5 w-5" />,
    },
    {
      title: "Quản lý đại lý",
      href: "/sales/customer",
      icon: <User className="h-5 w-5" />,
    },
    {
      title: "Cấp đại lý",
      href: "/sales/level",
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      title: "Tin nhắn",
      href: "/sales/messages",
      icon: <MessageCircleMore className="h-5 w-5" />,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      title: "Hồ sơ cá nhân",
      href: "/sales/profile",
      icon: <User className="h-5 w-5" />,
    },
  ];

  const NavItemComponent = ({
    item,
    onClick,
  }: {
    item: NavItem;
    onClick?: () => void;
  }) => (
    <Link
      key={item.href}
      to={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors relative",
        isActive(item.href)
          ? "bg-red-600 text-white"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      {item.icon}
      {item.title}
      {item.badge && item.badge > 0 && (
        <span className="absolute -top-1 left-6 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
          {item.badge > 99 ? "99+" : item.badge}
        </span>
      )}
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {!isDesktop && (
                <Sheet open={open} onOpenChange={setOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="lg:hidden mr-2"
                    >
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-[280px]">
                    <div className="p-6 border-b">
                      <Link
                        to="/sales/dashboard"
                        className="text-xl font-bold flex items-center"
                        onClick={() => setOpen(false)}
                      >
                        Dashboard
                      </Link>
                    </div>
                    <ScrollArea className="h-[calc(100vh-81px)]">
                      <div className="py-4">
                        <nav className="px-2 space-y-1">
                          {navItems.map((item) => (
                            <NavItemComponent
                              key={item.href}
                              item={item}
                              onClick={() => setOpen(false)}
                            />
                          ))}
                        </nav>
                        <Separator className="my-4" />
                        <div className="px-3">
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={handleLogout}
                          >
                            <LogOut className="mr-2 h-5 w-5" />
                            Đăng xuất
                          </Button>
                        </div>
                      </div>
                    </ScrollArea>
                  </SheetContent>
                </Sheet>
              )}
              <Link to="/" className="text-xl font-bold flex items-center">
                <Home className="h-5 w-5" />
                <span className="ml-5 ">Trang chủ</span>
              </Link>
            </div>

            <div className="flex items-center">
              <NotificationPopover />
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700 hidden md:inline-block">
                  Xin chào quản lý,{" "}
                  <span className="font-medium">
                    {nameDis || "Quản lý"}
                  </span>
                </span>
                <UserAvatar size="sm" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="ml-4 text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 bg-white shadow-sm h-[calc(100vh-4rem)] sticky top-16 border-r">
          <ScrollArea className="h-full">
            <nav className="p-4 space-y-1">
              {navItems.map((item) => (
                <NavItemComponent key={item.href} item={item} />
              ))}
            </nav>
          </ScrollArea>
        </aside>

        {/* Main content */}
        <main className="flex-1 bg-white">{children}</main>
      </div>
    </div>
  );
}
