"use client"

import { PanelLeftClose, PanelLeftOpen, PanelsTopLeft } from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EditorNavbarProps {
  isSidebarOpen: boolean
  projectCount: number
  onToggleSidebar: () => void
  className?: string
}

export function EditorNavbar({
  isSidebarOpen,
  projectCount,
  onToggleSidebar,
  className,
}: EditorNavbarProps) {
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 flex h-12 items-center border-b border-white/10 bg-[#090b0f]/90 px-3 backdrop-blur",
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

        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/14 text-cyan-200 ring-1 ring-inset ring-cyan-400/20">
          <PanelsTopLeft className="h-4 w-4" />
        </div>

        <div className="flex flex-col gap-0.5 leading-none">
          <span className="text-sm font-semibold text-text-primary">Ghost AI Workspace</span>
          <span className="text-[11px] text-text-muted">
            {projectCount} {projectCount === 1 ? "project" : "projects"} available
          </span>
        </div>
      </div>

      <div className="flex flex-1 justify-center" />

      <div className="flex items-center">
        <UserButton />
      </div>
    </header>
  )
}
