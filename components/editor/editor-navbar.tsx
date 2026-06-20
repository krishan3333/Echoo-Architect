"use client"

import { PanelLeftOpen, PanelLeftClose } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EditorNavbarProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
  className?: string
}

export function EditorNavbar({ isSidebarOpen, onToggleSidebar, className }: EditorNavbarProps) {
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 flex h-12 items-center border-b border-border bg-card px-3",
        className
      )}
    >
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          {isSidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
        </Button>
      </div>

      <div className="flex flex-1 justify-center" />

      <div className="flex items-center" />
    </header>
  )
}
