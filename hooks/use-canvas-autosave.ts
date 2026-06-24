"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { CanvasNode, CanvasEdge } from "@/types/canvas"

export type SaveStatus = "idle" | "saving" | "saved" | "error"

export function useCanvasAutosave({
  projectId,
  nodes,
  edges,
  ready,
}: {
  projectId: string
  nodes: CanvasNode[]
  edges: CanvasEdge[]
  ready: boolean
}) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resetRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstRef = useRef(true)
  const nodesRef = useRef(nodes)
  const edgesRef = useRef(edges)
  nodesRef.current = nodes
  edgesRef.current = edges

  const performSave = useCallback(async () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
    if (resetRef.current) {
      clearTimeout(resetRef.current)
      resetRef.current = null
    }
    setSaveStatus("saving")
    try {
      const res = await fetch(`/api/projects/${projectId}/canvas`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes: nodesRef.current, edges: edgesRef.current }),
      })
      const next: SaveStatus = res.ok ? "saved" : "error"
      setSaveStatus(next)
      resetRef.current = setTimeout(() => setSaveStatus("idle"), 2000)
    } catch {
      setSaveStatus("error")
      resetRef.current = setTimeout(() => setSaveStatus("idle"), 2000)
    }
  }, [projectId])

  useEffect(() => {
    if (!ready) return

    // Skip the first trigger after ready — avoids saving the just-loaded state
    if (isFirstRef.current) {
      isFirstRef.current = false
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(performSave, 1500)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [nodes, edges, ready, performSave])

  return { saveStatus, save: performSave }
}
