"use client";
import { toast } from "sonner";

import { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if device is iOS to show manual instruction if needed
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Standard PWA install prompt for Android/Chrome
    const handler = (e) => {
      e.preventDefault();
      
      // Only show on mobile devices
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobi/i.test(userAgent);
      if (isMobile || window.innerWidth < 768) {
        setDeferredPrompt(e);
        setIsVisible(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsVisible(false);
    } else if (isIOSDevice && !window.navigator.standalone) {
      // Show prompt for iOS users eventually (they don't get beforeinstallprompt)
      // Optional: uncomment below to show for iOS
      // setIsVisible(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        toast.info('Aby zainstalować aplikację na iOS, tapnij ikonę udostępniania na dole ekranu i wybierz "Do ekranu początkowego".');
      }
      return;
    }
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleCloseClick = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] animate-in slide-in-from-bottom-8 duration-500 fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-4 flex items-center gap-4 max-w-md mx-auto relative overflow-hidden backdrop-blur-xl bg-opacity-95 dark:bg-opacity-95">
        
        {/* Abstract glow */}
        <div className="absolute -left-10 -top-10 w-32 h-32 bg-zinc-500/10 rounded-full blur-2xl"></div>
        
        <img 
          src="/icon-192x192.png" 
          alt="BMS Logo" 
          className="w-14 h-14 rounded-xl object-cover shadow-md bg-zinc-950 p-1.5 relative z-10 shrink-0" 
        />
        
        <div className="flex-1 relative z-10">
          <h3 className="font-bold text-zinc-900 dark:text-white text-[15px] leading-tight">Bojar Manager</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Zainstaluj aplikację na telefonie</p>
        </div>
        
        <div className="flex flex-col gap-2 relative z-10 shrink-0">
          <button 
            onClick={handleInstallClick}
            className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <Smartphone className="w-3.5 h-3.5" />
            Zainstaluj
          </button>
        </div>
        
        <button 
          onClick={handleCloseClick}
          className="absolute top-1.5 right-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1"
          aria-label="Zamknij"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
