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
  PenLine,
  Compass,
  Sparkles,
  Brain,
  ChevronRight,
  Mic,
  MicOff,
  ImageIcon,
  FileText,
  ZoomIn,
  Paperclip,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export interface MessageAttachment {
  type: string;
  url: string;
  name?: string;
  size?: number;
  mimeType?: string;
  pageCount?: number;
  extractedText?: string;
}

interface MessageItem {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  attachments?: MessageAttachment[];
  thought?: string;
  thoughtDurationSec?: number;
  isThinking?: boolean;
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

// Collapsible Thought / Thinking Process Component (ChatGPT / DeepSeek Style)
function ThoughtAccordion({
  thought,
  thoughtDurationSec,
  isThinking,
}: {
  thought: string;
  thoughtDurationSec?: number;
  isThinking?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (!thought && !isThinking) return null;

  return (
    <div className="mb-3.5 rounded-2xl border border-white/[0.08] bg-[#181818]/90 backdrop-blur-sm overflow-hidden text-xs transition-colors shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04] transition-colors group cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          {isThinking ? (
            <div className="flex items-center gap-2 text-sky-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
              </span>
              <span className="font-medium text-neutral-200">Thinking...</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-neutral-400 group-hover:text-neutral-300">
              <Sparkles className="w-3.5 h-3.5 text-sky-400/80 group-hover:text-sky-300" />
              <span className="font-medium">
                {thoughtDurationSec && thoughtDurationSec > 0
                  ? `Thought for ${thoughtDurationSec}s`
                  : "Thought Process"}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-neutral-500 group-hover:text-neutral-400">
          <span className="text-[11px] font-normal">{isOpen ? "Hide" : "Show"}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="px-4 pb-3.5 pt-1.5 border-t border-white/[0.04] text-[13px] text-neutral-400 font-sans leading-relaxed break-words whitespace-pre-wrap select-text">
          <div className="pl-2.5 border-l-2 border-white/10 text-neutral-300">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {thought || "Thinking about how to answer..."}
            </ReactMarkdown>
            {isThinking && (
              <span className="inline-block w-1.5 h-3.5 bg-sky-400/80 rounded-[1px] ml-1 animate-pulse align-middle" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClerXChat({
  initialConversationId,
}: {
  initialConversationId?: string;
} = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();

  // State
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(
    initialConversationId || null
  );
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
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<"upload" | "voice" | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef<boolean>(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const voiceTranscriptRef = useRef("");
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger file upload with auth check
  const triggerFileUpload = () => {
    if (!user) {
      setShowAuthModal("upload");
      return;
    }
    fileInputRef.current?.click();
  };

  // File Upload Handlers (Photos, PDF Documents, Scans for Nemotron 3 Omni)
  const handleFileSelect = async (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;

    if (!user) {
      setShowAuthModal("upload");
      return;
    }

    const fileList = Array.from(files);
    setIsUploading(true);

    for (const file of fileList) {
      if (file.size > 30 * 1024 * 1024) {
        alert(`File "${file.name}" is too large. Maximum supported size is 30MB.`);
        continue;
      }

      // Check if file is PDF
      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        try {
          const { processPdfFile } = await import("@/lib/pdfHelper");
          const processed = await processPdfFile(file, 8);

          if (processed.pages.length > 0) {
            processed.pages.forEach((page) => {
              setAttachments((prev) => [
                ...prev,
                {
                  type: "image",
                  url: page.imageUrl,
                  name: `${file.name} (Page ${page.pageNumber}/${processed.pageCount})`,
                  size: file.size,
                  mimeType: "image/jpeg",
                  pageCount: processed.pageCount,
                  extractedText: page.pageNumber === 1 ? processed.extractedText : undefined,
                },
              ]);
            });
          }
        } catch (pdfErr) {
          console.error("PDF processing error:", pdfErr);
          // Fallback to basic file reader
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            if (result) {
              setAttachments((prev) => [
                ...prev,
                {
                  type: "file",
                  url: result,
                  name: file.name,
                  size: file.size,
                  mimeType: file.type || "application/pdf",
                },
              ]);
            }
          };
          reader.readAsDataURL(file);
        }
        continue;
      }

      // Check if text/code/data file (.txt, .md, .csv, .json, etc.)
      if (
        file.type.startsWith("text/") ||
        file.name.match(/\.(txt|md|csv|json|py|js|ts|tsx|jsx|html|css|yaml|yml|log|sql)$/i)
      ) {
        try {
          const textContent = await file.text();
          setAttachments((prev) => [
            ...prev,
            {
              type: "file",
              url: `data:text/plain;charset=utf-8,${encodeURIComponent(textContent)}`,
              name: file.name,
              size: file.size,
              mimeType: file.type || "text/plain",
              extractedText: textContent,
            },
          ]);
        } catch (textErr) {
          console.error("Text file read error:", textErr);
        }
        continue;
      }

      // Image / Photo files
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          const isImg = file.type.startsWith("image/");
          const newAtt: MessageAttachment = {
            type: isImg ? "image" : "file",
            url: result,
            name: file.name,
            size: file.size,
            mimeType: file.type || "image/jpeg",
          };
          setAttachments((prev) => [...prev, newAtt]);
        }
      };
      reader.readAsDataURL(file);
    }

    setIsUploading(false);
  };

  const removeAttachment = (indexToRemove: number) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Clipboard Paste handler (for pasting screenshots/photos directly)
  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
      const files = Array.from(e.clipboardData.files);
      const imageFiles = files.filter(
        (f) =>
          f.type.startsWith("image/") ||
          f.name.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg|pdf)$/i)
      );
      if (imageFiles.length > 0) {
        e.preventDefault();
        if (!user) {
          setShowAuthModal("upload");
          return;
        }
        handleFileSelect(imageFiles);
      }
    }
  };

  // Auto-scroll to bottom with smart sticky scroll detection (prevents shaking when user scrolls up)
  const scrollToBottom = useCallback((force = false, smooth = false) => {
    if (!scrollContainerRef.current) return;
    if (!force && !isAtBottomRef.current) return;

    const container = scrollContainerRef.current;
    if (smooth) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    } else {
      // Direct scrollTop prevents animation queue conflicts and screen shaking during rapid token streaming
      container.scrollTop = container.scrollHeight;
    }
  }, []);

  useEffect(() => {
    // Only auto-scroll if user is currently at the bottom
    if (isAtBottomRef.current) {
      scrollToBottom(false, false);
    }
  }, [messages, loading, isStreaming, scrollToBottom]);

  // Clean up recording on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Start recording voice note (Real-time Speech Recognition)
  const startVoiceRecording = () => {
    if (!user) {
      setShowAuthModal("voice");
      return;
    }

    const SpeechRecognition =
      typeof window !== "undefined"
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (!SpeechRecognition) {
      alert("Voice speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = typeof navigator !== "undefined" ? navigator.language || "en-US" : "en-US";

      voiceTranscriptRef.current = "";
      setLiveTranscript("");

      recognition.onstart = () => {
        setIsRecording(true);
        setRecordingDuration(0);
      };

      recognition.onresult = (event: any) => {
        let fullTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0]?.transcript?.trim() || "";
          if (!text) continue;

          if (result.isFinal) {
            fullTranscript += (fullTranscript ? " " : "") + text;
          } else if (i === event.results.length - 1) {
            fullTranscript += (fullTranscript ? " " : "") + text;
          }
        }

        const trimmed = fullTranscript.trim();
        voiceTranscriptRef.current = trimmed;
        setLiveTranscript(trimmed);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition notice:", event.error);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          alert("Microphone permission was denied. Please allow microphone access in your browser.");
          cancelVoiceRecording();
        }
      };

      recognition.onend = () => {
        // Recognition completed
      };

      speechRecognitionRef.current = recognition;
      recognition.start();

      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("Failed to start voice recognition:", err);
      setIsRecording(false);
    }
  };

  // Discard & cancel voice recording
  const cancelVoiceRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {
        // ignore
      }
      speechRecognitionRef.current = null;
    }
    voiceTranscriptRef.current = "";
    setLiveTranscript("");
    setIsRecording(false);
    setRecordingDuration(0);
  };

  // Finish recording and send transcribed prompt to AI
  const finishRecordingAndSend = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {
        // ignore
      }
      speechRecognitionRef.current = null;
    }

    const transcribedPrompt = voiceTranscriptRef.current.trim() || liveTranscript.trim();
    voiceTranscriptRef.current = "";
    setLiveTranscript("");
    setIsRecording(false);
    setRecordingDuration(0);

    if (transcribedPrompt) {
      handleSendMessage(transcribedPrompt);
    }
  };

  // Handle scroll detection for smart sticky scroll & scroll-down button
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // User is considered at bottom if within 60px of the bottom
    const atBottom = distanceFromBottom <= 60;
    isAtBottomRef.current = atBottom;
    setShowScrollDown(distanceFromBottom > 100);
  }, []);

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

  // Load initial conversation if passed via /c/[id]
  useEffect(() => {
    if (initialConversationId) {
      selectConversation(initialConversationId, false, false);
    }
  }, [initialConversationId]);

  // Load Conversations list
  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);

        const urlId = searchParams.get("id");
        if (urlId && data.conversations.some((c: any) => c.id === urlId)) {
          selectConversation(urlId, false, true);
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

  // Select a Conversation & Update URL to /c/[id]
  const selectConversation = async (id: string, closeMobileSidebar = true, updateUrl = true) => {
    setActiveConvId(id);
    if (closeMobileSidebar) {
      setSidebarOpen(false);
    }
    if (updateUrl && typeof window !== "undefined") {
      window.history.pushState(null, "", `/c/${id}`);
    }

    try {
      const res = await fetch(`/api/conversations/${id}/messages`);
      if (res.ok) {
        const data = await res.json();
        const loadedMessages = (data.messages || []).map((m: MessageItem) => {
          let loadedContent = m.content;
          let loadedThought = m.thought || "";
          if (loadedContent && loadedContent.includes("<think>")) {
            const thinkRegex = /<think>([\s\S]*?)<\/think>/i;
            const match = loadedContent.match(thinkRegex);
            if (match) {
              loadedThought = loadedThought || match[1].trim();
              loadedContent = loadedContent.replace(thinkRegex, "").trim();
            }
          }
          return {
            ...m,
            content: loadedContent,
            thought: loadedThought,
            attachments: m.attachments || [],
          };
        });
        setMessages(loadedMessages);
        isAtBottomRef.current = true;
        setShowScrollDown(false);
        setTimeout(() => scrollToBottom(true, false), 50);
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  // Start New Chat & Reset URL to /
  const handleNewChat = () => {
    handleStopGeneration();
    setActiveConvId(null);
    setMessages([]);
    setInput("");
    setAttachments([]);
    resetTextareaHeight();
    setSidebarOpen(false);
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/");
    }
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
      prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false, isThinking: false } : m))
    );
  };

  // Send Message & Real Token-by-Token SSE Stream
  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    const currentAttachments = [...attachments];

    if ((!messageContent && currentAttachments.length === 0) || loading || isStreaming) {
      return;
    }

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {
        // ignore
      }
      speechRecognitionRef.current = null;
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecording(false);
    setRecordingDuration(0);

    setInput("");
    setAttachments([]);
    resetTextareaHeight();

    const tempUserMsg: MessageItem = {
      role: "user",
      content: messageContent,
      attachments: currentAttachments,
      createdAt: new Date().toISOString(),
    };

    const streamingMsgId = `msg-${Date.now()}`;

    if (!user && !activeConvId && typeof window !== "undefined") {
      const guestId = `c-${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 6)}`;
      setActiveConvId(guestId);
      window.history.pushState(null, "", `/c/${guestId}`);
    }

    setMessages((prev) => [
      ...prev,
      tempUserMsg,
      {
        id: streamingMsgId,
        role: "assistant",
        content: "",
        thought: "",
        isThinking: true,
        isStreaming: true,
        createdAt: new Date().toISOString(),
      },
    ]);

    isAtBottomRef.current = true;
    setShowScrollDown(false);
    setTimeout(() => scrollToBottom(true, true), 30);

    setLoading(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    let payloadMessage = messageContent;
    const textAttachments = currentAttachments.filter((a) => a.extractedText);
    if (textAttachments.length > 0) {
      const extractedSnippets = textAttachments
        .map((a) => `[Extracted Document Text - ${a.name}]\n${a.extractedText}`)
        .join("\n\n");
      payloadMessage = payloadMessage
        ? `${payloadMessage}\n\n${extractedSnippets}`
        : extractedSnippets;
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortController.signal,
        body: JSON.stringify({
          conversationId: activeConvId,
          message: payloadMessage,
          attachments: currentAttachments,
          systemPrompt: systemPersona,
          history: messages.map((m) => ({
            role: m.role,
            content: m.content,
            attachments: m.attachments,
          })),
          stream: true,
        }),
      });

      if (!res.ok) {
        let errMsg = "Failed to generate response";
        try {
          const errData = await res.json();
          errMsg = errData.error || errMsg;
        } catch {
          // ignore
        }
        throw new Error(errMsg);
      }

      setLoading(false);
      setIsStreaming(true);

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Stream response body unavailable");

      const decoder = new TextDecoder();
      let buffer = "";
      let accumulatedContent = "";
      let accumulatedThought = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const eventBlock of events) {
          const lines = eventBlock.split("\n");
          let eventType = "message";
          let eventData = "";

          for (const line of lines) {
            if (line.startsWith("event:")) {
              eventType = line.replace(/^event:\s*/, "").trim();
            } else if (line.startsWith("data:")) {
              eventData = line.replace(/^data:\s*/, "").trim();
            }
          }

          if (!eventData) continue;

          try {
            const parsed = JSON.parse(eventData);

            if (eventType === "thought") {
              const token = parsed.token || "";
              accumulatedThought += token;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === streamingMsgId
                    ? {
                        ...m,
                        thought: accumulatedThought,
                        isThinking: true,
                        isStreaming: true,
                      }
                    : m
                )
              );
            } else if (eventType === "content") {
              const token = parsed.token || "";
              accumulatedContent += token;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === streamingMsgId
                    ? {
                        ...m,
                        content: accumulatedContent,
                        isThinking: false,
                        isStreaming: true,
                      }
                    : m
                )
              );
            } else if (eventType === "meta") {
              if (parsed.conversationId && parsed.conversationId !== activeConvId) {
                setActiveConvId(parsed.conversationId);
                if (typeof window !== "undefined") {
                  window.history.pushState(null, "", `/c/${parsed.conversationId}`);
                }
              }
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === streamingMsgId
                    ? {
                        ...m,
                        id: parsed.messageId || m.id,
                        thoughtDurationSec: parsed.thoughtDurationSec || m.thoughtDurationSec,
                        tokens: parsed.tokens,
                        latencyMs: parsed.latencyMs,
                      }
                    : m
                )
              );
            } else if (eventType === "error") {
              throw new Error(parsed.error || "Streaming error occurred");
            } else if (eventType === "done") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === streamingMsgId
                    ? {
                        ...m,
                        content: accumulatedContent,
                        thought: accumulatedThought,
                        isThinking: false,
                        isStreaming: false,
                      }
                    : m
                )
              );
            }
          } catch {
            // ignore non-json chunk
          }
        }
      }

      setIsStreaming(false);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === streamingMsgId
            ? {
                ...m,
                content: accumulatedContent,
                thought: accumulatedThought,
                isThinking: false,
                isStreaming: false,
              }
            : m
        )
      );

      if (user) {
        loadConversations();
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("Chat generation stopped by user");
        setIsStreaming(false);
        setLoading(false);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === streamingMsgId
              ? { ...m, isStreaming: false, isThinking: false }
              : m
          )
        );
        return;
      }
      setLoading(false);
      setIsStreaming(false);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === streamingMsgId
            ? {
                ...m,
                content: `⚠️ **Notice**: ${err.message || "Failed to process response. Please try again."}`,
                isStreaming: false,
                isThinking: false,
              }
            : m
        )
      );
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
    <div className="flex h-[100dvh] w-full bg-[#000000] text-[#ececec] overflow-hidden select-text font-sans">
      
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* LEFT SIDEBAR (ChatGPT Deep Black Layout) */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-[260px] bg-[#000000] border-r border-white/[0.08] flex flex-col justify-between transition-all duration-200 ease-in-out shrink-0 ${
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
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#1c1c1c] text-neutral-200 hover:text-white text-sm font-medium transition-colors group cursor-pointer border border-transparent hover:border-white/[0.06]"
          >
            <div className="flex items-center gap-2.5">
              <SquarePen className="w-4 h-4 text-neutral-400 group-hover:text-white" />
              <span>New chat</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-[#1c1c1c] text-neutral-400 rounded border border-white/[0.08]">
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
              className="w-full bg-[#161616] border border-white/[0.08] rounded-xl py-2 pl-8 pr-3 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-white/20 transition-colors"
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
        <div className="p-3 border-t border-white/[0.08] bg-[#000000]">
          {user ? (
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-[#1c1c1c] transition-colors">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-[#212121] text-neutral-200 border border-white/10 flex items-center justify-center text-xs font-semibold shrink-0">
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
      <main className="flex-1 flex flex-col justify-between bg-[#000000] overflow-hidden min-w-0">
        
        {/* Top Header */}
        <header className="h-14 px-3 sm:px-4 border-b border-white/[0.08] bg-[#000000] flex items-center justify-between shrink-0 z-20">
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
          style={{ overflowAnchor: "none" }}
          className={`flex-1 ${messages.length === 0 ? "overflow-hidden flex flex-col justify-center" : "overflow-y-auto"} px-4 py-4 relative bg-[#000000]`}
        >
          {messages.length === 0 ? (
            /* Clean Minimalist ChatGPT Empty State */
            <div className="w-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto px-2 sm:px-3 py-2 relative">
              {/* Greeting */}
              <div className="relative mb-6 text-center">
                <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                  What can I help with today?
                </h1>
              </div>

              {/* Quick Starter Suggestion Cards (2x2 Grid on ALL screens including Mobile, No Arrows) */}
              <div className="grid grid-cols-2 gap-2 sm:gap-2.5 w-full max-w-2xl mb-6 sm:mb-8 relative z-10">
                {[
                  {
                    icon: <Code2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-300 shrink-0" />,
                    title: "Write & debug code",
                    subtitle: "Fix bugs or build components",
                    prompt: "Write a clean, responsive React component in TypeScript with Tailwind CSS.",
                  },
                  {
                    icon: <PenLine className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-300 shrink-0" />,
                    title: "Draft & refine writing",
                    subtitle: "Documentation or essays",
                    prompt: "Help me write a concise, professional project proposal overview.",
                  },
                  {
                    icon: <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-300 shrink-0" />,
                    title: "Analyze documents",
                    subtitle: "Extract takeaways & tables",
                    prompt: "Explain how to structure and analyze complex research papers effectively.",
                  },
                  {
                    icon: <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-300 shrink-0" />,
                    title: "Brainstorm ideas",
                    subtitle: "Explore workflows & designs",
                    prompt: "Brainstorm 5 scalable system architecture designs for modern applications.",
                  },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(item.prompt)}
                    className="p-2.5 sm:p-3.5 rounded-2xl bg-[#141414] hover:bg-[#1c1c1c] border border-white/[0.08] hover:border-white/15 text-left transition-all group flex items-start gap-2.5 sm:gap-3 cursor-pointer shadow-sm active:scale-[0.99]"
                  >
                    <div className="p-1.5 sm:p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] shrink-0 mt-0.5 group-hover:bg-white/[0.08] transition-colors">
                      {item.icon}
                    </div>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="text-[11px] sm:text-xs font-semibold text-neutral-200 group-hover:text-white transition-colors truncate">
                        {item.title}
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-neutral-400 leading-snug truncate">
                        {item.subtitle}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Centered Floating Input Pill (Below Suggestions) */}
              <div className="w-full max-w-2xl relative z-10">
                <div className="relative rounded-[26px] bg-[#1a1a1a] border border-white/[0.1] focus-within:border-white/25 p-2 sm:p-2.5 flex flex-col shadow-2xl transition-all">
                  {/* Attached Photos / Documents Previews */}
                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 px-2 pt-1 pb-2 mb-1 border-b border-white/[0.06]">
                      {attachments.map((att, idx) => (
                        <div
                          key={idx}
                          className="relative group flex items-center gap-2 bg-[#141414] hover:bg-[#1a1a1a] border border-white/10 rounded-xl p-1.5 pr-2.5 transition-all shadow-sm"
                        >
                          {att.type === "image" ? (
                            <img
                              src={att.url}
                              alt={att.name || "Photo attachment"}
                              className="w-9 h-9 rounded-lg object-cover border border-white/10"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-neutral-300">
                              <FileText className="w-4 h-4" />
                            </div>
                          )}
                          <div className="flex flex-col max-w-[130px] sm:max-w-[170px] text-left">
                            <span className="text-xs text-neutral-200 font-medium truncate">
                              {att.name || "Attachment"}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-normal">
                              {att.pageCount ? `${att.pageCount} pages` : "Attached file"}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(idx)}
                            className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                            title="Remove attachment"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center w-full">
                    {isRecording ? (
                      /* Live Voice Recording State */
                      <div className="flex-1 flex items-center justify-between gap-3 px-2 py-1 min-h-[38px] overflow-hidden">
                        {/* Discard button */}
                        <button
                          type="button"
                          onClick={cancelVoiceRecording}
                          className="p-1.5 rounded-full text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                          title="Discard recording"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        {/* Live duration timer & pulsing red dot */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                          </span>
                          <span className="text-xs font-mono font-medium text-rose-400">
                            {formatTime(recordingDuration)}
                          </span>
                        </div>

                        {/* Live transcript or animated waveform */}
                        <div className="flex-1 flex items-center justify-center min-w-0 px-2">
                          {liveTranscript ? (
                            <span className="text-xs sm:text-sm text-neutral-200 truncate font-medium max-w-[280px]">
                              &ldquo;{liveTranscript}&rdquo;
                            </span>
                          ) : (
                            <div className="flex items-center justify-center gap-[3px] h-5 overflow-hidden">
                              {[40, 75, 100, 60, 85, 45, 90, 65, 95, 50, 80, 35, 70, 90, 55, 40].map((h, i) => (
                                <span
                                  key={i}
                                  className="w-[2.5px] bg-rose-400/80 rounded-full animate-pulse"
                                  style={{
                                    height: `${h}%`,
                                    animationDelay: `${(i % 6) * 120}ms`,
                                    animationDuration: "700ms",
                                  }}
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        <span className="text-[12px] text-neutral-400 hidden sm:inline shrink-0">
                          Tap send to ask AI
                        </span>
                      </div>
                    ) : (
                      /* Normal Input State */
                      <>
                        <button
                          type="button"
                          onClick={triggerFileUpload}
                          className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 mr-1 cursor-pointer"
                          title={user ? "Upload photo or document" : "Sign in to upload photos or documents"}
                        >
                          {isUploading ? (
                            <Loader2 className="w-5 h-5 animate-spin text-white" />
                          ) : (
                            <Plus className="w-5 h-5" />
                          )}
                        </button>

                        <textarea
                          ref={textareaRef}
                          value={input}
                          onChange={handleInputChange}
                          onPaste={handlePaste}
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

                        {/* Voice Input Trigger Button */}
                        <button
                          type="button"
                          onClick={startVoiceRecording}
                          className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 ml-1 cursor-pointer"
                          title="Record voice note (Speak to AI)"
                        >
                          <Mic className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {/* Send / Stop / Submit Action Button */}
                    <button
                      onClick={
                        isRecording
                          ? finishRecordingAndSend
                          : loading || isStreaming
                          ? handleStopGeneration
                          : () => handleSendMessage()
                      }
                      disabled={
                        !isRecording &&
                        !loading &&
                        !isStreaming &&
                        !input.trim() &&
                        attachments.length === 0
                      }
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ml-1 ${
                        isRecording
                          ? "bg-rose-500 text-white hover:bg-rose-600 active:scale-95 shadow-md cursor-pointer"
                          : loading || isStreaming
                          ? "bg-white text-black hover:bg-neutral-200 active:scale-95 shadow-sm cursor-pointer"
                          : input.trim() || attachments.length > 0
                          ? "bg-white text-black hover:bg-neutral-200 active:scale-95 shadow-sm cursor-pointer"
                          : "bg-neutral-600/50 text-neutral-400 cursor-not-allowed"
                      }`}
                      title={
                        isRecording
                          ? "Send recording to AI"
                          : loading || isStreaming
                          ? "Stop generating"
                          : "Send message"
                      }
                    >
                      {isRecording ? (
                        <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                      ) : loading || isStreaming ? (
                        <Square className="w-3.5 h-3.5 fill-black text-black" />
                      ) : (
                        <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </button>
                  </div>
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
                        {/* Attached Photos / Documents */}
                        {m.attachments && m.attachments.length > 0 && (
                          <div className="flex flex-wrap justify-end gap-2 mb-2 max-w-[85%] sm:max-w-[75%]">
                            {m.attachments.map((att, attIdx) => (
                              <div
                                key={attIdx}
                                onClick={() => setPreviewModalUrl(att.url)}
                                className="relative group rounded-2xl overflow-hidden border border-white/10 bg-[#161616] cursor-pointer hover:border-white/20 transition-all shadow-md"
                              >
                                {att.type === "image" ? (
                                  <div className="relative">
                                    <img
                                      src={att.url}
                                      alt={att.name || "Attached photo"}
                                      className="max-h-64 sm:max-h-80 max-w-full rounded-2xl object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                      <span className="p-2 rounded-full bg-black/70 text-white backdrop-blur-sm shadow">
                                        <ZoomIn className="w-4 h-4" />
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="p-3 flex items-center gap-2.5">
                                    <FileText className="w-6 h-6 text-neutral-300" />
                                    <div className="text-left">
                                      <p className="text-xs font-medium text-neutral-200 truncate max-w-[180px]">
                                        {att.name || "Document"}
                                      </p>
                                      <p className="text-[10px] text-neutral-400">Attached file</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {m.content ? (
                          <div className="bg-[#212121] border border-white/[0.06] text-[#ececec] px-5 py-3 rounded-[24px] max-w-[85%] sm:max-w-[75%] text-[15px] leading-relaxed break-words shadow-sm">
                            {m.content}
                          </div>
                        ) : null}

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
                        {/* Thought / Thinking Process Dropdown */}
                        {(m.thought || m.isThinking) && (
                          <ThoughtAccordion
                            thought={m.thought || ""}
                            thoughtDurationSec={m.thoughtDurationSec}
                            isThinking={m.isThinking}
                          />
                        )}

                        {m.content && (
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
                            {m.isStreaming && !m.isThinking && (
                              <span className="inline-block w-2 h-4 bg-neutral-200 rounded-[1px] ml-1 animate-pulse align-middle" />
                            )}
                          </div>
                        )}

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

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Floating Scroll-Down Arrow */}
          {showScrollDown && (
            <button
              onClick={() => {
                isAtBottomRef.current = true;
                setShowScrollDown(false);
                scrollToBottom(true, true);
              }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#212121] border border-white/10 shadow-xl flex items-center justify-center text-neutral-300 hover:text-white hover:bg-[#2a2a2a] transition-all z-30 cursor-pointer"
              title="Scroll to bottom"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Docked Floating Input Area */}
        {messages.length > 0 && (
          <div className="p-3 sm:p-4 bg-gradient-to-t from-[#000000] via-[#000000] to-transparent shrink-0">
            <div className="max-w-[48rem] mx-auto space-y-2">
              <div className="relative rounded-[26px] bg-[#212121] border border-white/[0.1] focus-within:border-white/25 p-2 sm:p-2.5 flex flex-col shadow-2xl transition-all">
                {/* Attached Photos / Documents Previews */}
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 px-2 pt-1 pb-2 mb-1 border-b border-white/[0.06]">
                    {attachments.map((att, idx) => (
                      <div
                        key={idx}
                        className="relative group flex items-center gap-2 bg-[#141414] hover:bg-[#1a1a1a] border border-white/10 rounded-xl p-1.5 pr-2.5 transition-all shadow-sm"
                      >
                        {att.type === "image" ? (
                          <img
                            src={att.url}
                            alt={att.name || "Photo attachment"}
                            className="w-9 h-9 rounded-lg object-cover border border-white/10"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-neutral-300">
                            <FileText className="w-4 h-4" />
                          </div>
                        )}
                        <div className="flex flex-col max-w-[130px] sm:max-w-[170px] text-left">
                          <span className="text-xs text-neutral-200 font-medium truncate">
                            {att.name || "Attachment"}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-normal">
                            {att.pageCount ? `${att.pageCount} pages` : "Attached file"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(idx)}
                          className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                          title="Remove attachment"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center w-full">
                  {isRecording ? (
                    /* Live Voice Recording State */
                    <div className="flex-1 flex items-center justify-between gap-3 px-2 py-1 min-h-[38px] overflow-hidden">
                      {/* Discard button */}
                      <button
                        type="button"
                        onClick={cancelVoiceRecording}
                        className="p-1.5 rounded-full text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                        title="Discard recording"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* Live duration timer & pulsing red dot */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                        </span>
                        <span className="text-xs font-mono font-medium text-rose-400">
                          {formatTime(recordingDuration)}
                        </span>
                      </div>

                      {/* Live transcript or animated waveform */}
                      <div className="flex-1 flex items-center justify-center min-w-0 px-2">
                        {liveTranscript ? (
                          <span className="text-xs sm:text-sm text-neutral-200 truncate font-medium max-w-[280px]">
                            &ldquo;{liveTranscript}&rdquo;
                          </span>
                        ) : (
                          <div className="flex items-center justify-center gap-[3px] h-5 overflow-hidden">
                            {[40, 75, 100, 60, 85, 45, 90, 65, 95, 50, 80, 35, 70, 90, 55, 40].map((h, i) => (
                              <span
                                key={i}
                                className="w-[2.5px] bg-rose-400/80 rounded-full animate-pulse"
                                style={{
                                  height: `${h}%`,
                                  animationDelay: `${(i % 6) * 120}ms`,
                                  animationDuration: "700ms",
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      <span className="text-[12px] text-neutral-400 hidden sm:inline shrink-0">
                        Tap send to ask AI
                      </span>
                    </div>
                  ) : (
                    /* Normal Input State */
                    <>
                      <button
                        type="button"
                        onClick={triggerFileUpload}
                        className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 mr-1 cursor-pointer"
                        title={user ? "Upload photo or document" : "Sign in to upload photos or documents"}
                      >
                        {isUploading ? (
                          <Loader2 className="w-5 h-5 animate-spin text-white" />
                        ) : (
                          <Plus className="w-5 h-5" />
                        )}
                      </button>

                      <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={handleInputChange}
                        onPaste={handlePaste}
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

                      {/* Voice Input Trigger Button */}
                      <button
                        type="button"
                        onClick={startVoiceRecording}
                        className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 ml-1 cursor-pointer"
                        title="Record voice note (Speak to AI)"
                      >
                        <Mic className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {/* Send / Stop / Submit Action Button */}
                  <button
                    onClick={
                      isRecording
                        ? finishRecordingAndSend
                        : loading || isStreaming
                        ? handleStopGeneration
                        : () => handleSendMessage()
                    }
                    disabled={
                      !isRecording &&
                      !loading &&
                      !isStreaming &&
                      !input.trim() &&
                      attachments.length === 0
                    }
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ml-1 ${
                      isRecording
                        ? "bg-rose-500 text-white hover:bg-rose-600 active:scale-95 shadow-md cursor-pointer"
                        : loading || isStreaming
                        ? "bg-white text-black hover:bg-neutral-200 active:scale-95 shadow-sm cursor-pointer"
                        : input.trim() || attachments.length > 0
                        ? "bg-white text-black hover:bg-neutral-200 active:scale-95 shadow-sm cursor-pointer"
                        : "bg-neutral-600/50 text-neutral-400 cursor-not-allowed"
                    }`}
                    title={
                      isRecording
                        ? "Send recording to AI"
                        : loading || isStreaming
                        ? "Stop generating"
                        : "Send message"
                    }
                  >
                    {isRecording ? (
                      <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                    ) : loading || isStreaming ? (
                      <Square className="w-3.5 h-3.5 fill-black text-black" />
                    ) : (
                      <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
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
                  className="w-full bg-[#161616] border border-white/10 rounded-xl p-3 text-xs text-neutral-200 focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#161616] border border-white/5 text-xs space-y-1.5">
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
                className="px-4 py-2 rounded-xl bg-[#1c1c1c] text-neutral-300 text-xs font-medium hover:bg-[#252525] transition-colors"
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
      {/* Hidden File Input for Photos / PDF Documents */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          handleFileSelect(e.target.files);
          if (e.target) e.target.value = "";
        }}
        accept="image/*,application/pdf,text/*"
        multiple
        className="hidden"
      />

      {/* Full-Screen Image Lightbox Preview Modal */}
      {previewModalUrl && (
        <div
          onClick={() => setPreviewModalUrl(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 transition-opacity animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
          >
            <div className="absolute -top-12 right-0 flex items-center gap-2">
              <a
                href={previewModalUrl}
                download="photo-document.png"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 text-xs font-medium"
                title="Download photo"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Save</span>
              </a>
              <button
                onClick={() => setPreviewModalUrl(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={previewModalUrl}
              alt="Photo preview"
              className="max-h-[82vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
            />
          </div>
        </div>
      )}

      {/* Login Required Modal for Voice & File Upload */}
      {showAuthModal && (
        <div
          onClick={() => setShowAuthModal(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#111111] border border-white/10 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 text-center relative overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => setShowAuthModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon */}
            <div className="w-14 h-14 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white shadow-inner">
              {showAuthModal === "upload" ? (
                <FileText className="w-7 h-7" />
              ) : (
                <Mic className="w-7 h-7 text-rose-400" />
              )}
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-white tracking-tight">
                {showAuthModal === "upload"
                  ? "Sign in to upload files & documents"
                  : "Sign in to use voice recording"}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-xs mx-auto">
                {showAuthModal === "upload"
                  ? "Sign in or create a free account to upload photos, PDFs, and documents for instant AI analysis."
                  : "Talk directly to ClerX AI with high-accuracy live speech recognition and voice input."}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => router.push("/login")}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-sm transition-all shadow-md active:scale-[0.98] cursor-pointer"
              >
                Log In
              </button>
              <button
                onClick={() => router.push("/signup")}
                className="w-full py-3 px-4 rounded-xl bg-[#1c1c1c] hover:bg-[#252525] border border-white/10 text-white font-medium text-sm transition-all active:scale-[0.98] cursor-pointer"
              >
                Create a Free Account
              </button>
            </div>

            <p className="text-[11px] text-neutral-500 pt-1">
              Guest text chat remains available to everyone.
            </p>
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
      className={`group relative px-2.5 py-2 rounded-xl cursor-pointer text-xs transition-colors flex items-center justify-between ${
        isActive
          ? "bg-[#1c1c1c] text-white font-medium"
          : "text-neutral-400 hover:text-neutral-200 hover:bg-[#161616]"
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
            className="bg-[#161616] text-white px-1.5 py-0.5 rounded-lg border border-white/20 text-xs w-full focus:outline-none"
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
