"use client";
import { toast } from "sonner";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Clock, CheckCircle2, XCircle, ChevronRight, Activity, AlertTriangle } from "lucide-react";

export default function ExamPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type"); // 'license' or 'medical'

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [examFinished, setExamFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [maxPoints, setMaxPoints] = useState(0);
  
  // Timer logic
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minut

  async function submitResult(isPassed, finalScore) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/exams/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, passed: isPassed, score: finalScore })
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Wystąpił błąd podczas zapisywania wyniku.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Błąd połączenia z serwerem.");
    } finally {
      setSubmitting(false);
    }
  }

  async function finishExam(timeout = false) {
    setExamFinished(true);
    let totalPointsEarned = 0;
    let calculatedMaxPoints = 0;

    questions.forEach((q, index) => {
      calculatedMaxPoints += q.points;
      if (answers[index] === q.answer) {
        totalPointsEarned += q.points;
      }
    });

    setScore(totalPointsEarned);
    setMaxPoints(calculatedMaxPoints);

    let isPassed = false;
    if (type === "license") {
      // Ułatwione: Wymagane 70% punktów zamiast 92%
      isPassed = totalPointsEarned >= Math.ceil(calculatedMaxPoints * 0.70);
    } else {
      // Ułatwione: Wymagane 70% punktów zamiast 80%
      isPassed = totalPointsEarned >= Math.ceil(calculatedMaxPoints * 0.70);
    }

    setPassed(isPassed);
    submitResult(isPassed, totalPointsEarned);
  }

  async function fetchQuestions() {
    try {
      const res = await fetch(`/api/exams/questions?type=${type}`);
      const data = await res.json();
      if (data.questions) {
        setQuestions(data.questions);
      } else {
        toast.error(data.error || "Błąd pobierania pytań");
        router.push("/dashboard/documents");
      }
    } catch (err) {
      console.error(err);
      toast.error("Błąd połączenia z serwerem.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!type) {
      router.push("/dashboard/documents");
      return;
    }
    const timer = setTimeout(() => {
      fetchQuestions();
    }, 0);
    return () => clearTimeout(timer);
  }, [type, router]);

  useEffect(() => {
    if (loading || examFinished) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishExam(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, examFinished]);

  const handleAnswer = (option) => {
    setAnswers({ ...answers, [currentQuestionIndex]: option });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishExam();
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-zinc-500">Ładowanie egzaminu...</div>;
  }

  if (examFinished) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 text-center">
        <div className={`p-8 rounded-3xl border shadow-sm ${passed ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900/30' : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900/30'}`}>
          {passed ? (
            <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
          ) : (
            <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
          )}
          <h1 className="text-3xl font-bold mb-2">
            {passed ? "Gratulacje, Zdałeś!" : "Niestety, nie zdałeś."}
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6">
            Twój wynik: <span className="font-bold text-zinc-900 dark:text-white">{score}</span> / {maxPoints} punktów (Wymagane {Math.ceil(maxPoints * 0.70)} pkt).
          </p>
          
          {submitting ? (
            <p className="text-zinc-500 animate-pulse">Zapisywanie wyniku i przetwarzanie płatności...</p>
          ) : (
            <button 
              onClick={() => router.push("/dashboard/documents")}
              className="px-6 py-3 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              Wróć do dokumentów
            </button>
          )}
        </div>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentQ = questions[currentQuestionIndex];
  const isAnswered = answers[currentQuestionIndex] !== undefined;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
            {type === "license" ? <ShieldCheck className="w-5 h-5 text-zinc-600 dark:text-zinc-400" /> : <Activity className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />}
          </div>
          <div>
            <h2 className="font-semibold">{type === "license" ? "Egzamin Teoretyczny C+E" : "Badania Psychologiczne"}</h2>
            <p className="text-sm text-zinc-500">Pytanie {currentQuestionIndex + 1} z {questions.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 font-mono font-bold text-lg bg-amber-50 dark:bg-amber-500/10 px-4 py-2 rounded-xl">
          <Clock className="w-5 h-5" />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-8">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
              Wartość: {currentQ.points} pkt
            </span>
          </div>
          <h3 className="text-2xl font-bold leading-tight">{currentQ.text}</h3>
        </div>

        <div className="space-y-3">
          {currentQ.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(option)}
              className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                answers[currentQuestionIndex] === option
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <span className="font-medium">{option}</span>
            </button>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
          <button
            onClick={handleNext}
            disabled={!isAnswered}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-xl font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {currentQuestionIndex < questions.length - 1 ? "Następne pytanie" : "Zakończ egzamin"}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
