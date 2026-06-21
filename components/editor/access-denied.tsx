import { Lock } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"

export function AccessDenied() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
      <Lock className="h-12 w-12 text-text-muted" />
      <h1 className="text-xl font-semibold text-text-primary">Access Denied</h1>
      <p className="text-sm text-text-muted">
        This project doesn&apos;t exist or you don&apos;t have permission to view it.
      </p>
      <Link href="/editor" className={buttonVariants({ variant: "outline", size: "sm" })}>
        Back to Editor
      </Link>
    </div>
  )
}
