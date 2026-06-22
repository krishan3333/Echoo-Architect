"use client"

import Link from "next/link"
import { Folder, FolderOpen, Pencil, Plus, Trash2, Users, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { getProjectTone } from "@/components/editor/project-tone"
import { cn } from "@/lib/utils"
import type { ProjectView } from "@/lib/projects"

interface ProjectSidebarProps {
  isOpen: boolean
  projects: ProjectView[]
  activeRoomId?: string
  onClose: () => void
  onCreateProject: () => void
  onRenameProject: (project: ProjectView) => void
  onDeleteProject: (project: ProjectView) => void
}

export function ProjectSidebar({
  isOpen,
  projects,
  activeRoomId,
  onClose,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
}: ProjectSidebarProps) {
  const ownedProjects = projects.filter((project) => project.isOwned)
  const sharedProjects = projects.filter((project) => !project.isOwned)
  const activeProject = activeRoomId ? projects.find((project) => project.id === activeRoomId) : null
  const defaultTab = activeProject?.isOwned === false ? "shared" : "my-projects"

  function renderProject(project: ProjectView) {
    const tone = getProjectTone(project.id)
    const isActive = project.id === activeRoomId
    const ProjectIcon = isActive ? FolderOpen : project.isOwned ? Folder : Users

    return (
      <li key={project.id}>
        <Link
          href={`/editor/${project.id}`}
          className={cn(
            "group flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition-colors",
            isActive
              ? cn("shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]", tone.active)
              : "border-transparent hover:bg-white/4"
          )}
        >
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset",
              tone.icon
            )}
          >
            <ProjectIcon className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium text-text-primary">{project.name}</span>
              {isActive && <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} />}
            </div>
            <p className="text-xs text-text-muted">
              {project.isOwned ? "Owner access" : "Shared with you"}
            </p>
          </div>

          {project.isOwned && (
            <div className="ml-auto flex shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={`Rename ${project.name}`}
                onClick={(event) => {
                  event.preventDefault()
                  onRenameProject(project)
                }}
              >
                <Pencil />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={`Delete ${project.name}`}
                onClick={(event) => {
                  event.preventDefault()
                  onDeleteProject(project)
                }}
              >
                <Trash2 />
              </Button>
            </div>
          )}
        </Link>
      </li>
    )
  }

  return (
    <aside
      className={cn(
        "fixed top-12 left-0 z-30 flex h-[calc(100vh-3rem)] w-72 flex-col border-r border-white/10 bg-[#090b0f]/95 backdrop-blur transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="border-b border-white/10 px-4 py-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-text-primary">Projects</span>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close sidebar">
            <X />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden p-3">
        <Tabs
          key={`${activeRoomId ?? "home"}-${defaultTab}`}
          defaultValue={defaultTab}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <TabsList className="w-full rounded-xl bg-white/5 p-1">
            <TabsTrigger value="my-projects" className="flex-1">
              My Projects
            </TabsTrigger>
            <TabsTrigger value="shared" className="flex-1">
              Shared
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="my-projects"
            className="mt-2 flex flex-1 flex-col overflow-y-auto"
          >
            {ownedProjects.length === 0 ? (
              <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4">
                <p className="text-sm text-text-muted">No projects yet</p>
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {ownedProjects.map(renderProject)}
              </ul>
            )}
          </TabsContent>

          <TabsContent
            value="shared"
            className="mt-2 flex flex-1 flex-col overflow-y-auto"
          >
            {sharedProjects.length === 0 ? (
              <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4">
                <p className="text-sm text-text-muted">No shared projects</p>
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {sharedProjects.map(renderProject)}
              </ul>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <div className="border-t border-white/10 p-3">
        <Button
          className="w-full bg-cyan-400 text-slate-950 hover:bg-cyan-300"
          size="sm"
          onClick={onCreateProject}
        >
          <Plus />
          New Project
        </Button>
      </div>
    </aside>
  )
}
