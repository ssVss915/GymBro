import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Sparkles, User, ShieldAlert } from "lucide-react";
import { ChatMessage } from "../types";

interface ChatProps {
  language: string;
}

const DEFAULT_PROMPTS = {
  en: [
    "Give me an instant beast motivation!",
    "How should I track my calories at home?",
    "Should I drink warm water for fat tear?",
    "Suggest a simple 5-min forearm push",
  ],
  hin: [
    "Bhai tagdi body banana hai, motivation de!",
    "Veg protein items list batao ghar ke khane me",
    "Subah creatine kab lena sabsy sahi h?",
    "Ghar pe bina equipment chest kaise banaye?",
  ],
};

export default function GymCoachChat({ language }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Set initial welcoming message from coach
  useEffect(() => {
    const welcomeText =
      language === "hin"
        ? "Kya haal chal bhai! 💪 Mai hu tera AI Personal GymBro Coach. Mujhse workout tips, diet advice, ya instant motivation ke liye chat kar. Bol, aaj kaun sa set marna hai? 🔥"
        : "Yo Bro! 💪 I'm your AI GymBro Coach. Need some hard motivation, customized body form advice, or macro calculations? Feed me your questions and let's get those grains! 🔥";
    
    setMessages([
      {
        id: "welcome",
        role: "model",
        content: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }, [language]);

  // Keep chat viewport anchored at bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/gym-coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-10), // send last 10 messages context
          language,
        }),
      });

      if (!response.ok) throw new Error("Pump pipeline stalled.");
      const data = await response.json();

      const aiMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "model",
        content: data.text || "Keep crushing those reps, Bro!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "model",
        content:
          language === "hin"
            ? "Arre bhai! Server me thodi problem aa gayi lagti hai, par tu thakna mat. 10 pushups aur maar tab tak! 🤜"
            : "Ah! Quick server snag, Bro! Don't let your momentum slide though, go grab another water sip! 🤜",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const prompts = language === "hin" ? DEFAULT_PROMPTS.hin : DEFAULT_PROMPTS.en;

  return (
    <div className="bg-neutral-900 rounded-3xl border border-neutral-800 p-6 shadow-2xl animate-fade-in text-white flex flex-col h-[520px]">
      
      {/* Visual Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-orange-500/10 p-2 rounded-xl text-orange-500 border border-orange-500/15 animate-pulse">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black uppercase tracking-tight flex items-center">
              GymBro Coach <Sparkles className="w-3.5 h-3.5 text-orange-500 ml-1.5" />
            </h3>
            <p className="text-[10px] text-green-500 font-bold tracking-widest flex items-center">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-ping" />
              ONLINE COACHING
            </p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1.5 mb-4 no-scrollbar">
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div key={m.id} className={`flex items-start ${isUser ? "justify-end" : "justify-start"}`}>
              {!isUser && (
                <div className="w-7 h-7 bg-orange-500 text-black text-xs font-bold flex items-center justify-center rounded-xl mr-2 shrink-0 select-none">
                  GB
                </div>
              )}
              <div
                className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  isUser
                    ? "bg-orange-500 text-black font-medium rounded-tr-none shadow-md shadow-orange-500/5"
                    : "bg-neutral-950/80 text-neutral-100 border border-neutral-850 rounded-tl-none font-normal"
                }`}
              >
                <p className="whitespace-pre-line">{m.content}</p>
                <span
                  className={`block text-[8px] mt-1.5 text-right font-mono ${
                    isUser ? "text-black/60" : "text-neutral-500"
                  }`}
                >
                  {m.timestamp}
                </span>
              </div>
              {isUser && (
                <div className="w-7 h-7 bg-neutral-800 text-neutral-400 text-xs font-bold flex items-center justify-center rounded-xl ml-2 shrink-0 select-none">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start justify-start animate-pulse">
            <div className="w-7 h-7 bg-neutral-800 text-orange-500 text-xs font-bold flex items-center justify-center rounded-xl mr-2">
              ...
            </div>
            <div className="bg-neutral-950 border border-neutral-850 px-4 py-3 rounded-2xl rounded-tl-none text-xs text-neutral-400 flex items-center space-x-1">
              <span>{language === "hin" ? "Coach bicep flex kar raha hai" : "Coach is typing"}</span>
              <span className="w-1 h-1 bg-orange-500 rounded-full animate-bounce" />
              <span className="w-1 h-1 bg-orange-500 rounded-full animate-bounce delay-100" />
              <span className="w-1 h-1 bg-orange-500 rounded-full animate-bounce delay-200" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      {messages.length <= 1 && (
        <div className="mb-4">
          <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest mb-1.5 pl-1.5 select-none">
            {language === "hin" ? "Coach se pucho:" : "Ask Coach directly:"}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {prompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p)}
                className="text-left bg-neutral-950 hover:bg-neutral-850 border border-neutral-850 hover:border-orange-500/30 p-2.5 rounded-xl text-[11px] text-neutral-300 leading-normal active:scale-95 cursor-pointer transition-all"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputValue);
        }}
        className="flex space-x-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={
            language === "hin"
              ? "Motivation chahiye? Coach se chat karo bhai..."
              : "Ask macro targets or fitness form tips..."
          }
          className="flex-1 bg-neutral-950 border border-neutral-800 focus:border-orange-500/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none placeholder-neutral-600 font-sans"
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-850 disabled:text-neutral-500 text-black px-4 rounded-xl font-bold cursor-pointer transition-all flex items-center justify-center active:scale-95 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
