"use client"

import { useState } from "react"
import { Bot, Compass, FolderOpen, Sparkles, Users } from "lucide-react"
import { getProjectTone } from "@/components/editor/project-tone"
import { WorkspaceNavbar } from "@/components/editor/workspace-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { ShareDialog } from "@/components/editor/share-dialog"
import { EditorDialogsContext } from "@/components/editor/editor-dialogs-context"
import { useProjectActions } from "@/hooks/use-project-actions"
import { cn } from "@/lib/utils"
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
  const tone = getProjectTone(roomId)
  const ownedCount = dialogs.projects.filter((project) => project.isOwned).length
  const sharedCount = dialogs.projects.length - ownedCount

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

      {/* Main area below navbar */}
      <div
        className={cn(
          "flex h-screen flex-col pt-12 transition-all duration-300",
          sidebarOpen && "md:pl-72",
          aiOpen && "md:pr-80"
        )}
      >
        <main className="flex flex-1 p-3">
          <div className="relative flex flex-1 overflow-hidden rounded-[28px] border border-white/10 bg-[#07090c]">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_40%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.12),transparent_28%)]" />

            <div className="relative flex flex-1 flex-col justify-between p-8 sm:p-10">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em]",
                    tone.pill
                  )}
                >
                  Open Project
                </span>
                <span className="inline-flex items-center rounded-full border border-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-text-muted">
                  {isOwner ? "Owner access" : "Shared access"}
                </span>
              </div>

              <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 px-4 text-center">
                <div
                  className={cn(
                    "flex h-16 w-16 items-center justify-center rounded-[20px] ring-1 ring-inset",
                    tone.icon
                  )}
                >
                  <Compass className="h-7 w-7" />
                </div>
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.24em] text-text-muted">
                    Workspace Shell
                  </p>
                  <h2 className="text-2xl font-semibold leading-snug text-text-primary sm:text-4xl">
                    {projectName} is open and easy to track.
                  </h2>
                  <p className="mx-auto max-w-xl text-sm leading-relaxed text-text-muted sm:text-base">
                    The current project stays pinned in the sidebar and header, while the shell
                    keeps collaboration and AI space nearby without feeling cluttered.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-inset",
                        tone.icon
                      )}
                    >
                      <FolderOpen className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-text-muted">
                        Current project
                      </p>
                      <p className="pt-1 text-sm font-semibold text-text-primary">{projectName}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/14 text-violet-200 ring-1 ring-inset ring-violet-400/20">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-text-muted">
                        Access
                      </p>
                      <p className="pt-1 text-sm font-semibold text-text-primary">
                        {isOwner ? "You own this workspace" : "Shared with you"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/14 text-emerald-200 ring-1 ring-inset ring-emerald-400/20">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-text-muted">
                        Projects
                      </p>
                      <p className="pt-1 text-sm font-semibold text-text-primary">
                        {ownedCount} owned • {sharedCount} shared
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
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
