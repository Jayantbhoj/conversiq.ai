"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Plus, 
  MessageSquare, 
  Star, 
  FileText, 
  Bot, 
  Sliders, 
  Eye, 
  X,
  Sparkles,
  Building,
  Mail,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import { 
  getAgents, 
  createAgent, 
  getChats, 
  getKnowledge, 
  initializeStorage, 
  Agent,
  getBusinesses,
  createBusiness,
  getActiveBusinessId,
  setActiveBusinessId,
  Business
} from "@/lib/storage";

const PRESET_AVATARS = [
  { name: "Neon Grid", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60" },
  { name: "Cosmic Orb", url: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=150&auto=format&fit=crop&q=60" },
  { name: "Fluid Aurora", url: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=150&auto=format&fit=crop&q=60" },
  { name: "Cyber Shape", url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=150&auto=format&fit=crop&q=60" }
];

export default function Dashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [activeBusinessId, setActiveBusinessIdState] = useState<string | null>(null);
  const [activeBusinessObj, setActiveBusinessObj] = useState<Business | null>(null);
  
  // Modals
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  
  // Agent Form State
  const [name, setName] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("Hello! How can I help you today?");
  const [systemPrompt, setSystemPrompt] = useState("You are a helpful customer support agent. Answer questions politely based on the knowledge base.");
  const [primaryColor, setPrimaryColor] = useState("#6366f1");
  const [accentColor, setAccentColor] = useState("#06b6d4");
  const [avatarUrl, setAvatarUrl] = useState(PRESET_AVATARS[0].url);

  // Business Form State
  const [businessName, setBusinessName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");

  // Business-Specific Stats
  const [totalChats, setTotalChats] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [totalKnowledgeChunks, setTotalKnowledgeChunks] = useState(0);

  const loadData = () => {
    initializeStorage();
    const activeId = getActiveBusinessId();
    setActiveBusinessIdState(activeId);

    const allAgents = getAgents();
    const allBusinesses = getBusinesses();
    setBusinesses(allBusinesses);

    if (activeId) {
      const activeBizObj = allBusinesses.find(b => b.id === activeId);
      setActiveBusinessObj(activeBizObj || null);

      const filtered = allAgents.filter(a => a.businessId === activeId);
      setAgents(filtered);

      let chatsCount = 0;
      let sumRating = 0;
      let ratedChatsCount = 0;
      let knowledgeCount = 0;

      filtered.forEach(a => {
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
    } else {
      setActiveBusinessObj(null);
      setAgents([]);
    }
  };

  useEffect(() => {
    loadData();

    // Listen to business switches from layout sidebar
    const handleActiveBusinessChange = () => {
      loadData();
    };
    window.addEventListener("storage-active-business-change", handleActiveBusinessChange);
    return () => window.removeEventListener("storage-active-business-change", handleActiveBusinessChange);
  }, []);

  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !activeBusinessId) return;

    createAgent({
      businessId: activeBusinessId,
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
    setShowAgentModal(false);

    // Reload list and notify sidebar
    loadData();
    window.dispatchEvent(new Event("storage-agent-update"));
  };

  const handleCreateBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !businessEmail.trim()) return;

    const newBiz = createBusiness(businessName, businessEmail);
    setBusinessName("");
    setBusinessEmail("");
    setShowBusinessModal(false);

    // Automatically set as active business
    setActiveBusinessId(newBiz.id);
    loadData();
  };

  // View 1: Business Selector Screen
  if (!activeBusinessId) {
    return (
      <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "32px", padding: "16px 0" }}>
        <div>
          <h1 style={{ marginBottom: "6px" }}>Select a Business</h1>
          <p>Choose an existing business profile or register a new one to access your Conversiq AI agents dashboard.</p>
        </div>

        <section className="grid-cols-3" style={{ gap: "24px" }}>
          {businesses.map(b => {
            const bizAgents = getAgents().filter(a => a.businessId === b.id);
            return (
              <div 
                key={b.id} 
                className="glass-card glass-card-interactive" 
                style={{ padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "180px", cursor: "pointer" }}
                onClick={() => {
                  setActiveBusinessId(b.id);
                  loadData();
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ padding: "8px", borderRadius: "8px", background: "rgba(99,102,241,0.1)", color: "var(--primary)" }}>
                      <Building size={20} />
                    </div>
                    <h3 style={{ fontSize: "1.2rem", color: "var(--foreground)" }}>{b.name}</h3>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "var(--foreground-muted)" }}>
                    <Mail size={14} /> {b.email}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-color)", paddingTop: "12px", marginTop: "12px" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--foreground-muted)", fontWeight: 500 }}>
                    {bizAgents.length} {bizAgents.length === 1 ? "Agent" : "Agents"}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.85rem", color: "var(--primary)", fontWeight: 600 }}>
                    Manage <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add New Business Trigger Card */}
          <div 
            onClick={() => setShowBusinessModal(true)}
            className="glass-card" 
            style={{ 
              padding: "24px", 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: "12px",
              minHeight: "180px", 
              cursor: "pointer",
              borderStyle: "dashed",
              borderColor: "rgba(0, 0, 0, 0.12)"
            }}
          >
            <div style={{
              background: "rgba(0, 0, 0, 0.02)",
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid var(--border-color)"
            }}>
              <Plus size={22} style={{ color: "var(--primary)" }} />
            </div>
            <div style={{ textAlign: "center" }}>
              <h4 style={{ color: "var(--foreground)", marginBottom: "4px" }}>Register New Business</h4>
              <p style={{ fontSize: "0.8rem" }}>Create a dedicated multi-tenant business space.</p>
            </div>
          </div>
        </section>

        {/* Business Registration Modal */}
        {showBusinessModal && (
          <div style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px"
          }}>
            <div className="glass-card" style={{ 
              width: "100%", 
              maxWidth: "460px", 
              padding: "32px", 
              borderRadius: "24px",
              boxShadow: "0 20px 50px rgba(15, 23, 42, 0.15)",
              border: "1px solid var(--border-color)",
              background: "#fff",
              position: "relative" 
            }}>
              <button 
                onClick={() => setShowBusinessModal(false)}
                style={{ 
                  position: "absolute", 
                  top: "24px", 
                  right: "24px", 
                  background: "transparent", 
                  color: "var(--foreground-muted)", 
                  cursor: "pointer" 
                }}
              >
                <X size={20} />
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
                <Building style={{ color: "var(--primary)" }} size={22} />
                <h2 style={{ fontSize: "1.35rem", color: "var(--foreground)" }}>Register Business</h2>
              </div>

              <form onSubmit={handleCreateBusiness} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--foreground)" }}>Business Name</label>
                  <input 
                    type="text" required placeholder="e.g. Gemini Enterprises"
                    value={businessName} onChange={e => setBusinessName(e.target.value)}
                    className="form-input"
                    style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-color)", marginTop: "6px" }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--foreground)" }}>Corporate Email</label>
                  <input 
                    type="email" required placeholder="e.g. contact@company.com"
                    value={businessEmail} onChange={e => setBusinessEmail(e.target.value)}
                    className="form-input"
                    style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-color)", marginTop: "6px" }}
                  />
                </div>
                <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1, padding: "12px" }} onClick={() => setShowBusinessModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: "12px" }}>
                    Register Business
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // View 2: Agents Dashboard for the Selected Business
  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Header and Welcome */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <button 
              onClick={() => setActiveBusinessId(null)}
              className="btn btn-secondary" 
              style={{ padding: "4px 8px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "4px" }}
            >
              <ArrowLeft size={14} /> Back
            </button>
            <span style={{ fontSize: "0.85rem", color: "var(--primary)", fontWeight: 600, background: "rgba(99,102,241,0.1)", padding: "2px 8px", borderRadius: "6px" }}>
              Active Business: {activeBusinessObj?.name}
            </span>
          </div>
          <h1 style={{ marginBottom: "6px" }}>Dashboard Overview</h1>
          <p>Create, customize, and analyze Conversiq AI support agents for your business.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAgentModal(true)}>
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
            <span style={{ fontSize: "0.85rem", color: "var(--foreground-muted)" }}>Knowledge Documents</span>
            <h3 style={{ fontSize: "1.6rem", color: "var(--foreground)", marginTop: "2px" }}>{totalKnowledgeChunks}</h3>
          </div>
        </div>
      </section>

      {/* Agents Grid Title */}
      <div>
        <h2 style={{ fontSize: "1.4rem", color: "var(--foreground)" }}>My Support Agents</h2>
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
                  <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>Knowledge Sources</span>
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
          onClick={() => setShowAgentModal(true)}
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
      {showAgentModal && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "20px"
        }}>
          <div className="glass-card" style={{ 
            width: "100%", 
            maxWidth: "520px", 
            padding: "32px", 
            borderRadius: "24px",
            boxShadow: "0 20px 50px rgba(15, 23, 42, 0.15)",
            border: "1px solid var(--border-color)",
            background: "#fff",
            maxHeight: "90vh", 
            overflowY: "auto", 
            position: "relative" 
          }}>
            <button 
              onClick={() => setShowAgentModal(false)}
              style={{ 
                position: "absolute", 
                top: "24px", 
                right: "24px", 
                background: "transparent", 
                color: "var(--foreground-muted)", 
                cursor: "pointer" 
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
              <Sparkles style={{ color: "var(--primary)" }} size={22} />
              <h2 style={{ fontSize: "1.35rem", color: "var(--foreground)" }}>Create Support Agent</h2>
            </div>

            <form onSubmit={handleCreateAgent} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--foreground)" }}>Agent Name</label>
                <input 
                  type="text" required placeholder="e.g. Gemini Gadgets Helper"
                  value={name} onChange={e => setName(e.target.value)}
                  className="form-input"
                  style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-color)", marginTop: "6px" }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--foreground)" }}>Welcome Message</label>
                <input 
                  type="text" required placeholder="Greeting when customer opens the chat..."
                  value={welcomeMessage} onChange={e => setWelcomeMessage(e.target.value)}
                  className="form-input"
                  style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-color)", marginTop: "6px" }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--foreground)" }}>System Instructions (RAG Prompt Context)</label>
                <textarea 
                  required placeholder="Instruct the agent on how to behave, respond, and what fallback info to give..."
                  value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)}
                  className="form-textarea"
                  style={{ width: "100%", minHeight: "120px", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-color)", marginTop: "6px", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1, padding: "12px" }} onClick={() => setShowAgentModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: "12px" }}>
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
