import { EditorShell } from "@/components/editor/editor-shell"
import { EditorHome } from "@/components/editor/editor-home"
import { getProjectsForUser } from "@/lib/projects"

export default async function EditorPage() {
  const projects = await getProjectsForUser()

  return (
    <EditorShell initialProjects={projects}>
      <EditorHome />
    </EditorShell>
  )
}
