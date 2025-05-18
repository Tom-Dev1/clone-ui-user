"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
  MessageSquare,
  Send,
  ImageIcon,
  X,
  Loader2,
  Images,
} from "lucide-react";
import * as signalR from "@microsoft/signalr";
import { SalesLayout } from "@/layouts/sale-layout";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Updated types for the new API response format
interface Member {
  userId: string;
  name: string;
}

interface ChatRoom {
  chatRoomId: string;
  roomName: string;
  createdAt: string;
  memberCount: number;
  lastMessage: string;
  lastUserName: string;
  lastTimestamp: string;
  members: Member[];
}

interface ChatMessage {
  chatMessageId: string;
  chatRoomId: string;
  senderId: string;
  senderName: string;
  messageText: string;
  timestamp: string;
  isRead: boolean;
  fileUrl?: string;
  imageUrls?: string[];
}

interface FilePreview {
  file: File;
  previewUrl: string;
}
interface DateGroup {
  date: Date;
  messages: ChatMessage[];
}

export default function ChatPage() {
  // Kiểm tra GUID hợp lệ
  const validateGuid = (guid: string) => {
    const regex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return regex.test(guid);
  };
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageInput, setMessageInput] = useState("");
  const [userId, setUserId] = useState<string>("");
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");
  const [selectedFiles, setSelectedFiles] = useState<FilePreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  // Add a ref to track pending message IDs
  const pendingMessageIds = useRef<Set<string>>(new Set());
  const [lightbox, setLightbox] = useState<{
    isOpen: boolean;
    currentImageIndex: number;
    images: string[];
    messageId: string;
  }>({
    isOpen: false,
    currentImageIndex: 0,
    images: [],
    messageId: "",
  });

  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const globalConnectionRef = useRef<signalR.HubConnection | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const name = localStorage.getItem("name");
  // Fetch chat rooms on component mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const authToken = localStorage.getItem("auth_token");
        const userId = localStorage.getItem("id");

        if (userId) {
          setUserId(userId);
        }

        const response = await fetch(
          "https://minhlong.mlhr.org/api/chat/rooms",
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch chat rooms");
        }

        const data = await response.json();
        setRooms(data);
        setLoading(false);

        // Auto-select the first room if available
        if (data.length > 0 && !selectedRoom) {
          setSelectedRoom(data[0].chatRoomId);
        }
      } catch (error) {
        console.error("Error fetching chat rooms:", error);
        setLoading(false);
      }
    };

    fetchRooms();

    // Set up global SignalR connection for background message receiving
    setupGlobalSignalR();

    return () => {
      if (globalConnectionRef.current) {
        globalConnectionRef.current.stop();
        globalConnectionRef.current = null;
      }
    };
  }, [selectedRoom]);

  // Setup global SignalR connection for background notifications
  const setupGlobalSignalR = async () => {
    try {
      const authToken = localStorage.getItem("auth_token");
      const userId = localStorage.getItem("id");

      if (!authToken || !userId) {
        console.error("Authentication token or user ID not found");
        return;
      }

      if (!validateGuid(userId)) {
        console.error("Invalid GUID format for user ID");
        return;
      }

      // Create SignalR connection
      const connection = new signalR.HubConnectionBuilder()
        .withUrl("https://minhlong.mlhr.org/chatHub", {
          accessTokenFactory: () => authToken,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000])
        .build();

      // Set up message receiving
      connection.on("ReceiveMessage", (msg) => {
        if (msg.senderId === localStorage.getItem("id")) return;
        // If the message is for the current chat room, update messages
        if (msg.chatRoomId === selectedRoom) {
          console.log(
            "Global connection received message for current room:",
            msg
          );

          // Check if this is a response to our own message
          if (msg.senderId === userId) {
            // If we have a pending message with similar content, don't add it again
            if (isPendingMessage(msg)) {
              console.log(
                "Skipping duplicate message from global connection",
                msg
              );
              return;
            }
          }
        }

        // Update the rooms list to reflect the new message
        updateRoomWithNewMessage(msg);
      });

      // Start connection
      await connection.start();
      console.log("✅ Connected to Global SignalR");

      // Store connection in ref
      globalConnectionRef.current = connection;

      // Join all rooms
      const response = await fetch("https://minhlong.mlhr.org/api/chat/rooms", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const rooms = await response.json();
        for (const room of rooms) {
          await connection.invoke("JoinRoom", room.chatRoomId);
          console.log(`Joined room globally: ${room.chatRoomId}`);
        }
      }
    } catch (error) {
      console.error("Global SignalR connection failed:", error);
    }
  };

  // Check if a message is a duplicate of a pending message
  const isPendingMessage = (msg: any): boolean => {
    // If we don't have any pending messages, it's not a duplicate
    if (pendingMessageIds.current.size === 0) return false;

    // Check if this message has similar content to any pending message
    const isSimilar = Array.from(pendingMessageIds.current).some((id) => {
      const pendingMsg = messages.find((m) => m.chatMessageId === id);
      if (!pendingMsg) return false;

      // Compare message content
      const sameText = pendingMsg.messageText === msg.messageText;
      const sameType =
        (pendingMsg.imageUrls &&
          pendingMsg.imageUrls.length > 0 &&
          msg.imageUrls &&
          msg.imageUrls.length > 0) ||
        (pendingMsg.fileUrl && msg.fileUrl);

      return sameText && sameType;
    });

    if (isSimilar) {
      // Remove the pending message ID since we've received the server response
      const pendingIds = Array.from(pendingMessageIds.current);
      if (pendingIds.length > 0) {
        pendingMessageIds.current.delete(pendingIds[0]);
      }
    }

    return isSimilar;
  };

  // Update room list when a new message is received
  const updateRoomWithNewMessage = (message: any) => {
    setRooms((prevRooms) => {
      // Find the room that received the message
      const updatedRooms = prevRooms.map((room) => {
        if (room.chatRoomId === message.chatRoomId) {
          // Update the room with the new message info
          return {
            ...room,
            lastMessage:
              message.messageText ||
              (message.fileUrl ? "Đã gửi một hình ảnh" : ""),
            lastTimestamp: message.timestamp,
          };
        }
        return room;
      });

      // Sort rooms by most recent message
      return updatedRooms.sort(
        (a, b) =>
          new Date(b.lastTimestamp).getTime() -
          new Date(a.lastTimestamp).getTime()
      );
    });
  };

  // Fetch messages when a room is selected
  useEffect(() => {
    if (!selectedRoom) return;

    const fetchMessages = async () => {
      try {
        const authToken = localStorage.getItem("auth_token");

        const response = await fetch(
          `https://minhlong.mlhr.org/api/chat/rooms/${selectedRoom}/messages?skip=0&take=2000`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }

        const data = await response.json();
        setMessages(data);

        // Clear pending messages when changing rooms
        pendingMessageIds.current.clear();

        // Scroll to bottom after messages load
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    // Connect to SignalR and join the room
    connectToSignalR(selectedRoom);

    // Cleanup function to disconnect when component unmounts or room changes
    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
        connectionRef.current = null;
        setConnectionStatus("disconnected");
      }
    };
  }, [selectedRoom]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      selectedFiles.forEach((filePreview) => {
        URL.revokeObjectURL(filePreview.previewUrl);
      });
    };
  }, [selectedFiles]);

  // Add this new useEffect after the other useEffects
  // This effect ensures that when selectedRoom changes, we update our message handler
  useEffect(() => {
    if (!globalConnectionRef.current || !selectedRoom) return;

    // Re-register the message handler when selectedRoom changes
    const handleMessage = (msg: any) => {
      if (msg.chatRoomId === selectedRoom) {
        console.log("Handling message for room:", selectedRoom, msg);

        // Check if this is a response to our own message
        if (msg.senderId === userId) {
          // If we have a pending message with similar content, don't add it again
          if (isPendingMessage(msg)) {
            console.log("Skipping duplicate message from room connection", msg);
            return;
          }
        }

        // Force scroll to bottom
        setTimeout(scrollToBottom, 100);
      }
    };

    // Remove previous handler and add new one
    globalConnectionRef.current.off("ReceiveMessage");
    globalConnectionRef.current.on("ReceiveMessage", handleMessage);

    return () => {
      if (globalConnectionRef.current) {
        globalConnectionRef.current.off("ReceiveMessage", handleMessage);
      }
    };
  }, [selectedRoom, userId]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Connect to SignalR
  const connectToSignalR = async (roomId: string) => {
    try {
      setConnectionStatus("connecting");
      const authToken = localStorage.getItem("auth_token");
      const userId = localStorage.getItem("id");

      if (!authToken || !userId) {
        throw new Error("Authentication token or user ID not found");
      }

      if (!validateGuid(userId) || !validateGuid(roomId)) {
        throw new Error("Invalid GUID format for user ID or room ID");
      }

      // Create SignalR connection
      const connection = new signalR.HubConnectionBuilder()
        .withUrl("https://minhlong.mlhr.org/chatHub", {
          accessTokenFactory: () => authToken,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000])
        .build();

      // Set up message receiving
      connection.on("ReceiveMessage", (msg) => {
        if (msg.senderId === userId) return; // bỏ qua tin của chính mình
        if (msg.chatRoomId !== roomId) return; // chỉ handle room đang mở

        // debug xem server gửi về cái gì
        console.log("Incoming message", msg);

        // Gom mọi link ảnh vào 1 mảng
        const imgs: string[] = [
          ...(Array.isArray(msg.images) ? msg.images : []),
          ...(Array.isArray(msg.imageUrls) ? msg.imageUrls : []),
        ];

        // nếu không có images từ server mà có fileUrl (kiểm tra extension) thì thêm fileUrl vào
        if (imgs.length === 0 && msg.fileUrl && isImageUrl(msg.fileUrl)) {
          imgs.push(msg.fileUrl);
        }

        setMessages((prev) => [
          ...prev,
          {
            chatMessageId: msg.chatMessageId || Date.now().toString(),
            chatRoomId: msg.chatRoomId,
            senderId: msg.senderId,
            senderName: msg.senderName,
            messageText: msg.messageText,
            timestamp: msg.timestamp,
            isRead: false,
            imageUrls: imgs, // chỉ dùng duy nhất field này
          },
        ]);

        updateRoomWithNewMessage(msg);
        scrollToBottom();
      });

      // Start connection
      await connection.start();
      console.log("✅ Connected to SignalR");

      // Join the room
      await connection.invoke("JoinRoom", roomId);
      console.log(`Joined room: ${roomId}`);

      // Store connection in ref
      connectionRef.current = connection;
      setConnectionStatus("connected");
    } catch (error) {
      console.error("SignalR connection failed:", error);
      setConnectionStatus("disconnected");
    }
  };

  // Get the other member's name from the room
  const getOtherMemberName = (room: ChatRoom) => {
    if (!userId || !room.members) return room.roomName;

    // Find the other member (not the current user)
    const otherMember = room.members.find((member) => member.userId !== userId);

    // Return the other member's name or a fallback
    return otherMember ? otherMember.name : room.roomName;
  };

  // Group messages by date
  const groupMessagesByDate = (messages: ChatMessage[]): DateGroup[] => {
    const groups: Record<string, DateGroup> = {};

    messages.forEach((msg) => {
      // parseISO hiểu ISO với bất cứ bao nhiêu chữ số thập phân
      const d = parseISO(msg.timestamp);
      const key = d.toISOString().slice(0, 10); // "YYYY-MM-DD"
      if (!groups[key]) groups[key] = { date: d, messages: [] };
      groups[key].messages.push(msg);
    });

    return Object.values(groups);
  };
  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles: FilePreview[] = [];

      Array.from(e.target.files).forEach((file) => {
        // Check if file is an image
        if (!file.type.startsWith("image/")) {
          alert("Vui lòng chỉ chọn các tệp hình ảnh");
          return;
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`Tệp ${file.name} vượt quá kích thước tối đa 5MB`);
          return;
        }

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        newFiles.push({ file, previewUrl });
      });

      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  // Remove a specific file
  const removeFile = (index: number) => {
    setSelectedFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].previewUrl);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  // Clear all selected files
  const clearAllFiles = () => {
    selectedFiles.forEach((filePreview) => {
      URL.revokeObjectURL(filePreview.previewUrl);
    });
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Upload multiple files and send message
  const uploadFilesAndSendMessage = async () => {
    if (selectedFiles.length === 0 || !selectedRoom || !connectionRef.current)
      return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const authToken = localStorage.getItem("auth_token");
      const userId = localStorage.getItem("id");

      if (!authToken || !userId) {
        throw new Error("Authentication token or user ID not found");
      }

      const fileUrls: string[] = [];
      const publicIds: string[] = [];

      // Upload each file
      for (let i = 0; i < selectedFiles.length; i++) {
        const filePreview = selectedFiles[i];

        // Create form data
        const formData = new FormData();
        formData.append("files", filePreview.file);

        // Upload file to server
        const response = await fetch(
          "https://minhlong.mlhr.org/api/chat/upload",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to upload file ${filePreview.file.name}`);
        }

        const uploadResult = await response.json();
        if (Array.isArray(uploadResult)) {
          fileUrls.push(...uploadResult.map((x) => x.imageUrl));
          publicIds.push(...uploadResult.map((x) => x.publicId));
        } else {
          fileUrls.push(uploadResult.url || uploadResult.imageUrl);
          if (uploadResult.publicId) {
            publicIds.push(uploadResult.publicId);
          }
        }

        // Update progress
        setUploadProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
      }

      // Create a temporary message ID
      const tempMessageId = Date.now().toString();

      // Add to pending messages
      pendingMessageIds.current.add(tempMessageId);

      // Add the message to the local state immediately for instant feedback
      const newMessage = {
        chatMessageId: tempMessageId,
        chatRoomId: selectedRoom,
        senderId: userId,
        senderName: "You", // This will be replaced when the server confirms
        messageText: messageInput || "Đã gửi một hình ảnh",
        timestamp: new Date().toISOString(),
        isRead: false,
        imageUrls: fileUrls,
      };

      // Update messages state immediately
      setMessages((prev) => [...prev, newMessage]);

      // Scroll to bottom to show the new message
      setTimeout(scrollToBottom, 50);

      // Send message with all file URLs
      await connectionRef.current.invoke(
        "SendMessage",
        selectedRoom,
        userId,
        messageInput || "Đã gửi một hình ảnh",
        fileUrls,
        publicIds
      );

      // Clear message input and selected files
      setMessageInput("");
      clearAllFiles();
      setUploadProgress(0);

      console.log("✅ Files uploaded and messages sent", fileUrls);
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Không thể tải lên tệp. Vui lòng thử lại sau.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle sending a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    // If there are files selected, upload them and send messages
    if (selectedFiles.length > 0) {
      await uploadFilesAndSendMessage();
      return;
    }

    // Otherwise just send a text message
    if (!messageInput.trim() || !selectedRoom || !connectionRef.current) return;

    try {
      const userId = localStorage.getItem("id");

      if (!userId) {
        throw new Error("User ID not found");
      }

      if (!validateGuid(userId) || !validateGuid(selectedRoom)) {
        throw new Error("Invalid GUID format for user ID or room ID");
      }

      // Create a temporary message ID
      const tempMessageId = Date.now().toString();

      // Add to pending messages
      pendingMessageIds.current.add(tempMessageId);

      // Create a temporary message for immediate feedback
      const tempMessage = {
        chatMessageId: tempMessageId,
        chatRoomId: selectedRoom,
        senderId: userId,
        senderName: "You", // Will be replaced by server response
        messageText: messageInput,
        timestamp: new Date().toISOString(),
        isRead: false,
      };

      // Add to messages immediately
      setMessages((prev) => [...prev, tempMessage]);

      // Clear input field
      setMessageInput("");

      // Scroll to bottom
      setTimeout(scrollToBottom, 50);

      // Send message via SignalR
      await connectionRef.current.invoke(
        "SendMessage",
        selectedRoom,
        userId,
        messageInput,
        [], // Empty array for fileUrls
        [] // Empty array for publicIds
      );

      console.log("✅ Message sent");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Get the selected room
  const selectedRoomData = selectedRoom
    ? rooms.find((r) => r.chatRoomId === selectedRoom)
    : null;

  // Get the other member's name for the selected room
  const otherMemberName = selectedRoomData
    ? getOtherMemberName(selectedRoomData)
    : "";

  const groupedMessages = groupMessagesByDate(messages);

  // Determine if a message contains an image
  const isImageUrl = (url: string | undefined) => {
    if (!url) return false;
    return url.match(/\.(jpeg|jpg|gif|png)$/) !== null;
  };

  return (
    <SalesLayout>
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar with chat rooms */}
        <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col h-full">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold">Tin nhắn</h2>
            <div className="flex items-center mt-1">
              <div
                className={cn(
                  "w-2 h-2 rounded-full mr-2",
                  connectionStatus === "connected"
                    ? "bg-green-500"
                    : connectionStatus === "connecting"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                )}
              ></div>
              <span
                className={cn(
                  "text-xs",
                  connectionStatus === "connected"
                    ? "text-green-500"
                    : connectionStatus === "connecting"
                    ? "text-yellow-500"
                    : "text-red-500"
                )}
              >
                {connectionStatus === "connected"
                  ? "Đã kết nối"
                  : connectionStatus === "connecting"
                  ? "Đang kết nối..."
                  : "Mất kết nối"}
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <p>Đang tải...</p>
              </div>
            ) : (
              <div>
                {rooms.map((room) => (
                  <div
                    key={room.chatRoomId}
                    className={cn(
                      "p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-150 border-l-4",
                      selectedRoom === room.chatRoomId
                        ? "border-red-500 bg-red-50"
                        : "border-transparent"
                    )}
                    onClick={() => setSelectedRoom(room.chatRoomId)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium truncate">
                            {getOtherMemberName(room)}
                          </h3>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                            {formatDistanceToNow(new Date(room.lastTimestamp), {
                              addSuffix: true,
                              locale: vi,
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate mt-1">
                          {room.lastUserName === name
                            ? "Bạn"
                            : room.lastUserName}
                          : {room.lastMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col h-full bg-gray-50">
          {selectedRoom ? (
            <>
              <div className="p-4 border-b bg-white shadow-sm flex items-center">
                <div>
                  <h2 className="text-lg font-bold">{otherMemberName}</h2>
                </div>
              </div>
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
              >
                {groupedMessages.map((group, groupIndex) => (
                  <div key={groupIndex} className="mb-6">
                    <div className="flex justify-center mb-4">
                      <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                        {group.date.toLocaleDateString("vi-VN", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                    <div className="space-y-4">
                      {group.messages.map((message) => (
                        <div
                          key={message.chatMessageId}
                          className={`flex ${
                            message.senderId === userId
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={cn(
                              "max-w-[70%] p-3 rounded-lg shadow-sm",
                              message.senderId === userId
                                ? "bg-red-500 text-white rounded-br-none"
                                : "bg-white text-gray-800 rounded-bl-none"
                            )}
                          >
                            {message.messageText && (
                              <p className="whitespace-pre-wrap break-words">
                                {message.messageText}
                              </p>
                            )}

                            {(() => {
                              // Gom chung imageUrls + fileUrl thành 1 mảng
                              const imgs: string[] = [
                                ...(message.imageUrls ?? []),
                                ...(message.fileUrl ? [message.fileUrl] : []),
                              ];

                              if (imgs.length === 0) return null;

                              return (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {imgs.map((url, i) => (
                                    <img
                                      key={`${message.chatMessageId}-img-${i}`}
                                      src={url || "/placeholder.svg"}
                                      alt="Shared image"
                                      className="max-w-[200px] h-auto object-contain rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setLightbox({
                                          isOpen: true,
                                          currentImageIndex: i,
                                          images: imgs,
                                          messageId: message.chatMessageId,
                                        });
                                      }}
                                    />
                                  ))}
                                </div>
                              );
                            })()}

                            {message.fileUrl &&
                              !isImageUrl(message.fileUrl) && (
                                <div className="mt-2">
                                  <a
                                    href={message.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cn(
                                      "text-xs underline flex items-center",
                                      message.senderId === userId
                                        ? "text-white"
                                        : "text-blue-500"
                                    )}
                                  >
                                    <ImageIcon className="h-4 w-4 mr-1" />
                                    Tải xuống tệp
                                  </a>
                                </div>
                              )}

                            <p className="text-xs mt-1 opacity-70 text-right">
                              {new Date(message.timestamp).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* File preview area */}
              {selectedFiles.length > 0 && (
                <div className="p-3 bg-gray-100 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600 font-medium">
                      Đã chọn {selectedFiles.length} hình ảnh
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFiles}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                    >
                      Xóa tất cả
                    </Button>
                  </div>

                  {isUploading && uploadProgress > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                      <div
                        className="bg-red-500 h-2.5 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {selectedFiles.map((filePreview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={filePreview.previewUrl || "/placeholder.svg"}
                          alt={`Preview ${index + 1}`}
                          className="h-20 w-auto rounded-md border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Message input area */}
              <div className="p-4 bg-white border-t shadow-inner">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                    multiple
                    disabled={connectionStatus !== "connected" || isUploading}
                  />

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          className="bg-gray-50 border-gray-200 hover:bg-gray-100"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={
                            connectionStatus !== "connected" || isUploading
                          }
                        >
                          <Images className="h-4 w-4 text-gray-500" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Gửi nhiều hình ảnh</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Viết tin nhắn..."
                    className="flex-1 bg-gray-50 border-gray-200 focus:ring-red-500 focus:border-red-500"
                    disabled={connectionStatus !== "connected" || isUploading}
                  />

                  <Button
                    type="submit"
                    size="icon"
                    className="bg-red-500 hover:bg-red-600"
                    disabled={
                      connectionStatus !== "connected" ||
                      isUploading ||
                      (!messageInput.trim() && selectedFiles.length === 0)
                    }
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <div className="bg-red-100 p-6 rounded-full mb-4">
                <MessageSquare className="h-16 w-16 text-red-500" />
              </div>
              <h3 className="text-xl font-medium">Chọn một cuộc trò chuyện</h3>
              <p className="mt-2 text-gray-400">
                Vui lòng chọn từ các cuộc trò chuyện hiện tại của bạn
              </p>
            </div>
          )}
        </div>
      </div>
      {lightbox.isOpen && (
        <div
          className="fixed inset-0 bg-white bg-opacity-95 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox((prev) => ({ ...prev, isOpen: false }))}
        >
          <div className="relative max-w-4xl w-full bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="absolute top-4 right-4 z-10">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-white hover:bg-gray-100 border-gray-200"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox((prev) => ({ ...prev, isOpen: false }));
                }}
              >
                <X className="h-4 w-4 text-gray-500" />
              </Button>
            </div>

            <div className="p-4 flex items-center justify-center">
              <img
                src={
                  lightbox.images[lightbox.currentImageIndex] ||
                  "/placeholder.svg"
                }
                alt="Enlarged view"
                className="max-h-[80vh] max-w-full object-contain rounded-md"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Navigation controls */}
            {lightbox.images.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {lightbox.images.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === lightbox.currentImageIndex
                        ? "bg-red-500"
                        : "bg-gray-300"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightbox((prev) => ({
                        ...prev,
                        currentImageIndex: index,
                      }));
                    }}
                  />
                ))}
              </div>
            )}

            {/* Left/Right navigation arrows */}
            {lightbox.images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightbox((prev) => ({
                      ...prev,
                      currentImageIndex:
                        (prev.currentImageIndex - 1 + prev.images.length) %
                        prev.images.length,
                    }));
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightbox((prev) => ({
                      ...prev,
                      currentImageIndex:
                        (prev.currentImageIndex + 1) % prev.images.length,
                    }));
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </SalesLayout>
  );
}
