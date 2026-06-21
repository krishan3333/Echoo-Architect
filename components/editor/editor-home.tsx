"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEditorDialogs } from "@/components/editor/editor-dialogs-context"

export function EditorHome() {
  const { openCreate } = useEditorDialogs()

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <h2 className="text-lg font-semibold text-text-primary">
        Create a project or open an existing one
      </h2>
      <p className="max-w-xs text-sm text-text-muted">
        Start a new architecture workspace, or choose a project from the sidebar.
      </p>
      <Button className="mt-2" onClick={openCreate}>
        <Plus />
        New Project
      </Button>
    </div>
  )
}
