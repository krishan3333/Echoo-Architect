"use client"

import { useOthers } from "@liveblocks/react"
import { useUser, UserButton } from "@clerk/nextjs"

export function PresenceAvatars() {
  const { user } = useUser()
  const others = useOthers()

  const collaborators = others.filter((o) => o.id !== user?.id)
  const visible = collaborators.slice(0, 5)
  const overflow = collaborators.length - 5

  return (
    <div
      style={{
        position: "absolute",
        top: 12,
        right: 16,
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        gap: 6,
        pointerEvents: "all",
      }}
    >
      {visible.length > 0 && (
        <div style={{ display: "flex", alignItems: "center" }}>
          {visible.map((other, i) => {
            const name = other.info?.name ?? "Collaborator"
            const avatar = other.info?.avatar
            const color = other.info?.cursorColor ?? "#6366f1"
            const initials = name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()

            return (
              <div
                key={other.connectionId}
                title={name}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: `2px solid ${color}`,
                  marginLeft: i === 0 ? 0 : -8,
                  overflow: "hidden",
                  background: `${color}33`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#fff",
                  flexShrink: 0,
                  boxShadow: "0 0 0 1.5px rgba(0,0,0,0.5)",
                  userSelect: "none",
                }}
              >
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatar}
                    alt={name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  initials
                )}
              </div>
            )
          })}

          {overflow > 0 && (
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "2px solid rgba(255,255,255,0.2)",
                marginLeft: -8,
                background: "rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 600,
                color: "rgba(255,255,255,0.7)",
                flexShrink: 0,
                boxShadow: "0 0 0 1.5px rgba(0,0,0,0.5)",
                userSelect: "none",
              }}
            >
              +{overflow}
            </div>
          )}
        </div>
      )}

      {collaborators.length > 0 && (
        <div
          style={{
            width: 1,
            height: 20,
            background: "rgba(255,255,255,0.15)",
            flexShrink: 0,
          }}
        />
      )}

      <UserButton />
    </div>
  )
}
