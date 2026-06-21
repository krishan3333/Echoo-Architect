"use client"

import { useState } from "react"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { EditorDialogsContext } from "@/components/editor/editor-dialogs-context"
import { useProjectDialogs } from "@/hooks/use-project-dialogs"

interface EditorShellProps {
  children: React.ReactNode
}

export function EditorShell({ children }: EditorShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const dialogs = useProjectDialogs({
    onProjectCreated: () => setSidebarOpen(true),
  })

  return (
    <EditorDialogsContext.Provider value={{ openCreate: dialogs.openCreate }}>
      <EditorNavbar
        isSidebarOpen={sidebarOpen}
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

      <main className="flex flex-1 flex-col pt-12">{children}</main>
    </EditorDialogsContext.Provider>
  )
}
