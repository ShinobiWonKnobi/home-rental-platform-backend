"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Home, Bell, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { Notification } from "@/types";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const userId = 1; // Demo user

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: "PUT",
      });
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (error) {
      toast.error("Failed to mark as read");
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications?id=${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        toast.success("Notification deleted");
      }
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const typeColors: Record<string, string> = {
    booking: "bg-blue-500/10 text-blue-500",
    review: "bg-yellow-500/10 text-yellow-500",
    message: "bg-green-500/10 text-green-500",
    payment: "bg-purple-500/10 text-purple-500",
    system: "bg-gray-500/10 text-gray-500",
  };

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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="rounded-full">
                {unreadCount}
              </Badge>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No notifications</h2>
            <p className="text-muted-foreground">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`border rounded-lg p-4 transition-colors ${
                  notification.isRead ? "bg-background" : "bg-muted/50"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={typeColors[notification.type]}>
                        {notification.type}
                      </Badge>
                      {!notification.isRead && (
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <h3 className="font-semibold mb-1">{notification.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
