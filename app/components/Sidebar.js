"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { 
  LayoutDashboard, 
  Map, 
  Truck, 
  Users, 
  MapPin,
  ClipboardCheck,
  Briefcase,
  LogOut,
  ShieldCheck,
  FileText,
  Settings,
  Landmark,
  MessageSquare,
  Megaphone,
  Gamepad2,
  Bug,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Car,
  Wrench,
  BarChart3,
  Trophy,
  Fuel
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const role = session?.user?.role || "DRIVER";

  const roleTranslations = {
    DRIVER: "Kierowca",
    DISPATCHER: "Dyspozytor",
    BOARD: "Zarząd",
    OWNER: "Właściciel"
  };

  const displayRole = roleTranslations[role] || role;

  const mainLinks = [
    { name: "Pulpit", href: "/dashboard", icon: LayoutDashboard, roles: ["DRIVER", "DISPATCHER", "BOARD", "OWNER"] },
    { name: "Statystyki Firmy", href: "/dashboard/statistics", icon: BarChart3, roles: ["DRIVER", "DISPATCHER", "BOARD", "OWNER"] },
    { name: "Ogłoszenia", href: "/dashboard/news", icon: Megaphone, roles: ["DRIVER", "DISPATCHER", "BOARD", "OWNER"] },
    { name: "Bank i Finanse", href: "/dashboard/bank", icon: Landmark, roles: ["DRIVER", "DISPATCHER", "BOARD", "OWNER"] },
    { name: "Moje Trasy", href: "/dashboard/jobs", icon: Map, roles: ["DRIVER", "DISPATCHER", "BOARD", "OWNER"] },
    { name: "Dokumenty i Uprawnienia", href: "/dashboard/documents", icon: ShieldCheck, roles: ["DRIVER", "DISPATCHER", "BOARD", "OWNER"] },
    { name: "Dyspozytornia", href: "/dashboard/dispatcher", icon: ClipboardCheck, roles: ["DISPATCHER", "BOARD", "OWNER"] },
    { name: "Zarządzanie Flotą", href: "/dashboard/fleet", icon: Truck, roles: ["DRIVER", "DISPATCHER", "BOARD", "OWNER"] },
    { name: "Lista Kierowców", href: "/dashboard/drivers", icon: Users, roles: ["DISPATCHER", "BOARD", "OWNER"] },
    { name: "Mapa Świata", href: "/dashboard/map", icon: MapPin, roles: ["DRIVER", "DISPATCHER", "BOARD", "OWNER"] },
    { name: "Wnioski", href: "/dashboard/requests", icon: FileText, roles: ["DRIVER", "DISPATCHER", "BOARD", "OWNER"] },
    { name: "Czat Firmowy", href: "/dashboard/chat", icon: MessageSquare, roles: ["DRIVER", "DISPATCHER", "BOARD", "OWNER"] },
    { name: "Karty Paliwowe", href: "/dashboard/fuel", icon: Fuel, roles: ["DRIVER", "DISPATCHER", "BOARD", "OWNER"] },
    { name: "Rozrywka", href: "/dashboard/casino", icon: Gamepad2, roles: ["DRIVER", "DISPATCHER", "BOARD", "OWNER"] },
  ];

  const adminLinks = [
    { name: "Zgłoszone Błędy", href: "/dashboard/admin/bugs", icon: Bug, roles: ["BOARD", "OWNER"] },
    { name: "Akceptacja Kont", href: "/dashboard/admin/approvals", icon: ShieldCheck, roles: ["BOARD", "OWNER"] },
    { name: "Finanse Firmy (Zarząd)", href: "/dashboard/finance", icon: Briefcase, roles: ["BOARD", "OWNER"] },
    { name: "Zarządzanie Leasingiem", href: "/dashboard/admin/leasing", icon: Car, roles: ["BOARD", "OWNER"] },
    { name: "Bazy Logistyczne", href: "/dashboard/admin/bases", icon: MapPin, roles: ["BOARD", "OWNER"] },
    { name: "Serwisy i Awarie", href: "/dashboard/admin/services", icon: Wrench, roles: ["BOARD", "OWNER"] },
    { name: "Ubezpieczenia Floty", href: "/dashboard/admin/insurance", icon: ShieldCheck, roles: ["BOARD", "OWNER"] },
  ];

  const visibleMainLinks = mainLinks.filter(link => link.roles.includes(role));
  const visibleAdminLinks = adminLinks.filter(link => link.roles.includes(role));

  const hasAdminAccess = visibleAdminLinks.length > 0;

  // Function to close mobile menu on navigation
  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Przycisk mobilny Hamburger */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-40 backdrop-blur-md">
        <span className="font-bold text-sm text-zinc-500 uppercase tracking-wider">Menu Systemowe</span>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Overlay dla mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar kontener */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 h-[100dvh] bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800
        transform transition-transform duration-300 ease-out 
        md:relative md:h-[calc(100vh-4rem)] md:translate-x-0 md:bg-white/50 md:dark:bg-zinc-950/50 md:flex
        flex flex-col
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
        {session?.user?.id ? (
          <Link 
            href={`/dashboard/drivers/${session.user.id}`}
            onClick={handleNavClick}
            className="block mb-8 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/40 transition-all group"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                  Zalogowany jako
                </p>
                <p className="text-sm font-bold mt-0.5 truncate text-zinc-900 dark:text-zinc-100">
                  {session?.user?.discordNick || session?.user?.name || session?.user?.email}
                </p>
                <div className="inline-flex mt-2 items-center px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
                  {displayRole}
                </div>
              </div>
              <div className="relative shrink-0">
                {session?.user?.image ? (
                  <img 
                    src={session.user.image} 
                    alt="Avatar" 
                    className="w-11 h-11 rounded-full object-cover border border-zinc-300 dark:border-zinc-700 group-hover:border-zinc-400 dark:group-hover:border-zinc-600 transition-colors" 
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-500 border border-zinc-300 dark:border-zinc-700 group-hover:border-zinc-400 dark:group-hover:border-zinc-600 transition-colors">
                    {(session?.user?.discordNick || session?.user?.name || "?").charAt(0)}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ) : (
          <div className="mb-8 px-2">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Zalogowany jako
            </p>
            <p className="text-sm font-medium mt-1 truncate">
              {session?.user?.discordNick || session?.user?.name || session?.user?.email}
            </p>
            <div className="inline-flex mt-2 items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
              {displayRole}
            </div>
          </div>
        )}

        {visibleMainLinks.map((link) => {
          const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/dashboard");
          
          return (
            <Link key={link.name} href={link.href} className="block relative" onClick={handleNavClick}>
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive 
                  ? "text-zinc-900 dark:text-zinc-100 font-medium bg-zinc-100/50 dark:bg-zinc-800/50 md:bg-transparent" 
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30"
              }`}>
                <link.icon className="w-5 h-5" />
                <span>{link.name}</span>
              </div>
            </Link>
          );
        })}

        {hasAdminAccess && (
          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button 
              onClick={() => setIsAdminOpen(!isAdminOpen)}
              className="w-full relative flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-colors text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5" />
                <span className="font-medium">Administracja</span>
              </div>
              {isAdminOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            
            <AnimatePresence>
              {isAdminOpen && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pl-8 space-y-1 mt-1 overflow-hidden"
                >
                  {visibleAdminLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link key={link.name} href={link.href} className="block relative" onClick={handleNavClick}>
                        {isActive && (
                          <motion.div 
                            layoutId="sidebar-admin-active"
                            className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                        <div className={`relative flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                          isActive 
                            ? "text-zinc-900 dark:text-zinc-100 font-medium" 
                            : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30"
                        }`}>
                          <link.icon className="w-4 h-4" />
                          <span>{link.name}</span>
                        </div>
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
        <button 
          onClick={() => {
            handleNavClick();
            signOut({ callbackUrl: "/login" });
          }}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Wyloguj się</span>
        </button>
      </div>
    </div>
    </>
  );
}
