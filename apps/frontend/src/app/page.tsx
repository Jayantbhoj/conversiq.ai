"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Bot, 
  Sparkles, 
  Activity, 
  Layers, 
  ArrowRight, 
  MessageSquare, 
  ThumbsUp, 
  ShieldCheck, 
  FileText 
} from "lucide-react";
import { getAgents, getMessages, sendMessage, createChat, initializeStorage, Agent, Message } from "@/lib/storage";

export default function Home() {
  const [demoAgent, setDemoAgent] = useState<Agent | null>(null);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Seed and initialize
    initializeStorage();
    const agents = getAgents();
    if (agents.length > 0) {
      setDemoAgent(agents[0]);
    }
  }, []);

  // Sync messages
  useEffect(() => {
    if (!chatSessionId) return;

    const loadMessages = () => {
      const msgs = getMessages(chatSessionId);
      setMessages(msgs);
      
      // Auto-typing indicator simulation
      if (msgs.length > 0 && msgs[msgs.length - 1].sender === "customer") {
        setIsTyping(true);
      } else {
        setIsTyping(false);
      }
    };

    loadMessages();

    // Listen to simulated storage updates
    window.addEventListener("storage-chat-update", loadMessages);
    return () => window.removeEventListener("storage-chat-update", loadMessages);
  }, [chatSessionId]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleStartDemoChat = () => {
    if (!demoAgent) return;
    const session = createChat(demoAgent.id);
    setChatSessionId(session.id);
    // Initial welcome reply
    const welcomeMsg: Message = {
      id: "demo-welcome",
      chatSessionId: session.id,
      sender: "agent",
      content: demoAgent.welcomeMessage,
      createdAt: new Date().toISOString()
    };
    // Save welcome message
    localStorage.setItem(`rag_messages_${session.id}`, JSON.stringify([welcomeMsg]));
    setMessages([welcomeMsg]);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !chatSessionId || !demoAgent) return;

    sendMessage(demoAgent.id, chatSessionId, "customer", inputText);
    setInputText("");
  };

  return (
    <main style={{ padding: "0 24px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Navbar */}
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "24px 0",
        borderBottom: "1px solid var(--border-color)",
        marginBottom: "60px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            background: "linear-gradient(135deg, var(--primary), var(--accent))",
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 15px rgba(99,102,241,0.4)"
          }}>
            <Bot size={20} color="#fff" />
          </div>
          <span style={{ fontSize: "1.4rem", fontWeight: 800, letterSpacing: "-0.03em" }}>
            Conversiq<span style={{ color: "var(--primary)" }}> AI</span>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/dashboard" className="btn btn-primary">
            Enter Dashboard <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        textAlign: "center",
        maxWidth: "800px",
        margin: "0 auto 80px auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "24px"
      }} className="animate-fade-in">
        <div className="badge badge-primary" style={{ gap: "6px", padding: "6px 14px", fontSize: "0.85rem" }}>
          <Sparkles size={14} /> The Next-Generation Support Assistant
        </div>
        <h1>
          No-Code AI Customer Support Agents Built on Your Knowledge Base
        </h1>
        <p style={{ fontSize: "1.2rem", maxWidth: "650px" }}>
          Instantly deploy AI customer agents trained on your documentation. Track conversions, classify user intent, and custom brand your chat pages with zero lines of code.
        </p>
        <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
          <Link href="/dashboard" className="btn btn-primary" style={{ padding: "14px 28px", fontSize: "1.05rem" }}>
            Create Your Agent <ArrowRight size={18} />
          </Link>
          <a href="#sandbox" className="btn btn-secondary" style={{ padding: "14px 28px", fontSize: "1.05rem" }}>
            Test Sandbox
          </a>
        </div>
      </section>

      {/* Visual Product Grid */}
      <section className="grid-cols-3" style={{ marginBottom: "100px" }}>
        <div className="glass-card animate-fade-in" style={{ padding: "30px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{
            background: "rgba(99,102,241,0.15)",
            color: "var(--primary)",
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <FileText size={24} />
          </div>
          <h3 style={{ fontSize: "1.25rem", color: "var(--foreground)" }}>Instant RAG Training</h3>
          <p>Upload text files or paste FAQ articles. Conversiq AI instantly chunks and indexes your data, providing your agent with the context needed to respond accurately.</p>
        </div>

        <div className="glass-card animate-fade-in" style={{ padding: "30px", display: "flex", flexDirection: "column", gap: "16px", animationDelay: "0.1s" }}>
          <div style={{
            background: "rgba(6,182,212,0.15)",
            color: "var(--accent)",
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Activity size={24} />
          </div>
          <h3 style={{ fontSize: "1.25rem", color: "var(--foreground)" }}>Intent Classification</h3>
          <p>Every chat is automatically classified into inquiries like Technical, Billing, or Sales, giving you organized metrics and insights into user issues.</p>
        </div>

        <div className="glass-card animate-fade-in" style={{ padding: "30px", display: "flex", flexDirection: "column", gap: "16px", animationDelay: "0.2s" }}>
          <div style={{
            background: "rgba(16,185,129,0.15)",
            color: "var(--success)",
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Layers size={24} />
          </div>
          <h3 style={{ fontSize: "1.25rem", color: "var(--foreground)" }}>Custom Branding</h3>
          <p>Style agent pages to match your company logo and design. Serve chats on custom subdomains or widgets with unique color schemes and avatars.</p>
        </div>
      </section>

      {/* Sandbox Live Sandbox Preview */}
      <section id="sandbox" style={{
        marginBottom: "100px",
        scrollMarginTop: "40px"
      }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2 style={{ marginBottom: "12px" }}>Interactive Sandbox Sandbox</h2>
          <p>Test drive a pre-trained agent right now. Ask it about refunds or battery specs.</p>
        </div>

        <div className="glass-card" style={{
          maxWidth: "700px",
          margin: "0 auto",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          height: "500px",
          position: "relative"
        }}>
          {/* Demo Agent Header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            background: "var(--bg-chat-bubble)",
            borderBottom: "1px solid var(--border-color)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <img 
                src={demoAgent?.avatarUrl} 
                alt={demoAgent?.name} 
                style={{ width: "38px", height: "38px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--primary)" }} 
              />
              <div>
                <h4 style={{ fontSize: "0.95rem", color: "var(--foreground)" }}>{demoAgent?.name || "Agent Loading..."}</h4>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--success)" }}></span>
                  <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>RAG Powered Agent</span>
                </div>
              </div>
            </div>
            <div className="badge badge-primary">Sandbox Mode</div>
          </div>

          {/* Demo Chat Scroll */}
          <div 
            ref={scrollRef}
            className="custom-scroll" 
            style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column", gap: "16px", background: "rgba(0,0,0,0.1)" }}
          >
            {!chatSessionId ? (
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: "16px",
                textAlign: "center"
              }}>
                <MessageSquare size={48} style={{ color: "var(--primary)", opacity: 0.6 }} />
                <div>
                  <h4 style={{ marginBottom: "4px" }}>Start a Conversation</h4>
                  <p style={{ fontSize: "0.85rem", maxWidth: "300px" }}>Click below to chat with {demoAgent?.name || "the demo agent"}.</p>
                </div>
                <button className="btn btn-primary" onClick={handleStartDemoChat}>
                  Start Sandbox Chat
                </button>
              </div>
            ) : (
              messages.map(m => (
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
                    padding: "12px 16px",
                    borderRadius: "14px",
                    fontSize: "0.9rem",
                    lineHeight: "1.5",
                    whiteSpace: "pre-wrap",
                    background: m.sender === "customer" ? "var(--primary)" : "var(--bg-chat-bubble)",
                    color: m.sender === "customer" ? "#fff" : "var(--foreground)",
                    borderBottomRightRadius: m.sender === "customer" ? "2px" : "14px",
                    borderBottomLeftRadius: m.sender === "customer" ? "14px" : "2px"
                  }}>
                    {m.content}
                  </div>
                </div>
              ))
            )}

            {isTyping && (
              <div style={{ display: "flex", justifyContent: "flex-start", width: "100%" }}>
                <div style={{
                  background: "var(--bg-chat-bubble)",
                  padding: "12px 20px",
                  borderRadius: "14px",
                  borderBottomLeftRadius: "2px",
                  display: "flex",
                  gap: "4px",
                  alignItems: "center"
                }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--foreground-muted)", animation: "pulse 1s infinite alternate" }}></span>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--foreground-muted)", animation: "pulse 1s infinite alternate 0.2s" }}></span>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--foreground-muted)", animation: "pulse 1s infinite alternate 0.4s" }}></span>
                </div>
              </div>
            )}
          </div>

          {/* Demo Chat Input */}
          {chatSessionId && (
            <form 
              onSubmit={handleSendMessage}
              style={{
                display: "flex",
                padding: "12px",
                background: "rgba(0, 0, 0, 0.01)",
                borderTop: "1px solid var(--border-color)",
                gap: "10px"
              }}
            >
              <input 
                type="text" 
                placeholder="Ask about returns policy or power bank specs..."
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                className="form-input"
                style={{ flex: 1, padding: "10px 14px", borderRadius: "10px", fontSize: "0.85rem" }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: "10px 16px" }}>
                Send
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid var(--border-color)",
        padding: "30px 0",
        textAlign: "center",
        color: "var(--foreground-muted)",
        fontSize: "0.85rem"
      }}>
        <p>© 2026 Conversiq AI SaaS Builder. Designed with rich glassmorphism & responsive layouts.</p>
      </footer>
    </main>
  );
}
