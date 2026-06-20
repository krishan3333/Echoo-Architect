"use client"

import { X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  return (
    <aside
      className={cn(
        "fixed top-12 left-0 z-30 flex h-[calc(100vh-3rem)] w-64 flex-col border-r border-border bg-card transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-sm font-semibold text-foreground">Projects</span>
        <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close sidebar">
          <X />
        </Button>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden p-3">
        <Tabs defaultValue="my-projects" className="flex flex-1 flex-col overflow-hidden">
          <TabsList className="w-full">
            <TabsTrigger value="my-projects" className="flex-1">
              My Projects
            </TabsTrigger>
            <TabsTrigger value="shared" className="flex-1">
              Shared
            </TabsTrigger>
          </TabsList>
          <TabsContent value="my-projects" className="flex flex-1 items-center justify-center">
            <p className="text-sm text-muted-foreground">No projects yet</p>
          </TabsContent>
          <TabsContent value="shared" className="flex flex-1 items-center justify-center">
            <p className="text-sm text-muted-foreground">No shared projects</p>
          </TabsContent>
        </Tabs>
      </div>

      <div className="border-t border-border p-3">
        <Button className="w-full" size="sm">
          <Plus />
          New Project
        </Button>
      </div>
    </aside>
  )
}
