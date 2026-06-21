const PROJECT_TONES = [
  {
    icon: "bg-cyan-500/14 text-cyan-200 ring-cyan-400/20",
    pill: "border-cyan-400/20 bg-cyan-500/10 text-cyan-100",
    active: "border-cyan-400/20 bg-cyan-500/10",
    dot: "bg-cyan-400",
  },
  {
    icon: "bg-violet-500/14 text-violet-200 ring-violet-400/20",
    pill: "border-violet-400/20 bg-violet-500/10 text-violet-100",
    active: "border-violet-400/20 bg-violet-500/10",
    dot: "bg-violet-400",
  },
  {
    icon: "bg-emerald-500/14 text-emerald-200 ring-emerald-400/20",
    pill: "border-emerald-400/20 bg-emerald-500/10 text-emerald-100",
    active: "border-emerald-400/20 bg-emerald-500/10",
    dot: "bg-emerald-400",
  },
  {
    icon: "bg-amber-500/14 text-amber-200 ring-amber-400/20",
    pill: "border-amber-400/20 bg-amber-500/10 text-amber-100",
    active: "border-amber-400/20 bg-amber-500/10",
    dot: "bg-amber-400",
  },
  {
    icon: "bg-rose-500/14 text-rose-200 ring-rose-400/20",
    pill: "border-rose-400/20 bg-rose-500/10 text-rose-100",
    active: "border-rose-400/20 bg-rose-500/10",
    dot: "bg-rose-400",
  },
]

function hashString(value: string) {
  let hash = 0

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }

  return hash
}

export function getProjectTone(seed: string) {
  return PROJECT_TONES[hashString(seed) % PROJECT_TONES.length]
}
