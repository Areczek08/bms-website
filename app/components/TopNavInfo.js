"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Wallet, Clock, Calendar, Bell, Info, AlertTriangle, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export function TopNavInfo() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [balance, setBalance] = useState(0);
  const [time, setTime] = useState(new Date());
  
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (session?.user) {
      // Fetch balance
      fetch("/api/user/header")
        .then(res => res.json())
        .then(data => {
          if (data.balance !== undefined) setBalance(data.balance);
        })
        .catch(console.error);

      // Fetch notifications
      fetch("/api/user/notifications")
        .then(res => res.json())
        .then(data => {
          if (data.notifications) {
            setNotifications(data.notifications);
            const lastSeen = localStorage.getItem("lastSeenNotifs");
            const currentIds = data.notifications.map(n => n.id).join(",");
            if (data.notifications.length > 0 && lastSeen !== currentIds) {
              setHasUnread(true);
            }
          }
        })
        .catch(console.error);
    }
  }, [session]);

  useEffect(() => {
    // Jeśli użytkownik jest na stronie ogłoszeń, uznajemy je za przeczytane
    if (pathname === "/dashboard/news" && notifications.length > 0) {
      setHasUnread(false);
      localStorage.setItem("lastSeenNotifs", notifications.map(n => n.id).join(","));
    }
  }, [pathname, notifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString("pl-PL", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("pl-PL", { hour: '2-digit', minute:'2-digit', second:'2-digit' });
  };

  if (!session?.user || pathname === "/") return null;

  return (
    <>
      <div className="flex items-center gap-4 mr-4 hidden md:flex">
        {/* Powiadomienia */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              if (!isNotifOpen) {
                setHasUnread(false);
                localStorage.setItem("lastSeenNotifs", notifications.map(n => n.id).join(","));
              }
            }}
            className="relative p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors shadow-sm"
          >
            <Bell className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </button>

          <AnimatePresence>
            {isNotifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50">
                  <h3 className="font-semibold text-sm">Powiadomienia</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-zinc-500 text-sm">
                      Brak nowych powiadomień
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {notifications.map(n => (
                        <Link 
                          key={n.id} 
                          href={n.link || "#"}
                          onClick={() => setIsNotifOpen(false)}
                          className="flex gap-3 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                        >
                          <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            n.type === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' :
                            n.type === 'success' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' :
                            'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                          }`}>
                            {n.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
                             n.type === 'success' ? <CheckCircle className="w-4 h-4" /> :
                             <Info className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{n.title}</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">{n.message}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Stan Konta */}
        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <Wallet className="w-4 h-4 text-amber-500" />
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">{Number(balance).toLocaleString()}</span>
            <span className="text-xs font-bold text-zinc-500">zł</span>
          </div>
        </div>
        
        {/* Data i Czas */}
        <div className="flex items-center gap-3 bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-1.5 border-r border-zinc-300 dark:border-zinc-700 pr-3">
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 capitalize">{formatDate(time)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-green-500" />
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 font-mono tracking-wider">{formatTime(time)}</span>
          </div>
        </div>
      </div>
    </>
  );
}
