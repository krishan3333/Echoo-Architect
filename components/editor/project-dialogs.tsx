"use client"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { useProjectDialogs } from "@/hooks/use-project-dialogs"

type Dialogs = ReturnType<typeof useProjectDialogs>

export function ProjectDialogs({ dialogs }: { dialogs: Dialogs }) {
  return (
    <>
      <CreateProjectDialog dialogs={dialogs} />
      <RenameProjectDialog dialogs={dialogs} />
      <DeleteProjectDialog dialogs={dialogs} />
    </>
  )
}

function CreateProjectDialog({ dialogs }: { dialogs: Dialogs }) {
  const { activeDialog, createName, setCreateName, createSlug, isLoading, handleCreate, close } =
    dialogs

  return (
    <Dialog open={activeDialog === "create"} onOpenChange={(open) => !open && close()}>
      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
          <DialogDescription>
            Give your new architecture workspace a name.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="create-name" className="text-xs font-medium text-muted-foreground">
              Project name
            </label>
            <Input
              id="create-name"
              autoFocus
              placeholder="My Project"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
          {createName && (
            <p className="text-xs text-muted-foreground">
              Slug:{" "}
              <span className="font-mono text-foreground/80">
                {createSlug || "—"}
              </span>
            </p>
          )}
        </div>

        <DialogFooter showCloseButton>
          <Button disabled={!createName.trim() || isLoading} onClick={handleCreate}>
            {isLoading ? "Creating…" : "Create Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function RenameProjectDialog({ dialogs }: { dialogs: Dialogs }) {
  const {
    activeDialog,
    selectedProject,
    renameName,
    setRenameName,
    isLoading,
    handleRename,
    close,
  } = dialogs

  return (
    <Dialog open={activeDialog === "rename"} onOpenChange={(open) => !open && close()}>
      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle>Rename Project</DialogTitle>
          <DialogDescription>
            Currently named{" "}
            <span className="font-medium text-foreground">{selectedProject?.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="rename-name" className="text-xs font-medium text-muted-foreground">
            New name
          </label>
          <Input
            id="rename-name"
            autoFocus
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
          />
        </div>

        <DialogFooter showCloseButton>
          <Button
            disabled={!renameName.trim() || renameName === selectedProject?.name || isLoading}
            onClick={handleRename}
          >
            {isLoading ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DeleteProjectDialog({ dialogs }: { dialogs: Dialogs }) {
  const { activeDialog, selectedProject, isLoading, handleDelete, close } = dialogs

  return (
    <Dialog open={activeDialog === "delete"} onOpenChange={(open) => !open && close()}>
      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle>Delete Project</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">{selectedProject?.name}</span>? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter showCloseButton>
          <Button variant="destructive" disabled={isLoading} onClick={handleDelete}>
            {isLoading ? "Deleting…" : "Delete Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
