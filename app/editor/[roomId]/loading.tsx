export default function Loading() {
  return (
    <div className="flex h-screen w-full animate-pulse bg-[#090b0f]">
      {/* Sidebar skeleton */}
      <aside className="flex h-full w-72 flex-col border-r border-white/10">
        <div className="border-b border-white/10 px-4 py-4">
          <div className="h-4 w-24 rounded bg-white/10" />
        </div>
        <div className="flex flex-col gap-2 p-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl px-3 py-2.5">
              <div className="h-9 w-9 shrink-0 rounded-xl bg-white/10" />
              <div className="flex flex-1 flex-col gap-1.5">
                <div className="h-3 w-32 rounded bg-white/10" />
                <div className="h-2.5 w-20 rounded bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Navbar skeleton */}
      <div className="flex flex-1 flex-col">
        <div className="flex h-12 items-center border-b border-white/10 px-4 gap-3">
          <div className="h-4 w-40 rounded bg-white/10" />
          <div className="ml-auto flex gap-2">
            <div className="h-8 w-16 rounded-lg bg-white/10" />
            <div className="h-8 w-16 rounded-lg bg-white/10" />
            <div className="h-8 w-16 rounded-lg bg-white/10" />
          </div>
        </div>

        {/* Canvas skeleton */}
        <div className="relative flex-1 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:32px_32px]" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-white/10" />
            <div className="h-3 w-32 rounded bg-white/10" />
          </div>
        </div>
      </div>

      {/* AI sidebar skeleton */}
      <aside className="flex h-full w-80 flex-col border-l border-white/10">
        <div className="border-b border-white/10 px-4 py-3">
          <div className="h-4 w-20 rounded bg-white/10" />
        </div>
        <div className="flex flex-1 flex-col gap-3 p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-white/5 p-3 flex flex-col gap-2">
              <div className="h-3 w-full rounded bg-white/10" />
              <div className="h-3 w-4/5 rounded bg-white/10" />
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 p-3">
          <div className="h-9 w-full rounded-xl bg-white/10" />
        </div>
      </aside>
    </div>
  )
}
