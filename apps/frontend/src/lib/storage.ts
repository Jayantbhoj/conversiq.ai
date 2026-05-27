export interface Agent {
  id: string;
  name: string;
  welcomeMessage: string;
  systemPrompt: string;
  primaryColor: string;
  accentColor: string;
  avatarUrl: string;
  createdAt: string;
}

export interface KnowledgeSource {
  id: string;
  agentId: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  agentId: string;
  category: "Unclassified" | "Billing" | "Technical" | "Sales" | "General Support";
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  chatSessionId: string;
  sender: "customer" | "agent";
  content: string;
  createdAt: string;
}

// Default Seed Data
const DEFAULT_AGENTS: Agent[] = [
  {
    id: "gemini-gadgets",
    name: "Gemini Gadgets Bot",
    welcomeMessage: "Hi there! Welcome to Gemini Gadgets. How can I help you with our tech gear today?",
    systemPrompt: "You are an expert customer support agent for Gemini Gadgets. Be polite, friendly, and search your knowledge base for product specifications and policies. If you do not know the answer, politely ask them to email support@geminigadgets.com.",
    primaryColor: "#6366f1",
    accentColor: "#06b6d4",
    avatarUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
  },
  {
    id: "aura-beauty",
    name: "Aura Skincare Guide",
    welcomeMessage: "Hello! I am your Aura Beauty guide. Tell me about your skin type, or ask about our botanical face oils!",
    systemPrompt: "You are a skincare consulting agent for Aura Beauty. Give tips on dry/oily skin, recommend products from your knowledge base, and emphasize natural vegan ingredients.",
    primaryColor: "#ec4899",
    accentColor: "#f43f5e",
    avatarUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=150&auto=format&fit=crop&q=60",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
  }
];

const DEFAULT_KNOWLEDGE: Record<string, KnowledgeSource[]> = {
  "gemini-gadgets": [
    {
      id: "g-k1",
      agentId: "gemini-gadgets",
      title: "Refunds and Returns Policy",
      content: "Gemini Gadgets offers a 30-day refund policy. Items must be returned in their original packaging, with all accessories included, to get a full refund. Shipping fees are non-refundable. Returns take 5-7 business days to process once received at our warehouse.",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "g-k2",
      agentId: "gemini-gadgets",
      title: "Gemini Pro Charge Specs",
      content: "The Gemini Pro Charge wireless power bank has a capacity of 10,000mAh. It features 15W fast Qi wireless charging, and 20W USB-C Power Delivery. It can charge an iPhone 15 from 0% to 50% in approximately 30 minutes via cable, and fits comfortably in a pocket.",
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  "aura-beauty": [
    {
      id: "a-k1",
      agentId: "aura-beauty",
      title: "Glow Oil Directions",
      content: "Apply 3-4 drops of Aura Botanical Glow Oil to clean, damp skin morning and night. Press gently into the face and neck. Formulated with organic jojoba, rosehip, and squalane. Suitable for all skin types, including sensitive skin.",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]
};

const DEFAULT_CHATS: Record<string, ChatSession[]> = {
  "gemini-gadgets": [
    {
      id: "chat-g1",
      agentId: "gemini-gadgets",
      category: "Billing",
      rating: 5,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "chat-g2",
      agentId: "gemini-gadgets",
      category: "Technical",
      rating: 4,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "chat-g3",
      agentId: "gemini-gadgets",
      category: "General Support",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    }
  ],
  "aura-beauty": [
    {
      id: "chat-a1",
      agentId: "aura-beauty",
      category: "Sales",
      rating: 5,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]
};

const DEFAULT_MESSAGES: Record<string, Message[]> = {
  "chat-g1": [
    {
      id: "m-g1-1",
      chatSessionId: "chat-g1",
      sender: "customer",
      content: "Hi, I purchased the charger last week but want to return it. What is your refund policy?",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 - 5000).toISOString()
    },
    {
      id: "m-g1-2",
      chatSessionId: "chat-g1",
      sender: "agent",
      content: "Hello! We offer a 30-day refund policy. Items must be returned in their original packaging, with all accessories included, to get a full refund. Shipping fees are non-refundable. Returns take 5-7 business days to process once received.",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  "chat-g2": [
    {
      id: "m-g2-1",
      chatSessionId: "chat-g2",
      sender: "customer",
      content: "Does the wireless charger support fast charging?",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 8000).toISOString()
    },
    {
      id: "m-g2-2",
      chatSessionId: "chat-g2",
      sender: "agent",
      content: "Yes! The Gemini Pro Charge wireless power bank features 15W fast Qi wireless charging, and 20W USB-C Power Delivery. It can charge an iPhone from 0% to 50% in roughly 30 minutes via cable.",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  "chat-g3": [
    {
      id: "m-g3-1",
      chatSessionId: "chat-g3",
      sender: "customer",
      content: "Hello, I just wanted to ask how long shipping takes?",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000 - 5000).toISOString()
    },
    {
      id: "m-g3-2",
      chatSessionId: "chat-g3",
      sender: "agent",
      content: "Hello! I don't have shipping times details in my database, but standard order processing usually takes 1-2 business days. If you need details on international shipping, please email support@geminigadgets.com!",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    }
  ],
  "chat-a1": [
    {
      id: "m-a1-1",
      chatSessionId: "chat-a1",
      sender: "customer",
      content: "Can I use the glow oil if I have sensitive skin?",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 10000).toISOString()
    },
    {
      id: "m-a1-2",
      chatSessionId: "chat-a1",
      sender: "agent",
      content: "Hi! Yes, our Aura Botanical Glow Oil is formulated with organic jojoba, rosehip, and squalane, which makes it suitable for all skin types, including sensitive skin! You can press 3-4 drops gently into clean, damp skin morning and night.",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]
};

// Safe LocalStorage helpers
function isClient() {
  return typeof window !== "undefined";
}

export function initializeStorage() {
  if (!isClient()) return;
  if (!localStorage.getItem("rag_agents")) {
    localStorage.setItem("rag_agents", JSON.stringify(DEFAULT_AGENTS));
    
    Object.entries(DEFAULT_KNOWLEDGE).forEach(([agentId, data]) => {
      localStorage.setItem(`rag_knowledge_${agentId}`, JSON.stringify(data));
    });
    
    Object.entries(DEFAULT_CHATS).forEach(([agentId, data]) => {
      localStorage.setItem(`rag_chats_${agentId}`, JSON.stringify(data));
    });
    
    Object.entries(DEFAULT_MESSAGES).forEach(([chatId, data]) => {
      localStorage.setItem(`rag_messages_${chatId}`, JSON.stringify(data));
    });
  }
}

export function getAgents(): Agent[] {
  if (!isClient()) return DEFAULT_AGENTS;
  initializeStorage();
  const raw = localStorage.getItem("rag_agents");
  return raw ? JSON.parse(raw) : [];
}

export function getAgentById(id: string): Agent | undefined {
  return getAgents().find(a => a.id === id);
}

export function createAgent(agent: Omit<Agent, "id" | "createdAt">): Agent {
  const agents = getAgents();
  const id = agent.name.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Math.random().toString(36).substring(2, 6);
  const newAgent: Agent = {
    ...agent,
    id,
    createdAt: new Date().toISOString()
  };
  agents.push(newAgent);
  localStorage.setItem("rag_agents", JSON.stringify(agents));
  return newAgent;
}

export function updateAgent(id: string, updated: Partial<Agent>): Agent {
  const agents = getAgents();
  const idx = agents.findIndex(a => a.id === id);
  if (idx > -1) {
    agents[idx] = { ...agents[idx], ...updated };
    localStorage.setItem("rag_agents", JSON.stringify(agents));
    return agents[idx];
  }
  throw new Error("Agent not found");
}

export function deleteAgent(id: string) {
  const agents = getAgents();
  const filtered = agents.filter(a => a.id !== id);
  localStorage.setItem("rag_agents", JSON.stringify(filtered));
  localStorage.removeItem(`rag_knowledge_${id}`);
  localStorage.removeItem(`rag_chats_${id}`);
}

export function getKnowledge(agentId: string): KnowledgeSource[] {
  if (!isClient()) return DEFAULT_KNOWLEDGE[agentId] || [];
  initializeStorage();
  const raw = localStorage.getItem(`rag_knowledge_${agentId}`);
  return raw ? JSON.parse(raw) : [];
}

export function addKnowledge(agentId: string, title: string, content: string): KnowledgeSource {
  const list = getKnowledge(agentId);
  const newSource: KnowledgeSource = {
    id: "k-" + Math.random().toString(36).substring(2, 9),
    agentId,
    title,
    content,
    createdAt: new Date().toISOString()
  };
  list.push(newSource);
  localStorage.setItem(`rag_knowledge_${agentId}`, JSON.stringify(list));
  return newSource;
}

export function deleteKnowledge(agentId: string, id: string) {
  const list = getKnowledge(agentId);
  const filtered = list.filter(k => k.id !== id);
  localStorage.setItem(`rag_knowledge_${agentId}`, JSON.stringify(filtered));
}

export function getChats(agentId: string): ChatSession[] {
  if (!isClient()) return DEFAULT_CHATS[agentId] || [];
  initializeStorage();
  const raw = localStorage.getItem(`rag_chats_${agentId}`);
  return raw ? JSON.parse(raw) : [];
}

export function createChat(agentId: string): ChatSession {
  const chats = getChats(agentId);
  const newChat: ChatSession = {
    id: "chat-" + Math.random().toString(36).substring(2, 9),
    agentId,
    category: "Unclassified",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  chats.push(newChat);
  localStorage.setItem(`rag_chats_${agentId}`, JSON.stringify(chats));
  return newChat;
}

export function getMessages(chatId: string): Message[] {
  if (!isClient()) return DEFAULT_MESSAGES[chatId] || [];
  initializeStorage();
  const raw = localStorage.getItem(`rag_messages_${chatId}`);
  return raw ? JSON.parse(raw) : [];
}

export function submitRating(agentId: string, chatId: string, rating: number) {
  const chats = getChats(agentId);
  const idx = chats.findIndex(c => c.id === chatId);
  if (idx > -1) {
    chats[idx].rating = rating;
    chats[idx].updatedAt = new Date().toISOString();
    localStorage.setItem(`rag_chats_${agentId}`, JSON.stringify(chats));
  }
}

export function sendMessage(agentId: string, chatId: string, sender: "customer" | "agent", content: string): Message {
  const messages = getMessages(chatId);
  const newMessage: Message = {
    id: "m-" + Math.random().toString(36).substring(2, 9),
    chatSessionId: chatId,
    sender,
    content,
    createdAt: new Date().toISOString()
  };
  messages.push(newMessage);
  localStorage.setItem(`rag_messages_${chatId}`, JSON.stringify(messages));

  if (sender === "customer") {
    // Simulate RAG reply & auto classification
    const agent = getAgentById(agentId);
    const knowledge = getKnowledge(agentId);

    // RAG Search simulation (Cosine similarity simulation using keyword matches)
    let bestMatchContent = "";
    let highestScore = 0;
    
    const queryWords = content.toLowerCase().split(/\s+/);
    knowledge.forEach(k => {
      const sourceText = (k.title + " " + k.content).toLowerCase();
      let matchCount = 0;
      queryWords.forEach(word => {
        if (word.length > 3 && sourceText.includes(word)) {
          matchCount++;
        }
      });
      
      if (matchCount > highestScore) {
        highestScore = matchCount;
        bestMatchContent = k.content;
      }
    });

    // Generate AI Agent response content
    let agentReply = "";
    if (highestScore > 0 && bestMatchContent) {
      agentReply = `According to our records: ${bestMatchContent}\n\nIs there anything else I can help you with?`;
    } else {
      // General fallbacks based on system prompt / instructions
      if (content.toLowerCase().includes("hello") || content.toLowerCase().includes("hi")) {
        agentReply = agent ? agent.welcomeMessage : "Hello! How can I support you today?";
      } else {
        agentReply = `I understand you're asking about that. Based on my support instructions: "${agent?.systemPrompt || "Be helpful"}", please contact email support at support@company.com if you need custom troubleshooting!`;
      }
    }

    // Add agent message
    setTimeout(() => {
      const agentMessage: Message = {
        id: "m-" + Math.random().toString(36).substring(2, 9),
        chatSessionId: chatId,
        sender: "agent",
        content: agentReply,
        createdAt: new Date().toISOString()
      };
      
      const latestMsgs = getMessages(chatId);
      latestMsgs.push(agentMessage);
      localStorage.setItem(`rag_messages_${chatId}`, JSON.stringify(latestMsgs));

      // Trigger automatic intent classification update
      classifyChat(agentId, chatId, content);

      // Dispatch event to notify layout (since we are fully client-side)
      window.dispatchEvent(new Event("storage-chat-update"));
    }, 1000);
  }

  return newMessage;
}

// Simple rule-based classifier representing LLM intent extraction
function classifyChat(agentId: string, chatId: string, latestCustomerMessage: string) {
  const text = latestCustomerMessage.toLowerCase();
  let category: ChatSession["category"] = "General Support";
  
  if (text.includes("refund") || text.includes("return") || text.includes("price") || text.includes("billing") || text.includes("charge") || text.includes("subscription") || text.includes("cost") || text.includes("pay")) {
    category = "Billing";
  } else if (text.includes("broken") || text.includes("error") || text.includes("bug") || text.includes("install") || text.includes("crash") || text.includes("not working") || text.includes("slow") || text.includes("connect")) {
    category = "Technical";
  } else if (text.includes("demo") || text.includes("buy") || text.includes("sales") || text.includes("discount") || text.includes("enterprise") || text.includes("deal") || text.includes("quote")) {
    category = "Sales";
  }

  const chats = getChats(agentId);
  const idx = chats.findIndex(c => c.id === chatId);
  if (idx > -1) {
    chats[idx].category = category;
    chats[idx].updatedAt = new Date().toISOString();
    localStorage.setItem(`rag_chats_${agentId}`, JSON.stringify(chats));
  }
}
