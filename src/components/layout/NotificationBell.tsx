"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, Users, CheckCircle2, XCircle, Clock, Check } from "lucide-react";
import { NotificationItem } from "@/types";

function formatRelativeTime(dateStr: string | Date): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // Background poll failure
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 25000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleMarkAllRead = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications/read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        setUnreadCount(0);
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() }))
        );
      }
    } catch {
      // Error marking read
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.readAt) {
      try {
        await fetch("/api/notifications/read", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId: notif.id }),
        });
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notif.id ? { ...n, readAt: new Date().toISOString() } : n
          )
        );
      } catch {
        // silent
      }
    }
    setOpen(false);
  };

  const getIconForType = (type: string) => {
    if (type === "access_request") {
      return <Users className="w-4 h-4 text-amber-600 shrink-0" />;
    }
    if (type === "request_approved") {
      return <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
    }
    if (type === "request_rejected") {
      return <XCircle className="w-4 h-4 text-rose-600 shrink-0" />;
    }
    return <Bell className="w-4 h-4 text-green-dark shrink-0" />;
  };

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          if (!open) fetchNotifications();
        }}
        aria-label="Notifications"
        className="relative w-9 h-9 rounded-full bg-white hover:bg-butter-warm/40 border border-green-dark/15 flex items-center justify-center text-green-dark transition-colors cursor-pointer shadow-2xs"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-600 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center shadow-xs ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-12 right-0 w-80 sm:w-96 max-w-[calc(100vw-24px)] bg-white rounded-3xl shadow-dropdown border border-green-dark/15 p-3 z-50 animate-fade-in space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-green-dark/10">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs text-green-dark tracking-wide">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={loading}
                className="text-[11px] font-bold text-green-mid hover:text-green-dark flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                <Check className="w-3 h-3" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto space-y-1.5 p-1">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-text-dim text-xs space-y-1">
                <Bell className="w-6 h-6 mx-auto text-green-dark/30 mb-2" />
                <p className="font-semibold text-green-dark">All caught up</p>
                <p className="text-[11px] text-text-dim">You don't have any notifications right now.</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isUnread = !notif.readAt;
                const content = (
                  <div
                    onClick={() => handleNotificationClick(notif)}
                    className={`w-full p-3 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                      isUnread
                        ? "bg-butter-cream/35 border-green-dark/20 shadow-2xs hover:bg-butter-cream/50"
                        : "bg-white border-green-dark/10 hover:bg-butter-warm/20"
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-white border border-green-dark/10 shrink-0 mt-0.5 shadow-2xs">
                      {getIconForType(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs font-bold truncate ${isUnread ? "text-green-dark font-black" : "text-text-primary"}`}>
                          {notif.title}
                        </span>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-text-dim mt-0.5 leading-relaxed line-clamp-2">
                        {notif.body}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-text-muted">
                        <Clock className="w-3 h-3 text-text-dim shrink-0" />
                        <span>{formatRelativeTime(notif.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                );

                if (notif.href) {
                  return (
                    <Link key={notif.id} href={notif.href} className="block">
                      {content}
                    </Link>
                  );
                }

                return <div key={notif.id}>{content}</div>;
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
