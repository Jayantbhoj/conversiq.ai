"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, Home, LogOut, ChevronDown } from "lucide-react";
import { initializeStorage, getAgents, Agent, getBusinesses, getActiveBusinessId, setActiveBusinessId, Business } from "@/lib/storage";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [activeBusinessId, setActiveBusinessIdState] = useState<string | null>(null);
  const [showBusinessMenu, setShowBusinessMenu] = useState(false);

  const loadData = () => {
    initializeStorage();
    setAgents(getAgents());
    setBusinesses(getBusinesses());
    setActiveBusinessIdState(getActiveBusinessId());
  };

  useEffect(() => {
    loadData();

    // Listen for storage changes to keep sidebar list updated
    const handleAgentUpdate = () => {
      setAgents(getAgents());
    };
    const handleActiveBusinessChange = () => {
      setActiveBusinessIdState(getActiveBusinessId());
    };
    const handleBusinessUpdate = () => {
      setBusinesses(getBusinesses());
    };

    window.addEventListener("storage-agent-update", handleAgentUpdate);
    window.addEventListener("storage-active-business-change", handleActiveBusinessChange);
    window.addEventListener("storage-business-update", handleBusinessUpdate);

    return () => {
      window.removeEventListener("storage-agent-update", handleAgentUpdate);
      window.removeEventListener("storage-active-business-change", handleActiveBusinessChange);
      window.removeEventListener("storage-business-update", handleBusinessUpdate);
    };
  }, [pathname]);

  const activeBusiness = businesses.find(b => b.id === activeBusinessId);
  const filteredAgents = agents.filter(a => a.businessId === activeBusinessId);

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar" style={{ position: "relative" }}>
        {/* Sidebar Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", padding: "0 8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              background: "linear-gradient(135deg, var(--primary), var(--accent))",
              width: "30px",
              height: "30px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 10px rgba(99,102,241,0.3)"
            }}>
              <Bot size={16} color="#fff" />
            </div>
            <span style={{ fontSize: "1.15rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
              Conversiq<span style={{ color: "var(--primary)" }}> AI</span>
            </span>
          </div>
        </div>

        {/* Active Business Switcher Dropdown */}
        {activeBusinessId && (
          <div style={{ margin: "16px 0 24px 0", position: "relative" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--foreground-muted)", textTransform: "uppercase", padding: "0 8px 8px 8px", letterSpacing: "0.05em", display: "block" }}>
              Active Business
            </span>
            <div className="glass-card" style={{
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
            }} onClick={() => setShowBusinessMenu(!showBusinessMenu)}>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {activeBusiness ? activeBusiness.name : "Select Business"}
              </span>
              <ChevronDown size={14} style={{ color: "var(--foreground-muted)" }} />
            </div>
            
            {showBusinessMenu && (
              <div className="glass-card" style={{
                position: "absolute",
                left: "0",
                right: "0",
                marginTop: "6px",
                zIndex: 500,
                maxHeight: "200px",
                overflowY: "auto",
                padding: "8px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                background: "#ffffff",
                border: "1px solid var(--border-color)",
                boxShadow: "var(--shadow-lg)"
              }}>
                {businesses.map(b => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setActiveBusinessId(b.id);
                      setShowBusinessMenu(false);
                    }}
                    className="btn"
                    style={{
                      justifyContent: "flex-start",
                      fontSize: "0.8rem",
                      padding: "8px",
                      background: b.id === activeBusinessId ? "rgba(99, 102, 241, 0.08)" : "transparent",
                      color: b.id === activeBusinessId ? "var(--primary)" : "var(--foreground-muted)",
                      width: "100%",
                      textAlign: "left"
                    }}
                  >
                    {b.name}
                  </button>
                ))}
                <div style={{ borderTop: "1px solid var(--border-color)", marginTop: "4px", paddingTop: "4px" }}>
                  <button
                    onClick={() => {
                      setActiveBusinessId(null);
                      setShowBusinessMenu(false);
                    }}
                    className="btn btn-secondary"
                    style={{ width: "100%", justifyContent: "center", fontSize: "0.8rem", padding: "6px" }}
                  >
                    Switch Business
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sidebar Nav Links */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--foreground-muted)", textTransform: "uppercase", padding: "0 8px 8px 8px", letterSpacing: "0.05em" }}>
            Navigation
          </span>
          <Link href="/dashboard" className={`btn`} style={{
            justifyContent: "flex-start",
            background: pathname === "/dashboard" ? "rgba(99, 102, 241, 0.1)" : "transparent",
            color: pathname === "/dashboard" ? "var(--primary)" : "var(--foreground-muted)",
            border: pathname === "/dashboard" ? "1px solid rgba(99, 102, 241, 0.15)" : "1px solid transparent"
          }}>
            <Home size={18} /> Overview
          </Link>
          
          {activeBusinessId && (
            <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--foreground-muted)", textTransform: "uppercase", padding: "0 8px 8px 8px", letterSpacing: "0.05em" }}>
                My Agents
              </span>
              {filteredAgents.map(a => {
                const isActive = pathname === `/dashboard/agent/${a.id}`;
                return (
                  <Link 
                    key={a.id} 
                    href={`/dashboard/agent/${a.id}`} 
                    className="btn"
                    style={{
                      justifyContent: "flex-start",
                      background: isActive ? "rgba(99, 102, 241, 0.08)" : "transparent",
                      color: isActive ? "var(--primary)" : "var(--foreground-muted)",
                      padding: "8px 12px",
                      fontSize: "0.85rem",
                      border: isActive ? `1px solid rgba(99, 102, 241, 0.15)` : "1px solid transparent"
                    }}
                  >
                    <img 
                      src={a.avatarUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150"} 
                      alt={a.name}
                      style={{ width: "20px", height: "20px", borderRadius: "50%", objectFit: "cover" }}
                    />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {a.name}
                    </span>
                  </Link>
                );
              })}
              {filteredAgents.length === 0 && (
                <span style={{ fontSize: "0.8rem", color: "var(--foreground-muted)", padding: "0 8px", fontStyle: "italic" }}>
                  No agents created yet.
                </span>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Footer Link */}
        <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "16px" }}>
          <Link href="/" className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
            <LogOut size={16} /> Exit SaaS
          </Link>
        </div>
      </aside>

      {/* Viewport content */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
