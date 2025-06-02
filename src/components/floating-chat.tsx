"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  X,
  Loader2,
  ImageIcon,
  Images,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import * as signalR from "@microsoft/signalr";
import { toast } from "sonner";

interface Manager {
  userId: string;
  fullName: string;
}

// Update the ChatMessage interface to better handle image arrays
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

export function FloatingChat() {
  // Kiểm tra GUID hợp lệ
  const validateGuid = (guid: string) => {
    const regex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return regex.test(guid);
  };

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [manager, setManager] = useState<Manager | null>(null);
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");
  const [selectedFiles, setSelectedFiles] = useState<FilePreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add pendingMessageIds ref to track pending messages
  const pendingMessageIds = useRef<Set<string>>(new Set());

  // Fetch manager info when component mounts
  useEffect(() => {
    if (isOpen && !manager) {
      fetchManagerInfo();
    }
  }, [isOpen, manager]);

  // Setup chat room when manager info is available
  useEffect(() => {
    if (manager && isOpen) {
      setupChatRoom();
    }
  }, [manager, isOpen]);

  // Cleanup connection when component unmounts or chat closes
  useEffect(() => {
    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
        connectionRef.current = null;
        setConnectionStatus("disconnected");
      }

      // Clear pending message IDs
      pendingMessageIds.current.clear();
    };
  }, []);

  // Scroll to bottom when new messages arrive or chat opens
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      selectedFiles.forEach((filePreview) => {
        URL.revokeObjectURL(filePreview.previewUrl);
      });
    };
  }, [selectedFiles]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Fetch manager information
  const fetchManagerInfo = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem("auth_token");
      if (!authToken) {
        toast.error("Bạn cần đăng nhập để trò chuyện");
        throw new Error("Authentication token not found");
      }
      const response = await fetch(
        "https://minhlong.mlhr.org/api/agency/manager-by",
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch manager info");
      }

      const data = await response.json();
      setManager(data);
    } catch (error) {
      console.error("Error fetching manager info:", error);
    } finally {
      setLoading(false);
    }
  };

  // Setup chat room - check if exists or create new one
  const setupChatRoom = async () => {
    if (!manager) return;

    try {
      setLoading(true);
      const authToken = localStorage.getItem("auth_token");
      const userId = localStorage.getItem("id");

      if (!userId) {
        throw new Error("User ID not found in localStorage");
      }

      if (!validateGuid(userId) || !validateGuid(manager.userId)) {
        throw new Error("Invalid GUID format for user ID or manager ID");
      }

      // Check for existing chat rooms
      const roomsResponse = await fetch(
        "https://minhlong.mlhr.org/api/chat/rooms",
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!roomsResponse.ok) {
        throw new Error("Failed to fetch chat rooms");
      }

      const rooms = await roomsResponse.json();

      // Find a room with the manager
      let room = rooms.find(
        (r: any) =>
          r.members && r.members.some((m: any) => m.userId === manager.userId)
      );

      // If no room exists, create one
      if (!room) {
        const createRoomResponse = await fetch(
          "https://minhlong.mlhr.org/api/chat/rooms",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              memberIds: [userId, manager.userId],
            }),
          }
        );

        if (!createRoomResponse.ok) {
          throw new Error("Failed to create chat room");
        }

        room = await createRoomResponse.json();
      }

      // Set the chat room ID
      setChatRoomId(room.chatRoomId);
      // Clear pending messages when changing rooms
      pendingMessageIds.current.clear();

      // Fetch messages for this room
      await fetchMessages(room.chatRoomId);

      // Connect to SignalR
      connectToSignalR(room.chatRoomId);
    } catch (error) {
      console.error("Error setting up chat room:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a chat room
  const fetchMessages = async (roomId: string) => {
    try {
      const authToken = localStorage.getItem("auth_token");

      const response = await fetch(
        `https://minhlong.mlhr.org/api/chat/rooms/${roomId}/messages?skip=0&take=200`,
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
    } catch (error) {
      console.error("Error fetching messages:", error);
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

      // Replace the ReceiveMessage handler in connectToSignalR with this improved version
      connection.on("ReceiveMessage", (msg: any) => {
        // nếu tin của chính mình, bỏ qua
        if (msg.senderId === localStorage.getItem("id")) return;

        // check duplicate
        if (
          msg.senderId === localStorage.getItem("id") &&
          isPendingMessage(msg)
        ) {
          return;
        }

        // gom chung: msg.images + msg.imageUrls + (fileUrl nếu đúng định dạng)
        const imgs: string[] = [
          ...(Array.isArray(msg.images) ? msg.images : []),
          ...(Array.isArray(msg.imageUrls) ? msg.imageUrls : []),
        ];
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
            // nếu chỉ gửi ảnh thì hide text
            messageText: imgs.length ? "" : msg.messageText,
            timestamp: msg.timestamp,
            isRead: false,
            imageUrls: imgs,
            fileUrl: imgs.length ? undefined : msg.fileUrl,
          },
        ]);

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

  // Add this function to check for pending messages
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

  // Update the uploadFilesAndSendMessage function to track pending messages
  const uploadFilesAndSendMessage = async () => {
    if (selectedFiles.length === 0 || !chatRoomId || !connectionRef.current)
      return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const authToken = localStorage.getItem("auth_token");
      const userId = localStorage.getItem("id");

      if (!userId || !validateGuid(userId) || !validateGuid(chatRoomId)) {
        throw new Error("Invalid user ID or chat room ID");
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
        chatRoomId: chatRoomId,
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
        chatRoomId,
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

  // Update the handleSendMessage function to track pending messages
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    // If there are files selected, upload them and send messages
    if (selectedFiles.length > 0) {
      await uploadFilesAndSendMessage();
      return;
    }

    if (!messageInput.trim() || !chatRoomId || !connectionRef.current) return;

    try {
      const userId = localStorage.getItem("id");

      if (!userId || !validateGuid(userId) || !validateGuid(chatRoomId)) {
        throw new Error("Invalid user ID or chat room ID");
      }

      // Create a temporary message ID
      const tempMessageId = Date.now().toString();

      // Add to pending messages
      pendingMessageIds.current.add(tempMessageId);

      // Create a temporary message for immediate feedback
      const tempMessage = {
        chatMessageId: tempMessageId,
        chatRoomId: chatRoomId,
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
        chatRoomId,
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

  // Determine if a message contains an image
  const isImageUrl = (url: string | undefined) => {
    if (!url) return false;
    return url.match(/\.(jpeg|jpg|gif|png)$/) !== null;
  };

  // Toggle chat open/closed
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Update the message rendering in the return statement to better handle images
  // Replace the message rendering part with this improved version
  return (
    <>
      {/* Floating chat button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-green-600 text-white rounded-full p-4 shadow-lg hover:bg-green-700 transition-colors z-50"
        aria-label="Chat with manager"
      >
        <MessageSquare className="h-6 w-6" />
      </button>

      {/* Chat window */}
      {isOpen && (
        <div
          className="fixed bottom-0 right-6 w-80 sm:w-96 bg-white rounded-lg shadow-xl overflow-hidden z-50 flex flex-col border border-gray-200"
          style={{ height: "50vh", maxHeight: "600px" }}
        >
          {/* Chat header */}
          <div className="bg-green-600 text-white p-3 flex items-center justify-between sticky top-0 shadow-sm">
            <div className="flex items-center">
              <div>
                <h3 className="font-medium text-sm">
                  {loading
                    ? "Đang tải..."
                    : manager
                    ? manager.fullName
                    : "Quản lý"}
                </h3>
                <p className="text-xs text-green-100">
                  {connectionStatus === "connected"
                    ? "Đã kết nối"
                    : connectionStatus === "connecting"
                    ? "Đang kết nối..."
                    : "Chưa kết nối"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleChat}
              className="text-white hover:bg-green-700 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Chat messages */}
          <div
            className="flex-1 overflow-y-auto p-3 bg-gray-50"
            style={{ scrollbarWidth: "thin" }}
          >
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center">
                <MessageSquare className="h-12 w-12 text-gray-300 mb-2" />
                <p className="text-sm">Chưa có tin nhắn nào</p>
                <p className="text-xs">Hãy bắt đầu cuộc trò chuyện</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => {
                  const userId = localStorage.getItem("id");
                  const isOwnMessage = message.senderId === userId;

                  return (
                    <div
                      key={message.chatMessageId}
                      className={`flex ${
                        isOwnMessage ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] p-2 rounded-lg text-sm",
                          isOwnMessage
                            ? "bg-green-600 text-white rounded-br-none"
                            : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                        )}
                      >
                        {message.messageText && (
                          <p className="whitespace-pre-wrap break-words">
                            {message.messageText}
                          </p>
                        )}

                        {(message.imageUrls ?? []).length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {(message.imageUrls ?? []).map((url, i) => (
                              <img
                                key={`${message.chatMessageId}-img-${i}`}
                                src={url || "/placeholder.svg"}
                                alt="Shared image"
                                className="max-w-[150px] object-contain rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLightbox({
                                    isOpen: true,
                                    currentImageIndex: i,
                                    images: message.imageUrls || [],
                                    messageId: message.chatMessageId,
                                  });
                                }}
                              />
                            ))}
                          </div>
                        )}

                        {message.fileUrl && !isImageUrl(message.fileUrl) && (
                          <div className="mt-2">
                            <a
                              href={message.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={cn(
                                "text-xs underline flex items-center",
                                isOwnMessage ? "text-white" : "text-blue-500"
                              )}
                            >
                              <ImageIcon className="h-4 w-4 mr-1" />
                              Tải xuống tệp
                            </a>
                          </div>
                        )}

                        <p className="text-xs mt-1 opacity-70 text-right">
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* File input (hidden) */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
            multiple
            disabled={connectionStatus !== "connected" || loading}
          />

          {/* File preview area */}
          {selectedFiles.length > 0 && (
            <div className="p-2 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-600 font-medium">
                  Đã chọn {selectedFiles.length} hình ảnh
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFiles}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto text-xs"
                >
                  Xóa tất cả
                </Button>
              </div>

              {isUploading && uploadProgress > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                  <div
                    className="bg-green-600 h-1.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}

              <div className="flex flex-wrap gap-1">
                {selectedFiles.map((filePreview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={filePreview.previewUrl || "/placeholder.svg"}
                      alt={`Preview ${index + 1}`}
                      className="h-16 w-auto rounded-md border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-sm hover:bg-red-600 transition-colors"
                    >
                      <X className="h-2 w-2" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message input */}
          <div className="p-3 border-t bg-white sticky bottom-0 shadow-inner">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="bg-gray-50 border-gray-200 hover:bg-gray-100 h-9 w-9"
                onClick={() => fileInputRef.current?.click()}
                disabled={
                  connectionStatus !== "connected" || loading || isUploading
                }
              >
                <Images className="h-4 w-4 text-gray-500" />
              </Button>

              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Viết tin nhắn..."
                className="flex-1 text-sm"
                disabled={
                  connectionStatus !== "connected" || loading || isUploading
                }
              />

              <Button
                type="submit"
                size="icon"
                className="bg-green-600 hover:bg-green-700 h-9 w-9"
                disabled={
                  connectionStatus !== "connected" ||
                  loading ||
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
        </div>
      )}

      {/* Image Lightbox */}
      {lightbox.isOpen && (
        <div
          className="fixed inset-0 bg-white bg-opacity-95 z-[100] flex items-center justify-center p-4"
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
                        ? "bg-green-600"
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
    </>
  );
}
