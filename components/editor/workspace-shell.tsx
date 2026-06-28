"use client"

import { useCallback, useRef, useState } from "react"
import { LiveblocksProvider, RoomProvider } from "@liveblocks/react"
import { LiveList } from "@liveblocks/client"
import { WorkspaceNavbar } from "@/components/editor/workspace-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { ShareDialog } from "@/components/editor/share-dialog"
import { CanvasWrapper } from "@/components/editor/canvas-wrapper"
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal"
import { AiSidebar } from "@/components/editor/ai-sidebar"
import type { CanvasTemplate } from "@/components/editor/starter-templates"
import { EditorDialogsContext } from "@/components/editor/editor-dialogs-context"
import { useProjectActions } from "@/hooks/use-project-actions"
import type { ProjectView } from "@/lib/projects"
import type { SaveStatus } from "@/hooks/use-canvas-autosave"

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
  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [pendingTemplate, setPendingTemplate] = useState<CanvasTemplate | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
  const saveRef = useRef<(() => void) | null>(null)
  const handleSaveReady = useCallback((fn: () => void) => {
    saveRef.current = fn
  }, [])

  const dialogs = useProjectActions({
    initialProjects,
    activeProjectId: roomId,
    onProjectCreated: () => setSidebarOpen(true),
  })

  return (
    <EditorDialogsContext.Provider value={{ openCreate: dialogs.openCreate }}>
      <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
        <RoomProvider
          id={roomId}
          initialPresence={{ cursor: null, thinking: false }}
          initialStorage={{ chatMessages: new LiveList([]) }}
        >
          <WorkspaceNavbar
            projectName={projectName}
            isOwner={isOwner}
            isSidebarOpen={sidebarOpen}
            isAiOpen={aiOpen}
            onToggleSidebar={() => setSidebarOpen((o) => !o)}
            onToggleAi={() => setAiOpen((o) => !o)}
            onShareOpen={() => setShareOpen(true)}
            onTemplatesOpen={() => setTemplatesOpen(true)}
            saveStatus={saveStatus}
            onSave={() => saveRef.current?.()}
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

          <StarterTemplatesModal
            open={templatesOpen}
            onOpenChange={setTemplatesOpen}
            onImport={(template) => setPendingTemplate(template)}
          />

          {/* Canvas fills full viewport below navbar — sidebars float over it */}
          <div className="fixed inset-0 top-12">
            <CanvasWrapper
              roomId={roomId}
              pendingTemplate={pendingTemplate}
              onTemplateImported={() => setPendingTemplate(null)}
              onSaveStatusChange={setSaveStatus}
              onSaveReady={handleSaveReady}
            />
          </div>

          <AiSidebar isOpen={aiOpen} onClose={() => setAiOpen(false)} roomId={roomId} />
        </RoomProvider>
      </LiveblocksProvider>
    </EditorDialogsContext.Provider>
  )
}
