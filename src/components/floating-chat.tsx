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

interface Manager {
  userId: string;
  fullName: string;
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
}

interface FilePreview {
  file: File;
  previewUrl: string;
}

export function FloatingChat() {
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

  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

      if (!authToken) {
        throw new Error("Authentication token not found");
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
            fileUrl: msg.fileUrl,
          },
        ]);
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

  // Upload files and send message
  const uploadFilesAndSendMessage = async () => {
    if (selectedFiles.length === 0 || !chatRoomId || !connectionRef.current)
      return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const authToken = localStorage.getItem("auth_token");
      const userId = localStorage.getItem("id");
      const fileUrls: string[] = [];

      // Upload each file
      for (let i = 0; i < selectedFiles.length; i++) {
        const filePreview = selectedFiles[i];

        // Create form data
        const formData = new FormData();
        formData.append("file", filePreview.file);

        // Upload file to server
        const response = await fetch("https://minhlong.mlhr.org/api/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload file ${filePreview.file.name}`);
        }

        const data = await response.json();
        fileUrls.push(data.url); // Assuming the API returns the file URL

        // Update progress
        setUploadProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
      }

      // Send message for each file
      for (const fileUrl of fileUrls) {
        await connectionRef.current.invoke(
          "SendMessage",
          chatRoomId,
          userId,
          messageInput || "Đã gửi một hình ảnh", // Use message text or default text
          fileUrl
        );
      }

      // Clear message input and selected files
      setMessageInput("");
      clearAllFiles();
      setUploadProgress(0);

      console.log("✅ Files uploaded and messages sent");
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Không thể tải lên tệp. Vui lòng thử lại sau.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle sending a message
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

      // Send message via SignalR
      await connectionRef.current.invoke(
        "SendMessage",
        chatRoomId,
        userId,
        messageInput,
        null // fileUrl is null for text messages
      );

      console.log("✅ Message sent");
      setMessageInput("");
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

  return (
    <>
      {/* Floating chat button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-green-600 text-white rounded-full p-3 shadow-lg hover:bg-green-700 transition-colors z-50"
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

                        {message.fileUrl && isImageUrl(message.fileUrl) && (
                          <div className="mt-2 overflow-hidden rounded-md">
                            <img
                              src={message.fileUrl || "/placeholder.svg"}
                              alt="Shared image"
                              className="max-w-full h-auto object-contain cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() =>
                                window.open(message.fileUrl, "_blank")
                              }
                            />
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
    </>
  );
}
