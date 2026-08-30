import { createClient } from "@/lib/supabase/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

async function getAuthHeaders(): Promise<HeadersInit> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }
  return headers;
}

function snakeToCamel(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map((item) => snakeToCamel(item));
  }
  if (typeof obj === "object" && obj !== null) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      result[camelKey] = snakeToCamel(value);
    }
    return result;
  }
  return obj;
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return snakeToCamel(data) as T;
}

// Mock responses for development without backend
const mockSources = [
  {
    documentId: "mock-1",
    documentTitle: "Academic Regulations 2026",
    pageNumber: 12,
    chunkId: "chunk-1",
    relevanceScore: 0.91,
  },
];

export const chatApi = {
  async sendMessage(message: string, conversationId?: string, department?: string) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 1200));
      const isUnknown = message.toLowerCase().includes("underwater") || message.toLowerCase().includes("lunar");
      return {
        answer: isUnknown
          ? "I couldn't find enough information about this in the college knowledge base. Please contact the relevant college department or administrator for confirmation."
          : "Students must maintain a minimum attendance of 75% in each course to be eligible for end-semester examinations.",
        conversationId: conversationId || "mock-conv-1",
        messageId: "mock-msg-" + Date.now(),
        sources: isUnknown ? [] : mockSources,
        hasContext: !isUnknown,
      };
    }
    return apiFetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        message,
        conversation_id: conversationId,
        department,
      }),
    });
  },

  async getConversations() {
    if (USE_MOCK) {
      return [
        { id: "mock-1", title: "Attendance requirements", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "mock-2", title: "Hostel fees", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ];
    }
    return apiFetch("/api/chat/conversations");
  },

  async getConversation(id: string) {
    if (USE_MOCK) return { id, title: "Mock", messages: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    return apiFetch(`/api/chat/conversations/${id}`);
  },

  async deleteConversation(id: string) {
    if (USE_MOCK) return { success: true };
    return apiFetch(`/api/chat/conversations/${id}`, { method: "DELETE" });
  },

  async submitFeedback(messageId: string, feedback: "positive" | "negative") {
    if (USE_MOCK) return { success: true };
    return apiFetch(`/api/chat/messages/${messageId}/feedback`, {
      method: "POST",
      body: JSON.stringify({ feedback }),
    });
  },
};

export const adminApi = {
  async getStats() {
    if (USE_MOCK) {
      return {
        totalDocuments: 10,
        indexedDocuments: 8,
        failedDocuments: 1,
        totalUsers: 45,
        totalConversations: 120,
        totalQuestions: 350,
        totalChunks: 1200,
        positiveFeedback: 280,
        negativeFeedback: 15,
        recentDocuments: [],
      };
    }
    const data = await apiFetch<Record<string, unknown>>("/api/admin/stats");
    return data;
  },

  async getDocuments(params?: Record<string, string>) {
    if (USE_MOCK) {
      return [
        { id: "1", title: "Academic Regulations 2026", filename: "academic_regulations_2026.pdf", status: "ready", version: "2026", chunkCount: 326, pageCount: 84, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "2", title: "Hostel Guidelines", filename: "hostel_guidelines.pdf", status: "ready", version: "2026", chunkCount: 45, pageCount: 12, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ];
    }
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiFetch(`/api/admin/documents${query}`);
  },

  async getDocument(id: string) {
    if (USE_MOCK) return { id, title: "Mock Document", filename: "mock.pdf", status: "ready", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    return apiFetch(`/api/admin/documents/${id}`);
  },

  async uploadDocument(formData: FormData) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 2000));
      return { id: "mock-new", title: "Uploaded", filename: "doc.pdf", status: "ready", chunkCount: 50 };
    }
    const headers = await getAuthHeaders();
    delete (headers as Record<string, string>)["Content-Type"];
    const res = await fetch(`${API_URL}/api/admin/documents`, {
      method: "POST",
      headers,
      body: formData,
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: "Upload failed" }));
      throw new Error(error.detail);
    }
    return snakeToCamel(await res.json());
  },

  async deleteDocument(id: string) {
    if (USE_MOCK) return { success: true };
    return apiFetch(`/api/admin/documents/${id}`, { method: "DELETE" });
  },

  async archiveDocument(id: string) {
    if (USE_MOCK) return { success: true };
    return apiFetch(`/api/admin/documents/${id}/archive`, { method: "POST" });
  },

  async debugRetrieval(query: string, department?: string) {
    if (USE_MOCK) {
      return {
        query,
        chunks: [
          { documentTitle: "Academic Regulations 2026", pageNumber: 12, content: "Students must maintain a minimum attendance of 75%...", relevanceScore: 0.91, chunkId: "c1" },
        ],
      };
    }
    return apiFetch("/api/admin/retrieval/debug", {
      method: "POST",
      body: JSON.stringify({ query, department }),
    });
  },

  async getUsers() {
    if (USE_MOCK) return [{ id: "1", email: "admin@college.edu", name: "Admin", role: "admin", createdAt: new Date().toISOString() }];
    return apiFetch("/api/admin/users");
  },

  async getDocumentChunks(id: string) {
    if (USE_MOCK) return [];
    return apiFetch(`/api/admin/documents/${id}/chunks`);
  },
};
