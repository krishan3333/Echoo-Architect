"use client"

import { createContext, useContext } from "react"

interface EditorDialogsContextValue {
  openCreate: () => void
}

export const EditorDialogsContext = createContext<EditorDialogsContextValue>({
  openCreate: () => {},
})

export function useEditorDialogs() {
  return useContext(EditorDialogsContext)
}
