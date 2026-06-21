"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { ProjectView } from "@/lib/projects"

export type { ProjectView }

type DialogType = "create" | "rename" | "delete" | null

interface UseProjectActionsOptions {
  initialProjects: ProjectView[]
  activeProjectId?: string
  onProjectCreated?: () => void
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}

function shortId(): string {
  return Math.random().toString(36).slice(2, 8)
}

export function useProjectActions({
  initialProjects,
  activeProjectId,
  onProjectCreated,
}: UseProjectActionsOptions) {
  const router = useRouter()
  const [activeDialog, setActiveDialog] = useState<DialogType>(null)
  const [selectedProject, setSelectedProject] = useState<ProjectView | null>(null)
  const [createName, setCreateName] = useState("")
  const [createSuffix, setCreateSuffix] = useState("")
  const [renameName, setRenameName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const slug = toSlug(createName)
  const createRoomId = slug ? `${slug}-${createSuffix}` : createSuffix

  function openCreate() {
    setCreateName("")
    setCreateSuffix(shortId())
    setActiveDialog("create")
  }

  function openRename(project: ProjectView) {
    setSelectedProject(project)
    setRenameName(project.name)
    setActiveDialog("rename")
  }

  function openDelete(project: ProjectView) {
    setSelectedProject(project)
    setActiveDialog("delete")
  }

  function close() {
    setActiveDialog(null)
    setSelectedProject(null)
  }

  async function handleCreate() {
    const name = createName.trim()
    if (!name) return
    setIsLoading(true)
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, id: createRoomId }),
      })
      if (!res.ok) throw new Error("Failed to create project")
      const project = await res.json()
      close()
      onProjectCreated?.()
      router.push(`/editor/${project.id}`)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRename() {
    if (!renameName.trim() || renameName === selectedProject?.name || !selectedProject) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: renameName.trim() }),
      })
      if (!res.ok) throw new Error("Failed to rename project")
      close()
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete() {
    if (!selectedProject) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete project")
      close()
      if (activeProjectId === selectedProject.id) {
        router.push("/editor")
      } else {
        router.refresh()
      }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    projects: initialProjects,
    activeDialog,
    selectedProject,
    createName,
    setCreateName,
    createRoomId,
    renameName,
    setRenameName,
    isLoading,
    openCreate,
    openRename,
    openDelete,
    close,
    handleCreate,
    handleRename,
    handleDelete,
  }
}
