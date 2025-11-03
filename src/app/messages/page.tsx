"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Home, Send, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import type { Message, User } from "@/types";

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<Map<number, User>>(new Map());
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const currentUserId = 1; // Demo user

  useEffect(() => {
    fetchMessages();
    fetchUsers();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages?userId=${currentUserId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        const userMap = new Map(data.map((u: User) => [u.id, u]));
        setUsers(userMap);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    setIsSending(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: currentUserId,
          receiverId: selectedUser,
          content: newMessage.trim(),
        }),
      });

      if (response.ok) {
        setNewMessage("");
        fetchMessages();
        toast.success("Message sent");
      }
    } catch (error) {
      toast.error("Failed to send message");
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  // Get unique conversations
  const conversations = Array.from(
    new Set(
      messages.map((m) =>
        m.senderId === currentUserId ? m.receiverId : m.senderId
      )
    )
  );

  const selectedMessages = messages.filter(
    (m) =>
      (m.senderId === currentUserId && m.receiverId === selectedUser) ||
      (m.receiverId === currentUserId && m.senderId === selectedUser)
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Home className="h-8 w-8" />
            <h1 className="text-2xl font-bold">HomeStay</h1>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Messages</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <div className="border rounded-lg p-4 space-y-2">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search messages..." className="pl-9" />
            </div>

            <ScrollArea className="h-[500px]">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 mb-2">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))
              ) : conversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No messages yet
                </div>
              ) : (
                conversations.map((userId) => {
                  const user = users.get(userId);
                  const lastMessage = messages
                    .filter(
                      (m) =>
                        (m.senderId === currentUserId && m.receiverId === userId) ||
                        (m.receiverId === currentUserId && m.senderId === userId)
                    )
                    .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())[0];

                  return (
                    <button
                      key={userId}
                      onClick={() => setSelectedUser(userId)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors ${
                        selectedUser === userId ? "bg-muted" : ""
                      }`}
                    >
                      <Avatar>
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-sm">{user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {lastMessage?.content}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </ScrollArea>
          </div>

          {/* Message Thread */}
          <div className="md:col-span-2 border rounded-lg flex flex-col">
            {selectedUser ? (
              <>
                <div className="p-4 border-b flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={users.get(selectedUser)?.avatar}
                      alt={users.get(selectedUser)?.name}
                    />
                    <AvatarFallback>
                      {users.get(selectedUser)?.name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{users.get(selectedUser)?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {users.get(selectedUser)?.userType}
                    </p>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {selectedMessages.map((message) => {
                      const isCurrentUser = message.senderId === currentUserId;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              isCurrentUser
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"
                              }`}
                            >
                              {new Date(message.sentAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>

                <div className="p-4 border-t flex gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="resize-none"
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={isSending || !newMessage.trim()}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Select a conversation to start messaging
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
