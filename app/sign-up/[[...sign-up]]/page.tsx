import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div className="flex flex-1">
      <div className="hidden lg:flex w-80 shrink-0 flex-col justify-center border-r border-border px-12">
        <span className="mb-3 text-xl font-semibold tracking-tight text-foreground">
          ghost AI
        </span>
        <p className="mb-10 text-sm leading-relaxed text-muted-foreground">
          Your intelligent writing companion.
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>AI-powered document editing</li>
          <li>Contextual suggestions in real time</li>
          <li>Project and file management</li>
        </ul>
      </div>
      <div className="flex flex-1 items-center justify-center p-8">
        <SignUp />
      </div>
    </div>
  )
}
