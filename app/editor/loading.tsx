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

      {/* Main content skeleton */}
      <div className="flex flex-1 flex-col">
        <div className="flex h-12 items-center border-b border-white/10 px-4 gap-3">
          <div className="h-4 w-32 rounded bg-white/10" />
          <div className="ml-auto h-8 w-20 rounded-lg bg-white/10" />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white/10" />
            <div className="h-4 w-40 rounded bg-white/10" />
            <div className="h-3 w-28 rounded bg-white/5" />
          </div>
        </div>
      </div>
    </div>
  )
}
