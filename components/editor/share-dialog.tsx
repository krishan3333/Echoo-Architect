"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Check, Copy, Crown, Loader2, UserMinus, UserPlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface Collaborator {
  id: string
  email: string
  name: string | null
  avatar: string | null
  isOwner?: boolean
}

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roomId: string
  isOwner: boolean
}

function CollaboratorAvatar({ name, email, avatar }: { name: string | null; email: string; avatar: string | null }) {
  const initial = (name ?? email).charAt(0).toUpperCase()
  const [imgFailed, setImgFailed] = useState(false)

  if (avatar && !imgFailed) {
    return (
      <img
        src={avatar}
        alt={name ?? email}
        className="h-8 w-8 rounded-full object-cover"
        onError={() => setImgFailed(true)}
      />
    )
  }

  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary select-none">
      {initial}
    </div>
  )
}

export function ShareDialog({ open, onOpenChange, roomId, isOwner }: ShareDialogProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [loading, setLoading] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchCollaborators = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${roomId}/collaborators`)
      if (res.ok) {
        const data = await res.json()
        setCollaborators(data.collaborators)
      }
    } finally {
      setLoading(false)
    }
  }, [roomId])

  useEffect(() => {
    if (open) fetchCollaborators()
  }, [open, fetchCollaborators])

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    const email = inviteEmail.trim().toLowerCase()
    if (!email) return
    setInviting(true)
    setInviteError(null)
    try {
      const res = await fetch(`/api/projects/${roomId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setInviteError(data.error ?? "Failed to invite")
        return
      }
      setCollaborators((prev) => [...prev, data])
      setInviteEmail("")
    } finally {
      setInviting(false)
    }
  }

  async function handleRemove(collaboratorId: string) {
    setRemovingId(collaboratorId)
    try {
      await fetch(`/api/projects/${roomId}/collaborators/${collaboratorId}`, {
        method: "DELETE",
      })
      setCollaborators((prev) => prev.filter((c) => c.id !== collaboratorId))
    } finally {
      setRemovingId(null)
    }
  }

  function handleCopyLink() {
    const url = `${window.location.origin}/editor/${roomId}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share project</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 pt-1">
          {/* Copy link */}
          <div className="flex gap-2">
            <Input
              readOnly
              value={typeof window !== "undefined" ? `${window.location.origin}/editor/${roomId}` : ""}
              className="text-xs text-text-muted"
            />
            <Button
              variant="outline"
              size="sm"
              className={cn("shrink-0 gap-1.5", copied && "text-green-500")}
              onClick={handleCopyLink}
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>

          {/* Invite form — owners only */}
          {isOwner && (
            <form onSubmit={handleInvite} className="flex flex-col gap-2">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wide">
                Invite by email
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="colleague@example.com"
                  value={inviteEmail}
                  onChange={(e) => {
                    setInviteEmail(e.target.value)
                    setInviteError(null)
                  }}
                  disabled={inviting}
                  className="flex-1"
                />
                <Button type="submit" size="sm" disabled={inviting || !inviteEmail.trim()} className="gap-1.5 shrink-0">
                  {inviting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
                  Invite
                </Button>
              </div>
              {inviteError && (
                <p className="text-xs text-destructive">{inviteError}</p>
              )}
            </form>
          )}

          {/* Member list */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide">
              Members {collaborators.length > 0 && `(${collaborators.length})`}
            </p>

            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-text-muted" />
              </div>
            ) : collaborators.length === 0 ? (
              <p className="py-4 text-center text-xs text-text-muted">No members yet.</p>
            ) : (
              <ScrollArea className="max-h-48">
                <div className="flex flex-col gap-1 pr-2">
                  {collaborators.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-muted/40"
                    >
                      <CollaboratorAvatar name={c.name} email={c.email} avatar={c.avatar} />
                      <div className="flex min-w-0 flex-col leading-none gap-0.5">
                        {c.name && (
                          <span className="text-sm font-medium text-text-primary truncate">{c.name}</span>
                        )}
                        <span className={cn("text-xs text-text-muted truncate", !c.name && "text-sm text-text-primary")}>
                          {c.email}
                        </span>
                      </div>
                      {c.isOwner ? (
                        <span className="ml-auto flex shrink-0 items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                          <Crown className="h-2.5 w-2.5" />
                          Owner
                        </span>
                      ) : isOwner ? (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="ml-auto shrink-0 text-text-muted hover:text-destructive"
                          onClick={() => handleRemove(c.id)}
                          disabled={removingId === c.id}
                          aria-label={`Remove ${c.name ?? c.email}`}
                        >
                          {removingId === c.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <UserMinus className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      ) : null}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
