"use client"

import { Component, type ReactNode } from "react"
import { ClientSideSuspense } from "@liveblocks/react"
import { Canvas } from "@/components/editor/canvas"
import type { CanvasTemplate } from "@/components/editor/starter-templates"
import type { SaveStatus } from "@/hooks/use-canvas-autosave"

class LiveblocksErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full items-center justify-center text-sm text-red-400/70">
          Could not connect to collaboration server.
        </div>
      )
    }
    return this.props.children
  }
}

interface CanvasWrapperProps {
  roomId: string
  pendingTemplate?: CanvasTemplate | null
  onTemplateImported?: () => void
  onSaveStatusChange?: (status: SaveStatus) => void
  onSaveReady?: (save: () => void) => void
}

export function CanvasWrapper({ roomId, pendingTemplate, onTemplateImported, onSaveStatusChange, onSaveReady }: CanvasWrapperProps) {
  return (
    <LiveblocksErrorBoundary>
      <ClientSideSuspense
        fallback={
          <div className="flex h-full w-full items-center justify-center text-sm text-white/40">
            Connecting…
          </div>
        }
      >
        <Canvas
          projectId={roomId}
          pendingTemplate={pendingTemplate}
          onTemplateImported={onTemplateImported}
          onSaveStatusChange={onSaveStatusChange}
          onSaveReady={onSaveReady}
        />
      </ClientSideSuspense>
    </LiveblocksErrorBoundary>
  )
}
