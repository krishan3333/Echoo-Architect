"use client"

import { X, Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { MockProject } from "@/hooks/use-project-dialogs"

interface ProjectSidebarProps {
  isOpen: boolean
  projects: MockProject[]
  onClose: () => void
  onCreateProject: () => void
  onRenameProject: (project: MockProject) => void
  onDeleteProject: (project: MockProject) => void
}

export function ProjectSidebar({
  isOpen,
  projects,
  onClose,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
}: ProjectSidebarProps) {
  const ownedProjects = projects.filter((project) => project.isOwned)
  const sharedProjects = projects.filter((project) => !project.isOwned)

  return (
    <aside
      className={cn(
        "fixed top-12 left-0 z-30 flex h-[calc(100vh-3rem)] w-64 flex-col border-r border-border-default bg-bg-surface transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
        <span className="text-sm font-semibold text-text-primary">Projects</span>
        <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close sidebar">
          <X />
        </Button>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden p-3">
        <Tabs defaultValue="my-projects" className="flex flex-1 flex-col overflow-hidden">
          <TabsList className="w-full">
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
              <div className="flex flex-1 items-center justify-center">
                <p className="text-sm text-text-muted">No projects yet</p>
              </div>
            ) : (
              <ul className="flex flex-col gap-0.5">
                {ownedProjects.map((project) => (
                  <li
                    key={project.id}
                    className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-bg-elevated"
                  >
                    <span className="flex-1 truncate text-sm text-text-primary">
                      {project.name}
                    </span>
                    <div className="ml-auto flex shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Rename ${project.name}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          onRenameProject(project)
                        }}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Delete ${project.name}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteProject(project)
                        }}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent
            value="shared"
            className="mt-2 flex flex-1 flex-col overflow-y-auto"
          >
            {sharedProjects.length === 0 ? (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-sm text-text-muted">No shared projects</p>
              </div>
            ) : (
              <ul className="flex flex-col gap-0.5">
                {sharedProjects.map((project) => (
                  <li
                    key={project.id}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-bg-elevated"
                  >
                    <span className="flex-1 truncate text-sm text-text-primary">
                      {project.name}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <div className="border-t border-border-default p-3">
        <Button className="w-full" size="sm" onClick={onCreateProject}>
          <Plus />
          New Project
        </Button>
      </div>
    </aside>
  )
}
