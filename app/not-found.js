import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mb-6 border border-amber-500/20">
        <AlertTriangle className="w-10 h-10" />
      </div>
      <h1 className="text-4xl font-bold mb-2">404 - Strona nie została znaleziona</h1>
      <p className="text-zinc-400 max-w-md mb-8 leading-relaxed">
        Przepraszamy, ale strona której szukasz nie istnieje lub została przeniesiona pod inny adres.
      </p>
      <Link
        href="/dashboard"
        className="px-6 py-3 bg-zinc-100 text-zinc-900 hover:bg-white rounded-xl font-medium transition-colors"
      >
        Wróć do pulpitu
      </Link>
    </div>
  );
}
