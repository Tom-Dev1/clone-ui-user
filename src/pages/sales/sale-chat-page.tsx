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
  hasUnread?: boolean;
  isRead?: boolean; // This field is on the room itself from the API
}

interface ChatMessage {
  chatMessageId: string;
  chatRoomId: string;
  senderId: string;
  senderName: string;
  messageText: string;
  timestamp: string;
  isRead: boolean; // This field is on the message itself
  fileUrl?: string;
  imageUrls?: string[]; // We will map server's 'images' to this
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
    if (!guid) return false; // Handle null or undefined GUIDs
    const regex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return regex.test(guid);
  };
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
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

  // START: ADDED HELPER FUNCTION TO MAP RAW MESSAGE
  const mapRawMessageToChatMessage = (rawMsg: any): ChatMessage => {
    const imagesToUse = rawMsg.images || rawMsg.imageUrls || [];

    return {
      chatMessageId:
        rawMsg.chatMessageId ||
        `temp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      chatRoomId: rawMsg.chatRoomId,
      senderId: rawMsg.senderId,
      senderName: rawMsg.senderName || "Không rõ người gửi",
      messageText:
        rawMsg.messageText || (imagesToUse.length > 0 ? "Đã gửi hình ảnh" : ""),
      timestamp: rawMsg.timestamp || new Date().toISOString(),
      isRead: typeof rawMsg.isRead === "boolean" ? rawMsg.isRead : true,
      fileUrl: rawMsg.fileUrl,
      imageUrls: imagesToUse, // Map 'images' or 'imageUrls' from server to 'imageUrls'
    };
  };
  // END: ADDED HELPER FUNCTION

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

      const roomsWithUnreadFlag = data
        .map((room) => ({
          ...room,
          // The API for rooms list returns `isRead` on the room itself,
          // indicating if the *last message in that room for the current user* is read or not.
          // `hasUnread` should be true if `room.isRead` is false (meaning last message is unread)
          // AND the last message was not sent by the current user.
          hasUnread: room.isRead === false && room.lastUserId !== currentUserId,
        }))
        .sort(
          (a, b) =>
            new Date(b.lastTimestamp).getTime() -
            new Date(a.lastTimestamp).getTime()
        );
      setRooms(roomsWithUnreadFlag);
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomsList = async () => {
    try {
      const authToken = localStorage.getItem("auth_token");
      const currentUserId = localStorage.getItem("id"); // Get current user ID for hasUnread logic
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
          // Preserve client-side 'hasUnread' if room is not selected, otherwise re-evaluate
          // If the newRoom's last message is from another user and is marked as unread by the API (newRoom.isRead === false)
          // and it's not the currently selected room, then it has unread messages.
          let calculatedHasUnread =
            newRoom.isRead === false && newRoom.lastUserId !== currentUserId;
          if (existingRoom && newRoom.chatRoomId === selectedRoom) {
            calculatedHasUnread = false; // If it's the selected room, it's considered read on client.
          } else if (existingRoom) {
            // For non-selected rooms, if existingRoom.hasUnread was true, keep it true
            // unless new data explicitly marks it as read by the current user.
            // The API's `newRoom.isRead` reflects the read status of the *last message by the current user*.
            // So, if `newRoom.isRead` is true, it means the user has read it.
            // If `newRoom.isRead` is false, it means the last message (possibly by another user) is unread for current user.
            calculatedHasUnread =
              newRoom.isRead === false && newRoom.lastUserId !== currentUserId;
          }

          return {
            ...newRoom,
            hasUnread: calculatedHasUnread,
          };
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

  const updateRoomWithNewMessage = (message: ChatMessage) => {
    setRooms((prevRooms) => {
      const currentUserId = localStorage.getItem("id");
      return prevRooms
        .map((room) => {
          if (room.chatRoomId === message.chatRoomId) {
            let newHasUnread = room.hasUnread;
            // A new message makes a room unread if:
            // 1. The message is from another user.
            // 2. The room is NOT the currently selected room.
            if (
              message.senderId !== currentUserId &&
              message.chatRoomId !== selectedRoom
            ) {
              newHasUnread = true;
            } else if (message.chatRoomId === selectedRoom) {
              // If it's the current room, it becomes read.
              newHasUnread = false;
            }
            // If message is from current user, hasUnread status doesn't change for this room for this user.
            // (it might change for the other user in the room, but that's handled on their client)

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
              isRead:
                message.chatRoomId === selectedRoom
                  ? true
                  : message.senderId === currentUserId
                  ? true
                  : false, // Update isRead based on context
            };
          }
          return room;
        })
        .sort(
          (a, b) =>
            new Date(b.lastTimestamp).getTime() -
            new Date(a.lastTimestamp).getTime()
        );
    });
  };

  useEffect(() => {
    fetchInitialRooms();
    setupGlobalSignalR();

    return () => {
      if (globalConnectionRef.current) {
        globalConnectionRef.current.stop();
        globalConnectionRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setupGlobalSignalR = async () => {
    try {
      const authToken = localStorage.getItem("auth_token");
      const localUserId = localStorage.getItem("id");

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

      // START: MODIFIED TO USE MAPPER
      connection.on("ReceiveMessage", (rawMsg: any) => {
        console.log("Global SignalR: Raw ReceivedMessage", rawMsg);
        const msg = mapRawMessageToChatMessage(rawMsg);
        console.log("Global SignalR: Mapped ReceivedMessage", msg);
        // END: MODIFIED TO USE MAPPER

        if (msg.senderId === localUserId && isPendingMessage(msg, true)) {
          console.log("Global SignalR: Skipping own pending message echo", msg);
          updateRoomWithNewMessage(msg);
          return;
        }

        updateRoomWithNewMessage(msg);

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
        fetchRoomsList();
      });

      await connection.start();
      console.log("✅ Connected to Global SignalR");
      globalConnectionRef.current = connection;

      setConnectionStatus("connected"); // Set global connection status

      const response = await fetch("https://minhlong.mlhr.org/api/chat/rooms", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const currentRooms: ChatRoom[] = await response.json();
        for (const room of currentRooms) {
          if (validateGuid(room.chatRoomId)) {
            // Ensure room ID is valid before joining
            try {
              await connection.invoke("JoinRoom", room.chatRoomId);
              console.log(`Global SignalR: Joined room: ${room.chatRoomId}`);
            } catch (e) {
              console.error(
                `Global SignalR: Failed to join room ${room.chatRoomId}`,
                e
              );
            }
          } else {
            console.warn(
              `Global SignalR: Invalid chatRoomId found, skipping join: ${room.chatRoomId}`
            );
          }
        }
      }
    } catch (error) {
      console.error("Global SignalR connection failed:", error);
      setConnectionStatus("disconnected");
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

        // For text messages, check text content
        const sameText = pendingMsg.messageText === incomingMsg.messageText;

        // For image messages, check if both have images (more robust check might involve image URLs if available early)
        const pendingHasImages =
          pendingMsg.imageUrls && pendingMsg.imageUrls.length > 0;
        const incomingHasImages =
          incomingMsg.imageUrls && incomingMsg.imageUrls.length > 0;

        // A message is similar if:
        // 1. It's a text message with the same text AND sender.
        // 2. It's an image message (both have images) AND sender, and optimistic text matches.
        //    (The optimistic text for an image message is often "Đã gửi hình ảnh")
        if (pendingMsg.senderId === incomingMsg.senderId) {
          if (pendingHasImages && incomingHasImages && sameText) {
            // Image message with same placeholder text
            foundPendingId = pendingId;
            return true;
          }
          if (!pendingHasImages && !incomingHasImages && sameText) {
            // Text message
            foundPendingId = pendingId;
            return true;
          }
        }
        return false;
      }
    );

    if (isSimilar && removeIfFound && foundPendingId) {
      pendingMessageIds.current.delete(foundPendingId);
      setMessages((prev) =>
        prev.map((m) =>
          m.chatMessageId === foundPendingId ? { ...incomingMsg } : m
        )
      );
    }
    return isSimilar;
  };

  useEffect(() => {
    if (!selectedRoom) {
      setMessages([]);
      if (
        connectionRef.current &&
        connectionRef.current.state === signalR.HubConnectionState.Connected
      ) {
        // No room selected, but room-specific connection might exist from previous selection
        console.log(
          `Stopping SignalR for previously selected room as no room is selected now.`
        );
        connectionRef.current.stop();
        connectionRef.current = null;
        // Do not set global connection status here, this is for room-specific
      }
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
        // START: MODIFIED TO USE MAPPER
        const rawData: any[] = await response.json();
        const data: ChatMessage[] = rawData
          .map(mapRawMessageToChatMessage)
          // END: MODIFIED TO USE MAPPER
          .sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
        setMessages(data);
        pendingMessageIds.current.clear();
        setTimeout(() => scrollToBottom(), 100);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessagesForRoom();
    connectToSignalR(selectedRoom); // This will handle its own connection status

    return () => {
      if (connectionRef.current) {
        console.log(
          `Stopping Room SignalR for room: ${selectedRoom} on component unmount or selectedRoom change`
        );
        connectionRef.current.stop();
        connectionRef.current = null;
      }
      // When selectedRoom changes, the global connection status should not be affected by room-specific cleanup.
      // So, don't set setConnectionStatus("disconnected") here for the global status.
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const connectToSignalR = async (roomId: string) => {
    if (!roomId || !validateGuid(roomId)) {
      // Validate roomId
      console.warn(
        "Room SignalR: Invalid or no roomId provided for connection.",
        roomId
      );
      return;
    }
    if (
      connectionRef.current &&
      connectionRef.current.state === signalR.HubConnectionState.Connected
    ) {
      console.log(
        "Room SignalR: Already connected or attempting to connect to a room. Stopping previous if different."
      );
      // Check if it's for a different room, if so, stop and reconnect
      // This is usually handled by the useEffect cleanup for selectedRoom, but as a safeguard:
      if (connectionRef.current.baseUrl.includes(roomId)) {
        // simplistic check, might need better
        // console.log("Room SignalR: Already connected to the same room."); // No, this is wrong. Hub is same, room is via JoinRoom.
      }
      await connectionRef.current.stop();
      connectionRef.current = null;
    }

    // Use global connection status for UI, room-specific is managed internally
    // setConnectionStatus("connecting"); // This controls the global status, maybe not ideal here.
    // For now, let's assume globalConnectionRef handles the main status display.

    try {
      const authToken = localStorage.getItem("auth_token");
      const localUserId = localStorage.getItem("id");

      if (!authToken || !localUserId)
        throw new Error("Room SignalR: Auth token or user ID not found.");
      if (!validateGuid(localUserId))
        // roomId already validated
        throw new Error("Room SignalR: Invalid User ID GUID.");

      const connection = new signalR.HubConnectionBuilder()
        .withUrl("https://minhlong.mlhr.org/chatHub", {
          // Same Hub URL
          accessTokenFactory: () => authToken,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000])
        .build();

      // START: MODIFIED TO USE MAPPER
      connection.on("ReceiveMessage", (rawMsg: any) => {
        console.log("Room SignalR: Raw ReceiveMessage", rawMsg);
        const msg = mapRawMessageToChatMessage(rawMsg);
        console.log("Room SignalR: Mapped ReceiveMessage", msg);
        // END: MODIFIED TO USE MAPPER

        if (msg.chatRoomId !== roomId) {
          // This message is for a different room, Global SignalR might handle it for list updates.
          // updateRoomWithNewMessage(msg); // Update other room's last message if needed (Global should do this)
          return;
        }

        // If message is from current user, check if it's a pending one
        if (msg.senderId === localUserId) {
          if (isPendingMessage(msg, true)) {
            // true to replace optimistic with server confirmed
            console.log(
              "Room SignalR: Updated pending message with server ID",
              msg
            );
          } else if (
            !messages.find((m) => m.chatMessageId === msg.chatMessageId)
          ) {
            // If not pending and not already in messages (e.g., echo not handled by pending), add it
            setMessages((prev) => [...prev, msg]);
          }
        } else {
          // Message from another user in this room
          setMessages((prev) => {
            if (!prev.find((m) => m.chatMessageId === msg.chatMessageId)) {
              return [...prev, msg];
            }
            return prev;
          });
        }
        // This will mark the current room as read (hasUnread: false) and update last message
        updateRoomWithNewMessage(msg);
        scrollToBottom();
      });

      connection.on("ReceiveMessageChatRoom", () => {
        console.log(
          "Room SignalR: Received ReceiveMessageChatRoom, refreshing room list."
        );
        fetchRoomsList();
      });

      connection.onclose((error) => {
        console.warn(
          `Room SignalR connection for ${roomId} closed. Error: ${error}`
        );
        // If this was the connection for the selected room, reflect disconnect.
        // However, the global connection status is likely what's displayed.
        // If global is still connected, this specific room might just be having issues.
        // For simplicity, we don't manage a separate "room connection status" in the UI here.
      });

      await connection.start();
      console.log(`✅ Connected to Room Logic via SignalR for: ${roomId}`);
      // setConnectionStatus("connected"); // Again, careful with global status

      try {
        await connection.invoke("JoinRoom", roomId); // Join the specific room
        console.log(
          `Room SignalR: Successfully invoked JoinRoom for: ${roomId}`
        );
      } catch (e) {
        console.error(
          `Room SignalR: Error invoking JoinRoom for ${roomId}:`,
          e
        );
      }
      connectionRef.current = connection; // Store this room-specific acting connection
    } catch (error) {
      console.error(
        `Room SignalR connection logic for ${roomId} failed:`,
        error
      );
      // setConnectionStatus("disconnected");
    }
  };

  const handleRoomClick = async (roomId: string) => {
    if (!validateGuid(roomId)) {
      console.error("Invalid room ID clicked:", roomId);
      return;
    }
    // If the room is already selected, do nothing extra besides ensuring it's marked read locally
    if (selectedRoom === roomId) {
      setRooms((prevRooms) =>
        prevRooms.map((r) =>
          r.chatRoomId === roomId ? { ...r, hasUnread: false, isRead: true } : r
        )
      );
      return;
    }

    console.log("Attempting to mark room as read via API:", roomId);
    try {
      const authToken = localStorage.getItem("auth_token");
      if (!authToken) {
        console.error("Auth token not found for mark-as-read.");
        // Proceed to select room even if mark-as-read fails pre-API call
        setSelectedRoom(roomId);
        // Manually mark as read on client side for immediate UI update
        setRooms((prevRooms) =>
          prevRooms.map((r) =>
            r.chatRoomId === roomId
              ? { ...r, hasUnread: false, isRead: true }
              : r
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

      console.log("Mark-as-read API Response Status:", response.status);

      if (response.ok) {
        console.log(`Room ${roomId} marked as read successfully via API.`);
        // Refresh rooms list to get updated isRead states from server if needed,
        // or just update local state. For immediate effect:
        setRooms((prevRooms) =>
          prevRooms
            .map((r) =>
              r.chatRoomId === roomId
                ? { ...r, hasUnread: false, isRead: true }
                : r
            )
            .sort(
              (a, b) =>
                new Date(b.lastTimestamp).getTime() -
                new Date(a.lastTimestamp).getTime()
            )
        );
        // Optionally, call fetchRoomsList() if server-side changes are critical beyond just this room's read status.
        // fetchRoomsList();
      } else {
        console.error(
          `Failed to mark room ${roomId} as read via API. Status: ${response.status}`
        );
        // Still mark as read locally for better UX even if API fails
        setRooms((prevRooms) =>
          prevRooms.map((r) =>
            r.chatRoomId === roomId
              ? { ...r, hasUnread: false, isRead: true }
              : r
          )
        );
      }
    } catch (error) {
      console.error("Error calling mark-as-read API:", error);
      // Still mark as read locally
      setRooms((prevRooms) =>
        prevRooms.map((r) =>
          r.chatRoomId === roomId ? { ...r, hasUnread: false, isRead: true } : r
        )
      );
    }
    setSelectedRoom(roomId);
  };

  const getOtherMemberName = (room: ChatRoom) => {
    if (!userId || !room.members || room.members.length === 0)
      return room.roomName || "Chat Room";
    // For 1-on-1 chat, find the other member. For group chat, roomName is more appropriate.
    if (room.members.length <= 2) {
      // Assuming 1-on-1 or self-chat if members <=2
      const otherMember = room.members.find(
        (member) => member.userId !== userId
      );
      return otherMember ? otherMember.name : room.roomName || "Chat Room";
    }
    return room.roomName || "Group Chat"; // For group chats with >2 members
  };

  const groupMessagesByDate = (messagesToGroup: ChatMessage[]): DateGroup[] => {
    const groups: Record<string, DateGroup> = {};
    messagesToGroup.forEach((msg) => {
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
      const currentTotalFiles = selectedFiles.length + e.target.files.length;
      if (currentTotalFiles > 5) {
        // Example: Limit to 5 files total
        alert("Bạn chỉ có thể chọn tối đa 5 hình ảnh cùng lúc.");
        if (e.target) e.target.value = ""; // Reset file input
        return;
      }

      Array.from(e.target.files).forEach((file) => {
        if (!file.type.startsWith("image/")) {
          alert("Vui lòng chỉ chọn các tệp hình ảnh.");
          return; // Skip non-image files
        }
        if (file.size > 5 * 1024 * 1024) {
          // 5MB limit per file
          alert(`Tệp ${file.name} vượt quá kích thước tối đa 5MB.`);
          return; // Skip oversized files
        }
        const previewUrl = URL.createObjectURL(file);
        newFiles.push({ file, previewUrl });
      });
      setSelectedFiles((prev) => [...prev, ...newFiles].slice(0, 5)); // Ensure not more than 5
      if (e.target) e.target.value = "";
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
    // Use globalConnectionRef or connectionRef based on which one is primary for sending.
    // Assuming connectionRef (room-specific acting one) is used for sending messages to a specific room.
    const currentConnection =
      connectionRef.current || globalConnectionRef.current;

    if (
      selectedFiles.length === 0 ||
      !selectedRoom ||
      !currentConnection ||
      currentConnection.state !== signalR.HubConnectionState.Connected
    ) {
      alert(
        currentConnection?.state !== signalR.HubConnectionState.Connected
          ? "Mất kết nối. Vui lòng thử lại."
          : "Không thể gửi. Kiểm tra kết nối hoặc phòng chat."
      );
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

        // Assuming API returns an array of { imageUrl: string, publicId: string }
        if (Array.isArray(uploadResult)) {
          uploadResult.forEach((item: any) => {
            if (item.imageUrl) fileUrls.push(item.imageUrl);
            if (item.publicId) publicIds.push(item.publicId);
          });
        } else if (uploadResult.imageUrl) {
          // Fallback for single object response
          fileUrls.push(uploadResult.imageUrl);
          if (uploadResult.publicId) publicIds.push(uploadResult.publicId);
        } else if (uploadResult.url) {
          // Another fallback
          fileUrls.push(uploadResult.url);
          if (uploadResult.publicId) publicIds.push(uploadResult.publicId);
        }

        setUploadProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
      }

      if (fileUrls.length === 0) {
        throw new Error(
          "Không có URL hình ảnh nào được trả về sau khi tải lên."
        );
      }

      const tempMessageId = `temp_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 7)}`;
      pendingMessageIds.current.add(tempMessageId);
      const currentTime = new Date().toISOString();
      const currentMessageText = messageInput.trim() || "Đã gửi hình ảnh";

      const newMessage: ChatMessage = {
        chatMessageId: tempMessageId,
        chatRoomId: selectedRoom,
        senderId: localUserId,
        senderName: userName,
        messageText: currentMessageText,
        timestamp: currentTime,
        isRead: true, // Own messages are read by self
        imageUrls: fileUrls, // Use the collected URLs
      };
      setMessages((prev) => [...prev, newMessage]);
      updateRoomWithNewMessage({ ...newMessage, senderName: userName });
      setTimeout(scrollToBottom, 50);

      await currentConnection.invoke(
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
      console.error("Error uploading files and sending message:", error);
      alert(
        `Không thể tải lên hoặc gửi tệp: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      // Remove optimistic message if send fails severely
      // This part can be tricky, needs careful state management for pending messages
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

    // Use globalConnectionRef or connectionRef.
    // Assuming connectionRef (room-specific acting one) is used for sending messages.
    const currentConnection =
      connectionRef.current || globalConnectionRef.current;

    if (
      !messageInput.trim() ||
      !selectedRoom ||
      !currentConnection ||
      currentConnection.state !== signalR.HubConnectionState.Connected
    ) {
      if (currentConnection?.state !== signalR.HubConnectionState.Connected) {
        alert("Kết nối bị gián đoạn. Vui lòng thử lại sau ít giây.");
      }
      return;
    }
    try {
      const localUserId = localStorage.getItem("id");
      const userName = localStorage.getItem("name") || "Bạn";
      if (!localUserId) throw new Error("User ID not found");
      if (!validateGuid(localUserId) || !validateGuid(selectedRoom))
        throw new Error("Invalid GUID for user or room.");

      const currentMessageText = messageInput.trim();
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
        isRead: true, // Own messages are read
        imageUrls: [], // No images for text message
      };
      setMessages((prev) => [...prev, tempMessage]);
      updateRoomWithNewMessage({ ...tempMessage, senderName: userName }); // Update room list optimistically
      setMessageInput("");
      setTimeout(scrollToBottom, 50);

      await currentConnection.invoke(
        "SendMessage",
        selectedRoom,
        localUserId,
        currentMessageText,
        [], // No imageUrls for text message
        [] // No publicIds
      );
      console.log("✅ Text Message sent");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Không thể gửi tin nhắn.");
      // Consider removing optimistic message here too if send fails
    }
  };

  const selectedRoomData = selectedRoom
    ? rooms.find((r) => r.chatRoomId === selectedRoom)
    : null;
  const otherMemberName = selectedRoomData
    ? getOtherMemberName(selectedRoomData)
    : "";
  const groupedMessages = groupMessagesByDate(messages);

  // This function seems fine, it's used for the `fileUrl` property, not `imageUrls` directly in the list
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
                  // Display global connection status here
                  globalConnectionRef.current?.state ===
                    signalR.HubConnectionState.Connected ||
                    connectionStatus === "connected"
                    ? "bg-green-500"
                    : globalConnectionRef.current?.state ===
                        signalR.HubConnectionState.Connecting ||
                      connectionStatus === "connecting"
                    ? "bg-yellow-500 animate-pulse"
                    : "bg-red-500"
                )}
              ></div>
              <span
                className={cn(
                  "text-xs",
                  globalConnectionRef.current?.state ===
                    signalR.HubConnectionState.Connected ||
                    connectionStatus === "connected"
                    ? "text-green-500"
                    : globalConnectionRef.current?.state ===
                        signalR.HubConnectionState.Connecting ||
                      connectionStatus === "connecting"
                    ? "text-yellow-500"
                    : "text-red-500"
                )}
              >
                {globalConnectionRef.current?.state ===
                  signalR.HubConnectionState.Connected ||
                connectionStatus === "connected"
                  ? "Đã kết nối"
                  : globalConnectionRef.current?.state ===
                      signalR.HubConnectionState.Connecting ||
                    connectionStatus === "connecting"
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
                  {/* Optional: Display room-specific connection status if needed */}
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
                                  // Style for optimistic messages
                                  message.chatMessageId
                                ) && message.chatMessageId.startsWith("temp_") // Only if it's a temp ID
                                  ? "opacity-100"
                                  : "opacity-100"
                              )}
                            >
                              {message.messageText && (
                                <p className="whitespace-pre-wrap break-words">
                                  {message.messageText}
                                </p>
                              )}
                              {(() => {
                                // Logic for displaying images from imageUrls (already correctly mapped)
                                // or fileUrl if it's an image
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
                                      "pt-1":
                                        message.messageText &&
                                        message.messageText !==
                                          "Đã gửi hình ảnh", // Add padding if there's actual text besides the default
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
                                !isImageUrl(message.fileUrl) && ( // For non-image files
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
                                      <ImageIcon className="h-4 w-4 mr-1 shrink-0" />{" "}
                                      {/* Consider a different icon for generic files */}
                                      Tải xuống tệp
                                    </a>
                                  </div>
                                )}
                              <p className="text-xs mt-1 opacity-70 text-right">
                                {parseISO(message.timestamp).toLocaleTimeString(
                                  "vi-VN", // Use Vietnamese locale for time
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
                    disabled={
                      (globalConnectionRef.current?.state !==
                        signalR.HubConnectionState.Connected &&
                        connectionStatus !== "connected") ||
                      isUploading
                    }
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
                            (globalConnectionRef.current?.state !==
                              signalR.HubConnectionState.Connected &&
                              connectionStatus !== "connected") ||
                            isUploading
                          }
                        >
                          <Images className="h-4 w-4 text-gray-500" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Gửi hình ảnh (tối đa 5MB/ảnh, 5 ảnh/lần)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Viết tin nhắn..."
                    className="flex-1 bg-gray-50 border-gray-200 focus:ring-red-500 focus:border-red-500"
                    disabled={
                      (globalConnectionRef.current?.state !==
                        signalR.HubConnectionState.Connected &&
                        connectionStatus !== "connected") ||
                      isUploading
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        // Check if can send before submitting form
                        const currentConn =
                          connectionRef.current || globalConnectionRef.current;
                        if (messageInput.trim() || selectedFiles.length > 0) {
                          if (
                            currentConn &&
                            currentConn.state ===
                              signalR.HubConnectionState.Connected
                          ) {
                            handleSendMessage(e as unknown as React.FormEvent);
                          } else {
                            alert(
                              "Kết nối bị gián đoạn. Vui lòng thử lại sau ít giây."
                            );
                          }
                        }
                      }
                    }}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="bg-red-500 hover:bg-red-600 shrink-0"
                    disabled={
                      (globalConnectionRef.current?.state !==
                        signalR.HubConnectionState.Connected &&
                        connectionStatus !== "connected") ||
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
              {loading ? ( // This loading is for initial rooms loading
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
                    {" "}
                    <path d="m15 18-6-6 6-6" />{" "}
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
                    {" "}
                    <path d="m9 18 6-6-6-6" />{" "}
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
