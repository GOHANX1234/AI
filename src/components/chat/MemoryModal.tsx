"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Brain,
  Sparkles,
  Sliders,
  Trash2,
  Plus,
  Search,
  Check,
  X,
  Loader2,
  AlertTriangle,
  Info,
  Edit2,
  Save,
  MessageSquare,
} from "lucide-react";

export interface MemoryItem {
  id: string;
  content: string;
  category: "preference" | "fact" | "work" | "tech" | "personal" | "instruction" | "general";
  isActive: boolean;
  sourceMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomInstructions {
  enabled: boolean;
  whatToKnow: string;
  howToRespond: string;
}

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMemoryUpdated?: () => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  tech: { bg: "bg-sky-500/10", text: "text-sky-400", border: "border-sky-500/20" },
  work: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
  preference: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  personal: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  instruction: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20" },
  general: { bg: "bg-neutral-500/10", text: "text-neutral-300", border: "border-neutral-500/20" },
};

export default function MemoryModal({ isOpen, onClose, onMemoryUpdated }: MemoryModalProps) {
  const [activeTab, setActiveTab] = useState<"memories" | "instructions">("memories");
  const [loading, setLoading] = useState(true);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [customInstructions, setCustomInstructions] = useState<CustomInstructions>({
    enabled: true,
    whatToKnow: "",
    howToRespond: "",
  });

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // New Memory Input
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<string>("general");
  const [addingMemory, setAddingMemory] = useState(false);

  // Edit Memory Inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Clear All Confirmation
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);

  // Saving Instructions State
  const [savingInstructions, setSavingInstructions] = useState(false);
  const [instructionSuccess, setInstructionSuccess] = useState(false);

  // Fetch memory data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/memory", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setMemories(data.memories || []);
        setMemoryEnabled(data.memoryEnabled !== false);
        if (data.customInstructions) {
          setCustomInstructions({
            enabled: data.customInstructions.enabled !== false,
            whatToKnow: data.customInstructions.whatToKnow || "",
            howToRespond: data.customInstructions.howToRespond || "",
          });
        }
      }
    } catch (err) {
      console.error("Failed to load memories:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, fetchData]);

  // Toggle Master Memory On/Off
  const handleToggleMemory = async () => {
    const nextState = !memoryEnabled;
    setMemoryEnabled(nextState);
    try {
      await fetch("/api/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-settings",
          memoryEnabled: nextState,
        }),
      });
      if (onMemoryUpdated) onMemoryUpdated();
    } catch (err) {
      console.error("Failed to toggle memory:", err);
      setMemoryEnabled(!nextState);
    }
  };

  // Add Manual Memory
  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim() || addingMemory) return;

    setAddingMemory(true);
    try {
      const res = await fetch("/api/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newContent.trim(),
          category: newCategory,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.memory) {
          setMemories((prev) => [data.memory, ...prev]);
          setNewContent("");
          if (onMemoryUpdated) onMemoryUpdated();
        }
      }
    } catch (err) {
      console.error("Failed to add memory:", err);
    } finally {
      setAddingMemory(false);
    }
  };

  // Save Inline Edit
  const handleSaveEdit = async (id: string) => {
    if (!editContent.trim() || savingEdit) return;
    setSavingEdit(true);
    try {
      const res = await fetch("/api/memory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          content: editContent.trim(),
        }),
      });

      if (res.ok) {
        setMemories((prev) =>
          prev.map((m) => (m.id === id ? { ...m, content: editContent.trim() } : m))
        );
        setEditingId(null);
        if (onMemoryUpdated) onMemoryUpdated();
      }
    } catch (err) {
      console.error("Failed to edit memory:", err);
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete Memory
  const handleDeleteMemory = async (id: string) => {
    try {
      const res = await fetch(`/api/memory?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMemories((prev) => prev.filter((m) => m.id !== id));
        if (onMemoryUpdated) onMemoryUpdated();
      }
    } catch (err) {
      console.error("Failed to delete memory:", err);
    }
  };

  // Clear All Memories
  const handleClearAll = async () => {
    setClearing(true);
    try {
      const res = await fetch("/api/memory?all=true", {
        method: "DELETE",
      });

      if (res.ok) {
        setMemories([]);
        setShowClearConfirm(false);
        if (onMemoryUpdated) onMemoryUpdated();
      }
    } catch (err) {
      console.error("Failed to clear all memories:", err);
    } finally {
      setClearing(false);
    }
  };

  // Save Custom Instructions
  const handleSaveInstructions = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingInstructions(true);
    setInstructionSuccess(false);

    try {
      const res = await fetch("/api/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-settings",
          customInstructions: {
            enabled: customInstructions.enabled,
            whatToKnow: customInstructions.whatToKnow.trim(),
            howToRespond: customInstructions.howToRespond.trim(),
          },
        }),
      });

      if (res.ok) {
        setInstructionSuccess(true);
        setTimeout(() => setInstructionSuccess(false), 3500);
        if (onMemoryUpdated) onMemoryUpdated();
      }
    } catch (err) {
      console.error("Failed to save custom instructions:", err);
    } finally {
      setSavingInstructions(false);
    }
  };

  // Filtered Memories
  const filteredMemories = memories.filter((m) => {
    const matchesSearch =
      m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0f0f0f] border border-white/10 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-white/[0.08] flex items-center justify-between bg-[#141414]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500/20 via-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-sky-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Personalization & Memory</span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-white/10 text-neutral-300">
                  Neural
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Manage what ClerX AI remembers about you across chat sessions.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs Navigation */}
        <div className="px-6 pt-3 border-b border-white/[0.06] flex items-center gap-6 bg-[#111111]">
          <button
            type="button"
            onClick={() => setActiveTab("memories")}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 transition-colors relative cursor-pointer ${
              activeTab === "memories"
                ? "text-white"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>Learned Memories</span>
            <span className="px-1.5 py-0.2 rounded-md bg-white/10 text-[10px] text-neutral-300">
              {memories.length}
            </span>
            {activeTab === "memories" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("instructions")}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 transition-colors relative cursor-pointer ${
              activeTab === "instructions"
                ? "text-white"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Custom Instructions</span>
            {activeTab === "instructions" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
            )}
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-neutral-400">
              <Loader2 className="w-6 h-6 animate-spin text-white" />
              <p className="text-xs">Loading personalization memory...</p>
            </div>
          ) : activeTab === "memories" ? (
            /* TAB 1: LEARNED MEMORIES */
            <div className="space-y-5">
              {/* Master Memory Switch Card */}
              <div className="p-4 rounded-2xl bg-[#141414] border border-white/[0.08] flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-white flex items-center gap-2">
                    <span>Remember details across all chats</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        memoryEnabled ? "bg-emerald-400 shadow-sm" : "bg-neutral-600"
                      }`}
                    />
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    ClerX AI automatically updates its memory as you talk to deliver tailored answers.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleToggleMemory}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                    memoryEnabled ? "bg-white" : "bg-neutral-800"
                  }`}
                >
                  <div
                    className={`bg-black w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      memoryEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Add Memory Form */}
              <form onSubmit={handleAddMemory} className="space-y-2">
                <div className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
                  <span>Add a Memory Manually</span>
                  <span className="text-[10px] text-neutral-500 font-normal">
                    e.g., &quot;Prefers TypeScript over Python&quot;
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="What should ClerX AI remember about you?"
                      className="w-full bg-[#141414] border border-white/[0.08] rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors"
                    />
                  </div>

                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="bg-[#141414] border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-neutral-300 focus:outline-none focus:border-white/30 cursor-pointer"
                  >
                    <option value="general">General</option>
                    <option value="tech">Tech Stack</option>
                    <option value="preference">Preference</option>
                    <option value="work">Work & Projects</option>
                    <option value="personal">Personal</option>
                    <option value="instruction">Instruction</option>
                  </select>

                  <button
                    type="submit"
                    disabled={!newContent.trim() || addingMemory}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer shadow-sm shrink-0"
                  >
                    {addingMemory ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    <span>Add</span>
                  </button>
                </div>
              </form>

              {/* Memory Search & Filter Bar */}
              {memories.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-white/[0.06]">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search remembered facts..."
                      className="w-full bg-[#141414] border border-white/[0.08] rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/20"
                    />
                  </div>

                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-[#141414] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-neutral-400 focus:outline-none focus:border-white/20 cursor-pointer"
                  >
                    <option value="all">All Categories ({memories.length})</option>
                    <option value="tech">Tech</option>
                    <option value="work">Work</option>
                    <option value="preference">Preference</option>
                    <option value="personal">Personal</option>
                    <option value="instruction">Instruction</option>
                    <option value="general">General</option>
                  </select>
                </div>
              )}

              {/* Memory List */}
              <div className="space-y-2">
                {memories.length === 0 ? (
                  <div className="py-12 rounded-2xl bg-[#141414]/50 border border-dashed border-white/10 text-center px-4 space-y-2">
                    <Sparkles className="w-6 h-6 text-neutral-500 mx-auto" />
                    <p className="text-xs font-medium text-neutral-300">
                      No memories stored yet
                    </p>
                    <p className="text-[11px] text-neutral-500 max-w-sm mx-auto leading-relaxed">
                      As you chat, ClerX AI will automatically remember your preferences, coding stack, and background to personalize future answers.
                    </p>
                  </div>
                ) : filteredMemories.length === 0 ? (
                  <div className="py-8 text-center text-xs text-neutral-400">
                    No memories found matching &quot;{searchQuery}&quot;.
                  </div>
                ) : (
                  filteredMemories.map((mem) => {
                    const catStyle =
                      CATEGORY_COLORS[mem.category] || CATEGORY_COLORS.general;
                    const isEditing = editingId === mem.id;

                    return (
                      <div
                        key={mem.id}
                        className="p-3.5 rounded-2xl bg-[#141414] border border-white/[0.06] hover:border-white/15 transition-all flex items-start justify-between gap-3 group"
                      >
                        <div className="flex-1 space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                            >
                              {mem.category}
                            </span>
                            <span className="text-[10px] text-neutral-500">
                              {new Date(mem.updatedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>

                          {isEditing ? (
                            <div className="flex items-center gap-2 pt-1">
                              <input
                                type="text"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="flex-1 bg-[#1a1a1a] border border-white/20 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-white"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveEdit(mem.id)}
                                disabled={savingEdit}
                                className="p-1.5 rounded-lg bg-white text-black hover:bg-neutral-200 transition-colors cursor-pointer"
                                title="Save"
                              >
                                {savingEdit ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Check className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                                title="Cancel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <p className="text-xs text-neutral-200 leading-relaxed break-words font-sans">
                              {mem.content}
                            </p>
                          )}
                        </div>

                        {!isEditing && (
                          <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(mem.id);
                                setEditContent(mem.content);
                              }}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                              title="Edit memory"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteMemory(mem.id)}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                              title="Delete memory"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Clear All Option */}
              {memories.length > 0 && (
                <div className="pt-3 flex items-center justify-between border-t border-white/[0.06]">
                  <span className="text-[11px] text-neutral-500">
                    {memories.length} total facts remembered
                  </span>

                  {showClearConfirm ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-red-400 font-medium">
                        Delete all memories?
                      </span>
                      <button
                        type="button"
                        onClick={handleClearAll}
                        disabled={clearing}
                        className="px-2.5 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {clearing ? "Clearing..." : "Yes, Clear All"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowClearConfirm(false)}
                        className="px-2.5 py-1 rounded-lg bg-white/10 text-neutral-300 text-[11px] hover:bg-white/20 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowClearConfirm(true)}
                      className="text-[11px] text-red-400/80 hover:text-red-400 hover:underline transition-colors cursor-pointer"
                    >
                      Clear all memories
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* TAB 2: CUSTOM INSTRUCTIONS */
            <form onSubmit={handleSaveInstructions} className="space-y-5">
              {/* Master Custom Instructions Switch Card */}
              <div className="p-4 rounded-2xl bg-[#141414] border border-white/[0.08] flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-white flex items-center gap-2">
                    <span>Enable Custom Instructions</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        customInstructions.enabled
                          ? "bg-emerald-400 shadow-sm"
                          : "bg-neutral-600"
                      }`}
                    />
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Custom instructions guide ClerX AI&apos;s tone, personality, and response format across all chats.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setCustomInstructions((prev) => ({
                      ...prev,
                      enabled: !prev.enabled,
                    }))
                  }
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                    customInstructions.enabled ? "bg-white" : "bg-neutral-800"
                  }`}
                >
                  <div
                    className={`bg-black w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      customInstructions.enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {instructionSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Custom instructions saved successfully!</span>
                </div>
              )}

              {/* Box 1: What would you like ClerX AI to know about you? */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-200">
                  What would you like ClerX AI to know about you to provide better responses?
                </label>
                <textarea
                  value={customInstructions.whatToKnow}
                  onChange={(e) =>
                    setCustomInstructions((prev) => ({
                      ...prev,
                      whatToKnow: e.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="e.g. Where are you based? What is your role or area of expertise? What tech stacks or projects do you work on?"
                  className="w-full bg-[#141414] border border-white/[0.08] rounded-2xl p-3.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors leading-relaxed"
                />
              </div>

              {/* Box 2: How would you like ClerX AI to respond? */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-200">
                  How would you like ClerX AI to respond?
                </label>
                <textarea
                  value={customInstructions.howToRespond}
                  onChange={(e) =>
                    setCustomInstructions((prev) => ({
                      ...prev,
                      howToRespond: e.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="e.g. How formal or casual? Should responses be brief or comprehensive? Do you want code with minimal explanation, or step-by-step walkthroughs?"
                  className="w-full bg-[#141414] border border-white/[0.08] rounded-2xl p-3.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors leading-relaxed"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingInstructions}
                  className="px-6 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  {savingInstructions ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Instructions</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
