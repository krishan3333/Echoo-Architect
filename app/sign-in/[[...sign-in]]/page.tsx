import { SignIn } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

import { AuthShell } from "@/components/auth/auth-shell"

export default async function SignInPage() {
  const { isAuthenticated } = await auth()

  if (isAuthenticated) {
    redirect("/editor")
  }

  return (
    <AuthShell>
      <SignIn forceRedirectUrl="/editor" fallbackRedirectUrl="/editor" />
    </AuthShell>
  )
}
