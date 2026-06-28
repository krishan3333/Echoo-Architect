import { ClerkLoaded, ClerkLoading } from "@clerk/nextjs"
import { BrainCircuit, Share2, ScrollText } from "lucide-react"
import type { ReactNode } from "react"
import { Logo } from "@/components/logo"

const features = [
  {
    icon: BrainCircuit,
    title: "AI Architecture Generation",
    description:
      "Describe your system, AI maps it to nodes and edges on a live canvas.",
  },
  {
    icon: Share2,
    title: "Real-time Collaboration",
    description:
      "Live cursors, presence indicators, and shared node editing across your team.",
  },
  {
    icon: ScrollText,
    title: "Instant Spec Generation",
    description:
      "Export a complete Markdown technical spec directly from the canvas graph.",
  },
]

function LoadingScreen() {
  return (
    <main className="min-h-screen bg-bg-base flex items-center justify-center p-8">
      <div
        className="h-9 w-9 rounded-full border-2 border-border-default border-t-accent-primary animate-spin"
        aria-label="Loading authentication"
      />
    </main>
  )
}

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <>
      <ClerkLoading>
        <LoadingScreen />
      </ClerkLoading>

      <ClerkLoaded>
        <main className="min-h-screen bg-bg-base md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="hidden min-w-0 flex-col bg-bg-surface border-r border-border-default md:flex">
            <div className="px-12 pt-10">
              <div className="flex items-center gap-2.5">
                <Logo width={48} height={16} />
                <span
                  style={{ fontFamily: "'Comic Sans MS', 'Comic Sans', cursive" }}
                  className="text-2xl font-bold tracking-wide select-none"
                >
                  <span className="text-text-primary">Echoo </span>
                  <span className="text-blue-500">Architect</span>
                </span>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center px-12 py-16">
              <h1
                style={{ fontFamily: "'Comic Sans MS', 'Comic Sans', cursive" }}
                className="text-4xl font-bold leading-tight tracking-tight mb-5"
              >
                <span className="text-text-primary">Design systems at the</span>
                <br />
                <span className="text-text-primary">speed of thought.</span>
              </h1>
              <p className="text-text-secondary text-base leading-relaxed mb-12 max-w-sm">
                Describe your architecture in plain English. Echoo Architect maps it
                to a shared canvas your whole team can refine in real time.
              </p>

              <ul className="space-y-7">
                {features.map(({ icon: Icon, title, description }) => (
                  <li key={title} className="flex items-start gap-4">
                    <div className="shrink-0 h-10 w-10 rounded-xl bg-accent-primary-dim flex items-center justify-center">
                      <Icon className="h-5 w-5 text-accent-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary leading-snug">
                        {title}
                      </p>
                      <p className="text-sm text-text-muted mt-1 leading-snug">
                        {description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="px-12 pb-10">
              <p
                style={{ fontFamily: "'Comic Sans MS', 'Comic Sans', cursive" }}
                className="text-xs text-text-faint"
              >
                &copy; 2026 Echoo{" "}
                <span className="text-blue-400">Architect</span>. All rights reserved.
              </p>
            </div>
          </section>

          <section className="min-w-0 min-h-screen flex items-center justify-center p-6 sm:p-8">
            <div className="w-full max-w-md">{children}</div>
          </section>
        </main>
      </ClerkLoaded>
    </>
  )
}
