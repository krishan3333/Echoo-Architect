"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEditorDialogs } from "@/components/editor/editor-dialogs-context"

interface EditorHomeProps {
  projectCount: number
  ownedCount: number
  sharedCount: number
}

export function EditorHome({ projectCount, ownedCount, sharedCount }: EditorHomeProps) {
  const { openCreate } = useEditorDialogs()

  return (
    <div className="flex flex-1 p-3">
      <section className="relative flex flex-1 overflow-hidden rounded-[28px] border border-white/10 bg-[#07090c]">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_40%)]" />

        <div className="relative mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center px-6 text-center">
          <p className="text-xs uppercase tracking-[0.24em] text-text-muted">
            Workspace Overview
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-text-primary sm:text-4xl">
            Pick a project to open
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-text-muted sm:text-base">
            Once you open one, we keep it pinned in the header and sidebar so the active workspace
            is always easy to spot.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs text-text-muted">
            <span className="rounded-full border border-white/10 px-3 py-1">
              {projectCount} total {projectCount === 1 ? "project" : "projects"}
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1">
              {ownedCount} owned
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1">
              {sharedCount} shared
            </span>
          </div>

          <Button
            className="mt-6 bg-cyan-400 text-slate-950 hover:bg-cyan-300"
            onClick={openCreate}
          >
            <Plus />
            New Project
          </Button>
        </div>
      </section>
    </div>
  )
}
