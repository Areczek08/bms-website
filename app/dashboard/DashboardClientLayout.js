"use client";

import { Sidebar } from "../components/Sidebar";
import { WelcomeModal } from "../components/WelcomeModal";
import { useSession, signOut } from "next-auth/react";
import { Clock, LogOut } from "lucide-react";
import { useEffect } from "react";

export default function DashboardClientLayout({ children }) {
  const { data: session, status, update } = useSession();

  useEffect(() => {
    let interval;
    if (session?.user?.driverStatus === "WAITING_FOR_APPROVAL") {
      interval = setInterval(() => {
        update();
      }, 5000);
    } else if (session?.user?.id) {
      fetch('/api/user/heartbeat', { method: 'PUT' }).catch(e => console.error(e));
      interval = setInterval(() => {
        fetch('/api/user/heartbeat', { method: 'PUT' }).catch(e => console.error(e));
      }, 60000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [session?.user?.driverStatus, update, session?.user?.id]);

  if (status === "loading") {
    return <div className="flex h-[80vh] items-center justify-center">Ładowanie...</div>;
  }

  if (session?.user?.driverStatus === "WAITING_FOR_APPROVAL") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 rounded-full flex items-center justify-center mb-6">
          <Clock className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Konto oczekuje na weryfikację</h1>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-lg mb-8 leading-relaxed">
          Zarząd otrzymał już Twoje zgłoszenie. Gdy Twoje konto zostanie zaakceptowane (lub odrzucone), otrzymasz powiadomienie e-mail, a dostęp do pełnego systemu dyspozytorni zostanie odblokowany.
        </p>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 rounded-xl font-medium transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Wyloguj się
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-full w-full -mt-8 -mx-4 pb-8 sm:mx-0">
      <WelcomeModal />
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        {children}
      </div>
    </div>
  );
}
