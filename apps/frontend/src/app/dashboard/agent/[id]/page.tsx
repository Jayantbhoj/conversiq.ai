"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Bot, 
  MessageSquare, 
  FileText, 
  Star, 
  Upload, 
  Trash2, 
  Sliders, 
  Eye, 
  AlertCircle, 
  FolderPlus, 
  ChevronRight,
  TrendingUp,
  Award
} from "lucide-react";
import { 
  getAgentById, 
  getKnowledge, 
  addKnowledge, 
  deleteKnowledge, 
  getChats, 
  getMessages, 
  updateAgent, 
  deleteAgent, 
  initializeStorage,
  Agent, 
  KnowledgeSource, 
  ChatSession, 
  Message 
} from "@/lib/storage";

export default function AgentDetail() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [activeTab, setActiveTab] = useState<"metrics" | "knowledge" | "chats" | "settings">("metrics");

  // Sub-states
  const [knowledgeList, setKnowledgeList] = useState<KnowledgeSource[]>([]);
  const [chatsList, setChatsList] = useState<ChatSession[]>([]);
  
  // Knowledge Form
  const [kTitle, setKTitle] = useState("");
  const [kContent, setKContent] = useState("");
  const [kbTab, setKbTab] = useState<"manual" | "upload">("manual");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Chat Viewer
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);

  // Settings Form
  const [name, setName] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [primaryColor, setPrimaryColor] = useState("");
  const [accentColor, setAccentColor] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const loadAgentData = () => {
    initializeStorage();
    const currentAgent = getAgentById(agentId);
    if (!currentAgent) {
      router.push("/dashboard");
      return;
    }
    setAgent(currentAgent);
    
    // Set settings form fields
    setName(currentAgent.name);
    setWelcomeMessage(currentAgent.welcomeMessage);
    setSystemPrompt(currentAgent.systemPrompt);
    setPrimaryColor(currentAgent.primaryColor);
    setAccentColor(currentAgent.accentColor);
    setAvatarUrl(currentAgent.avatarUrl);

    // Load related items
    const docs = getKnowledge(agentId);
    setKnowledgeList(docs);

    const chats = getChats(agentId);
    // Sort chats by updatedAt desc
    chats.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    setChatsList(chats);
  };

  useEffect(() => {
    if (agentId) {
      loadAgentData();
    }
  }, [agentId]);

  // Load chat messages when selected chat changes
  useEffect(() => {
    if (selectedChatId) {
      setChatMessages(getMessages(selectedChatId));
    } else {
      setChatMessages([]);
    }
  }, [selectedChatId]);

  // Handle Knowledge add
  const handleAddKnowledge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kTitle.trim() || !kContent.trim()) return;

    addKnowledge(agentId, kTitle, kContent);
    setKTitle("");
    setKContent("");
    loadAgentData();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validExtensions = [".txt", ".md", ".json", ".csv", ".xml", ".html"];
      const fileExt = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      if (!validExtensions.includes(fileExt) && !file.type.startsWith("text/")) {
        setUploadError(`Unsupported file format: ${file.name}. Please upload text, markdown, or JSON files.`);
        setUploading(false);
        return;
      }

      try {
        const text = await readFileAsText(file);
        if (!text.trim()) {
          setUploadError(`File ${file.name} is empty.`);
          setUploading(false);
          return;
        }

        // Add to knowledge base
        addKnowledge(agentId, file.name, text);
        successCount++;
      } catch (err) {
        setUploadError(`Error reading ${file.name}: ${err instanceof Error ? err.message : String(err)}`);
        setUploading(false);
        return;
      }
    }

    setUploading(false);
    setUploadSuccess(`Successfully indexed ${successCount} policy document(s).`);
    loadAgentData();
    setTimeout(() => {
      setUploadSuccess(null);
      setUploadError(null);
    }, 4000);
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        reject(reader.error);
      };
      reader.readAsText(file);
    });
  };

  // Handle Knowledge delete
  const handleDeleteKnowledge = (chunkId: string) => {
    deleteKnowledge(agentId, chunkId);
    loadAgentData();
  };

  // Handle Settings Save
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agent) return;

    updateAgent(agentId, {
      name,
      welcomeMessage,
      systemPrompt,
      primaryColor,
      accentColor,
      avatarUrl
    });

    loadAgentData();
    // Notify sidebar to refresh agent lists
    window.dispatchEvent(new Event("storage-agent-update"));
  };

  // Handle Agent Delete
  const handleDeleteAgent = () => {
    if (window.confirm(`Are you sure you want to delete ${agent?.name}? This action is permanent and deletes all knowledge bases and chat histories.`)) {
      deleteAgent(agentId);
      window.dispatchEvent(new Event("storage-agent-update"));
      router.push("/dashboard");
    }
  };

  if (!agent) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "50vh", flexDirection: "column", gap: "10px" }}>
        <AlertCircle size={32} style={{ color: "var(--danger)" }} />
        <h3>Loading Agent Details...</h3>
      </div>
    );
  }

  // Calculate Metrics
  const totalConversations = chatsList.length;
  let totalMsgsCount = 0;
  let sumRating = 0;
  let ratedCount = 0;
  
  // Categorizations counts
  const categoriesMap = {
    Billing: 0,
    Technical: 0,
    Sales: 0,
    "General Support": 0,
    Unclassified: 0
  };

  chatsList.forEach(c => {
    categoriesMap[c.category]++;
    if (c.rating) {
      sumRating += c.rating;
      ratedCount++;
    }
    totalMsgsCount += getMessages(c.id).length;
  });

  const ratingAvg = ratedCount > 0 ? Number((sumRating / ratedCount).toFixed(1)) : 0;

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Detail Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <img 
            src={agent.avatarUrl} 
            alt={agent.name} 
            style={{ width: "56px", height: "56px", borderRadius: "50%", objectFit: "cover", border: `3px solid ${agent.primaryColor}` }}
          />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h1 style={{ fontSize: "1.8rem", color: "var(--foreground)" }}>{agent.name}</h1>
              <span className="badge badge-primary" style={{ background: "rgba(99,102,241,0.08)", color: agent.primaryColor, borderColor: "rgba(99,102,241,0.2)" }}>
                ID: {agent.id}
              </span>
            </div>
            <p style={{ marginTop: "4px", fontSize: "0.9rem" }}>Branding and knowledge hub for your RAG customer agent.</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <a href={`/agent/${agent.id}`} target="_blank" className="btn btn-primary" style={{ background: agent.primaryColor, gap: "6px" }}>
            <Eye size={16} /> Test Live Page
          </a>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px" }}>
        <button 
          className="btn" 
          onClick={() => setActiveTab("metrics")}
          style={{
            background: activeTab === "metrics" ? "var(--bg-chat-bubble)" : "transparent",
            color: activeTab === "metrics" ? "var(--foreground)" : "var(--foreground-muted)",
            borderColor: activeTab === "metrics" ? "var(--border-color)" : "transparent",
            padding: "8px 16px",
            fontSize: "0.9rem"
          }}
        >
          <TrendingUp size={16} style={{ color: activeTab === "metrics" ? agent.primaryColor : "inherit" }} /> Overview & Metrics
        </button>

        <button 
          className="btn" 
          onClick={() => setActiveTab("knowledge")}
          style={{
            background: activeTab === "knowledge" ? "var(--bg-chat-bubble)" : "transparent",
            color: activeTab === "knowledge" ? "var(--foreground)" : "var(--foreground-muted)",
            borderColor: activeTab === "knowledge" ? "var(--border-color)" : "transparent",
            padding: "8px 16px",
            fontSize: "0.9rem"
          }}
        >
          <FileText size={16} style={{ color: activeTab === "knowledge" ? agent.primaryColor : "inherit" }} /> Knowledge Base
        </button>

        <button 
          className="btn" 
          onClick={() => setActiveTab("chats")}
          style={{
            background: activeTab === "chats" ? "var(--bg-chat-bubble)" : "transparent",
            color: activeTab === "chats" ? "var(--foreground)" : "var(--foreground-muted)",
            borderColor: activeTab === "chats" ? "var(--border-color)" : "transparent",
            padding: "8px 16px",
            fontSize: "0.9rem"
          }}
        >
          <MessageSquare size={16} style={{ color: activeTab === "chats" ? agent.primaryColor : "inherit" }} /> Inbox Transcript
        </button>

        <button 
          className="btn" 
          onClick={() => setActiveTab("settings")}
          style={{
            background: activeTab === "settings" ? "var(--bg-chat-bubble)" : "transparent",
            color: activeTab === "settings" ? "var(--foreground)" : "var(--foreground-muted)",
            borderColor: activeTab === "settings" ? "var(--border-color)" : "transparent",
            padding: "8px 16px",
            fontSize: "0.9rem"
          }}
        >
          <Sliders size={16} style={{ color: activeTab === "settings" ? agent.primaryColor : "inherit" }} /> Branding & Config
        </button>
      </div>

      {/* Tab Panels */}

      {/* 1. OVERVIEW & METRICS */}
      {activeTab === "metrics" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="animate-fade-in">
          <div className="grid-cols-3">
            <div className="glass-card" style={{ padding: "20px" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--foreground-muted)" }}>Total Conversations</span>
              <h2 style={{ fontSize: "2rem", color: "var(--foreground)", marginTop: "6px" }}>{totalConversations}</h2>
            </div>
            <div className="glass-card" style={{ padding: "20px" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--foreground-muted)" }}>Average Rating</span>
              <h2 style={{ fontSize: "2rem", color: "var(--foreground)", marginTop: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
                {ratingAvg > 0 ? (
                  <>
                    {ratingAvg} <span style={{ color: "var(--warning)", fontSize: "1.2rem", display: "flex" }}><Star size={20} fill="var(--warning)" /></span>
                  </>
                ) : (
                  "N/A"
                )}
              </h2>
            </div>
            <div className="glass-card" style={{ padding: "20px" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--foreground-muted)" }}>Indexed Chunks</span>
              <h2 style={{ fontSize: "2rem", color: "var(--foreground)", marginTop: "6px" }}>{knowledgeList.length}</h2>
            </div>
          </div>

          <div className="grid-cols-2">
            {/* Intent Classification Distribution */}
            <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <h3 style={{ fontSize: "1.1rem", color: "var(--foreground)", marginBottom: "4px" }}>Intent Classification</h3>
                <p style={{ fontSize: "0.8rem" }}>AI-categorized customer chat topics from recent transcripts.</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {Object.entries(categoriesMap).map(([category, count]) => {
                  const percentage = totalConversations > 0 ? Math.round((count / totalConversations) * 100) : 0;
                  let color = "var(--primary)";
                  if (category === "Billing") color = "var(--warning)";
                  if (category === "Technical") color = "var(--danger)";
                  if (category === "Sales") color = "var(--success)";
                  if (category === "General Support") color = "var(--accent)";

                  return (
                    <div key={category} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                        <span style={{ fontWeight: 600 }}>{category}</span>
                        <span style={{ color: "var(--foreground-muted)" }}>{count} ({percentage}%)</span>
                      </div>
                      <div style={{ width: "100%", height: "8px", background: "rgba(0,0,0,0.06)", borderRadius: "99px", overflow: "hidden" }}>
                        <div style={{ width: `${percentage}%`, height: "100%", background: color, borderRadius: "99px", transition: "width 0.5s ease-out" }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* System Context Box */}
            <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Award size={18} style={{ color: agent.primaryColor }} />
                <h3 style={{ fontSize: "1.1rem", color: "var(--foreground)" }}>Active RAG Directives</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", background: "rgba(0,0,0,0.15)", padding: "16px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", textTransform: "uppercase", fontWeight: 700 }}>System Guidelines:</span>
                  <p style={{ fontSize: "0.85rem", color: "var(--foreground)", marginTop: "4px", fontStyle: "italic" }}>
                    "{agent.systemPrompt}"
                  </p>
                </div>
                <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", textTransform: "uppercase", fontWeight: 700 }}>Greeting Banner:</span>
                  <p style={{ fontSize: "0.85rem", color: "var(--foreground)", marginTop: "4px" }}>
                    "{agent.welcomeMessage}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. KNOWLEDGE BASE */}
      {activeTab === "knowledge" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="animate-fade-in">
          <div className="grid-cols-2" style={{ alignItems: "flex-start" }}>
            {/* Upload/Add box */}
            <div className="glass-card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <FolderPlus size={18} style={{ color: agent.primaryColor }} />
                  <h3 style={{ fontSize: "1.1rem", color: "var(--foreground)" }}>Knowledge Source</h3>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button 
                    onClick={() => setKbTab("manual")} 
                    type="button"
                    className="btn" 
                    style={{ 
                      padding: "6px 12px", 
                      fontSize: "0.8rem", 
                      background: kbTab === "manual" ? "rgba(99,102,241,0.08)" : "transparent",
                      color: kbTab === "manual" ? "var(--primary)" : "var(--foreground-muted)",
                      border: kbTab === "manual" ? "1px solid rgba(99,102,241,0.15)" : "1px solid transparent"
                    }}
                  >
                    Manual Text
                  </button>
                  <button 
                    onClick={() => setKbTab("upload")} 
                    type="button"
                    className="btn" 
                    style={{ 
                      padding: "6px 12px", 
                      fontSize: "0.8rem", 
                      background: kbTab === "upload" ? "rgba(99,102,241,0.08)" : "transparent",
                      color: kbTab === "upload" ? "var(--primary)" : "var(--foreground-muted)",
                      border: kbTab === "upload" ? "1px solid rgba(99,102,241,0.15)" : "1px solid transparent"
                    }}
                  >
                    Upload Files
                  </button>
                </div>
              </div>
              
              {kbTab === "manual" ? (
                <form onSubmit={handleAddKnowledge} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div className="form-group">
                    <label className="form-label">Document Title</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Return Policy Details"
                      value={kTitle}
                      onChange={e => setKTitle(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Text Content (Vector Encoded Source)</label>
                    <textarea 
                      required 
                      placeholder="Paste the documentation text block here. The RAG system will extract facts from this block to answer client inquiries."
                      value={kContent}
                      onChange={e => setKContent(e.target.value)}
                      className="form-textarea"
                      style={{ minHeight: "150px" }}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ background: agent.primaryColor }}>
                    <Upload size={16} /> Index Document Chunk
                  </button>
                </form>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{
                    border: "2px dashed var(--border-color)",
                    borderRadius: "12px",
                    padding: "36px 20px",
                    textAlign: "center",
                    background: "rgba(0,0,0,0.01)",
                    cursor: "pointer",
                    position: "relative",
                    transition: "all 0.2s ease"
                  }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={async (e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      const mockEvent = {
                        target: { files: e.dataTransfer.files }
                      } as unknown as React.ChangeEvent<HTMLInputElement>;
                      await handleFileUpload(mockEvent);
                    }
                  }}
                  onClick={() => document.getElementById("file-upload-input")?.click()}
                  >
                    <input 
                      id="file-upload-input"
                      type="file"
                      multiple
                      accept=".txt,.md,.json,.csv,.xml,.html"
                      onChange={handleFileUpload}
                      style={{ display: "none" }}
                    />
                    <Upload size={32} style={{ color: agent.primaryColor, marginBottom: "12px", opacity: 0.8 }} />
                    <h4 style={{ fontSize: "0.95rem", color: "var(--foreground)", marginBottom: "6px" }}>
                      {uploading ? "Parsing and indexing..." : "Drag & drop files here"}
                    </h4>
                    <p style={{ fontSize: "0.8rem", color: "var(--foreground-muted)" }}>
                      or click to browse from your computer
                    </p>
                    <span style={{ display: "block", fontSize: "0.7rem", color: "var(--foreground-muted)", marginTop: "12px" }}>
                      Supports .txt, .md, .json, .csv, .xml, .html
                    </span>
                  </div>

                  {uploadError && (
                    <div style={{ padding: "10px 14px", background: "rgba(239, 68, 68, 0.08)", color: "#dc2626", border: "1px solid rgba(239, 68, 68, 0.15)", borderRadius: "8px", fontSize: "0.8rem" }}>
                      {uploadError}
                    </div>
                  )}

                  {uploadSuccess && (
                    <div style={{ padding: "10px 14px", background: "rgba(16, 185, 129, 0.08)", color: "#059669", border: "1px solid rgba(16, 185, 129, 0.15)", borderRadius: "8px", fontSize: "0.8rem" }}>
                      {uploadSuccess}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Indexed Chunks */}
            <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <h3 style={{ fontSize: "1.1rem", color: "var(--foreground)", marginBottom: "4px" }}>Indexed Database</h3>
                <p style={{ fontSize: "0.8rem" }}>{knowledgeList.length} documentation chunks available in the active vector index.</p>
              </div>

              <div className="custom-scroll" style={{ maxHeight: "390px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {knowledgeList.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "var(--foreground-muted)" }}>
                    <AlertCircle size={28} style={{ marginBottom: "8px", opacity: 0.5 }} />
                    <p>No knowledge chunks indexed yet. Add some on the left!</p>
                  </div>
                ) : (
                  knowledgeList.map(k => (
                    <div 
                      key={k.id} 
                      style={{
                        background: "var(--bg-chat-bubble)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "10px",
                        padding: "14px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h4 style={{ fontSize: "0.9rem", color: "var(--foreground)" }}>{k.title}</h4>
                        <button 
                          onClick={() => handleDeleteKnowledge(k.id)}
                          style={{ background: "transparent", color: "rgba(239, 68, 68, 0.7)", cursor: "pointer" }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <p style={{ fontSize: "0.8rem", lineHeight: "1.4", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                        {k.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CONVERSATIONS INBOX */}
      {activeTab === "chats" && (
        <div 
          className="glass-card" 
          style={{ 
            display: "grid", 
            gridTemplateColumns: "280px 1fr", 
            height: "550px", 
            overflow: "hidden",
            background: "rgba(10, 14, 23, 0.5)"
          }}
        >
          {/* Chats Sidebar List */}
          <div style={{ borderRight: "1px solid var(--border-color)", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "16px", borderBottom: "1px solid var(--border-color)" }}>
              <h4 style={{ fontSize: "0.9rem", color: "var(--foreground)" }}>Recent Conversations</h4>
            </div>
            
            <div className="custom-scroll" style={{ flex: 1 }}>
              {chatsList.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 16px", color: "var(--foreground-muted)", fontSize: "0.8rem" }}>
                  No customer chats recorded yet.
                </div>
              ) : (
                chatsList.map(c => {
                  const isActive = selectedChatId === c.id;
                  let badgeType = "badge-primary";
                  if (c.category === "Billing") badgeType = "badge-warning";
                  if (c.category === "Technical") badgeType = "badge-danger";
                  if (c.category === "Sales") badgeType = "badge-success";

                  return (
                    <div 
                      key={c.id} 
                      onClick={() => setSelectedChatId(c.id)}
                      style={{
                        padding: "16px",
                        borderBottom: "1px solid var(--border-color)",
                        cursor: "pointer",
                        background: isActive ? "var(--bg-chat-bubble)" : "transparent",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        borderLeft: isActive ? `3px solid ${agent.primaryColor}` : "3px solid transparent"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--foreground)" }}>Session {c.id.substring(5, 11)}</span>
                        <span style={{ fontSize: "0.7rem", color: "var(--foreground-muted)" }}>
                          {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span className={`badge ${badgeType}`} style={{ fontSize: "0.65rem", padding: "2px 6px" }}>{c.category}</span>
                        {c.rating && (
                          <div style={{ display: "flex", alignItems: "center", gap: "2px", color: "var(--warning)", fontSize: "0.75rem" }}>
                            <Star size={11} fill="var(--warning)" /> {c.rating}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", background: "rgba(0,0,0,0.02)" }}>
            {selectedChatId ? (
              <>
                {/* Chat Session Info */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-color)", background: "rgba(0,0,0,0.01)" }}>
                  <div>
                    <h4 style={{ color: "var(--foreground)", fontSize: "0.9rem" }}>Chat Session {selectedChatId.substring(5, 12)}</h4>
                    <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>
                      Started {new Date(chatsList.find(c => c.id === selectedChatId)?.createdAt || "").toLocaleString()}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span className="badge badge-primary">
                      Intent: {chatsList.find(c => c.id === selectedChatId)?.category}
                    </span>
                    {chatsList.find(c => c.id === selectedChatId)?.rating && (
                      <span className="badge badge-warning" style={{ gap: "4px" }}>
                        <Star size={12} fill="var(--warning)" /> Rating: {chatsList.find(c => c.id === selectedChatId)?.rating}/5
                      </span>
                    )}
                  </div>
                </div>

                {/* Messages Scroller */}
                <div className="custom-scroll" style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  {chatMessages.map(m => (
                    <div 
                      key={m.id} 
                      style={{
                        display: "flex",
                        justifyContent: m.sender === "customer" ? "flex-start" : "flex-end"
                      }}
                    >
                      <div style={{
                        maxWidth: "75%",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                        alignItems: m.sender === "customer" ? "flex-start" : "flex-end"
                      }}>
                        <div style={{
                          padding: "10px 14px",
                          borderRadius: "12px",
                          fontSize: "0.85rem",
                          lineHeight: "1.4",
                          whiteSpace: "pre-wrap",
                          background: m.sender === "customer" ? "var(--bg-chat-bubble)" : agent.primaryColor,
                          color: m.sender === "customer" ? "var(--foreground)" : "#fff",
                          borderBottomRightRadius: m.sender === "customer" ? "12px" : "2px",
                          borderBottomLeftRadius: m.sender === "customer" ? "2px" : "12px"
                        }}>
                          {m.content}
                        </div>
                        <span style={{ fontSize: "0.65rem", color: "var(--foreground-muted)" }}>
                          {m.sender === "customer" ? "Customer" : agent.name} • {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ display: "flex", flex: 1, flexDirection: "column", alignItems: "center", justifyItems: "center", justifyContent: "center", gap: "12px", color: "var(--foreground-muted)" }}>
                <MessageSquare size={36} style={{ opacity: 0.4 }} />
                <p style={{ fontSize: "0.85rem" }}>Select a conversation from the inbox side panel to read its transcript.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. BRANDING & CONFIG */}
      {activeTab === "settings" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="animate-fade-in">
          <div className="grid-cols-2" style={{ alignItems: "flex-start" }}>
            {/* Configuration Form */}
            <div className="glass-card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                <Sliders size={18} style={{ color: agent.primaryColor }} />
                <h3 style={{ fontSize: "1.1rem", color: "var(--foreground)" }}>Branding Parameters</h3>
              </div>

              <form onSubmit={handleSaveSettings} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Agent Name</label>
                  <input 
                    type="text" 
                    required 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Avatar URL</label>
                  <input 
                    type="text" 
                    required 
                    value={avatarUrl}
                    onChange={e => setAvatarUrl(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Theme Colors</label>
                  <div style={{ display: "flex", gap: "16px" }}>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>Primary Theme</span>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <input 
                          type="color" 
                          value={primaryColor} 
                          onChange={e => setPrimaryColor(e.target.value)}
                          style={{ width: "30px", height: "30px", borderRadius: "50%", cursor: "pointer", padding: "0" }}
                        />
                        <span style={{ fontSize: "0.8rem", textTransform: "uppercase" }}>{primaryColor}</span>
                      </div>
                    </div>

                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>Accent Theme</span>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <input 
                          type="color" 
                          value={accentColor} 
                          onChange={e => setAccentColor(e.target.value)}
                          style={{ width: "30px", height: "30px", borderRadius: "50%", cursor: "pointer", padding: "0" }}
                        />
                        <span style={{ fontSize: "0.8rem", textTransform: "uppercase" }}>{accentColor}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Welcome Message Greeting</label>
                  <input 
                    type="text" 
                    required 
                    value={welcomeMessage}
                    onChange={e => setWelcomeMessage(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">System Instructions Context</label>
                  <textarea 
                    required 
                    value={systemPrompt}
                    onChange={e => setSystemPrompt(e.target.value)}
                    className="form-textarea"
                    style={{ minHeight: "120px" }}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, background: agent.primaryColor }}>
                    Save Branded Theme
                  </button>
                </div>
              </form>
            </div>

            {/* Preview Box & Danger Zone */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Branding Visual Preview */}
              <div className="glass-card" style={{ padding: "24px" }}>
                <h3 style={{ fontSize: "1.1rem", color: "var(--foreground)", marginBottom: "16px" }}>Branding Sandbox</h3>
                
                <div style={{
                  border: "1px solid var(--border-color)",
                  borderRadius: "14px",
                  overflow: "hidden",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.15)"
                }}>
                  {/* Floating mock chat header */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", background: primaryColor, color: "#fff" }}>
                    <img src={avatarUrl} style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" }} />
                    <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>{name}</span>
                  </div>
                  {/* Floating mock messages area */}
                  <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px", background: "rgba(0,0,0,0.1)", height: "120px" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <div style={{ background: "var(--bg-chat-bubble)", color: "var(--foreground)", padding: "8px 12px", borderRadius: "10px", fontSize: "0.75rem" }}>
                        Hello! What products do you have?
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-start" }}>
                      <div style={{ background: primaryColor, color: "#fff", padding: "8px 12px", borderRadius: "10px", fontSize: "0.75rem" }}>
                        {welcomeMessage}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="glass-card" style={{ padding: "24px", border: "1px solid rgba(239,68,68,0.2)" }}>
                <h3 style={{ fontSize: "1.1rem", color: "#ef4444", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <AlertCircle size={18} /> Danger Zone
                </h3>
                <p style={{ fontSize: "0.8rem", marginBottom: "16px" }}>Deleting this agent is permanent and cannot be undone. All chats, ratings, and knowledge index layers will be deleted.</p>
                <button type="button" onClick={handleDeleteAgent} className="btn btn-danger" style={{ width: "100%", justifyContent: "center" }}>
                  Delete Support Agent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
