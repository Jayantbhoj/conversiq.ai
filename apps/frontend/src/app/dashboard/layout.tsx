"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, Home, LogOut, Settings, Users, Sparkles } from "lucide-react";
import { initializeStorage, getAgents, Agent } from "@/lib/storage";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    initializeStorage();
    setAgents(getAgents());

    // Listen for storage changes to keep sidebar list updated
    const handleUpdate = () => {
      setAgents(getAgents());
    };
    window.addEventListener("storage-agent-update", handleUpdate);
    return () => window.removeEventListener("storage-agent-update", handleUpdate);
  }, [pathname]);

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Sidebar Logo & Theme Toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px", padding: "0 8px" }}>
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
              Aura<span style={{ color: "var(--primary)" }}>Support</span>
            </span>
          </div>
        </div>

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
          
          <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--foreground-muted)", textTransform: "uppercase", padding: "0 8px 8px 8px", letterSpacing: "0.05em" }}>
              My Agents
            </span>
            {agents.map(a => {
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
          </div>
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
