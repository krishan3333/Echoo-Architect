"use client"

import { useState, useRef, useEffect } from "react"
import { Bot, X, FileText, Download, Loader2, MessageSquare, RefreshCw } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRealtimeRun } from "@trigger.dev/react-hooks"
import { useEventListener, useUpdateMyPresence, useStorage, useMutation, useSelf } from "@liveblocks/react"
import type { designAgent } from "@/trigger/design-agent"
import { AiStatusFeedMessageSchema, AiChatMessageSchema, type AiChatMessage } from "@/types/tasks"
import ReactMarkdown from "react-markdown"

interface Message {
  role: "user" | "assistant"
  content: string
  status?: "loading" | "done" | "error"
}

interface SpecItem {
  id: string
  filename: string
  createdAt: string
}

interface AiSidebarProps {
  isOpen: boolean
  onClose: () => void
  roomId: string
}

const STARTER_CHIPS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
]

export function AiSidebar({ isOpen, onClose, roomId }: AiSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [runId, setRunId] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isTriggering, setIsTriggering] = useState(false)
  // Shared AI state — updated for all room participants via Liveblocks events
  const [aiThinking, setAiThinking] = useState(false)
  const [feedMessage, setFeedMessage] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Chat tab state
  const [chatInput, setChatInput] = useState("")
  const [chatError, setChatError] = useState<string | null>(null)
  const chatScrollRef = useRef<HTMLDivElement>(null)
  const chatTextareaRef = useRef<HTMLTextAreaElement>(null)

  // Specs tab state
  const [activeTab, setActiveTab] = useState("architect")
  const [specs, setSpecs] = useState<SpecItem[]>([])
  const [specsLoading, setSpecsLoading] = useState(false)
  const [specsError, setSpecsError] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewSpec, setPreviewSpec] = useState<SpecItem | null>(null)
  const [previewContent, setPreviewContent] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  // Spec generation run state
  const [specRunId, setSpecRunId] = useState<string | null>(null)
  const [specToken, setSpecToken] = useState<string | null>(null)
  const [isGeneratingSpec, setIsGeneratingSpec] = useState(false)
  const [specGenError, setSpecGenError] = useState<string | null>(null)

  const updateMyPresence = useUpdateMyPresence()
  const self = useSelf()

  // ai-chat feed — room-scoped, persistent, separate from ai-status-feed
  const rawChatMessages = useStorage((root) => root.chatMessages)
  const chatMessages: AiChatMessage[] = rawChatMessages
    ? Array.from(rawChatMessages)
        .map((m) => AiChatMessageSchema.safeParse(m))
        .filter((r): r is { success: true; data: AiChatMessage } => r.success)
        .map((r) => r.data)
    : []

  const addChatMessage = useMutation(({ storage }, msg: AiChatMessage) => {
    storage.get("chatMessages").push(msg)
  }, [])

  // Auto-scroll chat feed on new messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [chatMessages.length])

  const { run } = useRealtimeRun<typeof designAgent>(runId ?? "", {
    accessToken: accessToken ?? "",
    enabled: !!runId && !!accessToken,
  })

  // Subscribe to spec generation run
  const { run: specRun } = useRealtimeRun(specRunId ?? "", {
    accessToken: specToken ?? "",
    enabled: !!specRunId && !!specToken,
  })

  // Subscribe to the ai-status-feed: listen for shared AI status events from the room
  useEventListener(({ event }) => {
    if (event.type === "ai:thinking") {
      setAiThinking(event.thinking ?? false)
      if (!event.thinking) {
        // Keep the last feed message visible after generation ends
      }
    }

    if (event.type === "ai:status") {
      // Validate incoming feed message before displaying
      const parsed = AiStatusFeedMessageSchema.safeParse({ text: event.message })
      if (parsed.success) {
        setFeedMessage(parsed.data.text ?? null)
      }
    }
  })

  // Update the last assistant message based on run status
  useEffect(() => {
    if (!run) return

    if (run.status === "EXECUTING") {
      setMessages(prev => {
        const last = prev[prev.length - 1]
        if (last?.status === "loading") return prev
        return [...prev, { role: "assistant", content: "Generating architecture…", status: "loading" }]
      })
    }

    if (run.status === "COMPLETED") {
      const summary = (run.output as { summary?: string } | null)?.summary ?? "Design added to canvas."
      setMessages(prev => {
        const updated = [...prev]
        const lastIdx = updated.findLastIndex(m => m.status === "loading")
        if (lastIdx !== -1) {
          updated[lastIdx] = { role: "assistant", content: summary, status: "done" }
        } else {
          updated.push({ role: "assistant", content: summary, status: "done" })
        }
        return updated
      })
      setRunId(null)
      setAccessToken(null)
      updateMyPresence({ thinking: false })
    }

    if (run.status === "FAILED" || run.status === "CRASHED" || run.status === "CANCELED") {
      setMessages(prev => {
        const updated = [...prev]
        const lastIdx = updated.findLastIndex(m => m.status === "loading")
        const errMsg = "Design generation failed. Please try again."
        if (lastIdx !== -1) {
          updated[lastIdx] = { role: "assistant", content: errMsg, status: "error" }
        } else {
          updated.push({ role: "assistant", content: errMsg, status: "error" })
        }
        return updated
      })
      setRunId(null)
      setAccessToken(null)
      updateMyPresence({ thinking: false })
    }
  }, [run?.status, run?.output, updateMyPresence])

  // Watch spec generation run — refresh list on completion
  useEffect(() => {
    if (!specRun) return
    if (specRun.status === "COMPLETED") {
      setIsGeneratingSpec(false)
      setSpecRunId(null)
      setSpecToken(null)
      setSpecGenError(null)
      fetchSpecs()
    }
    if (specRun.status === "FAILED" || specRun.status === "CRASHED" || specRun.status === "CANCELED") {
      setIsGeneratingSpec(false)
      setSpecRunId(null)
      setSpecToken(null)
      setSpecGenError("Spec generation failed. Please try again.")
    }
  }, [specRun?.status]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  function autoResize() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = Math.min(Math.max(el.scrollHeight, 72), 160) + "px"
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    autoResize()
  }

  async function handleSend() {
    const text = input.trim()
    if (!text || isTriggering || !!runId || aiThinking) return

    setMessages(prev => [...prev, { role: "user", content: text }])
    setInput("")
    setFeedMessage(null)
    if (textareaRef.current) textareaRef.current.style.height = "72px"
    setIsTriggering(true)
    updateMyPresence({ thinking: true })

    try {
      // Trigger the design task
      const triggerRes = await fetch("/api/ai/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, roomId, projectId: roomId }),
      })

      if (!triggerRes.ok) {
        const err = await triggerRes.json().catch(() => ({}))
        throw new Error((err as { error?: string }).error ?? "Failed to start design")
      }

      const { runId: newRunId } = (await triggerRes.json()) as { runId: string }

      // Get a public token to subscribe to this run
      const tokenRes = await fetch("/api/ai/design/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: newRunId }),
      })

      if (!tokenRes.ok) throw new Error("Failed to get run token")

      const { token } = (await tokenRes.json()) as { token: string }

      setRunId(newRunId)
      setAccessToken(token)
      setMessages(prev => [...prev, { role: "assistant", content: "Generating architecture…", status: "loading" }])
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong"
      setMessages(prev => [...prev, { role: "assistant", content: msg, status: "error" }])
      updateMyPresence({ thinking: false })
    } finally {
      setIsTriggering(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleChip(chip: string) {
    setInput(chip)
    setTimeout(() => textareaRef.current?.focus(), 0)
  }

  // Fetch spec list when Specs tab becomes active
  useEffect(() => {
    if (activeTab !== "specs") return
    fetchSpecs()
  }, [activeTab, roomId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleGenerateSpec() {
    if (isGeneratingSpec) return
    setIsGeneratingSpec(true)
    setSpecGenError(null)
    try {
      const chatHistory = messages
        .filter((m) => m.status !== "loading")
        .map((m) => ({ role: m.role, content: m.content }))

      const r = await fetch("/api/ai/spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, chatHistory, nodes: [], edges: [] }),
      })
      if (!r.ok) {
        const err = await r.json().catch(() => ({}))
        throw new Error((err as { error?: string }).error ?? "Failed to start spec generation")
      }
      const { runId: newRunId } = (await r.json()) as { runId: string }

      const tokenRes = await fetch("/api/ai/spec/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: newRunId }),
      })
      if (!tokenRes.ok) throw new Error("Failed to get run token")
      const { token } = (await tokenRes.json()) as { token: string }

      setSpecRunId(newRunId)
      setSpecToken(token)
    } catch (err) {
      setIsGeneratingSpec(false)
      setSpecGenError(err instanceof Error ? err.message : "Something went wrong")
    }
  }

  async function fetchSpecs() {
    setSpecsLoading(true)
    setSpecsError(null)
    try {
      const r = await fetch(`/api/projects/${roomId}/specs`)
      if (!r.ok) throw new Error("Failed to load specs")
      const data = (await r.json()) as { specs: SpecItem[] }
      setSpecs(data.specs)
    } catch {
      setSpecsError("Failed to load specs")
    } finally {
      setSpecsLoading(false)
    }
  }

  async function handleSpecClick(spec: SpecItem) {
    setPreviewSpec(spec)
    setPreviewContent(null)
    setPreviewLoading(true)
    setPreviewOpen(true)
    try {
      const r = await fetch(`/api/projects/${roomId}/specs/${spec.id}`)
      if (!r.ok) throw new Error("Failed to load spec content")
      const data = (await r.json()) as { content: string }
      setPreviewContent(data.content)
    } catch {
      setPreviewContent(null)
    } finally {
      setPreviewLoading(false)
    }
  }

  function handleDownload(specId: string) {
    const a = document.createElement("a")
    a.href = `/api/projects/${roomId}/specs/${specId}/download`
    a.click()
  }

  function formatSpecDate(isoString: string): string {
    try {
      return new Date(isoString).toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch {
      return ""
    }
  }

  function formatMsgTime(isoString: string): string {
    try {
      return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } catch {
      return ""
    }
  }

  function handleChatSend() {
    const text = chatInput.trim()
    if (!text) return

    setChatError(null)
    try {
      const msg: AiChatMessage = {
        id: `${self?.id ?? "user"}-${Date.now()}`,
        senderId: self?.id ?? "unknown",
        sender: self?.info?.name ?? "User",
        role: "user",
        content: text,
        timestamp: new Date().toISOString(),
      }
      addChatMessage(msg)
      setChatInput("")
      if (chatTextareaRef.current) chatTextareaRef.current.style.height = "72px"
    } catch {
      setChatError("Failed to send message. Please try again.")
    }
  }

  function handleChatKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleChatSend()
    }
  }

  function handleChatInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setChatInput(e.target.value)
    const el = chatTextareaRef.current
    if (el) {
      el.style.height = "auto"
      el.style.height = Math.min(Math.max(el.scrollHeight, 72), 160) + "px"
    }
  }

  const isBusy = isTriggering || !!runId
  // Input is disabled for all users when any AI generation is in progress
  const inputDisabled = isBusy || aiThinking

  return (
    <aside
      className={`fixed right-0 top-12 hidden h-[calc(100vh-3rem)] w-80 flex-col border-l border-border-default bg-bg-base/95 shadow-2xl transition-transform duration-300 ease-in-out md:flex ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent-primary-dim text-accent-primary ring-1 ring-inset ring-accent-primary/20">
            <Bot className="h-4 w-4" />
            {aiThinking && (
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulse rounded-full bg-accent-primary" />
            )}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text-primary">AI Workspace</h2>
            <p className="text-[11px] text-text-muted">Collaborate with Ghost AI</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col overflow-hidden">
        <TabsList className="h-auto w-full justify-start gap-0 rounded-none border-b border-border-default bg-transparent px-2 py-0">
          <TabsTrigger
            value="architect"
            className="rounded-none border-b-2 border-transparent bg-transparent px-3 py-2.5 text-xs font-medium text-text-muted shadow-none transition-colors data-[state=active]:border-accent-primary data-[state=active]:bg-transparent data-[state=active]:text-accent-primary data-[state=active]:shadow-none"
          >
            AI Architect
          </TabsTrigger>
          <TabsTrigger
            value="specs"
            className="rounded-none border-b-2 border-transparent bg-transparent px-3 py-2.5 text-xs font-medium text-text-muted shadow-none transition-colors data-[state=active]:border-accent-primary data-[state=active]:bg-transparent data-[state=active]:text-accent-primary data-[state=active]:shadow-none"
          >
            Specs
          </TabsTrigger>
          <TabsTrigger
            value="chat"
            className="rounded-none border-b-2 border-transparent bg-transparent px-3 py-2.5 text-xs font-medium text-text-muted shadow-none transition-colors data-[state=active]:border-accent-primary data-[state=active]:bg-transparent data-[state=active]:text-accent-primary data-[state=active]:shadow-none"
          >
            Chat
          </TabsTrigger>
        </TabsList>

        {/* AI Architect Tab */}
        <TabsContent
          value="architect"
          className="mt-0 flex flex-1 flex-col overflow-hidden"
        >
          {/* Shared AI status feed — shows the latest status message from ai-status-feed */}
          {(aiThinking || feedMessage) && (
            <div className="flex shrink-0 items-center gap-2 border-b border-border-default px-4 py-2">
              {aiThinking ? (
                <Loader2 className="h-3 w-3 shrink-0 animate-spin text-accent-primary" />
              ) : (
                <Bot className="h-3 w-3 shrink-0 text-accent-primary/60" />
              )}
              <span className="truncate text-[11px] text-text-muted">
                {feedMessage ?? "Ghost AI is thinking…"}
              </span>
            </div>
          )}

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-primary-dim text-accent-primary ring-1 ring-inset ring-accent-primary/20">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">Ghost AI Architect</p>
                  <p className="mt-1 text-xs leading-relaxed text-text-muted">
                    Describe your system and I&apos;ll design the architecture on the canvas.
                  </p>
                </div>
                <div className="flex w-full flex-col gap-2">
                  {STARTER_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => handleChip(chip)}
                      className="rounded-full bg-white/5 px-3 py-1.5 text-left text-xs text-accent-primary transition-colors hover:bg-white/9"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 pb-2">
                {messages.map((m, i) =>
                  m.role === "user" ? (
                    <div key={i} className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl rounded-br-sm border-2 border-accent-primary/50 bg-accent-primary-dim px-3 py-2 text-xs text-text-primary">
                        {m.content}
                      </div>
                    </div>
                  ) : (
                    <div key={i} className="flex justify-start">
                      <div
                        className={`max-w-[85%] rounded-2xl rounded-bl-sm border px-3 py-2 text-xs ${
                          m.status === "error"
                            ? "border-red-500/30 bg-red-500/10 text-red-400"
                            : "border-border-default bg-white/5 text-text-secondary"
                        }`}
                      >
                        {m.status === "loading" ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-3 w-3 animate-spin text-accent-primary" />
                            <span className="text-text-muted">{m.content}</span>
                          </span>
                        ) : (
                          m.content
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="border-t border-border-default p-3">
            <div className="flex flex-col gap-2 rounded-xl border border-border-default bg-white/4 p-2">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask Ghost AI…"
                disabled={inputDisabled}
                style={{ minHeight: 72, maxHeight: 160 }}
                className="resize-none border-0 bg-transparent p-1 text-xs text-text-primary placeholder:text-text-faint focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-50"
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-text-faint">
                  {inputDisabled ? "Generating…" : "Enter to send · Shift+Enter for newline"}
                </span>
                <Button
                  size="sm"
                  onClick={handleSend}
                  disabled={!input.trim() || inputDisabled}
                  className="h-7 bg-accent-primary px-3 text-[11px] text-white hover:bg-accent-primary/90 disabled:opacity-40"
                >
                  {isTriggering ? <Loader2 className="h-3 w-3 animate-spin" /> : "Send"}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Specs Tab */}
        <TabsContent value="specs" className="mt-0 flex flex-1 flex-col overflow-hidden">
          <ScrollArea className="flex-1">
            <div className="flex flex-col gap-2 px-4 py-4">
              {/* Generate button */}
              <Button
                onClick={handleGenerateSpec}
                disabled={isGeneratingSpec}
                className="w-full bg-accent-primary text-white hover:bg-accent-primary/90 disabled:opacity-60"
              >
                {isGeneratingSpec ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Generating…
                  </span>
                ) : (
                  "Generate Spec"
                )}
              </Button>

              {specGenError && (
                <p className="text-[11px] text-red-400">{specGenError}</p>
              )}

              {/* Header row */}
              <div className="mt-1 mb-1 flex items-center justify-between">
                <span className="text-[11px] font-medium text-text-muted uppercase tracking-wide">
                  Generated Specs
                </span>
                <button
                  onClick={fetchSpecs}
                  disabled={specsLoading}
                  className="rounded p-1 text-text-faint transition-colors hover:text-text-muted disabled:opacity-40"
                  title="Refresh"
                >
                  <RefreshCw className={`h-3 w-3 ${specsLoading ? "animate-spin" : ""}`} />
                </button>
              </div>

              {/* Loading */}
              {specsLoading && (
                <div className="flex items-center gap-2 py-6 text-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin text-accent-primary" />
                  <span className="text-xs text-text-muted">Loading specs…</span>
                </div>
              )}

              {/* Error */}
              {!specsLoading && specsError && (
                <p className="py-4 text-center text-xs text-red-400">{specsError}</p>
              )}

              {/* Empty state */}
              {!specsLoading && !specsError && specs.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-text-faint">
                    <FileText className="h-5 w-5" />
                  </div>
                  <p className="text-xs text-text-muted">
                    No specs yet. Generate one from above.
                  </p>
                </div>
              )}

              {/* Spec list */}
              {!specsLoading && specs.map((spec) => (
                <div
                  key={spec.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSpecClick(spec)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault()
                      handleSpecClick(spec)
                    }
                  }}
                  className="group flex w-full cursor-pointer items-center gap-3 rounded-xl border border-border-default bg-white/5 px-3 py-2.5 text-left transition-colors hover:bg-white/8 hover:border-accent-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/50"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-primary-dim text-accent-primary ring-1 ring-inset ring-accent-primary/20">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-text-primary">
                      {spec.filename}
                    </p>
                    <p className="text-[11px] text-text-muted">{formatSpecDate(spec.createdAt)}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDownload(spec.id) }}
                    className="shrink-0 rounded p-1 text-text-faint opacity-0 transition-opacity group-hover:opacity-100 hover:text-text-muted"
                    title="Download"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Preview Modal */}
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogContent
              showCloseButton={false}
              className="flex flex-col w-[calc(100vw-2rem)] max-w-3xl overflow-hidden border border-border-default p-0 sm:w-[min(48rem,calc(100vw-4rem))]"
              style={{
                maxHeight: "calc(100vh - 2rem)",
                backgroundColor: "oklch(0.08 0 0)",
                color: "oklch(0.95 0 0)",
              }}
            >
              <DialogHeader
                className="flex shrink-0 flex-row items-center gap-3 border-b px-5 py-4"
                style={{ borderColor: "oklch(1 0 0 / 8%)" }}
              >
                <DialogTitle
                  className="min-w-0 flex-1 truncate pr-2 text-sm font-medium"
                  style={{ color: "oklch(0.95 0 0)" }}
                >
                  {previewSpec?.filename ?? "Spec Preview"}
                </DialogTitle>
                <div className="flex shrink-0 items-center gap-2">
                  {previewSpec && (
                    <Button
                      size="sm"
                      onClick={() => handleDownload(previewSpec.id)}
                      className="h-7 gap-1.5 bg-accent-primary px-3 text-[11px] text-white hover:bg-accent-primary/90"
                    >
                      <Download className="h-3 w-3" />
                      Download
                    </Button>
                  )}
                  <DialogClose
                    render={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-text-muted hover:bg-white/5 hover:text-text-primary"
                      />
                    }
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close preview</span>
                  </DialogClose>
                </div>
              </DialogHeader>

              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
                  <div className="w-full max-w-full wrap-break-word px-5 py-4">
                {previewLoading && (
                  <div className="flex items-center justify-center gap-2 py-12">
                    <Loader2 className="h-4 w-4 animate-spin text-accent-primary" />
                    <span className="text-xs" style={{ color: "oklch(0.52 0 0)" }}>Loading…</span>
                  </div>
                )}
                {!previewLoading && !previewContent && (
                  <p className="py-12 text-center text-xs text-red-400">
                    Failed to load spec content.
                  </p>
                )}
                {!previewLoading && previewContent && (
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <h1 style={{ fontSize: "1rem", fontWeight: 600, color: "oklch(0.95 0 0)", marginTop: "1rem", marginBottom: "0.5rem" }}>{children}</h1>
                      ),
                      h2: ({ children }) => (
                        <h2 style={{ fontSize: "0.875rem", fontWeight: 600, color: "oklch(0.95 0 0)", marginTop: "0.875rem", marginBottom: "0.375rem" }}>{children}</h2>
                      ),
                      h3: ({ children }) => (
                        <h3 style={{ fontSize: "0.8125rem", fontWeight: 600, color: "oklch(0.87 0 0)", marginTop: "0.75rem", marginBottom: "0.25rem" }}>{children}</h3>
                      ),
                      p: ({ children }) => (
                        <p style={{ fontSize: "0.75rem", lineHeight: "1.6", color: "oklch(0.72 0 0)", marginBottom: "0.5rem" }}>{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul style={{ fontSize: "0.75rem", color: "oklch(0.72 0 0)", paddingLeft: "1.25rem", listStyleType: "disc", marginBottom: "0.5rem" }}>{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol style={{ fontSize: "0.75rem", color: "oklch(0.72 0 0)", paddingLeft: "1.25rem", listStyleType: "decimal", marginBottom: "0.5rem" }}>{children}</ol>
                      ),
                      li: ({ children }) => (
                        <li style={{ marginBottom: "0.2rem" }}>{children}</li>
                      ),
                      strong: ({ children }) => (
                        <strong style={{ fontWeight: 600, color: "oklch(0.87 0 0)" }}>{children}</strong>
                      ),
                      em: ({ children }) => (
                        <em style={{ fontStyle: "italic", color: "oklch(0.72 0 0)" }}>{children}</em>
                      ),
                      code: ({ className, children }) => {
                        const isBlock = className?.includes("language-")
                        return isBlock ? (
                          <code style={{ fontSize: "0.6875rem", color: "oklch(0.72 0 0)" }}>{children}</code>
                        ) : (
                          <code style={{ fontSize: "0.6875rem", color: "oklch(0.76 0.14 185)", backgroundColor: "rgba(255,255,255,0.08)", padding: "0.1rem 0.3rem", borderRadius: "0.25rem" }}>{children}</code>
                        )
                      },
                      pre: ({ children }) => (
                        <pre style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "0.75rem", borderRadius: "0.5rem", marginBottom: "0.75rem", overflowX: "auto", maxWidth: "100%", fontSize: "0.6875rem" }}>{children}</pre>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote style={{ borderLeft: "2px solid oklch(0.76 0.14 185 / 40%)", paddingLeft: "0.75rem", fontStyle: "italic", color: "oklch(0.52 0 0)", marginBottom: "0.5rem" }}>{children}</blockquote>
                      ),
                      hr: () => (
                        <hr style={{ borderColor: "oklch(1 0 0 / 8%)", marginBlock: "0.75rem" }} />
                      ),
                      a: ({ href, children }) => (
                        <a href={href} style={{ color: "oklch(0.76 0.14 185)", textDecoration: "underline", textUnderlineOffset: "2px" }}>{children}</a>
                      ),
                    }}
                  >
                    {previewContent}
                  </ReactMarkdown>
                )}
                  </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Chat Tab — ai-chat feed, room-scoped, separate from ai-status-feed */}
        <TabsContent value="chat" className="mt-0 flex flex-1 flex-col overflow-hidden">
          <div ref={chatScrollRef} className="flex-1 overflow-y-auto px-4 py-3">
            {chatMessages.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-text-faint">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <p className="text-xs text-text-muted">
                  No messages yet. Say hello to your collaborators!
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 pb-2">
                {chatMessages.map((m) => {
                  const isMe = m.senderId === self?.id
                  return (
                    <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`flex max-w-[85%] flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}>
                        {!isMe && (
                          <span className="px-1 text-[10px] text-text-faint">{m.sender}</span>
                        )}
                        <div
                          className={`rounded-2xl px-3 py-2 text-xs ${
                            isMe
                              ? "rounded-br-sm border-2 border-accent-primary/50 bg-accent-primary-dim text-text-primary"
                              : "rounded-bl-sm border border-border-default bg-white/5 text-text-secondary"
                          }`}
                        >
                          {m.content}
                        </div>
                        <span className="px-1 text-[10px] text-text-faint">
                          {formatMsgTime(m.timestamp)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {chatError && (
            <div className="shrink-0 px-4 pb-1">
              <p className="text-[11px] text-red-400">{chatError}</p>
            </div>
          )}

          {/* Chat input — same pattern as AI Architect input */}
          <div className="border-t border-border-default p-3">
            <div className="flex flex-col gap-2 rounded-xl border border-border-default bg-white/4 p-2">
              <Textarea
                ref={chatTextareaRef}
                value={chatInput}
                onChange={handleChatInputChange}
                onKeyDown={handleChatKeyDown}
                placeholder="Send a message to the room…"
                style={{ minHeight: 72, maxHeight: 160 }}
                className="resize-none border-0 bg-transparent p-1 text-xs text-text-primary placeholder:text-text-faint focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-text-faint">
                  Enter to send · Shift+Enter for newline
                </span>
                <Button
                  size="sm"
                  onClick={handleChatSend}
                  disabled={!chatInput.trim()}
                  className="h-7 bg-accent-primary px-3 text-[11px] text-white hover:bg-accent-primary/90 disabled:opacity-40"
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  )
}
