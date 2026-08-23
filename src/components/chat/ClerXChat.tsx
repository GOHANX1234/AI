"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ClerXLogo from "@/components/ui/ClerXLogo";
import {
  SquarePen,
  Search,
  Pin,
  Trash2,
  Edit2,
  Copy,
  Check,
  Download,
  Sliders,
  ArrowUp,
  ArrowDown,
  Square,
  Loader2,
  Menu,
  X,
  RefreshCw,
  LogOut,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
  Plus,
  Code2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageItem {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  tokens?: number;
  latencyMs?: number;
  createdAt?: string;
  isStreaming?: boolean;
}

interface ConversationItem {
  id: string;
  title: string;
  systemPrompt?: string;
  pinned: boolean;
  lastMessage?: string;
  updatedAt: string;
  createdAt?: string;
}

// Format language name nicely (e.g. typescript -> TypeScript)
function formatLanguage(lang: string): string {
  if (!lang) return "Code";
  const map: Record<string, string> = {
    ts: "TypeScript",
    typescript: "TypeScript",
    js: "JavaScript",
    javascript: "JavaScript",
    py: "Python",
    python: "Python",
    sh: "Bash",
    bash: "Bash",
    html: "HTML",
    css: "CSS",
    json: "JSON",
    sql: "SQL",
    cpp: "C++",
    csharp: "C#",
    go: "Go",
    rust: "Rust",
  };
  return map[lang.toLowerCase()] || lang.charAt(0).toUpperCase() + lang.slice(1);
}

// ChatGPT Exact Code Block Layout
function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-4 rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0d0d0d] font-mono text-[13px] shadow-sm">
      {/* Code Header with </> and Copy button */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#171717] border-b border-white/[0.06] text-neutral-300">
        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-xs font-medium text-neutral-300">
            {formatLanguage(language)}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          title="Copy code"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-white" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Code Body */}
      <div className="p-4 overflow-x-auto text-neutral-200 leading-relaxed font-mono">
        <pre className="!bg-transparent !p-0 !m-0">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

export default function ClerXChat() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();

  // State
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarVisible, setDesktopSidebarVisible] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editTitleText, setEditTitleText] = useState("");
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [systemPersona, setSystemPersona] = useState(
    "You are ClerX AI, a helpful, intelligent, versatile, and precise AI assistant. Provide thoughtful, clear, accurate, and actionable answers."
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, isStreaming]);

  // Handle scroll detection for scroll-down button
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 150;
    setShowScrollDown(isUp);
  };

  // Adjust textarea height dynamically
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  // Reset textarea height
  const resetTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  // Load Conversations
  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);

        const urlId = searchParams.get("id");
        if (urlId && data.conversations.some((c: any) => c.id === urlId)) {
          selectConversation(urlId, false);
        }
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  }, [searchParams]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Handle URL query prompt if passed
  useEffect(() => {
    const promptQuery = searchParams.get("prompt");
    if (promptQuery) {
      setInput(promptQuery);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [searchParams]);

  // Select a Conversation
  const selectConversation = async (id: string, closeMobileSidebar = true) => {
    setActiveConvId(id);
    if (closeMobileSidebar) {
      setSidebarOpen(false);
    }

    try {
      const res = await fetch(`/api/conversations/${id}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  // Start New Chat
  const handleNewChat = () => {
    handleStopGeneration();
    setActiveConvId(null);
    setMessages([]);
    setInput("");
    resetTextareaHeight();
    setSidebarOpen(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Stop Generation Handler
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }
    setLoading(false);
    setIsStreaming(false);
    setMessages((prev) =>
      prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m))
    );
  };

  // Send Message & Stream Response
  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent || loading || isStreaming) return;

    setInput("");
    resetTextareaHeight();

    const tempUserMsg: MessageItem = {
      role: "user",
      content: messageContent,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortController.signal,
        body: JSON.stringify({
          conversationId: activeConvId,
          message: messageContent,
          systemPrompt: systemPersona,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate response");
      }

      if (data.conversationId && data.conversationId !== activeConvId) {
        setActiveConvId(data.conversationId);
      }

      const fullContent = data.message.content;
      setLoading(false);
      setIsStreaming(true);

      const streamingMsgId = data.message.id || `msg-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: streamingMsgId,
          role: "assistant",
          content: "",
          isStreaming: true,
          createdAt: data.message.createdAt || new Date().toISOString(),
        },
      ]);

      // Ultra-smooth stream playback
      let charIndex = 0;
      const chunkSize = Math.max(3, Math.floor(fullContent.length / 70));
      
      streamIntervalRef.current = setInterval(() => {
        charIndex += chunkSize;
        if (charIndex >= fullContent.length) {
          charIndex = fullContent.length;
          if (streamIntervalRef.current) {
            clearInterval(streamIntervalRef.current);
            streamIntervalRef.current = null;
          }
          setIsStreaming(false);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === streamingMsgId
                ? { ...m, content: fullContent, isStreaming: false }
                : m
            )
          );
        } else {
          const currentSlice = fullContent.substring(0, charIndex);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === streamingMsgId ? { ...m, content: currentSlice } : m
            )
          );
        }
      }, 16);

      if (user) {
        loadConversations();
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("Chat generation stopped by user");
        return;
      }
      setLoading(false);
      setIsStreaming(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ **Notice**: ${err.message || "Failed to process response. Please try again."}`,
        },
      ]);
    } finally {
      abortControllerRef.current = null;
    }
  };

  // Delete Conversation
  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/conversations/${id}`, { method: "DELETE" });
      if (res.ok) {
        const remaining = conversations.filter((c) => c.id !== id);
        setConversations(remaining);
        if (activeConvId === id) {
          if (remaining.length > 0) {
            selectConversation(remaining[0].id);
          } else {
            handleNewChat();
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Pin
  const handleTogglePin = async (conv: ConversationItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/conversations/${conv.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: !conv.pinned }),
      });
      if (res.ok) {
        loadConversations();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save Rename
  const handleSaveRename = async (id: string) => {
    if (!editTitleText.trim()) {
      setEditingConvId(null);
      return;
    }
    try {
      const res = await fetch(`/api/conversations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitleText.trim() }),
      });
      if (res.ok) {
        loadConversations();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEditingConvId(null);
    }
  };

  // Copy Message Text
  const handleCopyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Regenerate Response
  const handleRegenerate = () => {
    if (messages.length === 0 || loading || isStreaming) return;
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.content);
    }
  };

  // Export Conversation as Markdown
  const handleExportMarkdown = () => {
    if (messages.length === 0) return;
    const active = conversations.find((c) => c.id === activeConvId);
    let md = `# ${active?.title || "ClerX AI Chat"}\n*Exported on ${new Date().toLocaleString()}*\n\n---\n\n`;

    messages.forEach((m) => {
      md += `### ${m.role === "user" ? "👤 You" : "🤖 ClerX"}\n\n${m.content}\n\n---\n\n`;
    });

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(active?.title || "clerx-chat").toLowerCase().replace(/[^a-z0-9]/g, "-")}.md`;
    a.click();
  };

  // Keyboard shortcut listener (Cmd/Ctrl + K for new chat)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter conversations by search term
  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pinnedConversations = filteredConversations.filter((c) => c.pinned);
  const recentConversations = filteredConversations.filter((c) => !c.pinned);

  return (
    <div className="flex h-[100dvh] w-full bg-[#212121] text-[#ececec] overflow-hidden select-text font-sans">
      
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* LEFT SIDEBAR (ChatGPT Layout) */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-[260px] bg-[#171717] border-r border-white/[0.06] flex flex-col justify-between transition-all duration-200 ease-in-out shrink-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${!desktopSidebarVisible ? "md:hidden" : ""}`}
      >
        {/* Top Header: Logo & Controls */}
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between px-1">
            <Link href="/" onClick={() => setSidebarOpen(false)}>
              <ClerXLogo size="sm" withText={false} />
            </Link>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setDesktopSidebarVisible(false)}
                className="hidden md:flex p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Close sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 md:hidden"
                title="Close sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#212121] text-neutral-200 hover:text-white text-sm font-medium transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <SquarePen className="w-4 h-4 text-neutral-400 group-hover:text-white" />
              <span>New chat</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-neutral-800 text-neutral-400 rounded">
              ⌘K
            </kbd>
          </button>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search chats..."
              className="w-full bg-[#212121] border border-white/[0.06] rounded-lg py-1.5 pl-8 pr-3 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-3">
          {/* Pinned Section */}
          {pinnedConversations.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-medium text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Pin className="w-3 h-3 text-neutral-400" />
                <span>Pinned</span>
              </div>
              <div className="space-y-0.5 mt-1">
                {pinnedConversations.map((conv) => (
                  <ConversationRow
                    key={conv.id}
                    conv={conv}
                    isActive={activeConvId === conv.id}
                    editingConvId={editingConvId}
                    editTitleText={editTitleText}
                    setEditTitleText={setEditTitleText}
                    onSelect={() => selectConversation(conv.id)}
                    onTogglePin={(e) => handleTogglePin(conv, e)}
                    onRename={(e) => {
                      e.stopPropagation();
                      setEditingConvId(conv.id);
                      setEditTitleText(conv.title);
                    }}
                    onSaveRename={() => handleSaveRename(conv.id)}
                    onDelete={(e) => handleDeleteConversation(conv.id, e)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Recent Section */}
          <div>
            {pinnedConversations.length > 0 && (
              <div className="px-2 py-1 text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                Recent
              </div>
            )}

            {recentConversations.length === 0 && pinnedConversations.length === 0 ? (
              <div className="text-center py-8 px-4 text-xs text-neutral-500">
                <p>No conversations yet.</p>
              </div>
            ) : (
              <div className="space-y-0.5 mt-1">
                {recentConversations.map((conv) => (
                  <ConversationRow
                    key={conv.id}
                    conv={conv}
                    isActive={activeConvId === conv.id}
                    editingConvId={editingConvId}
                    editTitleText={editTitleText}
                    setEditTitleText={setEditTitleText}
                    onSelect={() => selectConversation(conv.id)}
                    onTogglePin={(e) => handleTogglePin(conv, e)}
                    onRename={(e) => {
                      e.stopPropagation();
                      setEditingConvId(conv.id);
                      setEditTitleText(conv.title);
                    }}
                    onSaveRename={() => handleSaveRename(conv.id)}
                    onDelete={(e) => handleDeleteConversation(conv.id, e)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom User / Auth Card */}
        <div className="p-3 border-t border-white/[0.06] bg-[#171717]">
          {user ? (
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[#212121] transition-colors">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-[#2f2f2f] text-neutral-200 border border-white/10 flex items-center justify-center text-xs font-semibold shrink-0">
                  {user.name ? user.name.substring(0, 2).toUpperCase() : "U"}
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-medium text-neutral-200 truncate">
                    {user.name || "User"}
                  </div>
                  <div className="text-[11px] text-neutral-400 truncate">
                    {user.email}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Settings"
                >
                  <Sliders className="w-4 h-4" />
                </button>
                <button
                  onClick={() => logout()}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 p-1">
              <div>
                <div className="text-xs font-semibold text-neutral-200">
                  Get responses tailored to you
                </div>
                <div className="text-[11px] text-neutral-400 mt-1 leading-snug">
                  Log in to save and sync your chat history across devices.
                </div>
              </div>

              <Link
                href="/login"
                className="block w-full py-2 text-center rounded-full border border-white/20 hover:bg-white/10 text-white font-medium text-xs transition-colors"
              >
                Log in
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CHAT CANVAS */}
      <main className="flex-1 flex flex-col justify-between bg-[#212121] overflow-hidden min-w-0">
        
        {/* Top Header */}
        <header className="h-14 px-3 sm:px-4 border-b border-white/[0.06] flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-2 overflow-hidden">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 md:hidden"
              title="Open sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Desktop Sidebar Toggle Button */}
            {!desktopSidebarVisible && (
              <button
                onClick={() => setDesktopSidebarVisible(true)}
                className="hidden md:flex p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Show sidebar"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            )}

            {/* Model Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-base font-semibold text-neutral-200 hover:bg-white/5 transition-colors"
              >
                <span>ClerX</span>
                <ChevronDown className="w-4 h-4 text-neutral-400" />
              </button>

              {showModelDropdown && (
                <div
                  className="absolute left-0 mt-2 w-56 rounded-xl bg-[#171717] border border-white/10 shadow-2xl p-1.5 z-30 space-y-1 text-xs"
                  onClick={() => setShowModelDropdown(false)}
                >
                  <div className="p-2 rounded-lg bg-[#212121] text-white flex items-center justify-between font-medium">
                    <span>ClerX Workspace</span>
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="px-2 py-1 text-[11px] text-neutral-400">
                    High-speed conversational intelligence
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            {!user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 rounded-full text-xs font-medium text-neutral-200 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="px-3.5 py-1.5 rounded-full bg-white text-black text-xs font-medium hover:bg-neutral-200 transition-colors shadow-sm"
                >
                  Sign up for free
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleNewChat}
                  className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs font-medium"
                  title="New chat"
                >
                  <SquarePen className="w-4 h-4" />
                </button>
                <button
                  onClick={handleExportMarkdown}
                  disabled={messages.length === 0}
                  className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs font-medium disabled:opacity-30 disabled:pointer-events-none"
                  title="Export chat as Markdown"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Message Feed */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 py-6 relative"
        >
          {messages.length === 0 ? (
            /* Empty State */
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto py-12">
              <h2 className="text-3xl sm:text-4xl font-medium text-[#ececec] mb-8 tracking-tight">
                Where should we begin?
              </h2>

              {/* Centered Floating Input Pill */}
              <div className="w-full max-w-2xl space-y-3">
                <div className="relative rounded-[28px] bg-[#2f2f2f] border border-white/[0.08] focus-within:border-white/20 p-2 sm:p-2.5 flex items-center shadow-lg transition-colors">
                  <button
                    onClick={() => textareaRef.current?.focus()}
                    className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 mr-1"
                    title="Add attachment"
                  >
                    <Plus className="w-5 h-5" />
                  </button>

                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    rows={1}
                    placeholder="Ask anything"
                    className="w-full bg-transparent text-[15px] sm:text-base text-neutral-100 placeholder-neutral-400 focus:outline-none resize-none px-2 py-1 max-h-48 leading-relaxed"
                    style={{ fontSize: "16px" }}
                  />

                  <button
                    onClick={() => (loading || isStreaming ? handleStopGeneration() : handleSendMessage())}
                    disabled={!loading && !isStreaming && !input.trim()}
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ml-1 ${
                      loading || isStreaming
                        ? "bg-white text-black hover:bg-neutral-200 active:scale-95 shadow-sm cursor-pointer"
                        : input.trim()
                        ? "bg-white text-black hover:bg-neutral-200 active:scale-95 shadow-sm"
                        : "bg-neutral-600/50 text-neutral-400 cursor-not-allowed"
                    }`}
                    title={loading || isStreaming ? "Stop generating" : "Send message"}
                  >
                    {loading || isStreaming ? (
                      <Square className="w-3.5 h-3.5 fill-black text-black" />
                    ) : (
                      <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Active Conversation Message List */
            <div className="max-w-[48rem] mx-auto space-y-6 pt-2 pb-12">
              {messages.map((m, idx) => {
                const isUser = m.role === "user";
                return (
                  <div key={idx} className="group space-y-2">
                    {isUser ? (
                      /* User Message Bubble */
                      <div className="flex flex-col items-end">
                        <div className="bg-[#2f2f2f] text-[#ececec] px-5 py-3 rounded-[24px] max-w-[85%] sm:max-w-[75%] text-[15px] leading-relaxed">
                          {m.content}
                        </div>
                        <button
                          onClick={() => handleCopyMessage(m.content, `user-${idx}`)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-white transition-opacity mt-1 mr-1"
                          title="Copy message"
                        >
                          {copiedId === `user-${idx}` ? (
                            <Check className="w-3.5 h-3.5 text-white" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    ) : (
                      /* Assistant Message Stream */
                      <div className="text-[15px] text-[#ececec] leading-relaxed overflow-hidden">
                        <div className="prose-chat">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code({ node, inline, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || "");
                                const codeText = String(children).replace(/\n$/, "");
                                if (!inline && match) {
                                  return (
                                    <CodeBlock language={match[1]} code={codeText} />
                                  );
                                }
                                return (
                                  <code
                                    className="bg-neutral-800 text-neutral-200 px-1.5 py-0.5 rounded text-[13px] font-mono"
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                );
                              },
                            }}
                          >
                            {m.content}
                          </ReactMarkdown>

                          {/* Minimalist Trailing Cursor */}
                          {m.isStreaming && (
                            <span className="inline-block w-2 h-4 bg-neutral-200 rounded-[1px] ml-1 animate-pulse align-middle" />
                          )}
                        </div>

                        {/* Assistant Action Bar */}
                        {!m.isStreaming && m.content && (
                          <div className="mt-3 flex items-center gap-1.5 text-neutral-400 text-xs">
                            <button
                              onClick={() => handleCopyMessage(m.content, `msg-${idx}`)}
                              className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                              title="Copy response"
                            >
                              {copiedId === `msg-${idx}` ? (
                                <Check className="w-4 h-4 text-white" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>

                            {idx === messages.length - 1 && !loading && !isStreaming && (
                              <button
                                onClick={handleRegenerate}
                                className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                                title="Regenerate answer"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Minimalist ChatGPT 3-Dot Pulse (Clean & Seamless) */}
              {loading && (
                <div className="flex items-center gap-1.5 py-3 text-neutral-400 animate-in fade-in duration-200">
                  <span className="w-2 h-2 rounded-full bg-neutral-400 animate-pulse" />
                  <span className="w-2 h-2 rounded-full bg-neutral-400 animate-pulse [animation-delay:150ms]" />
                  <span className="w-2 h-2 rounded-full bg-neutral-400 animate-pulse [animation-delay:300ms]" />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Floating Scroll-Down Arrow */}
          {showScrollDown && (
            <button
              onClick={() => scrollToBottom(true)}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#2f2f2f] border border-white/10 shadow-xl flex items-center justify-center text-neutral-300 hover:text-white hover:bg-[#383838] transition-all z-30"
              title="Scroll to bottom"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Docked Floating Input Area */}
        {messages.length > 0 && (
          <div className="p-3 sm:p-4 bg-gradient-to-t from-[#212121] via-[#212121] to-transparent shrink-0">
            <div className="max-w-[48rem] mx-auto space-y-2">
              <div className="relative rounded-[28px] bg-[#2f2f2f] border border-white/[0.08] focus-within:border-white/20 p-2 sm:p-2.5 flex items-center shadow-lg transition-colors">
                <button
                  onClick={() => textareaRef.current?.focus()}
                  className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 mr-1"
                  title="Add attachment"
                >
                  <Plus className="w-5 h-5" />
                </button>

                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  rows={1}
                  placeholder="Ask anything"
                  className="w-full bg-transparent text-[15px] sm:text-base text-neutral-100 placeholder-neutral-400 focus:outline-none resize-none px-2 py-1 max-h-48 leading-relaxed"
                  style={{ fontSize: "16px" }}
                />

                <button
                  onClick={() => (loading || isStreaming ? handleStopGeneration() : handleSendMessage())}
                  disabled={!loading && !isStreaming && !input.trim()}
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ml-1 ${
                    loading || isStreaming
                      ? "bg-white text-black hover:bg-neutral-200 active:scale-95 shadow-sm cursor-pointer"
                      : input.trim()
                      ? "bg-white text-black hover:bg-neutral-200 active:scale-95 shadow-sm"
                      : "bg-neutral-600/50 text-neutral-400 cursor-not-allowed"
                  }`}
                  title={loading || isStreaming ? "Stop generating" : "Send message"}
                >
                  {loading || isStreaming ? (
                    <Square className="w-3.5 h-3.5 fill-black text-black" />
                  ) : (
                    <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                  )}
                </button>
              </div>

              <p className="text-center text-[11px] text-neutral-500">
                ClerX can make mistakes. Check important info.
              </p>
            </div>
          </div>
        )}

      </main>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171717] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-neutral-400" />
                <span>Settings</span>
              </h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                  Custom Instructions
                </label>
                <textarea
                  value={systemPersona}
                  onChange={(e) => setSystemPersona(e.target.value)}
                  rows={3}
                  className="w-full bg-[#212121] border border-white/10 rounded-xl p-3 text-xs text-neutral-200 focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#212121] border border-white/5 text-xs space-y-1.5">
                <div className="text-neutral-300 font-medium">Workspace Status</div>
                <div className="text-neutral-400 flex justify-between">
                  <span>Chat Sessions</span>
                  <span className="text-neutral-200">{conversations.length} saved</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 rounded-xl bg-[#2f2f2f] text-neutral-300 text-xs font-medium hover:bg-[#383838] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 rounded-xl bg-white text-black text-xs font-medium hover:bg-neutral-200 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Conversation Row Component
function ConversationRow({
  conv,
  isActive,
  editingConvId,
  editTitleText,
  setEditTitleText,
  onSelect,
  onTogglePin,
  onRename,
  onSaveRename,
  onDelete,
}: {
  conv: ConversationItem;
  isActive: boolean;
  editingConvId: string | null;
  editTitleText: string;
  setEditTitleText: (val: string) => void;
  onSelect: () => void;
  onTogglePin: (e: React.MouseEvent) => void;
  onRename: (e: React.MouseEvent) => void;
  onSaveRename: () => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`group relative px-2.5 py-2 rounded-lg cursor-pointer text-xs transition-colors flex items-center justify-between ${
        isActive
          ? "bg-[#212121] text-white font-medium"
          : "text-neutral-400 hover:text-neutral-200 hover:bg-[#212121]/60"
      }`}
    >
      <div className="flex items-center gap-2 overflow-hidden flex-1 mr-2">
        {conv.pinned && <Pin className="w-3 h-3 text-neutral-400 shrink-0" />}
        {editingConvId === conv.id ? (
          <input
            type="text"
            value={editTitleText}
            onChange={(e) => setEditTitleText(e.target.value)}
            onBlur={onSaveRename}
            onKeyDown={(e) => e.key === "Enter" && onSaveRename()}
            autoFocus
            className="bg-[#2f2f2f] text-white px-1.5 py-0.5 rounded border border-white/20 text-xs w-full focus:outline-none"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="truncate">{conv.title}</span>
        )}
      </div>

      <div className="hidden group-hover:flex items-center gap-1 shrink-0">
        <button
          onClick={onTogglePin}
          title={conv.pinned ? "Unpin" : "Pin"}
          className="p-1 hover:text-white transition-colors"
        >
          <Pin className="w-3 h-3" />
        </button>
        <button
          onClick={onRename}
          title="Rename"
          className="p-1 hover:text-white transition-colors"
        >
          <Edit2 className="w-3 h-3" />
        </button>
        <button
          onClick={onDelete}
          title="Delete"
          className="p-1 hover:text-white transition-colors"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
