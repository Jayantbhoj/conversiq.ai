const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchAgent(id: string) {
  const res = await fetch(`${BASE_URL}/agents/${id}`);
  if (!res.ok) throw new Error('Agent not found');
  return res.json();
}

export async function fetchKnowledge(agentId: string) {
  const res = await fetch(`${BASE_URL}/agents/${agentId}/knowledge`);
  return res.json();
}

export async function addKnowledge(agentId: string, title: string, content: string) {
  const res = await fetch(`${BASE_URL}/agents/${agentId}/knowledge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content }),
  });
  return res.json();
}

export async function uploadDocument(agentId: string, file: File, tags: string = '') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('tags', tags);
  const res = await fetch(`${BASE_URL}/agents/${agentId}/documents`, {
    method: 'POST',
    body: formData,
  });
  return res.json();
}

export async function deleteKnowledge(agentId: string, docId: string) {
  const res = await fetch(`${BASE_URL}/agents/${agentId}/knowledge/${docId}`, {
    method: 'DELETE',
  });
  return res.json();
}

export async function fetchChats(agentId: string) {
  const res = await fetch(`${BASE_URL}/agents/${agentId}/chats`);
  return res.json();
}

export async function createChatSession(agentId: string) {
  const res = await fetch(`${BASE_URL}/agents/${agentId}/chats`, {
    method: 'POST',
  });
  return res.json();
}

export async function queryAgentResponse(agentId: string, query: string) {
  const res = await fetch(`${BASE_URL}/agents/${agentId}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  return res.json();
}

export async function fetchMessages(chatSessionId: string) {
  const res = await fetch(`${BASE_URL}/chats/${chatSessionId}/messages`);
  return res.json();
}

export async function sendChatMessage(chatSessionId: string, sender: 'customer' | 'agent', content: string) {
  const res = await fetch(`${BASE_URL}/chats/${chatSessionId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sender, content }),
  });
  return res.json();
}

export async function submitChatRating(chatSessionId: string, rating: number) {
  const res = await fetch(`${BASE_URL}/chats/${chatSessionId}/rating`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating }),
  });
  return res.json();
}

export async function updateAgent(agentId: string, data: any) {
  const res = await fetch(`${BASE_URL}/agents/${agentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteAgent(agentId: string) {
  const res = await fetch(`${BASE_URL}/agents/${agentId}`, {
    method: 'DELETE',
  });
  return res.json();
}
