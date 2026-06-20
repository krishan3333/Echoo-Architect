import { EditorShell } from "@/components/editor/editor-shell"

export default function Home() {
  return (
    <EditorShell>
      <div className="flex flex-1 items-center justify-center">
        <span className="text-muted-foreground">ghost AI</span>
      </div>
    </EditorShell>
  )
}
