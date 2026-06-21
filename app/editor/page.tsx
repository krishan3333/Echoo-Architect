import { EditorShell } from "@/components/editor/editor-shell"
import { EditorHome } from "@/components/editor/editor-home"
import { getProjectsForUser } from "@/lib/projects"

export default async function EditorPage() {
  const projects = await getProjectsForUser()
  const ownedCount = projects.filter((project) => project.isOwned).length
  const sharedCount = projects.length - ownedCount

  return (
    <EditorShell initialProjects={projects}>
      <EditorHome
        projectCount={projects.length}
        ownedCount={ownedCount}
        sharedCount={sharedCount}
      />
    </EditorShell>
  )
}
