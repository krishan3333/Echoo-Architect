"use client"

import { useState, useRef } from "react"
import { Bot, X, FileText, Download } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface AiSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const STARTER_CHIPS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
]

export function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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

  function handleSend() {
    const text = input.trim()
    if (!text) return
    setMessages((prev) => [...prev, { role: "user", content: text }])
    setInput("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "72px"
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleChip(chip: string) {
    setMessages([{ role: "user", content: chip }])
  }

  return (
    <aside
      className={`fixed right-0 top-12 hidden h-[calc(100vh-3rem)] w-80 flex-col border-l border-border-default bg-bg-base/95 shadow-2xl transition-transform duration-300 ease-in-out md:flex ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent-primary-dim text-accent-primary ring-1 ring-inset ring-accent-primary/20">
            <Bot className="h-4 w-4" />
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
      <Tabs defaultValue="architect" className="flex flex-1 flex-col overflow-hidden">
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
        </TabsList>

        {/* AI Architect Tab */}
        <TabsContent
          value="architect"
          className="mt-0 flex flex-1 flex-col overflow-hidden"
        >
          <ScrollArea className="flex-1 px-4 py-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-primary-dim text-accent-primary ring-1 ring-inset ring-accent-primary/20">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">Ghost AI Architect</p>
                  <p className="mt-1 text-xs leading-relaxed text-text-muted">
                    Describe your system and I'll help you design the architecture.
                  </p>
                </div>
                <div className="flex w-full flex-col gap-2">
                  {STARTER_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => handleChip(chip)}
                      className="rounded-full bg-white/[0.05] px-3 py-1.5 text-left text-xs text-accent-primary transition-colors hover:bg-white/[0.09]"
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
                      <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-border-default bg-white/[0.05] px-3 py-2 text-xs text-text-secondary">
                        {m.content}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input area */}
          <div className="border-t border-border-default p-3">
            <div className="flex flex-col gap-2 rounded-xl border border-border-default bg-white/[0.04] p-2">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask Ghost AI…"
                style={{ minHeight: 72, maxHeight: 160 }}
                className="resize-none border-0 bg-transparent p-1 text-xs text-text-primary placeholder:text-text-faint focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-text-faint">
                  Enter to send · Shift+Enter for newline
                </span>
                <Button
                  size="sm"
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="h-7 bg-accent-primary px-3 text-[11px] text-white hover:bg-accent-primary/90 disabled:opacity-40"
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Specs Tab */}
        <TabsContent
          value="specs"
          className="mt-0 flex flex-1 flex-col overflow-hidden"
        >
          <ScrollArea className="flex-1">
            <div className="flex flex-col gap-4 px-4 py-4">
              <Button className="w-full bg-accent-primary text-white hover:bg-accent-primary/90">
                Generate Spec
              </Button>

              <div className="rounded-2xl border border-border-default bg-white/[0.05] p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-primary-dim text-accent-primary ring-1 ring-inset ring-accent-primary/20">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary">
                      System Architecture v1
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-muted">
                      Microservices design with API gateway, authentication service, and
                      event-driven messaging layer.
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="h-7 gap-1.5 border-border-default text-[11px] text-text-muted opacity-50"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </aside>
  )
}
