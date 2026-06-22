"use client"

import { useState } from "react"
import { Bot, FolderOpen, Sparkles } from "lucide-react"
import { WorkspaceNavbar } from "@/components/editor/workspace-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { ShareDialog } from "@/components/editor/share-dialog"
import { CanvasWrapper } from "@/components/editor/canvas-wrapper"
import { EditorDialogsContext } from "@/components/editor/editor-dialogs-context"
import { useProjectActions } from "@/hooks/use-project-actions"
import type { ProjectView } from "@/lib/projects"

interface WorkspaceShellProps {
  roomId: string
  projectName: string
  initialProjects: ProjectView[]
  isOwner: boolean
}

export function WorkspaceShell({ roomId, projectName, initialProjects, isOwner }: WorkspaceShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [aiOpen, setAiOpen] = useState(true)
  const [shareOpen, setShareOpen] = useState(false)

  const dialogs = useProjectActions({
    initialProjects,
    activeProjectId: roomId,
    onProjectCreated: () => setSidebarOpen(true),
  })
  return (
    <EditorDialogsContext.Provider value={{ openCreate: dialogs.openCreate }}>
      <WorkspaceNavbar
        projectName={projectName}
        isOwner={isOwner}
        isSidebarOpen={sidebarOpen}
        isAiOpen={aiOpen}
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
        onToggleAi={() => setAiOpen((o) => !o)}
        onShareOpen={() => setShareOpen(true)}
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
        activeRoomId={roomId}
        onClose={() => setSidebarOpen(false)}
        onCreateProject={dialogs.openCreate}
        onRenameProject={dialogs.openRename}
        onDeleteProject={dialogs.openDelete}
      />

      <ProjectDialogs dialogs={dialogs} />

      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        roomId={roomId}
        isOwner={isOwner}
      />

      {/* Canvas fills full viewport below navbar — sidebars float over it */}
      <div className="fixed inset-0 top-12">
        <CanvasWrapper roomId={roomId} />
      </div>

      {aiOpen && (
        <aside className="fixed right-0 top-12 hidden h-[calc(100vh-3rem)] w-80 flex-col border-l border-white/10 bg-[#090b0f]/95 md:flex">
          <div className="flex items-start justify-between border-b border-white/10 px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-text-primary">AI Copilot</h2>
              <p className="mt-0.5 text-xs text-text-muted">Placeholder panel</p>
            </div>
            <Sparkles className="mt-0.5 h-4 w-4 text-violet-300" />
          </div>

          <div className="flex-1 p-4">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/14 text-violet-200 ring-1 ring-inset ring-violet-400/20">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-text-primary">Chat surface pending</p>
                  <p className="text-xs leading-relaxed text-text-muted">
                    This side stays reserved for prompts, quick project help, and generated follow
                    up work.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/14 text-cyan-200 ring-1 ring-inset ring-cyan-400/20">
                  <FolderOpen className="h-4 w-4" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-text-primary">Project context</p>
                  <p className="text-xs leading-relaxed text-text-muted">
                    The open workspace name, access level, and project list stay visible so you can
                    orient yourself quickly.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 p-4">
            <p className="mb-2 text-[10px] tracking-[0.18em] uppercase text-text-muted">
              Future Hooks
            </p>
            <p className="text-xs leading-relaxed text-text-muted">
              Prompt composer, run status, and architecture guidance can attach here without
              crowding the main workspace.
            </p>
          </div>
        </aside>
      )}
    </EditorDialogsContext.Provider>
  )
}
