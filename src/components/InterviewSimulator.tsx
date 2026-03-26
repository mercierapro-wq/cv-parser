"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, CheckCircle2, ArrowUpRight, RotateCcw, ChevronRight, Minus, Maximize2, Minimize2, History, ChevronLeft } from "lucide-react";
import { CVData } from "@/types/cv";

type InterviewType = "prequalification" | "technique" | "manager" | "rh";
type Phase = "select" | "interview" | "debrief" | "history";

interface APIQuestion {
  id: number;
  question: string;
  tag: string;
  intent: string;
}

interface Message {
  id: string;
  role: "recruiter" | "user";
  content: string;
}

interface AnalyseQuestion {
  id: number;
  qualite_reponse: string;
  commentaire: string;
}

interface Debrief {
  score: number;
  mention: string;
  synthese: string;
  points_forts: string[];
  axes_amelioration: string[];
  analyse_par_question: AnalyseQuestion[];
  conseil: string;
}

interface SavedInterview {
  type: InterviewType;
  messages: Message[];
  debrief: Debrief;
  date: string;
}

interface InterviewSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  cvData: CVData;
  jobOffer?: string;
  /** ID du CV/candidature pour sauvegarder l'entretien dans l'offre associée */
  cvId?: string;
  /** Incrémenter pour forcer l'ouverture du panneau (ex: bouton "Démarrer") */
  expandTrigger?: number;
  /** Ouvrir le panneau directement sans passer par la bulle */
  defaultExpanded?: boolean;
}

const TYPE_CONFIG = {
  prequalification: {
    label: "Préqualification",
    description: "Appel RH de découverte, 15–20 min",
    emoji: "📞",
    color: "bg-sky-50 border-sky-200 text-sky-800",
    badge: "bg-sky-100 text-sky-700",
  },
  technique: {
    label: "Technique",
    description: "Deep-dive compétences & projets",
    emoji: "⚙️",
    color: "bg-violet-50 border-violet-200 text-violet-800",
    badge: "bg-violet-100 text-violet-700",
  },
  manager: {
    label: "Manager N+1",
    description: "Entretien avec votre futur supérieur hiérarchique",
    emoji: "🤝",
    color: "bg-amber-50 border-amber-200 text-amber-800",
    badge: "bg-amber-100 text-amber-700",
  },
  rh: {
    label: "RH",
    description: "Motivation, valeurs, projet professionnel",
    emoji: "💼",
    color: "bg-emerald-50 border-emerald-200 text-emerald-800",
    badge: "bg-emerald-100 text-emerald-700",
  },
} as const;

const CLOSING_MESSAGE =
  "Merci beaucoup pour cet échange, c'était vraiment enrichissant ! Je reviens vers vous très rapidement avec la suite du processus de recrutement. À très bientôt !";

function getScript(type: InterviewType, cvData: CVData): string[] {
  const prenom = cvData.personne?.prenom || "";
  const greeting = prenom ? `Bonjour ${prenom}` : "Bonjour";
  const titre = cvData.personne?.titre_professionnel || "ce rôle";
  const hardSkills = cvData.competences?.hard_skills ?? [];
  const topSkills = hardSkills.slice(0, 3).join(", ") || "vos compétences clés";
  const derniereXp = cvData.experiences?.[0];
  const derniereEntreprise = derniereXp?.entreprise || "votre dernière entreprise";
  const dernierPoste = derniereXp?.poste || titre;

  const scripts: Record<InterviewType, string[]> = {
    prequalification: [
      `${greeting}, je suis Sophie Martin, recruteuse pour ce poste. Merci d'avoir postulé ! Pour commencer, pouvez-vous vous présenter brièvement et m'expliquer ce qui vous a donné envie de postuler ?`,
      `Merci pour cette présentation. Êtes-vous actuellement en poste, et si oui, quelle serait votre disponibilité pour rejoindre une nouvelle structure ?`,
      `Je comprends. Concernant la rémunération, dans quelle fourchette vous positionnez-vous pour un poste comme celui-ci ?`,
      `Bien noté. Ce poste est basé à Paris avec 2 jours de télétravail par semaine. Est-ce que ce format vous convient ?`,
      `Parfait. Dernière question : qu'est-ce qui vous attire dans notre entreprise en particulier, au-delà du poste lui-même ?`,
    ],
    technique: [
      `${greeting}, je suis Thomas Durand, lead tech. Pour commencer, pouvez-vous me décrire un projet technique dont vous êtes particulièrement fier — votre rôle exact et l'impact obtenu ?`,
      `C'est très intéressant. En rapport avec ${topSkills} — pouvez-vous me parler d'un problème technique complexe que vous avez rencontré et de la façon dont vous l'avez résolu ?`,
      `Bonne approche. Comment gérez-vous la revue de code et la qualité dans vos équipes — avez-vous des pratiques spécifiques ?`,
      `Je vois. Si vous deviez améliorer une chose dans les pratiques techniques de votre équipe actuelle chez ${derniereEntreprise}, laquelle serait-ce ?`,
      `C'est honnête. Dernière question : comment vous tenez-vous à jour sur les nouvelles technologies — avez-vous des rituels ou des ressources spécifiques ?`,
    ],
    manager: [
      `${greeting}, je suis Isabelle Peron, directrice du département. J'aimerais mieux comprendre votre façon de travailler. Comment décririez-vous votre style de collaboration au sein d'une équipe ?`,
      `Intéressant. Pouvez-vous me raconter une situation où vous avez eu un désaccord professionnel — avec un collègue ou un manager — et comment vous l'avez géré ?`,
      `Merci pour cet exemple concret. Côté organisation : quand vous avez plusieurs projets urgents en simultané, quelle méthode utilisez-vous pour prioriser ?`,
      `C'est une bonne approche. Qu'est-ce que vos anciens collègues chez ${derniereEntreprise} diraient de vous — y compris une critique constructive ?`,
      `J'apprécie cette lucidité. Pour finir : où vous projetez-vous dans 3 ans, et comment ce poste s'inscrit-il dans cette trajectoire ?`,
    ],
    rh: [
      `${greeting}, je suis Julie Mercier du département RH. Pour commencer, qu'est-ce qui vous a donné envie de postuler chez nous spécifiquement, plutôt que chez un concurrent ?`,
      `C'est motivant à entendre. Quelles sont vos valeurs professionnelles les plus importantes — celles sans lesquelles vous ne pouvez pas vous épanouir au travail ?`,
      `Je comprends. Pouvez-vous me citer une réalisation en tant que ${dernierPoste} dont vous êtes vraiment fier, et m'expliquer pourquoi elle compte pour vous ?`,
      `Bel exemple. Parlez-moi d'une période professionnelle difficile — comment l'avez-vous traversée et qu'en avez-vous appris sur vous-même ?`,
      `Merci pour cette honnêteté. Dernière question : qu'apportez-vous à notre culture d'entreprise, et qu'espérez-vous recevoir de nous en retour ?`,
    ],
  };

  return scripts[type];
}

function getMention(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Très bien";
  if (score >= 60) return "Bien";
  if (score >= 40) return "Passable";
  return "Insuffisant";
}

function generateDebriefFallback(type: InterviewType): Debrief {
  const score = 62 + Math.floor(Math.random() * 27);

  const content: Record<InterviewType, { synthese: string; points_forts: string[]; axes_amelioration: string[] }> = {
    prequalification: {
      synthese: "Entretien de préqualification solide. Vous avez su vous présenter avec clarté et cohérence.",
      points_forts: [
        "Présentation fluide et structurée du parcours",
        "Disponibilité et prétentions salariales cohérentes avec le marché",
        "Motivation exprimée de façon authentique et convaincante",
      ],
      axes_amelioration: [
        "Préparer des questions précises sur le poste et l'équipe pour montrer votre intérêt",
        "Soigner les transitions entre les réponses pour un discours plus fluide",
      ],
    },
    technique: {
      synthese: "Entretien technique satisfaisant. Vos exemples concrets montrent une vraie maîtrise.",
      points_forts: [
        "Exemples techniques concrets et mesurables dans les réponses",
        "Bonne maîtrise du vocabulaire et des enjeux métier",
        "Culture de la qualité bien ancrée dans le discours",
      ],
      axes_amelioration: [
        "Structurer les réponses avec la méthode STAR (Situation → Tâche → Action → Résultat)",
        "Quantifier davantage l'impact business des réalisations techniques",
      ],
    },
    manager: {
      synthese: "Profil managérial convaincant. Vous démontrez une vraie maturité professionnelle.",
      points_forts: [
        "Bonne capacité à prendre du recul sur les expériences passées",
        "Gestion des conflits abordée avec maturité et nuance",
        "Vision de carrière claire et cohérente avec le poste",
      ],
      axes_amelioration: [
        "Illustrer les exemples avec des chiffres concrets (taille d'équipe, objectifs atteints)",
        "Montrer plus de flexibilité dans l'approche selon les contextes",
      ],
    },
    rh: {
      synthese: "Entretien RH convaincant. Votre authenticité et votre cohérence sont vos meilleurs atouts.",
      points_forts: [
        "Valeurs professionnelles clairement articulées et sincères",
        "Bonne adéquation perçue avec la culture de l'entreprise",
        "Authenticité et honnêteté tout au long de l'échange",
      ],
      axes_amelioration: [
        "Approfondir la connaissance de l'entreprise et de son secteur avant l'entretien",
        "Relier plus explicitement les expériences passées aux défis spécifiques du poste",
      ],
    },
  };

  return {
    score,
    mention: getMention(score),
    ...content[type],
    analyse_par_question: [],
    conseil: "",
  };
}

export default function InterviewSimulator({
  isOpen,
  onClose,
  cvData,
  jobOffer,
  cvId,
  expandTrigger = 0,
  defaultExpanded = false,
}: InterviewSimulatorProps) {
  const [phase, setPhase] = useState<Phase>("select");
  const [interviewType, setInterviewType] = useState<InterviewType | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [debrief, setDebrief] = useState<Debrief | null>(null);
  const [minimized, setMinimized] = useState(true); // bulle par défaut
  const [enlarged, setEnlarged] = useState(false);
  const [loadingType, setLoadingType] = useState<InterviewType | null>(null);
  const [loadedQuestions, setLoadedQuestions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [interviews, setInterviews] = useState<SavedInterview[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedHistoryInterview, setSelectedHistoryInterview] = useState<SavedInterview | null>(null);
  const [historyTab, setHistoryTab] = useState<"conversation" | "evaluation">("evaluation");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesRef = useRef<Message[]>([]);
  const interviewTypeRef = useRef<InterviewType | null>(null);
  const jobOfferRef = useRef<string | undefined>(jobOffer || cvData.jobOffer);
  const prevCvIdRef = useRef<string | undefined>(cvId);

  // Sync refs
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { interviewTypeRef.current = interviewType; }, [interviewType]);
  useEffect(() => { jobOfferRef.current = jobOffer || cvData.jobOffer; }, [jobOffer, cvData.jobOffer]);

  // Reset quand l'offre change (sans fermer le panneau)
  useEffect(() => {
    if (prevCvIdRef.current === cvId) return;
    prevCvIdRef.current = cvId;
    setPhase("select");
    setInterviewType(null);
    setMessages([]);
    setInput("");
    setIsTyping(false);
    setQuestionIndex(0);
    setDebrief(null);
    setLoadingType(null);
    setLoadedQuestions([]);
    setIsSaving(false);
    setSaveStatus('idle');
    setInterviews([]);
    setLoadingHistory(false);
    setSelectedHistoryInterview(null);
    setHistoryTab("evaluation");
  }, [cvId]);

  // Reset complet à la fermeture
  useEffect(() => {
    if (!isOpen) {
      setPhase("select");
      setInterviewType(null);
      setMessages([]);
      setInput("");
      setIsTyping(false);
      setQuestionIndex(0);
      setDebrief(null);
      setMinimized(true);
      setEnlarged(false);
      setLoadingType(null);
      setLoadedQuestions([]);
      setIsSaving(false);
      setSaveStatus('idle');
      setInterviews([]);
      setLoadingHistory(false);
      setSelectedHistoryInterview(null);
      setHistoryTab("evaluation");
    }
  }, [isOpen]);

  // Ouvrir le panneau depuis l'extérieur (bouton "Démarrer")
  useEffect(() => {
    if (expandTrigger > 0) setMinimized(false);
  }, [expandTrigger]);

  // Ouvrir directement le panneau si defaultExpanded
  useEffect(() => {
    if (isOpen && defaultExpanded) setMinimized(false);
  }, [isOpen, defaultExpanded]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input
  useEffect(() => {
    if (phase === "interview" && !isTyping && !minimized) {
      inputRef.current?.focus();
    }
  }, [phase, isTyping, minimized]);

  const startInterview = useCallback(
    async (type: InterviewType) => {
      setLoadingType(type);
      let questions: string[] = [];

      try {
        const { profilePicture, profilePictureTransform, ...cvWithoutImage } = cvData;
        const { auth: firebaseAuth } = await import("@/lib/firebase");
        const token = await firebaseAuth.currentUser?.getIdToken();
        if (!token) throw new Error("Session expirée");

        const response = await fetch("/api/n8n-proxy", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: "generate-interview-questions",
            cv: cvWithoutImage,
            job_offer: jobOfferRef.current ?? "",
            interview_type: type,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const apiQuestions: APIQuestion[] =
            (Array.isArray(data) ? data[0]?.output?.questions : data.questions) ?? [];
          questions = apiQuestions.map((q) => q.question);
        }
      } catch {
        // Silently fall back to local script
      }

      if (questions.length === 0) {
        questions = getScript(type, cvData);
      }

      setLoadedQuestions(questions);
      setLoadingType(null);
      setInterviewType(type);
      setMessages([{ id: "init", role: "recruiter", content: questions[0] }]);
      setQuestionIndex(1);
      setPhase("interview");
    },
    [cvData]
  );

  const saveInterview = useCallback(async (debriefData: Debrief) => {
    if (!cvId || !interviewType) return;
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      const { auth: firebaseAuth } = await import("@/lib/firebase");
      const token = await firebaseAuth.currentUser?.getIdToken();
      if (!token) throw new Error("Session expirée");

      const response = await fetch("/api/n8n-proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "save-interview",
          cvId,
          interview: {
            type: interviewType,
            messages: messagesRef.current,
            debrief: debriefData,
            date: new Date().toISOString(),
          },
        }),
      });

      if (response.ok) {
        setSaveStatus('saved');
        setInterviews([]); // invalide le cache pour forcer un re-fetch à la prochaine ouverture
      } else {
        setSaveStatus('error');
      }
    } catch {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  }, [cvId, interviewType, messagesRef]);

  const evaluateInterview = useCallback(
    async (currentMessages: Message[]) => {
      const type = interviewTypeRef.current;
      if (!type) return;

      // Construire les échanges (paires question/réponse)
      const exchanges: { question: string; reponse: string }[] = [];
      for (let i = 0; i < currentMessages.length; i++) {
        if (currentMessages[i].role === "recruiter" && currentMessages[i].content !== CLOSING_MESSAGE) {
          const next = currentMessages[i + 1];
          if (next?.role === "user") {
            exchanges.push({ question: currentMessages[i].content, reponse: next.content });
          }
        }
      }

      try {
        const { profilePicture, profilePictureTransform, ...cvWithoutImage } = cvData;
        const { auth: firebaseAuth } = await import("@/lib/firebase");
        const token = await firebaseAuth.currentUser?.getIdToken();
        if (!token) throw new Error("Session expirée");

        const response = await fetch("/api/n8n-proxy", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: "evaluate-interview",
            cv: cvWithoutImage,
            job_offer: jobOfferRef.current ?? "",
            interview_type: type,
            exchanges,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const result = Array.isArray(data) ? (data[0]?.output ?? data[0]) : data;
          const debriefData: Debrief = {
            score: result.score ?? 0,
            mention: result.mention ?? getMention(result.score ?? 0),
            synthese: result.synthese ?? "",
            points_forts: result.points_forts ?? [],
            axes_amelioration: result.axes_amelioration ?? [],
            analyse_par_question: result.analyse_par_question ?? [],
            conseil: result.conseil ?? "",
          };
          setDebrief(debriefData);
          saveInterview(debriefData);
          return;
        }
      } catch {
        // Fallback ci-dessous
      }

      const fallback = generateDebriefFallback(type);
      setDebrief(fallback);
      saveInterview(fallback);
    },
    [cvData, saveInterview]
  );

  const sendMessage = useCallback(() => {
    if (!input.trim() || isTyping || !interviewType) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const nextQIndex = questionIndex;
    const delay = 1300 + Math.random() * 700;

    setTimeout(() => {
      setIsTyping(false);
      if (nextQIndex < loadedQuestions.length) {
        setMessages((prev) => [
          ...prev,
          { id: `r-${Date.now()}`, role: "recruiter", content: loadedQuestions[nextQIndex] },
        ]);
        setQuestionIndex(nextQIndex + 1);
      } else {
        setMessages((prev) => [
          ...prev,
          { id: "r-closing", role: "recruiter", content: CLOSING_MESSAGE },
        ]);
        setTimeout(() => {
          setPhase("debrief");
          evaluateInterview(messagesRef.current);
        }, 2200);
      }
    }, delay);
  }, [input, isTyping, interviewType, questionIndex, loadedQuestions, evaluateInterview]);

  const handleTerminate = useCallback(() => {
    if (!interviewTypeRef.current || phase !== "interview") return;
    setIsTyping(false);
    setPhase("debrief");
    evaluateInterview(messagesRef.current);
  }, [phase, evaluateInterview]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  const resetSimulator = () => {
    setPhase("select");
    setInterviewType(null);
    setMessages([]);
    setInput("");
    setIsTyping(false);
    setQuestionIndex(0);
    setDebrief(null);
    setLoadingType(null);
    setLoadedQuestions([]);
    setEnlarged(false);
    setSaveStatus('idle');
  };

  const openHistory = useCallback(async () => {
    setPhase("history");
    setSelectedHistoryInterview(null);
    if (!cvId || interviews.length > 0) return;
    setLoadingHistory(true);
    try {
      const { auth: firebaseAuth } = await import("@/lib/firebase");
      const token = await firebaseAuth.currentUser?.getIdToken();
      if (!token) return;
      const response = await fetch("/api/n8n-proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ action: "get-interviews", cvId }),
      });
      if (response.ok) {
        const data = await response.json();
        const list: SavedInterview[] = Array.isArray(data)
          ? (data[0]?.interviews ?? [])
          : (data.interviews ?? []);
        setInterviews(list);
      }
    } catch {
      // ignore
    } finally {
      setLoadingHistory(false);
    }
  }, [cvId, interviews.length]);

  if (!isOpen) return null;

  const typeConfig = interviewType ? TYPE_CONFIG[interviewType] : null;

  return (
    <div className="fixed bottom-6 right-6 z-[300] flex flex-col items-end gap-3">

      {/* ── Minimized bubble ── */}
      {minimized && (
        <button
          onClick={() => setMinimized(false)}
          className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl shadow-indigo-400/40 flex items-center justify-center text-2xl transition-all hover:scale-110 animate-in zoom-in-75 duration-200"
          title="Reprendre l'entretien"
        >
          🎯
        </button>
      )}

      {/* ── Expanded panel ── */}
      {!minimized && (
        <div
          className="bg-white rounded-[1.5rem] shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300 transition-[width,height] duration-300"
          style={
            enlarged
              ? {
                  width: "min(700px, calc(100vw - 3rem))",
                  height: "min(calc(100vh - 4rem), 860px)",
                }
              : {
                  width: "min(380px, calc(100vw - 3rem))",
                  height: "min(580px, calc(100vh - 6rem))",
                }
          }
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center text-base shrink-0">
                🎯
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 leading-tight">
                  Simulateur d&apos;entretien
                </p>
                {cvData.optimizedFor && (
                  <p className="text-[11px] text-slate-500 font-medium truncate max-w-[180px]">
                    {cvData.optimizedFor}
                  </p>
                )}
                {typeConfig && (
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${typeConfig.badge}`}>
                    {typeConfig.label}
                  </span>
                )}
                {!typeConfig && !cvData.optimizedFor && (
                  <p className="text-[11px] text-slate-400 font-medium">Choisissez un type</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              {phase === "interview" && (
                <button
                  onClick={handleTerminate}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
                >
                  Terminer
                </button>
              )}
              <button
                onClick={() => setEnlarged((v) => !v)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                title={enlarged ? "Réduire le panneau" : "Agrandir le panneau"}
              >
                {enlarged ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setMinimized(true)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                title="Réduire"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => { onClose(); setMinimized(true); }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">

            {/* — Phase: Select — */}
            {phase === "select" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3 animate-in fade-in duration-300">
                <p className="text-xs text-slate-500 font-medium">
                  Choisissez le type d&apos;entretien pour lequel vous souhaitez vous entraîner.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(TYPE_CONFIG) as InterviewType[]).map((type) => {
                    const cfg = TYPE_CONFIG[type];
                    const isLoading = loadingType === type;
                    const isDisabled = loadingType !== null;
                    return (
                      <button
                        key={type}
                        onClick={() => startInterview(type)}
                        disabled={isDisabled}
                        className={`p-3 rounded-xl border-2 text-left transition-all hover:shadow-sm ${cfg.color} ${
                          isDisabled && !isLoading ? "opacity-50 cursor-not-allowed" : ""
                        } ${!isDisabled ? "hover:scale-[1.02] active:scale-[0.98]" : ""}`}
                      >
                        {isLoading ? (
                          <span className="text-xl leading-none block mb-1 animate-spin inline-block">⏳</span>
                        ) : (
                          <span className="text-xl leading-none block mb-1">{cfg.emoji}</span>
                        )}
                        <p className="font-bold text-xs leading-tight">{cfg.label}</p>
                        <p className="text-[10px] opacity-65 mt-0.5 font-medium leading-snug">
                          {isLoading ? "Génération des questions…" : cfg.description}
                        </p>
                        {!isLoading && <ChevronRight className="w-3 h-3 opacity-40 mt-1.5 ml-auto" />}
                      </button>
                    );
                  })}
                </div>

                {cvId && (
                  <button
                    onClick={openHistory}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl border border-slate-200 hover:border-indigo-200 transition-all"
                  >
                    <History className="w-3.5 h-3.5" />
                    Historique des entretiens
                  </button>
                )}
              </div>
            )}

            {/* — Phase: Interview — */}
            {phase === "interview" && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 no-scrollbar">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                        msg.role === "user" ? "flex-row-reverse" : ""
                      }`}
                    >
                      {msg.role === "recruiter" && (
                        <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 mt-0.5 text-sm">
                          👩‍💼
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] px-3 py-2.5 rounded-2xl text-[13px] font-medium leading-relaxed whitespace-pre-wrap ${
                          msg.role === "recruiter"
                            ? "bg-slate-100 text-slate-800 rounded-tl-sm"
                            : "bg-indigo-600 text-white rounded-tr-sm"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex gap-2 animate-in fade-in duration-200">
                      <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 text-sm">
                        👩‍💼
                      </div>
                      <div className="bg-slate-100 px-3 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="px-3 pb-3 pt-2 border-t border-slate-100 shrink-0">
                  <div className="flex items-end gap-2 bg-slate-50 rounded-xl border-2 border-slate-100 focus-within:border-indigo-400 focus-within:bg-white transition-all px-3 py-1.5">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={isTyping}
                      placeholder={isTyping ? "Le recruteur répond…" : "Votre réponse…"}
                      rows={1}
                      className="flex-1 bg-transparent resize-none outline-none text-[13px] font-medium text-slate-900 placeholder:text-slate-400 max-h-24 disabled:opacity-40 py-1 leading-relaxed"
                      style={{ minHeight: "32px" }}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim() || isTyping}
                      className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 mb-0.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium mt-1 text-center">
                    Entrée pour envoyer · Shift+Entrée pour sauter une ligne
                  </p>
                </div>
              </>
            )}

            {/* — Phase: Debrief (chargement) — */}
            {phase === "debrief" && !debrief && (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 animate-in fade-in duration-300">
                <div className="w-10 h-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
                <p className="text-xs font-semibold text-slate-500 text-center">
                  Analyse de votre entretien en cours…
                </p>
              </div>
            )}

            {/* — Phase: Debrief (résultats) — */}
            {phase === "debrief" && debrief && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4 animate-in fade-in duration-300">

                {/* Score + Mention */}
                <div className="flex flex-col items-center text-center pt-1">
                  <div className="relative w-24 h-24">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="9" />
                      <circle
                        cx="50" cy="50" r="40" fill="none"
                        stroke={
                          debrief.score >= 90 ? "#22c55e"
                          : debrief.score >= 75 ? "#8b5cf6"
                          : debrief.score >= 60 ? "#6366f1"
                          : debrief.score >= 40 ? "#f59e0b"
                          : "#ef4444"
                        }
                        strokeWidth="9"
                        strokeLinecap="round"
                        strokeDasharray={`${(debrief.score / 100) * 251.3} 251.3`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-slate-900 leading-none">{debrief.score}</span>
                      <span className="text-[10px] font-bold text-slate-400">/100</span>
                    </div>
                  </div>
                  <span className={`mt-2 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    debrief.score >= 90 ? "bg-emerald-100 text-emerald-700"
                    : debrief.score >= 75 ? "bg-violet-100 text-violet-700"
                    : debrief.score >= 60 ? "bg-indigo-100 text-indigo-700"
                    : debrief.score >= 40 ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700"
                  }`}>
                    {debrief.mention}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-2">Bilan de l&apos;entretien</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">{debrief.synthese}</p>
                </div>

                {/* Points forts */}
                {debrief.points_forts.length > 0 && (
                  <div className="space-y-1.5">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wide px-1">Points forts</h4>
                    {debrief.points_forts.map((s, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <p className="text-xs font-medium text-slate-700 leading-snug">{s}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Axes d'amélioration */}
                {debrief.axes_amelioration.length > 0 && (
                  <div className="space-y-1.5">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wide px-1">Axes d&apos;amélioration</h4>
                    {debrief.axes_amelioration.map((imp, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-2.5 bg-amber-50 rounded-xl border border-amber-100">
                        <ArrowUpRight className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs font-medium text-slate-700 leading-snug">{imp}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Analyse par question */}
                {debrief.analyse_par_question.length > 0 && (
                  <div className="space-y-1.5">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wide px-1">Analyse par question</h4>
                    {debrief.analyse_par_question.map((aq) => {
                      const qualiteColor =
                        aq.qualite_reponse === "Excellente" ? "text-emerald-600 bg-emerald-50 border-emerald-100"
                        : aq.qualite_reponse === "Bonne" ? "text-indigo-600 bg-indigo-50 border-indigo-100"
                        : aq.qualite_reponse === "Correcte" ? "text-slate-600 bg-slate-50 border-slate-200"
                        : aq.qualite_reponse === "Insuffisante" ? "text-amber-600 bg-amber-50 border-amber-100"
                        : "text-red-600 bg-red-50 border-red-100"; // Hors sujet
                      return (
                        <div key={aq.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold text-slate-500">Q{aq.id}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${qualiteColor}`}>
                              {aq.qualite_reponse}
                            </span>
                          </div>
                          <p className="text-[11px] font-medium text-slate-600 leading-snug">{aq.commentaire}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Conseil */}
                {debrief.conseil && (
                  <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                    <h4 className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide mb-1">Conseil</h4>
                    <p className="text-xs font-medium text-slate-700 leading-relaxed">{debrief.conseil}</p>
                  </div>
                )}

                {/* Save status */}
                {cvId && (
                  <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium">
                    {isSaving && (
                      <>
                        <div className="w-3 h-3 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
                        <span className="text-slate-400">Sauvegarde en cours…</span>
                      </>
                    )}
                    {!isSaving && saveStatus === 'saved' && (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600">Entretien sauvegardé</span>
                      </>
                    )}
                    {!isSaving && saveStatus === 'error' && (
                      <>
                        <span className="text-red-500">Erreur de sauvegarde ·</span>
                        <button onClick={() => debrief && saveInterview(debrief)} className="text-indigo-600 underline hover:text-indigo-700">
                          Réessayer
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={resetSimulator}
                    className="flex-1 py-2.5 flex items-center justify-center gap-1.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Accueil
                  </button>
                  <button
                    onClick={resetSimulator}
                    className="flex-1 py-2.5 flex items-center justify-center gap-1.5 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 shadow-lg transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Relancer
                  </button>
                </div>
              </div>
            )}

            {/* — Phase: History — */}
            {phase === "history" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3 animate-in fade-in duration-300">

                {/* Back button */}
                <button
                  onClick={() => {
                    if (selectedHistoryInterview) {
                      setSelectedHistoryInterview(null);
                      setHistoryTab("evaluation");
                    } else {
                      setPhase("select");
                    }
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  {selectedHistoryInterview ? "Retour à l'historique" : "Retour"}
                </button>

                {/* Detail view */}
                {selectedHistoryInterview && (() => {
                  const d = selectedHistoryInterview.debrief;
                  const detailCfg = TYPE_CONFIG[selectedHistoryInterview.type] ?? { emoji: "🎯", label: selectedHistoryInterview.type };
                  return (
                    <div className="space-y-3">

                      {/* Header */}
                      <div className="flex items-center gap-2">
                        <span className="text-base">{detailCfg.emoji}</span>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{detailCfg.label}</p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {new Date(selectedHistoryInterview.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                        </div>
                      </div>

                      {/* Tabs */}
                      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
                        <button
                          onClick={() => setHistoryTab("evaluation")}
                          className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                            historyTab === "evaluation" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          Évaluation
                        </button>
                        <button
                          onClick={() => setHistoryTab("conversation")}
                          className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                            historyTab === "conversation" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          Conversation
                        </button>
                      </div>

                      {/* Tab: Évaluation */}
                      {historyTab === "evaluation" && (
                        <div className="space-y-3">
                          <div className="flex flex-col items-center text-center pt-1">
                            <div className="relative w-20 h-20">
                              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="9" />
                                <circle
                                  cx="50" cy="50" r="40" fill="none"
                                  stroke={d.score >= 90 ? "#22c55e" : d.score >= 75 ? "#8b5cf6" : d.score >= 60 ? "#6366f1" : d.score >= 40 ? "#f59e0b" : "#ef4444"}
                                  strokeWidth="9" strokeLinecap="round"
                                  strokeDasharray={`${(d.score / 100) * 251.3} 251.3`}
                                />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-xl font-black text-slate-900 leading-none">{d.score}</span>
                                <span className="text-[10px] font-bold text-slate-400">/100</span>
                              </div>
                            </div>
                            <span className={`mt-2 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                              d.score >= 90 ? "bg-emerald-100 text-emerald-700" : d.score >= 75 ? "bg-violet-100 text-violet-700"
                              : d.score >= 60 ? "bg-indigo-100 text-indigo-700" : d.score >= 40 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                            }`}>{d.mention}</span>
                            <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">{d.synthese}</p>
                          </div>

                          {d.points_forts.length > 0 && (
                            <div className="space-y-1.5">
                              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wide px-1">Points forts</h4>
                              {d.points_forts.map((s, i) => (
                                <div key={i} className="flex items-start gap-2.5 p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                  <p className="text-xs font-medium text-slate-700 leading-snug">{s}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {d.axes_amelioration.length > 0 && (
                            <div className="space-y-1.5">
                              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wide px-1">Axes d&apos;amélioration</h4>
                              {d.axes_amelioration.map((imp, i) => (
                                <div key={i} className="flex items-start gap-2.5 p-2.5 bg-amber-50 rounded-xl border border-amber-100">
                                  <ArrowUpRight className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                  <p className="text-xs font-medium text-slate-700 leading-snug">{imp}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {d.analyse_par_question.length > 0 && (
                            <div className="space-y-1.5">
                              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wide px-1">Analyse par question</h4>
                              {d.analyse_par_question.map((aq) => {
                                const qualiteColor =
                                  aq.qualite_reponse === "Excellente" ? "text-emerald-600 bg-emerald-50 border-emerald-100"
                                  : aq.qualite_reponse === "Bonne" ? "text-indigo-600 bg-indigo-50 border-indigo-100"
                                  : aq.qualite_reponse === "Correcte" ? "text-slate-600 bg-slate-50 border-slate-200"
                                  : aq.qualite_reponse === "Insuffisante" ? "text-amber-600 bg-amber-50 border-amber-100"
                                  : "text-red-600 bg-red-50 border-red-100";
                                return (
                                  <div key={aq.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-[10px] font-bold text-slate-500">Q{aq.id}</span>
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${qualiteColor}`}>{aq.qualite_reponse}</span>
                                    </div>
                                    <p className="text-[11px] font-medium text-slate-600 leading-snug">{aq.commentaire}</p>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {d.conseil && (
                            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                              <h4 className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide mb-1">Conseil</h4>
                              <p className="text-xs font-medium text-slate-700 leading-relaxed">{d.conseil}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tab: Conversation */}
                      {historyTab === "conversation" && (
                        <div className="space-y-2.5">
                          {selectedHistoryInterview.messages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                            >
                              {msg.role === "recruiter" && (
                                <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 mt-0.5 text-xs">
                                  👩‍💼
                                </div>
                              )}
                              <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-[12px] font-medium leading-relaxed whitespace-pre-wrap ${
                                msg.role === "recruiter"
                                  ? "bg-slate-100 text-slate-800 rounded-tl-sm"
                                  : "bg-indigo-600 text-white rounded-tr-sm"
                              }`}>
                                {msg.content}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* List view */}
                {!selectedHistoryInterview && (
                  <>
                    {loadingHistory && (
                      <div className="flex flex-col items-center justify-center gap-2 py-8">
                        <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
                        <p className="text-xs font-medium text-slate-400">Chargement…</p>
                      </div>
                    )}

                    {!loadingHistory && interviews.length === 0 && (
                      <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                        <History className="w-8 h-8 text-slate-200" />
                        <p className="text-xs font-semibold text-slate-400">Aucun entretien enregistré</p>
                        <p className="text-[11px] text-slate-300 font-medium">Lancez votre premier entretien pour le retrouver ici.</p>
                      </div>
                    )}

                    {!loadingHistory && interviews.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide px-1">
                          {interviews.length} entretien{interviews.length > 1 ? "s" : ""}
                        </p>
                        {interviews.filter(iv => iv.debrief).map((interview, i) => {
                          const cfg = TYPE_CONFIG[interview.type] ?? { emoji: "🎯", label: interview.type, badge: "bg-slate-100 text-slate-700" };
                          const d = interview.debrief;
                          return (
                            <button
                              key={i}
                              onClick={() => { setSelectedHistoryInterview(interview); setHistoryTab("evaluation"); }}
                              className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-indigo-50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-all text-left group"
                            >
                              <span className="text-xl shrink-0">{cfg.emoji}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-800">{cfg.label}</p>
                                <p className="text-[10px] text-slate-400 font-medium">
                                  {new Date(interview.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                                  d.score >= 90 ? "bg-emerald-100 text-emerald-700" : d.score >= 75 ? "bg-violet-100 text-violet-700"
                                  : d.score >= 60 ? "bg-indigo-100 text-indigo-700" : d.score >= 40 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                                }`}>{d.score}/100</span>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
