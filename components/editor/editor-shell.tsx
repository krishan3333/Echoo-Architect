"use client"

import { useState } from "react"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { EditorDialogsContext } from "@/components/editor/editor-dialogs-context"
import { useProjectActions } from "@/hooks/use-project-actions"
import { cn } from "@/lib/utils"
import type { ProjectView } from "@/lib/projects"

interface EditorShellProps {
  children: React.ReactNode
  initialProjects: ProjectView[]
}

export function EditorShell({ children, initialProjects }: EditorShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const dialogs = useProjectActions({
    initialProjects,
    onProjectCreated: () => setSidebarOpen(true),
  })

  return (
    <EditorDialogsContext.Provider value={{ openCreate: dialogs.openCreate }}>
      <EditorNavbar
        isSidebarOpen={sidebarOpen}
        projectCount={dialogs.projects.length}
        onToggleSidebar={() => setSidebarOpen((isOpen) => !isOpen)}
      />

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <ProjectSidebar
        isOpen={sidebarOpen}
        projects={dialogs.projects}
        onClose={() => setSidebarOpen(false)}
        onCreateProject={dialogs.openCreate}
        onRenameProject={dialogs.openRename}
        onDeleteProject={dialogs.openDelete}
      />

      <ProjectDialogs dialogs={dialogs} />

      <div
        className={cn(
          "flex min-h-screen flex-col pt-12 transition-all duration-300",
          sidebarOpen && "md:pl-72"
        )}
      >
        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    </EditorDialogsContext.Provider>
  )
}
