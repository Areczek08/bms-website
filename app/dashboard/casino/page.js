"use client";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Coins, 
  Loader2, 
  RotateCcw, 
  Trophy, 
  Zap, 
  Sparkles, 
  Crown, 
  Flame, 
  History, 
  TrendingUp, 
  ShieldCheck,
  ChevronRight,
  Volume2,
  VolumeX,
  Star,
  Skull
} from "lucide-react";

// Generate static roulette sequence for horizontal strip
const ROULETTE_NUMBERS = [
  { num: 0, color: "GREEN" },
  { num: 1, color: "RED" }, { num: 14, color: "BLACK" }, { num: 2, color: "RED" }, { num: 13, color: "BLACK" },
  { num: 3, color: "RED" }, { num: 12, color: "BLACK" }, { num: 4, color: "RED" }, { num: 11, color: "BLACK" },
  { num: 5, color: "RED" }, { num: 10, color: "BLACK" }, { num: 6, color: "RED" }, { num: 9, color: "BLACK" },
  { num: 7, color: "RED" }, { num: 8, color: "BLACK" },
];

export default function CasinoPage() {
  const { data: session } = useSession();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ROULETTE"); // ROULETTE | SLOTS

  // Sound & FX toggle
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Roulette State
  const [betAmount, setBetAmount] = useState(100);
  const [betType, setBetType] = useState("RED");
  const [spinning, setSpinning] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [history, setHistory] = useState([
    { color: "RED", num: 3 },
    { color: "BLACK", num: 12 },
    { color: "RED", num: 7 },
    { color: "GREEN", num: 0 },
    { color: "BLACK", num: 10 },
    { color: "RED", num: 1 },
    { color: "BLACK", num: 14 },
  ]);

  // Horizontal Wheel Strip state
  const [wheelItems, setWheelItems] = useState([]);
  const [wheelOffset, setWheelOffset] = useState(0);
  const wheelContainerRef = useRef(null);
  const currentTileIndexRef = useRef(10);
  const currentAudioRef = useRef(null);

  // Jackpot Celebration Modal State
  const [jackpotModal, setJackpotModal] = useState(null);
  // Loss Celebration Modal State
  const [lossModal, setLossModal] = useState(null);

  useEffect(() => {
    fetchBalance();
    initWheel();
  }, []);

  const fetchBalance = async () => {
    try {
      const res = await fetch("/api/user/header");
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const stopAudio = () => {
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      } catch (e) {
        console.log("Audio stop error:", e);
      }
      currentAudioRef.current = null;
    }
  };

  const triggerWinCelebration = (winAmount, game) => {
    stopAudio();
    setJackpotModal({ winAmount, game });
    try {
      const audio = new Audio("/sounds/jackpot_win.mp4");
      audio.volume = 0.8;
      currentAudioRef.current = audio;
      audio.play().catch(err => console.log("Audio playback deferred by browser:", err));
    } catch (e) {
      console.error("Audio error:", e);
    }
  };

  const triggerLossCelebration = (lostAmount, game) => {
    stopAudio();
    setLossModal({ lostAmount, game });
    try {
      const audio = new Audio("/sounds/loss_sound.mp3");
      audio.volume = 0.8;
      currentAudioRef.current = audio;
      audio.play().catch(err => console.log("Loss audio playback deferred by browser:", err));
    } catch (e) {
      console.error("Loss audio error:", e);
    }
  };

  const closeJackpotModal = () => {
    stopAudio();
    setJackpotModal(null);
  };

  const closeLossModal = () => {
    stopAudio();
    setLossModal(null);
  };

  const initWheel = () => {
    // Generate large initial sequence (150 repeats = 2250 tiles)
    const items = [];
    for (let i = 0; i < 150; i++) {
      items.push(...ROULETTE_NUMBERS);
    }
    setWheelItems(items);

    // Initial offset position centered around tile 10
    const itemWidth = 80;
    const containerWidth = 700;
    const centerOffset = containerWidth / 2 - itemWidth / 2;
    setWheelOffset(-(10 * itemWidth - centerOffset));
    currentTileIndexRef.current = 10;
  };

  const playRoulette = async () => {
    const betNum = Number(betAmount);
    if (!betNum || betNum <= 0) return toast.error("Wprowadź poprawną kwotę zakładu!");
    if (betNum > balance) return toast.error("Brak wystarczających środków na koncie!");

    setSpinning(true);
    setLastResult(null);

    try {
      const res = await fetch("/api/casino/play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game: "ROULETTE", betAmount: betNum, betType })
      });
      const data = await res.json();

      if (!data.success) {
        toast.error(data.error || "Błąd gry");
        setSpinning(false);
        return;
      }

      // Ensure wheel always spins FORWARD by picking a target index strictly greater than current + 35
      const targetColor = data.result; // GREEN | RED | BLACK
      const minIndex = currentTileIndexRef.current + 35;
      
      let targetIndex = wheelItems.findIndex((item, idx) => idx >= minIndex && item.color === targetColor);
      
      if (targetIndex === -1 || targetIndex > wheelItems.length - 30) {
        // Expand wheel strip if approaching end
        const extraItems = [];
        for (let i = 0; i < 50; i++) {
          extraItems.push(...ROULETTE_NUMBERS);
        }
        setWheelItems(prev => [...prev, ...extraItems]);
        targetIndex = minIndex + 5;
      }

      currentTileIndexRef.current = targetIndex;

      const itemWidth = 80; // width of tile (72px + 8px gap)
      const containerWidth = wheelContainerRef.current ? wheelContainerRef.current.offsetWidth : 700;
      const centerOffset = containerWidth / 2 - itemWidth / 2;
      const randomRandomness = (Math.random() - 0.5) * 36; // natural offset within tile
      const targetX = -(targetIndex * itemWidth - centerOffset + randomRandomness);

      setWheelOffset(targetX);

      // Finish animation delay (4 seconds spin)
      setTimeout(() => {
        setBalance(data.newBalance);
        const winTile = wheelItems[targetIndex] || { num: 7, color: targetColor };
        setLastResult({ color: targetColor, winAmount: data.winAmount });
        setHistory(prev => [{ color: targetColor, num: winTile.num }, ...prev.slice(0, 9)]);
        setSpinning(false);

        if (data.winAmount > 0) {
          triggerWinCelebration(data.winAmount, "ROULETTE");
          toast.success(`WYGRANA! +${data.winAmount.toLocaleString()} PLN! 🎉`, {
            style: { background: "#065f46", color: "#fff", borderColor: "#10b981" }
          });
        } else {
          triggerLossCelebration(betNum, "ROULETTE");
          toast.error(`Przegrana: -${betNum.toLocaleString()} PLN`, {
            style: { background: "#7f1d1d", color: "#fff", borderColor: "#ef4444" }
          });
        }
      }, 4000);

    } catch (e) {
      console.error(e);
      toast.error("Błąd połączenia z serwerem.");
      setSpinning(false);
    }
  };

  const setBetMultiplier = (factor) => {
    if (factor === "HALF") setBetAmount(prev => Math.max(10, Math.floor(prev / 2)));
    else if (factor === "DOUBLE") setBetAmount(prev => Math.min(balance, prev * 2));
    else if (factor === "MAX") setBetAmount(balance);
    else setBetAmount(prev => prev + factor);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
        <p className="text-amber-400 font-bold tracking-wider text-sm">ŁADOWANIE KASYNO SZKIEŁY sp. z o.o. ...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8 text-white">
      
      {/* 👑 VIP LUXURY HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-950 via-amber-950/40 to-zinc-950 border border-amber-500/30 p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.15)]">
        {/* Glow ambient circle background */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
              <Crown className="w-3.5 h-3.5" /> High Roller VTC Club
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 flex items-center gap-3">
              <Coins className="w-9 h-9 text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
              KASYNO SZKIEŁY sp. z o.o.
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-lg">
              Jedyne legalne kasyno w Poznaniu, Pamiętaj aby grać z głową!
            </p>
          </div>

          {/* Balance Display Card */}
          <div className="w-full md:w-auto bg-slate-900/80 backdrop-blur-xl border border-amber-500/30 p-4 px-6 rounded-2xl flex justify-between md:flex-col items-center md:items-end shadow-xl">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-amber-400" /> Saldo Gracza
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 drop-shadow-md">
              {Number(balance).toLocaleString()} <span className="text-sm font-normal text-amber-400">PLN</span>
            </div>
          </div>
        </div>

        {/* Live Game Info */}
        <div className="mt-8 flex items-center justify-end border-t border-amber-500/20 pt-6">

          <div className="hidden sm:flex items-center gap-4 text-xs text-zinc-400">
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-amber-400" /> Szybkie Wypłaty
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-yellow-400" /> Fair Play Provable
            </div>
          </div>
        </div>
      </div>

      {/* 🎯 GAME CONTENT CONTAINER */}
      <AnimatePresence mode="wait">
        <motion.div 
          key="roulette"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* LEWA KOLUMNA: GRA RULETKA */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-6">
              
              {/* Top History Bar */}
              <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                  <History className="w-4 h-4 text-amber-400" /> Ostatnie Wlosowania:
                </div>
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {history.map((h, i) => (
                    <span 
                      key={i}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border shadow-sm ${
                        h.color === "GREEN" 
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" 
                          : h.color === "RED" 
                          ? "bg-red-500/20 text-red-400 border-red-500/40" 
                          : "bg-zinc-800 text-zinc-300 border-zinc-700"
                      }`}
                    >
                      {h.num}
                    </span>
                  ))}
                </div>
              </div>

              {/* CS:GO Style Horizontal Carousel */}
              <div className="relative py-6 bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden shadow-inner" ref={wheelContainerRef}>
                
                {/* Center Indicator Needle */}
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 z-20 bg-amber-400 shadow-[0_0_15px_#f59e0b] pointer-events-none">
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-amber-400" />
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-amber-400" />
                </div>

                {/* Left / Right Fading Overlay Gradients */}
                <div className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-zinc-950 to-transparent z-10 pointer-events-none" />
                <div className="absolute top-0 bottom-0 right-0 w-20 bg-gradient-to-l from-zinc-950 to-transparent z-10 pointer-events-none" />

                {/* Moving Tile Strip */}
                <motion.div 
                  className="flex items-center gap-2 px-4"
                  animate={{ x: wheelOffset }}
                  transition={{ duration: spinning ? 4 : 0, ease: [0.12, 0.8, 0.25, 1] }}
                >
                  {wheelItems.map((item, idx) => (
                    <div
                      key={idx}
                      className={`w-[72px] h-[80px] shrink-0 rounded-xl flex flex-col items-center justify-center font-mono font-black text-xl border-2 shadow-lg transition-transform ${
                        item.color === "GREEN"
                          ? "bg-gradient-to-b from-emerald-600 to-emerald-800 text-white border-emerald-400 shadow-emerald-500/20"
                          : item.color === "RED"
                          ? "bg-gradient-to-b from-red-600 to-red-800 text-white border-red-400 shadow-red-500/20"
                          : "bg-gradient-to-b from-zinc-800 to-zinc-950 text-zinc-100 border-zinc-700 shadow-black/40"
                      }`}
                    >
                      <span>{item.num}</span>
                      <span className="text-[10px] font-sans font-bold opacity-75 uppercase mt-0.5">
                        {item.color === "GREEN" ? "36x" : "2x"}
                      </span>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Bet Controls & Color Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                
                {/* RED (2x) */}
                <button
                  onClick={() => setBetType("RED")}
                  disabled={spinning}
                  className={`p-4 rounded-2xl border-2 font-black transition-all flex flex-col items-center justify-center gap-1.5 relative overflow-hidden group ${
                    betType === "RED"
                      ? "bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_25px_rgba(239,68,68,0.25)]"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-red-500/50 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2 text-base">
                    <span className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]" />
                    CZERWONE
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 font-mono font-bold">
                    WYGRANA 2X
                  </span>
                </button>

                {/* GREEN (14x) */}
                <button
                  onClick={() => setBetType("GREEN")}
                  disabled={spinning}
                  className={`p-4 rounded-2xl border-2 font-black transition-all flex flex-col items-center justify-center gap-1.5 relative overflow-hidden group ${
                    betType === "GREEN"
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.25)]"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-emerald-500/50 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2 text-base">
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                    ZIELONE (ZERO)
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-mono font-bold">
                    JACKPOT 36X
                  </span>
                </button>

                {/* BLACK (2x) */}
                <button
                  onClick={() => setBetType("BLACK")}
                  disabled={spinning}
                  className={`p-4 rounded-2xl border-2 font-black transition-all flex flex-col items-center justify-center gap-1.5 relative overflow-hidden group ${
                    betType === "BLACK"
                      ? "bg-zinc-800/80 border-zinc-400 text-white shadow-[0_0_25px_rgba(255,255,255,0.15)]"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-500 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2 text-base">
                    <span className="w-3.5 h-3.5 rounded-full bg-zinc-300 shadow-[0_0_10px_#fff]" />
                    CZARNE
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono font-bold">
                    WYGRANA 2X
                  </span>
                </button>
              </div>

              {/* Amount Input & Quick Multipliers */}
              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="w-full sm:w-1/2 space-y-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Stawka Zakładu (PLN)</label>
                    <div className="relative">
                      <input 
                        type="number"
                        min="1"
                        value={betAmount}
                        onChange={(e) => setBetAmount(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 focus:border-amber-500 rounded-xl p-3 pl-4 pr-16 font-mono font-bold text-white outline-none text-base transition-colors"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-xs text-amber-400">PLN</span>
                    </div>
                  </div>

                  {/* Multipliers Bar */}
                  <div className="w-full sm:w-1/2 flex items-center gap-1.5 pt-5">
                    <button onClick={() => setBetMultiplier(100)} className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-xl font-mono text-xs font-bold text-zinc-300 transition-all">+100</button>
                    <button onClick={() => setBetMultiplier(500)} className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-xl font-mono text-xs font-bold text-zinc-300 transition-all">+500</button>
                    <button onClick={() => setBetMultiplier("HALF")} className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-xl font-mono text-xs font-bold text-zinc-300 transition-all">1/2</button>
                    <button onClick={() => setBetMultiplier("DOUBLE")} className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-xl font-mono text-xs font-bold text-amber-400 transition-all">2X</button>
                    <button onClick={() => setBetMultiplier("MAX")} className="flex-1 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-xl font-mono text-xs font-bold text-amber-400 transition-all">MAX</button>
                  </div>
                </div>

                {/* Spin Button */}
                <button
                  onClick={playRoulette}
                  disabled={spinning}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-zinc-950 font-black text-base sm:text-lg tracking-wider uppercase transition-all shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_40px_rgba(245,158,11,0.5)] flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {spinning ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      LOSOWANIE W TOKU...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      POSTAW ZAKŁAD I KRĘĆ!
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>

          {/* PRAWA KOLUMNA: PIONOWY ODTWARZACZ WIDEO Z PORADĄ */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-zinc-900/90 border border-amber-500/30 rounded-3xl p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between space-y-4">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/30">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white tracking-tight">Porada Krupiera</h3>
                    <p className="text-[11px] text-zinc-400">Bartosz Pińczuk o tym jak grać i wygrywać</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-[10px] uppercase">
                  Wideo
                </span>
              </div>

              {/* Vertical Video Player Component */}
              <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-inner group">
                <video 
                  controls 
                  loop 
                  playsInline
                  className="w-full aspect-[9/16] object-cover rounded-2xl max-h-[500px]"
                  src="/videos/casino_tip.mp4"
                />
              </div>

              {/* Bottom Tip Footer */}
              <div className="bg-zinc-950/80 border border-zinc-800 p-3 rounded-2xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <Crown className="w-3.5 h-3.5" /> Taktyczny Sekret Ruletki
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Pamiętaj o rozsądnym zarządzaniu kapitałem firmowym. Obejrzyj powyższy poradnik i unikaj stawiania całości salda na jeden kolor!
                </p>
              </div>

            </div>
          </div>

        </motion.div>
      </AnimatePresence>

      {/* 🎆 MEGA JACKPOT CELEBRATION OVERLAY */}
      <AnimatePresence>
        {jackpotModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-hidden"
          >
            {/* Animated Golden Rays / Particles Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/30 via-zinc-950/90 to-zinc-950 pointer-events-none" />
            
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
              className="absolute w-[800px] h-[800px] bg-gradient-to-tr from-amber-500/15 via-yellow-500/10 to-transparent rounded-full blur-3xl pointer-events-none"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.3, opacity: 0, y: 50, rotate: -5 }}
              animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.3, opacity: 0, y: 50, rotate: 5 }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
              className="relative z-10 max-w-lg w-full bg-gradient-to-b from-zinc-900 via-amber-950/60 to-zinc-950 border-2 border-amber-500/60 rounded-3xl p-8 text-center space-y-6 shadow-[0_0_90px_rgba(245,158,11,0.6)] overflow-hidden"
            >
              {/* Glowing Corner Accents */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-400/30 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-yellow-500/30 rounded-full blur-2xl pointer-events-none" />

              {/* Animated Crown Icon */}
              <motion.div 
                animate={{ scale: [1, 1.25, 1], rotate: [0, 8, -8, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-500 to-amber-600 border-2 border-yellow-200 flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.9)]"
              >
                <Crown className="w-14 h-14 text-zinc-950 drop-shadow-md" />
              </motion.div>

              {/* Jackpot Titles */}
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-xs tracking-widest uppercase">
                  <Sparkles className="w-3.5 h-3.5" /> KASYNO SZKIEŁY sp. z o.o.
                </div>
                <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-500 drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
                  {jackpotModal.winAmount >= 1000 ? "MEGA JACKPOT!" : "WIELKA WYGRANA!"}
                </h2>
                <p className="text-zinc-300 text-xs sm:text-sm">
                  Gratulacje! Twój zakład zakończył się spektakularnym sukcesem.
                </p>
              </div>

              {/* Win Amount Box */}
              <div className="bg-zinc-950/90 border border-amber-500/40 p-6 rounded-2xl shadow-inner space-y-1">
                <p className="text-xs font-bold text-amber-400/80 uppercase tracking-widest">Wygrałeś Łącznie</p>
                <div className="text-4xl sm:text-5xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-400 to-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                  +{jackpotModal.winAmount.toLocaleString()} <span className="text-2xl text-emerald-400">PLN</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={closeJackpotModal}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-zinc-950 font-black text-lg tracking-wider uppercase transition-all shadow-[0_0_40px_rgba(245,158,11,0.6)] flex items-center justify-center gap-2 group"
              >
                <Coins className="w-6 h-6 text-zinc-950 group-hover:scale-110 transition-transform" />
                ODBIERZ WYGRANĄ DO SALDA!
              </button>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 💀 BANKRUPT / LOSS OVERLAY */}
      <AnimatePresence>
        {lossModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-hidden"
          >
            {/* Animated Red Pulse Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-600/30 via-zinc-950/90 to-zinc-950 pointer-events-none" />
            
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
              className="absolute w-[800px] h-[800px] bg-gradient-to-tr from-red-600/15 via-rose-500/10 to-transparent rounded-full blur-3xl pointer-events-none"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.3, opacity: 0, y: 50, rotate: 5 }}
              animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.3, opacity: 0, y: 50, rotate: -5 }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
              className="relative z-10 max-w-lg w-full bg-gradient-to-b from-zinc-900 via-red-950/60 to-zinc-950 border-2 border-red-500/60 rounded-3xl p-8 text-center space-y-6 shadow-[0_0_90px_rgba(239,68,68,0.6)] overflow-hidden"
            >
              {/* Glowing Corner Accents */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-500/30 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-rose-600/30 rounded-full blur-2xl pointer-events-none" />

              {/* Animated Skull Icon */}
              <motion.div 
                animate={{ scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-red-600 via-rose-700 to-red-900 border-2 border-red-400 flex items-center justify-center shadow-[0_0_50px_rgba(239,68,68,0.9)]"
              >
                <Skull className="w-14 h-14 text-white drop-shadow-md" />
              </motion.div>

              {/* Loss Titles */}
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 font-extrabold text-xs tracking-widest uppercase">
                  <Flame className="w-3.5 h-3.5" /> BŁĄD TAKTYCZNY
                </div>
                <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-300 via-rose-500 to-red-600 drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
                  NIE TYM RAZEM!
                </h2>
                <p className="text-zinc-300 text-xs sm:text-sm">
                  Kasyno zatrzymało Twoją stawkę. Przeanalizuj taktykę Krupiera i spróbuj ponownie!
                </p>
              </div>

              {/* Loss Amount Box */}
              <div className="bg-zinc-950/90 border border-red-500/40 p-6 rounded-2xl shadow-inner space-y-1">
                <p className="text-xs font-bold text-red-400/80 uppercase tracking-widest">Straciłeś Stawkę</p>
                <div className="text-4xl sm:text-5xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-500 to-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                  -{lossModal.lostAmount.toLocaleString()} <span className="text-2xl text-red-400">PLN</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={closeLossModal}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-black text-lg tracking-wider uppercase transition-all shadow-[0_0_40px_rgba(239,68,68,0.6)] flex items-center justify-center gap-2 group"
              >
                <RotateCcw className="w-6 h-6 text-white group-hover:rotate-180 transition-transform duration-500" />
                SPRÓBUJ PONOWNIE!
              </button>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

