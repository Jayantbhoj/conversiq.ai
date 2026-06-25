"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { 
  Bot, 
  Send, 
  Star, 
  AlertCircle,
  ThumbsUp,
  Smile,
  ShieldAlert
} from "lucide-react";
import { Agent, Message } from "@/lib/storage";
import { 
  fetchAgent, 
  fetchMessages, 
  sendChatMessage, 
  createChatSession, 
  submitChatRating, 
  queryAgentResponse 
} from "@/lib/api";

export default function CustomerAgentChat() {
  const params = useParams();
  const agentId = params.id as string;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [showRatingSuccess, setShowRatingSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load Agent info and initialize chat session
  useEffect(() => {
    if (!agentId) return;

    async function initChat() {
      try {
        setLoading(true);
        const currentAgent = await fetchAgent(agentId);
        setAgent(currentAgent);

        // Session restore or create
        const sessionKey = `aura_session_${agentId}`;
        let activeChatId = sessionStorage.getItem(sessionKey);

        if (!activeChatId) {
          // Create new chat session on backend
          const session = await createChatSession(agentId);
          activeChatId = session.id;
          sessionStorage.setItem(sessionKey, activeChatId);
          
          // Add welcome greeting to database
          await sendChatMessage(activeChatId, "agent", currentAgent.welcomeMessage);
        }

        setChatId(activeChatId);
      } catch (err) {
        console.error("Failed to initialize agent chat:", err);
      } finally {
        setLoading(false);
      }
    }

    initChat();
  }, [agentId]);

  // Sync Messages and handle typing indicator
  const loadMessages = async () => {
    if (!chatId) return;
    try {
      const msgs = await fetchMessages(chatId);
      setMessages(msgs);

      if (msgs.length > 0 && msgs[msgs.length - 1].sender === "customer") {
        setIsTyping(true);
      } else {
        setIsTyping(false);
      }
    } catch (err) {
      console.error("Failed to load chat messages:", err);
    }
  };

  useEffect(() => {
    if (chatId) {
      loadMessages();
      // Poll database for new messages every 3 seconds
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [chatId]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !chatId || !agent) return;

    const userText = inputText;
    setInputText("");

    try {
      // 1. Send customer message to backend
      const customerMsg = await sendChatMessage(chatId, "customer", userText);
      setMessages(prev => [...prev, customerMsg]);
      setIsTyping(true);

      // 2. Query chatbot retrieval pipeline
      const queryResult = await queryAgentResponse(agent.id, userText);

      // 3. Post chatbot reply to session database
      const agentMsg = await sendChatMessage(chatId, "agent", queryResult.response);
      setMessages(prev => [...prev, agentMsg]);
    } catch (err) {
      console.error("Failed to handle sending message:", err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleRate = async (stars: number) => {
    if (!agent || !chatId) return;
    try {
      await submitChatRating(chatId, stars);
      setRating(stars);
      setShowRatingSuccess(true);
      setTimeout(() => {
        setShowRatingSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Failed to submit session rating:", err);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center", 
        minHeight: "100vh", 
        gap: "16px",
        padding: "24px",
        textAlign: "center"
      }}>
        <p style={{ color: "#fff" }}>Connecting to chat server...</p>
      </div>
    );
  }

  if (!agent) {
    return (
      <div style={{
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center", 
        minHeight: "100vh", 
        gap: "16px",
        padding: "24px",
        textAlign: "center"
      }}>
        <ShieldAlert size={48} style={{ color: "var(--danger)" }} />
        <h2 style={{ color: "#fff" }}>Agent Not Found</h2>
        <p style={{ maxWidth: "400px" }}>The customer support agent ID you entered does not exist or has been deleted by the business administrator.</p>
      </div>
    );
  }

  // Inject primary theme color custom styles dynamically
  const dynamicStyles = `
    .theme-primary-bg { background-color: ${agent.primaryColor} !important; }
    .theme-primary-text { color: ${agent.primaryColor} !important; }
    .theme-border-focus:focus { border-color: ${agent.primaryColor} !important; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15) !important; }
    .star-btn { color: var(--foreground-muted); transition: transform 0.2s ease, color 0.2s ease; }
    .star-btn:hover { color: var(--warning); transform: scale(1.2); }
  `;

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      minHeight: "100vh", 
      padding: "20px",
      position: "relative"
    }}>
      {/* Inject Style rules */}
      {/* Inject Style rules */}
      <style dangerouslySetInnerHTML={{ __html: dynamicStyles }} />

      {/* Main chat window container */}
      <div 
        className="glass-card animate-fade-in" 
        style={{
          width: "100%",
          maxWidth: "480px",
          height: "650px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          borderRadius: "20px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.4)"
        }}
      >
        {/* Chat Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          background: `linear-gradient(135deg, ${agent.primaryColor}, ${agent.accentColor || agent.primaryColor})`,
          color: "#fff"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img 
              src={agent.avatarUrl} 
              alt={agent.name} 
              style={{ width: "38px", height: "38px", borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.4)" }} 
            />
            <div>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700 }}>{agent.name}</h3>
              <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "2px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", display: "inline-block" }}></span>
                <span style={{ fontSize: "0.7rem", opacity: 0.85 }}>Online • Support Desk</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rating feedback banner */}
        <div style={{
          background: "rgba(0, 0, 0, 0.01)",
          borderBottom: "1px solid var(--border-color)",
          padding: "8px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "0.75rem"
        }}>
          {showRatingSuccess ? (
            <span style={{ color: "var(--success)", display: "flex", alignItems: "center", gap: "4px" }}>
              <Smile size={14} /> Thank you for your feedback!
            </span>
          ) : rating ? (
            <span style={{ color: "var(--foreground-muted)" }}>
              Rated: {rating} ★
            </span>
          ) : (
            <span style={{ color: "var(--foreground-muted)" }}>Rate this interaction:</span>
          )}

          <div style={{ display: "flex", gap: "4px" }}>
            {[1, 2, 3, 4, 5].map(stars => (
              <button 
                key={stars} 
                className="star-btn"
                onClick={() => handleRate(stars)}
                style={{ background: "transparent", cursor: "pointer" }}
              >
                <Star 
                  size={14} 
                  fill={rating && rating >= stars ? "var(--warning)" : "none"} 
                  color={rating && rating >= stars ? "var(--warning)" : "currentColor"} 
                />
              </button>
            ))}
          </div>
        </div>

        {/* Messages Stream */}
        <div 
          ref={scrollRef}
          className="custom-scroll"
          style={{
            flex: 1,
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            background: "rgba(0,0,0,0.15)"
          }}
        >
          {messages.map(m => (
            <div 
              key={m.id} 
              style={{
                display: "flex",
                justifyContent: m.sender === "customer" ? "flex-end" : "flex-start",
                width: "100%"
              }}
            >
              <div style={{
                maxWidth: "80%",
                padding: "10px 14px",
                borderRadius: "14px",
                fontSize: "0.85rem",
                lineHeight: "1.45",
                whiteSpace: "pre-wrap",
                background: m.sender === "customer" ? agent.primaryColor : "var(--bg-chat-bubble)",
                color: m.sender === "customer" ? "#fff" : "var(--foreground)",
                borderBottomRightRadius: m.sender === "customer" ? "2px" : "14px",
                borderBottomLeftRadius: m.sender === "customer" ? "14px" : "2px",
                boxShadow: m.sender === "customer" ? `0 4px 10px rgba(0,0,0,0.15)` : "none"
              }}>
                {m.content}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div style={{ display: "flex", justifyContent: "flex-start", width: "100%" }}>
              <div style={{
                background: "var(--bg-chat-bubble)",
                padding: "10px 16px",
                borderRadius: "14px",
                borderBottomLeftRadius: "2px",
                display: "flex",
                gap: "4px",
                alignItems: "center"
              }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--foreground-muted)", animation: "pulse 0.8s infinite alternate" }}></span>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--foreground-muted)", animation: "pulse 0.8s infinite alternate 0.15s" }}></span>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--foreground-muted)", animation: "pulse 0.8s infinite alternate 0.3s" }}></span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form 
          onSubmit={handleSend}
          style={{
            display: "flex",
            padding: "12px",
            background: "rgba(0,0,0,0.2)",
            borderTop: "1px solid var(--border-color)",
            gap: "8px"
          }}
        >
          <input 
            type="text" 
            placeholder="Type your message here..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            className="form-input theme-border-focus"
            style={{ flex: 1, padding: "10px 14px", borderRadius: "10px", fontSize: "0.85rem" }}
          />
          <button 
            type="submit" 
            className="btn theme-primary-bg" 
            style={{ 
              color: "#fff", 
              padding: "10px 14px", 
              borderRadius: "10px",
              boxShadow: `0 4px 10px rgba(0,0,0,0.1)`
            }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>

      {/* Subtle branding attribution */}
      <span style={{
        marginTop: "16px",
        fontSize: "0.75rem",
        color: "var(--foreground-muted)",
        display: "flex",
        alignItems: "center",
        gap: "4px"
      }}>
        Powered by <Bot size={12} /> AuraSupport Agent Builder
      </span>
    </div>
  );
}
