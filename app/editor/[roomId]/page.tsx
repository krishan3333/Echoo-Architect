import { redirect } from "next/navigation"
import { AccessDenied } from "@/components/editor/access-denied"
import { WorkspaceShell } from "@/components/editor/workspace-shell"
import { getCurrentIdentity, getProjectWithAccess } from "@/lib/project-access"
import { getProjectsForUser } from "@/lib/projects"

interface Props {
  params: Promise<{ roomId: string }>
}

export default async function EditorRoomPage({ params }: Props) {
  const { roomId } = await params

  const identity = await getCurrentIdentity()
  if (!identity) {
    redirect("/sign-in")
  }

  const [project, projects] = await Promise.all([
    getProjectWithAccess(roomId, identity),
    getProjectsForUser(identity),
  ])

  if (!project) {
    return <AccessDenied />
  }

  return (
    <WorkspaceShell
      roomId={roomId}
      projectName={project.name}
      initialProjects={projects}
      isOwner={project.isOwner}
    />
  )
}
