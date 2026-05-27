"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Plus, 
  MessageSquare, 
  Star, 
  FileText, 
  Bot, 
  ExternalLink, 
  Sliders, 
  Eye, 
  X,
  Sparkles
} from "lucide-react";
import { 
  getAgents, 
  createAgent, 
  getChats, 
  getKnowledge, 
  initializeStorage, 
  Agent 
} from "@/lib/storage";

const PRESET_AVATARS = [
  { name: "Neon Grid", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60" },
  { name: "Cosmic Orb", url: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=150&auto=format&fit=crop&q=60" },
  { name: "Fluid Aurora", url: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=150&auto=format&fit=crop&q=60" },
  { name: "Cyber Shape", url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=150&auto=format&fit=crop&q=60" }
];

export default function Dashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [name, setName] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("Hello! How can I help you today?");
  const [systemPrompt, setSystemPrompt] = useState("You are a helpful customer support agent. Answer questions politely based on the knowledge base.");
  const [primaryColor, setPrimaryColor] = useState("#6366f1");
  const [accentColor, setAccentColor] = useState("#06b6d4");
  const [avatarUrl, setAvatarUrl] = useState(PRESET_AVATARS[0].url);

  // Global Stats State
  const [totalChats, setTotalChats] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [totalKnowledgeChunks, setTotalKnowledgeChunks] = useState(0);

  const loadData = () => {
    initializeStorage();
    const list = getAgents();
    setAgents(list);

    // Compute aggregated metrics
    let chatsCount = 0;
    let sumRating = 0;
    let ratedChatsCount = 0;
    let knowledgeCount = 0;

    list.forEach(a => {
      const chats = getChats(a.id);
      chatsCount += chats.length;
      chats.forEach(c => {
        if (c.rating) {
          sumRating += c.rating;
          ratedChatsCount++;
        }
      });

      const docs = getKnowledge(a.id);
      knowledgeCount += docs.length;
    });

    setTotalChats(chatsCount);
    setAvgRating(ratedChatsCount > 0 ? Number((sumRating / ratedChatsCount).toFixed(1)) : 0);
    setTotalKnowledgeChunks(knowledgeCount);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createAgent({
      name,
      welcomeMessage,
      systemPrompt,
      primaryColor,
      accentColor,
      avatarUrl
    });

    // Reset Form
    setName("");
    setWelcomeMessage("Hello! How can I help you today?");
    setSystemPrompt("You are a helpful customer support agent. Answer questions politely based on the knowledge base.");
    setPrimaryColor("#6366f1");
    setAccentColor("#06b6d4");
    setAvatarUrl(PRESET_AVATARS[0].url);
    setShowModal(false);

    // Reload list and notify sidebar
    loadData();
    window.dispatchEvent(new Event("storage-agent-update"));
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Header and Welcome */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ marginBottom: "6px" }}>Dashboard Overview</h1>
          <p>Create, customize, and analyze your AI support agents.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Create New Agent
        </button>
      </div>

      {/* Global Stat Cards */}
      <section className="grid-cols-4">
        <div className="glass-card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(99,102,241,0.15)", color: "var(--primary)" }}>
            <Bot size={24} />
          </div>
          <div>
            <span style={{ fontSize: "0.85rem", color: "var(--foreground-muted)" }}>Total Agents</span>
            <h3 style={{ fontSize: "1.6rem", color: "var(--foreground)", marginTop: "2px" }}>{agents.length}</h3>
          </div>
        </div>

        <div className="glass-card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(6,182,212,0.15)", color: "var(--accent)" }}>
            <MessageSquare size={24} />
          </div>
          <div>
            <span style={{ fontSize: "0.85rem", color: "var(--foreground-muted)" }}>Total Conversations</span>
            <h3 style={{ fontSize: "1.6rem", color: "var(--foreground)", marginTop: "2px" }}>{totalChats}</h3>
          </div>
        </div>

        <div className="glass-card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(245,158,11,0.15)", color: "var(--warning)" }}>
            <Star size={24} />
          </div>
          <div>
            <span style={{ fontSize: "0.85rem", color: "var(--foreground-muted)" }}>Avg Satisfaction</span>
            <h3 style={{ fontSize: "1.6rem", color: "var(--foreground)", marginTop: "2px" }}>{avgRating > 0 ? `${avgRating} / 5` : "N/A"}</h3>
          </div>
        </div>

        <div className="glass-card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(16,185,129,0.15)", color: "var(--success)" }}>
            <FileText size={24} />
          </div>
          <div>
            <span style={{ fontSize: "0.85rem", color: "var(--foreground-muted)" }}>RAG Knowledge Chunks</span>
            <h3 style={{ fontSize: "1.6rem", color: "var(--foreground)", marginTop: "2px" }}>{totalKnowledgeChunks}</h3>
          </div>
        </div>
      </section>

      {/* Agents Grid Title */}
      <div>
        <h2 style={{ fontSize: "1.4rem", color: "var(--foreground)" }}>My AI Chat Agents</h2>
      </div>

      {/* Agents List Grid */}
      <section className="grid-cols-2">
        {agents.map(a => {
          const chatsCount = getChats(a.id).length;
          const kCount = getKnowledge(a.id).length;

          return (
            <div key={a.id} className="glass-card glass-card-interactive" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <img 
                    src={a.avatarUrl} 
                    alt={a.name} 
                    style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover", border: `2px solid ${a.primaryColor}` }}
                  />
                  <div>
                    <h3 style={{ fontSize: "1.15rem", color: "var(--foreground)", marginBottom: "4px" }}>{a.name}</h3>
                    <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>
                      Created {new Date(a.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: a.primaryColor, display: "inline-block" }} title="Primary Theme"></span>
                  <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: a.accentColor, display: "inline-block" }} title="Accent Theme"></span>
                </div>
              </div>

              {/* Quick stats on card */}
              <div style={{ display: "flex", gap: "20px", background: "var(--bg-chat-bubble)", padding: "10px 14px", borderRadius: "10px" }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>Conversations</span>
                  <h4 style={{ color: "var(--foreground)", marginTop: "2px" }}>{chatsCount}</h4>
                </div>
                <div style={{ flex: 1, borderLeft: "1px solid var(--border-color)", paddingLeft: "16px" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>Knowledge Chunks</span>
                  <h4 style={{ color: "var(--foreground)", marginTop: "2px" }}>{kCount}</h4>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                <Link href={`/dashboard/agent/${a.id}`} className="btn btn-secondary" style={{ flex: 1, fontSize: "0.85rem", gap: "6px" }}>
                  <Sliders size={14} /> Manage Agent
                </Link>
                <Link href={`/agent/${a.id}`} target="_blank" className="btn btn-primary" style={{ flex: 1, fontSize: "0.85rem", gap: "6px", background: a.primaryColor }}>
                  <Eye size={14} /> Open Chat Page
                </Link>
              </div>
            </div>
          );
        })}

        {/* Create Agent Box Card */}
        <div 
          onClick={() => setShowModal(true)}
          className="glass-card" 
          style={{ 
            padding: "24px", 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            justifyContent: "center", 
            gap: "12px",
            minHeight: "190px", 
            cursor: "pointer",
            borderStyle: "dashed",
            borderColor: "rgba(0, 0, 0, 0.12)"
          }}
        >
          <div style={{
            background: "rgba(0, 0, 0, 0.02)",
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid var(--border-color)"
          }}>
            <Plus size={24} style={{ color: "var(--primary)" }} />
          </div>
          <div style={{ textAlign: "center" }}>
            <h4 style={{ color: "var(--foreground)", marginBottom: "4px" }}>Add New Agent</h4>
            <p style={{ fontSize: "0.8rem" }}>Branded customer chat widget & knowledge base.</p>
          </div>
        </div>
      </section>

      {/* Creation Modal */}
      {showModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div 
            className="glass-card" 
            style={{ 
              width: "100%", 
              maxWidth: "580px", 
              padding: "28px", 
              maxHeight: "90vh", 
              overflowY: "auto",
              position: "relative"
            }}
          >
            {/* Modal Close */}
            <button 
              onClick={() => setShowModal(false)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "transparent",
                color: "var(--foreground-muted)",
                cursor: "pointer"
              }}
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
              <Sparkles style={{ color: "var(--primary)" }} size={22} />
              <h2 style={{ fontSize: "1.35rem", color: "var(--foreground)" }}>Create Support Agent</h2>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateAgent} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Agent Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Gemini Gadgets Helper"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Avatar Avatar</label>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "8px" }}>
                  {PRESET_AVATARS.map(avatar => (
                    <div 
                      key={avatar.name} 
                      onClick={() => setAvatarUrl(avatar.url)}
                      style={{
                        position: "relative",
                        cursor: "pointer",
                        borderRadius: "50%",
                        padding: "2px",
                        border: avatarUrl === avatar.url ? `2px solid ${primaryColor}` : "2px solid transparent"
                      }}
                    >
                      <img 
                        src={avatar.url} 
                        alt={avatar.name} 
                        style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover" }} 
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Branding Colors</label>
                <div style={{ display: "flex", gap: "20px" }}>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>Primary Color</span>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <input 
                        type="color" 
                        value={primaryColor} 
                        onChange={e => setPrimaryColor(e.target.value)}
                        style={{ width: "34px", height: "34px", borderRadius: "50%", cursor: "pointer", padding: "0" }}
                      />
                      <span style={{ fontSize: "0.85rem", textTransform: "uppercase" }}>{primaryColor}</span>
                    </div>
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>Accent Color</span>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <input 
                        type="color" 
                        value={accentColor} 
                        onChange={e => setAccentColor(e.target.value)}
                        style={{ width: "34px", height: "34px", borderRadius: "50%", cursor: "pointer", padding: "0" }}
                      />
                      <span style={{ fontSize: "0.85rem", textTransform: "uppercase" }}>{accentColor}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Welcome Message</label>
                <input 
                  type="text" 
                  required
                  placeholder="Greeting when customer opens the chat..."
                  value={welcomeMessage}
                  onChange={e => setWelcomeMessage(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">System Instructions (RAG Prompt Context)</label>
                <textarea 
                  required
                  placeholder="Instruct the agent on how to behave, respond, and what fallback info to give..."
                  value={systemPrompt}
                  onChange={e => setSystemPrompt(e.target.value)}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Create Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
