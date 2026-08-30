"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { ChatSidebar, ChatWelcome } from "@/components/chat/ChatSidebar";
import { NeuChatMessage } from "@/components/chat/ChatMessage";
import { NeuChatComposer } from "@/components/chat/ChatComposer";
import { NeuLoading } from "@/components/ui/NeuLoading";
import { useAuth } from "@/lib/auth/context";
import { chatApi } from "@/lib/api/client";
import type { Conversation, Message } from "@/types";

interface ChatWorkspaceProps {
  conversationId?: string;
}

export function ChatWorkspace({ conversationId }: ChatWorkspaceProps) {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeId, setActiveId] = useState<string | undefined>(conversationId);
  const [sending, setSending] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  const loadConversations = useCallback(async () => {
    try {
      const data = await chatApi.getConversations();
      setConversations(data as Conversation[]);
    } catch {
      // silent
    }
  }, []);

  const loadConversation = useCallback(async (id: string) => {
    try {
      const data = await chatApi.getConversation(id);
      setMessages((data as { messages: Message[] }).messages || []);
      setActiveId(id);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    if (user) loadConversations();
  }, [user, loadConversations]);

  useEffect(() => {
    if (conversationId) loadConversation(conversationId);
    else {
      setActiveId(undefined);
      setMessages([]);
    }
  }, [conversationId, loadConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const handleNewChat = () => {
    setActiveId(undefined);
    setMessages([]);
    router.push("/chat");
  };

  const handleSelect = (id: string) => {
    router.push(`/chat/${id}`);
  };

  const handleSend = async (content: string) => {
    const tempUserMsg: Message = {
      id: "temp-user-" + Date.now(),
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setSending(true);

    try {
      const response = await chatApi.sendMessage(content, activeId) as {
        messageId: string;
        answer: string;
        conversationId: string;
        sources?: Array<Record<string, unknown>>;
      };
      const assistantMsg: Message = {
        id: response.messageId,
        role: "assistant",
        content: response.answer,
        createdAt: new Date().toISOString(),
        sources: response.sources?.map((s) => ({
          documentId: s.documentId as string,
          documentTitle: s.documentTitle as string,
          pageNumber: s.pageNumber as number | undefined,
          chunkId: s.chunkId as string,
          relevanceScore: s.relevanceScore as number | undefined,
        })),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      if (!activeId) {
        setActiveId(response.conversationId);
        router.push(`/chat/${response.conversationId}`);
      }
      loadConversations();
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: "temp-error",
          role: "assistant",
          content: "Something went wrong. Please try again.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <NeuLoading label="Loading..." />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <ChatSidebar
        conversations={conversations}
        activeId={activeId}
        onNewChat={handleNewChat}
        onSelect={handleSelect}
        onLogout={() => { signOut(); router.push("/"); }}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <main className="flex flex-1 flex-col min-w-0">
        <header className="flex items-center gap-3 px-4 py-3 lg:px-6">
          <button
            className="lg:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">UniMate</h1>
        </header>

        <div className="flex-1 overflow-y-auto px-4 lg:px-8 pb-4">
          {messages.length === 0 && !sending ? (
            <ChatWelcome onSuggestion={handleSend} />
          ) : (
            <div className="mx-auto max-w-3xl space-y-6 py-4">
              {messages.map((msg) => (
                <NeuChatMessage key={msg.id} message={msg} />
              ))}
              {sending && <NeuLoading />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="px-4 lg:px-8 pb-6 pt-2">
          <div className="mx-auto max-w-3xl">
            <NeuChatComposer onSend={handleSend} disabled={sending} />
          </div>
        </div>
      </main>
    </div>
  );
}
