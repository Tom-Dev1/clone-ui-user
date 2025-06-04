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
  lastUserId: string;
  hasUnread?: boolean; // Client-side flag for unread status
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
  const validateGuid = (guid: string) => {
    const regex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return regex.test(guid);
  };
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true); // For initial room loading
  const [loadingMessages, setLoadingMessages] = useState(false); // For message loading
  const [messageInput, setMessageInput] = useState("");
  const [userId, setUserId] = useState<string>("");
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");
  const [selectedFiles, setSelectedFiles] = useState<FilePreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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

  const fetchInitialRooms = async () => {
    setLoading(true);
    try {
      const authToken = localStorage.getItem("auth_token");
      const currentUserId = localStorage.getItem("id");

      if (currentUserId) {
        setUserId(currentUserId);
      } else {
        console.error("User ID not found in localStorage.");
        setLoading(false);
        return;
      }

      const response = await fetch("https://minhlong.mlhr.org/api/chat/rooms", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch chat rooms");
      }

      const data: Omit<ChatRoom, "hasUnread">[] = await response.json();
      // Initialize rooms with hasUnread = false
      const roomsWithUnreadFlag = data.map((room) => ({
        ...room,
        hasUnread: false,
      }));
      setRooms(roomsWithUnreadFlag);

      if (roomsWithUnreadFlag.length > 0 && !selectedRoom) {
        // Auto-select the first room. Mark-as-read will be handled by handleRoomClick if needed.
        await handleRoomClick(
          roomsWithUnreadFlag[0].chatRoomId,
          roomsWithUnreadFlag
        );
      }
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh rooms list (e.g., after a new room is created via SignalR)
  const fetchRoomsList = async () => {
    // Similar to fetchInitialRooms but without auto-selection or setting userId again
    // It should preserve existing `hasUnread` states or re-evaluate them if possible
    // For simplicity, this example will re-fetch and reset `hasUnread` states.
    // A more sophisticated approach would merge new data with existing client-side states.
    try {
      const authToken = localStorage.getItem("auth_token");
      const response = await fetch("https://minhlong.mlhr.org/api/chat/rooms", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!response.ok) throw new Error("Failed to refresh chat rooms");
      const data: Omit<ChatRoom, "hasUnread">[] = await response.json();

      setRooms((prevRooms) => {
        const updatedRooms = data.map((newRoom) => {
          const existingRoom = prevRooms.find(
            (pr) => pr.chatRoomId === newRoom.chatRoomId
          );
          return { ...newRoom, hasUnread: existingRoom?.hasUnread || false };
        });
        return updatedRooms.sort(
          (a, b) =>
            new Date(b.lastTimestamp).getTime() -
            new Date(a.lastTimestamp).getTime()
        );
      });

      console.log("✅ Rooms list refreshed");
    } catch (error) {
      console.error("Error refreshing chat rooms:", error);
    }
  };

  // Update room list when a new message is received
  const updateRoomWithNewMessage = (message: ChatMessage) => {
    setRooms((prevRooms) => {
      const currentUserId = localStorage.getItem("id"); // Ensure userId is up-to-date
      return prevRooms
        .map((room) => {
          if (room.chatRoomId === message.chatRoomId) {
            let newHasUnread = room.hasUnread;
            if (
              message.senderId !== currentUserId &&
              message.chatRoomId !== selectedRoom
            ) {
              newHasUnread = true; // Mark as unread if message from other, and room not active
            } else if (message.chatRoomId === selectedRoom) {
              newHasUnread = false; // If room is active, it's considered "read" contextually
            }
            // Otherwise, if message from self, or from other in non-selected but already read room, keep current `hasUnread`

            return {
              ...room,
              lastMessage:
                message.messageText ||
                (message.imageUrls && message.imageUrls.length > 0
                  ? "Đã gửi hình ảnh"
                  : message.fileUrl
                  ? "Đã gửi tệp"
                  : "Tin nhắn mới"),
              lastTimestamp: message.timestamp,
              lastUserName: message.senderName,
              lastUserId: message.senderId,
              hasUnread: newHasUnread,
            };
          }
          return room;
        })
        .sort(
          // Keep rooms sorted by last message
          (a, b) =>
            new Date(b.lastTimestamp).getTime() -
            new Date(a.lastTimestamp).getTime()
        );
    });
  };

  // Fetch chat rooms on component mount
  useEffect(() => {
    fetchInitialRooms();
    setupGlobalSignalR();

    return () => {
      if (globalConnectionRef.current) {
        globalConnectionRef.current.stop();
        globalConnectionRef.current = null;
      }
      // Room specific connection is cleaned up in selectedRoom useEffect
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount

  // Setup global SignalR connection
  const setupGlobalSignalR = async () => {
    try {
      const authToken = localStorage.getItem("auth_token");
      const localUserId = localStorage.getItem("id"); // Use localUserId for checks

      if (!authToken || !localUserId) {
        console.error("Global SignalR: Auth token or user ID not found.");
        return;
      }
      if (!validateGuid(localUserId)) {
        console.error("Global SignalR: Invalid User ID GUID.");
        return;
      }

      const connection = new signalR.HubConnectionBuilder()
        .withUrl("https://minhlong.mlhr.org/chatHub", {
          accessTokenFactory: () => authToken,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000])
        .build();

      connection.on("ReceiveMessage", (msg: ChatMessage) => {
        console.log("Global SignalR: ReceivedMessage", msg);
        // If the message is for the current chat room, it will be handled by room-specific connection
        // or update messages list if it's not a duplicate from pending.
        // For global, we primarily care about updating room list (last message, unread status)
        if (msg.senderId === localUserId && isPendingMessage(msg, true)) {
          console.log("Global SignalR: Skipping own pending message echo", msg);
          // If it was a pending message for the *selectedRoom*, it's already added.
          // If for another room, updateRoomWithNewMessage will handle it.
          updateRoomWithNewMessage(msg); // Still update room for sorting/last message if needed
          return;
        }

        updateRoomWithNewMessage(msg);

        // If message is for the currently selected room and NOT from self, add to message list
        if (msg.chatRoomId === selectedRoom && msg.senderId !== localUserId) {
          setMessages((prev) => {
            if (!prev.find((m) => m.chatMessageId === msg.chatMessageId)) {
              return [...prev, msg];
            }
            return prev;
          });
          scrollToBottom();
        }
      });

      connection.on("ReceiveMessageChatRoom", () => {
        console.log(
          "Global SignalR: Received ReceiveMessageChatRoom event, refreshing room list."
        );
        fetchRoomsList(); // Refresh the list of rooms
      });

      await connection.start();
      console.log("✅ Connected to Global SignalR");
      globalConnectionRef.current = connection;

      // Join all rooms user is part of
      const response = await fetch("https://minhlong.mlhr.org/api/chat/rooms", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const currentRooms: ChatRoom[] = await response.json();
        for (const room of currentRooms) {
          try {
            await connection.invoke("JoinRoom", room.chatRoomId);
            console.log(`Global SignalR: Joined room: ${room.chatRoomId}`);
          } catch (e) {
            console.error(
              `Global SignalR: Failed to join room ${room.chatRoomId}`,
              e
            );
          }
        }
      }
    } catch (error) {
      console.error("Global SignalR connection failed:", error);
    }
  };

  const isPendingMessage = (
    incomingMsg: ChatMessage,
    removeIfFound: boolean = false
  ): boolean => {
    if (pendingMessageIds.current.size === 0) return false;
    let foundPendingId: string | null = null;

    const isSimilar = Array.from(pendingMessageIds.current).some(
      (pendingId) => {
        const pendingMsg = messages.find((m) => m.chatMessageId === pendingId);
        if (!pendingMsg) return false;

        const sameText = pendingMsg.messageText === incomingMsg.messageText;
        // Basic check for image type messages, more robust check might be needed if text can be empty for image messages
        const pendingHasImages =
          pendingMsg.imageUrls && pendingMsg.imageUrls.length > 0;
        const incomingHasImages =
          incomingMsg.imageUrls && incomingMsg.imageUrls.length > 0;
        const sameType =
          (pendingHasImages && incomingHasImages) ||
          (!pendingHasImages && !incomingHasImages);

        // Check senderId as well, if it's available on the incoming message from server
        if (
          sameText &&
          sameType &&
          pendingMsg.senderId === incomingMsg.senderId
        ) {
          foundPendingId = pendingId;
          return true;
        }
        return false;
      }
    );

    if (isSimilar && removeIfFound && foundPendingId) {
      pendingMessageIds.current.delete(foundPendingId);
      // Update the optimistic message with the real one from the server
      setMessages((prev) =>
        prev.map((m) =>
          m.chatMessageId === foundPendingId ? { ...incomingMsg } : m
        )
      );
    }
    return isSimilar;
  };

  // Fetch messages when a room is selected
  useEffect(() => {
    if (!selectedRoom) {
      setMessages([]);
      return;
    }
    setLoadingMessages(true);
    const fetchMessagesForRoom = async () => {
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
        if (!response.ok) throw new Error("Failed to fetch messages");
        const data: ChatMessage[] = await response.json();
        setMessages(
          data.sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          )
        );
        pendingMessageIds.current.clear(); // Clear pending for new room
        setTimeout(() => scrollToBottom(), 100);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessagesForRoom();
    connectToSignalR(selectedRoom); // Connect to room-specific SignalR

    return () => {
      if (connectionRef.current) {
        console.log(`Stopping SignalR for room: ${selectedRoom}`);
        connectionRef.current.stop();
        connectionRef.current = null;
        setConnectionStatus("disconnected");
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoom]);

  // Scroll to bottom when new messages arrive or selected room changes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Clean up preview URLs
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

  // Connect to Room-Specific SignalR
  const connectToSignalR = async (roomId: string) => {
    if (!roomId) return;
    if (
      connectionRef.current &&
      connectionRef.current.state === signalR.HubConnectionState.Connected
    ) {
      await connectionRef.current.stop(); // Stop previous connection if any
      connectionRef.current = null;
    }

    setConnectionStatus("connecting");
    try {
      const authToken = localStorage.getItem("auth_token");
      const localUserId = localStorage.getItem("id");

      if (!authToken || !localUserId)
        throw new Error("Room SignalR: Auth token or user ID not found.");
      if (!validateGuid(localUserId) || !validateGuid(roomId))
        throw new Error("Room SignalR: Invalid GUID.");

      const connection = new signalR.HubConnectionBuilder()
        .withUrl("https://minhlong.mlhr.org/chatHub", {
          accessTokenFactory: () => authToken,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000])
        .build();

      connection.on("ReceiveMessage", (msg: ChatMessage) => {
        console.log("Room SignalR: ReceiveMessage", msg);
        if (msg.chatRoomId !== roomId) {
          // Message for a different room
          return;
        }
        // If it's own message, update pending state
        if (msg.senderId === localUserId) {
          if (isPendingMessage(msg, true)) {
            console.log(
              "Room SignalR: Updated pending message with server ID",
              msg
            );
          } else if (
            !messages.find((m) => m.chatMessageId === msg.chatMessageId)
          ) {
            setMessages((prev) => [...prev, msg]); // Add if somehow missed (edge case)
          }
        } else {
          // Message from other user in this room
          setMessages((prev) => {
            if (!prev.find((m) => m.chatMessageId === msg.chatMessageId)) {
              return [...prev, msg];
            }
            return prev;
          });
        }
        updateRoomWithNewMessage(msg); // Update room list (last message, hasUnread=false for current room)
        scrollToBottom();
      });

      connection.on("ReceiveMessageChatRoom", () => {
        console.log(
          "Room SignalR: Received ReceiveMessageChatRoom (e.g. new room created/deleted), refreshing room list"
        );
        fetchRoomsList();
      });

      connection.onclose((error) => {
        console.warn(
          `Room SignalR connection for ${roomId} closed. Error: ${error}`
        );
        setConnectionStatus("disconnected");
      });

      await connection.start();
      console.log(`✅ Connected to Room SignalR for: ${roomId}`);
      setConnectionStatus("connected");
      try {
        await connection.invoke("JoinRoom", roomId);
        console.log(`Room SignalR: Joined room: ${roomId}`);
      } catch (e) {
        console.error(`Room SignalR: Error joining room ${roomId}:`, e);
      }
      connectionRef.current = connection;
    } catch (error) {
      console.error(`Room SignalR connection for ${roomId} failed:`, error);
      setConnectionStatus("disconnected");
    }
  };

  // Handle clicking a room in the sidebar
  const handleRoomClick = async (
    roomId: string,
    currentRoomsState?: ChatRoom[]
  ) => {
    const roomsSource = currentRoomsState || rooms; // Use passed state if available (for initial load)
    const roomToSelect = roomsSource.find((r) => r.chatRoomId === roomId);

    if (selectedRoom === roomId && roomToSelect && !roomToSelect.hasUnread)
      return; // Avoid re-processing if already selected and read

    if (roomToSelect && roomToSelect.hasUnread) {
      try {
        const authToken = localStorage.getItem("auth_token");
        if (!authToken) {
          console.error("Mark-as-read: Auth token not found.");
          // Proceed to select room anyway
          setSelectedRoom(roomId);
          setRooms((prev) =>
            prev.map((r) =>
              r.chatRoomId === roomId ? { ...r, hasUnread: false } : r
            )
          );
          return;
        }
        const response = await fetch(
          "https://minhlong.mlhr.org/api/chat/mark-as-read",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ chatRoomId: roomId }),
          }
        );
        if (response.ok) {
          console.log(`✅ Marked room ${roomId} as read via API.`);
          setRooms((prevRooms) =>
            prevRooms.map((r) =>
              r.chatRoomId === roomId ? { ...r, hasUnread: false } : r
            )
          );
        } else {
          console.error(
            `Failed to mark room ${roomId} as read. Status: ${response.status}`
          );
          // Optimistically mark as read on client even if API fails, to remove dot
          setRooms((prevRooms) =>
            prevRooms.map((r) =>
              r.chatRoomId === roomId ? { ...r, hasUnread: false } : r
            )
          );
        }
      } catch (error) {
        console.error("Error calling mark-as-read API:", error);
        setRooms(
          (
            prevRooms // Optimistically mark as read
          ) =>
            prevRooms.map((r) =>
              r.chatRoomId === roomId ? { ...r, hasUnread: false } : r
            )
        );
      }
    } else if (
      roomToSelect &&
      !roomToSelect.hasUnread &&
      selectedRoom !== roomId
    ) {
      // If room is already marked as read on client, but we are selecting it.
      // No API call needed, just update state if it was not already selected.
    }

    // If the room was not previously unread, or after attempting to mark as read
    if (selectedRoom !== roomId) {
      setSelectedRoom(roomId); // This triggers useEffect for messages and SignalR
    } else {
      // If it was already the selected room but somehow marked unread and now clicked again
      // (e.g. optimistic update failed but user clicks again), ensure dot is removed.
      setRooms((prevRooms) =>
        prevRooms.map((r) =>
          r.chatRoomId === roomId ? { ...r, hasUnread: false } : r
        )
      );
    }
  };

  const getOtherMemberName = (room: ChatRoom) => {
    if (!userId || !room.members || room.members.length === 0)
      return room.roomName || "Chat Room";
    const otherMember = room.members.find((member) => member.userId !== userId);
    return otherMember ? otherMember.name : room.roomName || "Chat Room";
  };

  const groupMessagesByDate = (messages: ChatMessage[]): DateGroup[] => {
    const groups: Record<string, DateGroup> = {};
    messages.forEach((msg) => {
      try {
        const d = parseISO(msg.timestamp);
        const key = d.toISOString().slice(0, 10);
        if (!groups[key]) groups[key] = { date: d, messages: [] };
        groups[key].messages.push(msg);
      } catch (e) {
        console.error(
          "Error parsing message timestamp for grouping:",
          msg.timestamp,
          e
        );
      }
    });
    return Object.values(groups).sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles: FilePreview[] = [];
      Array.from(e.target.files).forEach((file) => {
        if (!file.type.startsWith("image/")) {
          alert("Vui lòng chỉ chọn các tệp hình ảnh");
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          alert(`Tệp ${file.name} vượt quá kích thước tối đa 5MB`);
          return;
        }
        const previewUrl = URL.createObjectURL(file);
        newFiles.push({ file, previewUrl });
      });
      setSelectedFiles((prev) => [...prev, ...newFiles]);
      if (e.target) e.target.value = ""; // Reset file input
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].previewUrl);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const clearAllFiles = () => {
    selectedFiles.forEach((filePreview) =>
      URL.revokeObjectURL(filePreview.previewUrl)
    );
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadFilesAndSendMessage = async () => {
    if (
      selectedFiles.length === 0 ||
      !selectedRoom ||
      !connectionRef.current ||
      connectionRef.current.state !== signalR.HubConnectionState.Connected
    ) {
      alert("Không thể gửi. Kiểm tra kết nối hoặc phòng chat.");
      return;
    }
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const authToken = localStorage.getItem("auth_token");
      const localUserId = localStorage.getItem("id");
      const userName = localStorage.getItem("name") || "Bạn";
      if (!authToken || !localUserId)
        throw new Error("Auth token or user ID not found.");

      const fileUrls: string[] = [];
      const publicIds: string[] = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const filePreview = selectedFiles[i];
        const formData = new FormData();
        formData.append("files", filePreview.file);
        const response = await fetch(
          "https://minhlong.mlhr.org/api/chat/upload",
          {
            method: "POST",
            headers: { Authorization: `Bearer ${authToken}` },
            body: formData,
          }
        );
        if (!response.ok)
          throw new Error(`Failed to upload ${filePreview.file.name}`);
        const uploadResult = await response.json();
        if (Array.isArray(uploadResult)) {
          fileUrls.push(...uploadResult.map((x: any) => x.imageUrl));
          publicIds.push(...uploadResult.map((x: any) => x.publicId));
        } else {
          fileUrls.push(uploadResult.url || uploadResult.imageUrl);
          if (uploadResult.publicId) publicIds.push(uploadResult.publicId);
        }
        setUploadProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
      }

      const tempMessageId = `temp_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 7)}`;
      pendingMessageIds.current.add(tempMessageId);
      const currentTime = new Date().toISOString();
      const currentMessageText = messageInput || "Đã gửi hình ảnh";

      const newMessage: ChatMessage = {
        chatMessageId: tempMessageId,
        chatRoomId: selectedRoom,
        senderId: localUserId,
        senderName: userName,
        messageText: currentMessageText,
        timestamp: currentTime,
        isRead: true,
        imageUrls: fileUrls,
      };
      setMessages((prev) => [...prev, newMessage]);
      updateRoomWithNewMessage({ ...newMessage, senderName: userName });
      setTimeout(scrollToBottom, 50);

      await connectionRef.current.invoke(
        "SendMessage",
        selectedRoom,
        localUserId,
        currentMessageText,
        fileUrls,
        publicIds
      );
      setMessageInput("");
      clearAllFiles();
      setUploadProgress(0);
      console.log("✅ Files uploaded & message sent", fileUrls);
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Không thể tải lên hoặc gửi tệp. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length > 0) {
      await uploadFilesAndSendMessage();
      return;
    }
    if (
      !messageInput.trim() ||
      !selectedRoom ||
      !connectionRef.current ||
      connectionRef.current.state !== signalR.HubConnectionState.Connected
    ) {
      if (
        connectionRef.current?.state !== signalR.HubConnectionState.Connected
      ) {
        alert("Kết nối bị gián đoạn. Vui lòng thử lại sau ít giây.");
      }
      return;
    }
    try {
      const localUserId = localStorage.getItem("id");
      const userName = localStorage.getItem("name") || "Bạn";
      if (!localUserId) throw new Error("User ID not found");
      if (!validateGuid(localUserId) || !validateGuid(selectedRoom))
        throw new Error("Invalid GUID.");

      const currentMessageText = messageInput;
      const tempMessageId = `temp_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 7)}`;
      const currentTime = new Date().toISOString();
      pendingMessageIds.current.add(tempMessageId);

      const tempMessage: ChatMessage = {
        chatMessageId: tempMessageId,
        chatRoomId: selectedRoom,
        senderId: localUserId,
        senderName: userName,
        messageText: currentMessageText,
        timestamp: currentTime,
        isRead: true,
        imageUrls: [],
      };
      setMessages((prev) => [...prev, tempMessage]);
      updateRoomWithNewMessage({ ...tempMessage, senderName: userName });
      setMessageInput("");
      setTimeout(scrollToBottom, 50);

      await connectionRef.current.invoke(
        "SendMessage",
        selectedRoom,
        localUserId,
        currentMessageText,
        [],
        []
      );
      console.log("✅ Text Message sent");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Không thể gửi tin nhắn.");
    }
  };

  const selectedRoomData = selectedRoom
    ? rooms.find((r) => r.chatRoomId === selectedRoom)
    : null;
  const otherMemberName = selectedRoomData
    ? getOtherMemberName(selectedRoomData)
    : "";
  const groupedMessages = groupMessagesByDate(messages);
  const isImageUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    return /\.(jpeg|jpg|gif|png|webp)$/i.test(url);
  };
  return (
    <SalesLayout>
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
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
                    ? "bg-yellow-500 animate-pulse"
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
            {loading && rooms.length === 0 ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <p className="ml-2 text-gray-500">Đang tải...</p>
              </div>
            ) : rooms.length === 0 && !loading ? (
              <div className="p-4 text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                Không có cuộc trò chuyện nào.
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
                    onClick={() => handleRoomClick(room.chatRoomId)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium truncate">
                            {getOtherMemberName(room)}
                          </h3>
                          <div className="flex items-center shrink-0">
                            {room.hasUnread &&
                              selectedRoom !== room.chatRoomId && (
                                <span className="w-2 h-2 bg-red-500 rounded-full mr-2 shrink-0"></span>
                              )}
                            {room.lastTimestamp && (
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                {formatDistanceToNow(
                                  parseISO(room.lastTimestamp),
                                  { addSuffix: true, locale: vi }
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                        <p
                          className={cn(
                            "text-sm text-gray-500 truncate mt-1",
                            room.hasUnread && selectedRoom !== room.chatRoomId
                              ? "font-semibold text-red-600"
                              : ""
                          )}
                        >
                          {room.lastUserId === userId && room.lastMessage
                            ? "Bạn: "
                            : ""}
                          {room.lastMessage || "Chưa có tin nhắn"}
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
          {selectedRoom && selectedRoomData ? (
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
                {loadingMessages ? (
                  <div className="flex flex-col justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                    <p className="mt-2 text-gray-500">Đang tải tin nhắn...</p>
                  </div>
                ) : messages.length === 0 && !loadingMessages ? (
                  <div className="flex flex-col justify-center items-center h-full text-gray-500">
                    <MessageSquare className="h-16 w-16 text-gray-300 mb-3" />
                    <p className="text-lg">Chưa có tin nhắn.</p>
                    <p className="text-sm">Bắt đầu cuộc trò chuyện nào!</p>
                  </div>
                ) : (
                  groupedMessages.map((group, groupIndex) => (
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
                                "max-w-[70%] p-3 rounded-lg shadow-sm relative",
                                message.senderId === userId
                                  ? "bg-red-500 text-white rounded-br-none"
                                  : "bg-white text-gray-800 rounded-bl-none border border-gray-200",
                                pendingMessageIds.current.has(
                                  message.chatMessageId
                                )
                                  ? "opacity-100"
                                  : ""
                              )}
                            >
                              {message.messageText && (
                                <p className="whitespace-pre-wrap break-words">
                                  {message.messageText}
                                </p>
                              )}
                              {(() => {
                                const imgs: string[] = [
                                  ...(message.imageUrls || []),
                                  ...(message.fileUrl &&
                                  isImageUrl(message.fileUrl)
                                    ? [message.fileUrl]
                                    : []),
                                ].filter(Boolean);
                                if (imgs.length === 0) return null;
                                return (
                                  <div
                                    className={cn("mt-2 flex flex-wrap gap-2", {
                                      "pt-1": message.messageText,
                                    })}
                                  >
                                    {imgs.map((url, i) => (
                                      <img
                                        key={`${message.chatMessageId}-img-${i}`}
                                        src={url || "/placeholder.svg"}
                                        alt="Hình ảnh chia sẻ"
                                        className="max-w-[150px] sm:max-w-[200px] h-auto object-contain rounded-md cursor-pointer hover:opacity-90 transition-opacity border"
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
                                        "text-xs underline flex items-center hover:opacity-80",
                                        message.senderId === userId
                                          ? "text-white"
                                          : "text-blue-600"
                                      )}
                                    >
                                      <ImageIcon className="h-4 w-4 mr-1 shrink-0" />
                                      Tải xuống tệp
                                    </a>
                                  </div>
                                )}
                              <p className="text-xs mt-1 opacity-70 text-right">
                                {parseISO(message.timestamp).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" }
                                )}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
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
                      disabled={isUploading}
                    >
                      Xóa tất cả
                    </Button>
                  </div>
                  {isUploading && uploadProgress > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                      <div
                        className="bg-red-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto scrollbar-thin">
                    {selectedFiles.map((filePreview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={filePreview.previewUrl || "/placeholder.svg"}
                          alt={`Preview ${index + 1}`}
                          className="h-20 w-auto rounded-md border border-gray-300 object-cover"
                        />
                        {!isUploading && (
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-sm hover:bg-red-600 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="p-4 bg-white border-t shadow-inner">
                <form
                  onSubmit={handleSendMessage}
                  className="flex space-x-2 items-center"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                    multiple
                    disabled={connectionStatus !== "connected" || isUploading}
                  />
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          className="bg-gray-50 border-gray-200 hover:bg-gray-100 shrink-0"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={
                            connectionStatus !== "connected" || isUploading
                          }
                        >
                          <Images className="h-4 w-4 text-gray-500" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Gửi hình ảnh</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Viết tin nhắn..."
                    className="flex-1 bg-gray-50 border-gray-200 focus:ring-red-500 focus:border-red-500"
                    disabled={connectionStatus !== "connected" || isUploading}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e as unknown as React.FormEvent);
                      }
                    }}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="bg-red-500 hover:bg-red-600 shrink-0"
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
              {loading ? (
                <>
                  <Loader2 className="h-12 w-12 animate-spin text-red-400 mb-4" />
                  <h3 className="text-xl font-medium">Đang tải dữ liệu...</h3>
                </>
              ) : (
                <>
                  <div className="bg-red-100 p-6 rounded-full mb-4">
                    <MessageSquare className="h-16 w-16 text-red-500" />
                  </div>
                  <h3 className="text-xl font-medium">
                    Chọn một cuộc trò chuyện
                  </h3>
                  <p className="mt-2 text-gray-400">
                    Vui lòng chọn từ các cuộc trò chuyện.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      {lightbox.isOpen && lightbox.images.length > 0 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setLightbox((prev) => ({ ...prev, isOpen: false }))}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full bg-transparent rounded-lg shadow-xl overflow-hidden flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-2 right-2 z-[110]">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-white/20 hover:bg-white/40 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox((prev) => ({ ...prev, isOpen: false }));
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <img
              src={
                lightbox.images[lightbox.currentImageIndex] ||
                "/placeholder.svg"
              }
              alt="Xem ảnh lớn"
              className="max-h-[calc(90vh-80px)] max-w-full object-contain rounded-md"
            />
            {lightbox.images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 z-[110]"
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
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 z-[110]"
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
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Button>
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-[110]">
                  {lightbox.images.map((_, index) => (
                    <button
                      key={`dot-${index}`}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                        index === lightbox.currentImageIndex
                          ? "bg-white scale-125"
                          : "bg-white/40 hover:bg-white/70"
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
              </>
            )}
          </div>
        </div>
      )}
    </SalesLayout>
  );
}
