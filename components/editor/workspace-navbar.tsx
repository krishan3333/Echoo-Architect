"use client"

import {
  Crown,
  FolderOpen,
  LayoutTemplate,
  PanelLeftClose,
  PanelLeftOpen,
  Share2,
  Sparkles,
  Users,
} from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import { getProjectTone } from "@/components/editor/project-tone"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface WorkspaceNavbarProps {
  projectName: string
  isOwner: boolean
  isSidebarOpen: boolean
  isAiOpen: boolean
  onToggleSidebar: () => void
  onToggleAi: () => void
  onShareOpen: () => void
  onTemplatesOpen: () => void
  className?: string
}

export function WorkspaceNavbar({
  projectName,
  isOwner,
  isSidebarOpen,
  isAiOpen,
  onToggleSidebar,
  onToggleAi,
  onShareOpen,
  onTemplatesOpen,
  className,
}: WorkspaceNavbarProps) {
  const tone = getProjectTone(projectName)

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 flex h-12 items-center gap-3 border-b border-white/10 bg-[#090b0f]/90 px-3 backdrop-blur",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          {isSidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
        </Button>

        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-xl ring-1 ring-inset",
            tone.icon
          )}
        >
          <FolderOpen className="h-4 w-4" />
        </div>

        <div className="flex flex-col gap-0.5 leading-none">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold leading-none text-text-primary">
              {projectName}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em]",
                tone.pill
              )}
            >
              {isOwner ? <Crown className="h-3 w-3" /> : <Users className="h-3 w-3" />}
              {isOwner ? "Owner" : "Shared"}
            </span>
          </div>
          <span className="text-[11px] leading-none text-text-muted">Workspace</span>
        </div>
      </div>

      <div className="flex flex-1" />

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={onTemplatesOpen}>
          <LayoutTemplate className="h-3.5 w-3.5" />
          Templates
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={onShareOpen}>
          <Share2 className="h-3.5 w-3.5" />
          Share
        </Button>
        <Button
          variant={isAiOpen ? "default" : "outline"}
          size="sm"
          onClick={onToggleAi}
          className={cn(
            "gap-1.5",
            isAiOpen && "bg-violet-400 text-slate-950 hover:bg-violet-300"
          )}
          aria-label="Toggle AI sidebar"
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI
        </Button>
        <UserButton />
      </div>
    </header>
  )
}
