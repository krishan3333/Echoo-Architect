"use client"

import { useState } from "react"

export interface MockProject {
  id: string
  name: string
  slug: string
  isOwned: boolean
}

export const MOCK_PROJECTS: MockProject[] = [
  { id: "1", name: "Design System", slug: "design-system", isOwned: true },
  { id: "2", name: "API Gateway", slug: "api-gateway", isOwned: true },
  { id: "3", name: "Shared Architecture", slug: "shared-architecture", isOwned: false },
]

type DialogType = "create" | "rename" | "delete" | null

interface UseProjectDialogsOptions {
  onProjectCreated?: (project: MockProject) => void
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}

export function useProjectDialogs(options: UseProjectDialogsOptions = {}) {
  const [projects, setProjects] = useState<MockProject[]>(MOCK_PROJECTS)
  const [activeDialog, setActiveDialog] = useState<DialogType>(null)
  const [selectedProject, setSelectedProject] = useState<MockProject | null>(null)
  const [createName, setCreateName] = useState("")
  const [renameName, setRenameName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  function openCreate() {
    setCreateName("")
    setActiveDialog("create")
  }

  function openRename(project: MockProject) {
    setSelectedProject(project)
    setRenameName(project.name)
    setActiveDialog("rename")
  }

  function openDelete(project: MockProject) {
    setSelectedProject(project)
    setActiveDialog("delete")
  }

  function close() {
    setActiveDialog(null)
    setSelectedProject(null)
  }

  async function handleCreate() {
    const projectName = createName.trim()
    if (!projectName) return

    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 400))
    const newProject: MockProject = {
      id: `project-${Date.now()}`,
      name: projectName,
      slug: toSlug(projectName),
      isOwned: true,
    }

    setProjects((currentProjects) => [newProject, ...currentProjects])
    setIsLoading(false)
    close()
    options.onProjectCreated?.(newProject)
  }

  async function handleRename() {
    if (!renameName.trim() || renameName === selectedProject?.name) return
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 400))
    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.id === selectedProject?.id
          ? { ...project, name: renameName.trim(), slug: toSlug(renameName) }
          : project
      )
    )
    setIsLoading(false)
    close()
  }

  async function handleDelete() {
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 400))
    setProjects((currentProjects) =>
      currentProjects.filter((project) => project.id !== selectedProject?.id)
    )
    setIsLoading(false)
    close()
  }

  return {
    projects,
    activeDialog,
    selectedProject,
    createName,
    setCreateName,
    createSlug: toSlug(createName),
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
