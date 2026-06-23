"use client"

import { useEffect } from "react"
import type { RefObject } from "react"
import type { ReactFlowInstance } from "@xyflow/react"

function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false
  const tag = target.tagName
  if (tag === "INPUT" || tag === "TEXTAREA") return true
  if (target.isContentEditable) return true
  return false
}

export function useKeyboardShortcuts(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rfRef: RefObject<ReactFlowInstance<any, any> | null>,
  undo: () => void,
  redo: () => void,
) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (isEditableTarget(e.target)) return

      const ctrl = e.ctrlKey || e.metaKey

      if (!ctrl) {
        if (e.key === "+" || e.key === "=") {
          e.preventDefault()
          rfRef.current?.zoomIn({ duration: 200 })
        } else if (e.key === "-") {
          e.preventDefault()
          rfRef.current?.zoomOut({ duration: 200 })
        }
        return
      }

      if (e.key === "z" || e.key === "Z") {
        e.preventDefault()
        if (e.shiftKey) {
          redo()
        } else {
          undo()
        }
      } else if (e.key === "y" || e.key === "Y") {
        e.preventDefault()
        redo()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [rfRef, undo, redo])
}
