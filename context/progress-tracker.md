# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Phase 8: Base Canvas

## Current Goal

- Collaborative React Flow canvas live in the workspace, backed by Liveblocks storage.

## Completed

- 01-design-system: shadcn/ui configured (Tailwind v4), Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea installed, lucide-react installed, lib/utils.ts with cn() created, dark class applied to <html>.
- 02-editor: EditorNavbar (fixed h-12 bar, PanelLeftOpen/PanelLeftClose toggle, z-40) and ProjectSidebar (fixed overlay, slides from left, isOpen/onClose props, My Projects + Shared tabs with empty states, New Project button) created. Dialog pattern confirmed ready via existing components/ui/dialog.tsx.
- 03-auth: @clerk/ui installed, ClerkProvider wraps root layout with dark theme (from @clerk/ui/themes) + CSS variable overrides (no hardcoded colors), proxy.ts at root protects all routes except /, /sign-in/*, /sign-up/*, two-panel sign-in/sign-up pages (left panel hidden on mobile), app/editor/page.tsx is the protected editor route, root page redirects auth→/editor unauth→/sign-in, UserButton in navbar right section. npm run build passes.
- 05-prisma: Project and ProjectCollaborator models in prisma/models/project.prisma (multi-file schema), migration applied (20260621143156_init), Prisma Client generated to app/generated/prisma/, lib/prisma.ts singleton branching on prisma+postgres:// for Accelerate vs @prisma/adapter-pg for direct TCP. tsc --noEmit clean.
- 06-project-apis: REST endpoints — GET /api/projects (list owner's projects), POST /api/projects (create, defaults name to "Untitled Project"), PATCH /api/projects/[projectId] (rename, owner-only), DELETE /api/projects/[projectId] (delete, owner-only). 401 for unauthenticated, 403 for non-owner mutations. npm run build passes.
- 07-wire-editor-home: app/editor/page.tsx is now a server component fetching owned+shared projects via lib/projects.ts (getProjectsForUser). hooks/use-project-actions.ts replaces the mock hook — create calls POST /api/projects with a slug-suffix room ID and navigates to /editor/[id], rename calls PATCH + router.refresh(), delete calls DELETE + redirects to /editor if active project else refresh. POST API accepts optional id to keep project ID and room ID aligned. Create dialog shows room ID preview, rename pre-fills name, delete shows project name. npm run build passes.
- 08-editor-workspace-shell: app/editor/[roomId]/page.tsx server component — unauthenticated users redirect to /sign-in, missing/unauthorized projects render AccessDenied. lib/project-access.ts provides getCurrentIdentity() + getProjectWithAccess(). WorkspaceShell client component renders full-viewport layout: WorkspaceNavbar (project name, share button, AI sidebar toggle), ProjectSidebar with activeRoomId highlighting, canvas placeholder, AI sidebar placeholder. npm run build passes.
- 09-share-dialog: Share button in WorkspaceNavbar opens ShareDialog. GET/POST /api/projects/[projectId]/collaborators and DELETE /api/projects/[projectId]/collaborators/[collaboratorId] enforce ownership server-side. Collaborator emails enriched with Clerk display name + avatar via clerkClient().users.getUserList. Owners can invite by email, view list with avatars/names, remove collaborators. Collaborators see read-only list. Copy-link button with "Copied!" feedback. ProjectAccess.isOwner added; page passes isOwner to WorkspaceShell. npm run build passes.
- 10-liveblocks-setup: liveblocks.config.ts defines Presence (cursor + isThinking) and UserMeta (name, avatar, cursorColor). lib/liveblocks.ts is a cached Liveblocks node client with getUserCursorColor() that deterministically maps userId to a fixed 8-color palette. POST /api/liveblocks-auth requires Clerk auth, verifies project access via getProjectWithAccess(), ensures room exists (creates if missing), and returns a session token with user name/avatar/cursorColor. Returns 403 for unauthorized access. npm run build passes.
- 11-base-canvas: types/canvas.ts defines NodeData (label, color, shape), CanvasNode, CanvasEdge. components/editor/canvas.tsx uses useLiveblocksFlow({ suspense: true }) wired into ReactFlow with dot Background + MiniMap. components/editor/canvas-wrapper.tsx wraps with LiveblocksErrorBoundary + LiveblocksProvider (/api/liveblocks-auth) + RoomProvider (initialPresence cursor: null, isThinking: false) + ClientSideSuspense. WorkspaceShell canvas placeholder replaced with CanvasWrapper. npm run build passes.
- 12-shape-panel: ShapeType union (rectangle | diamond | circle | pill | cylinder | hexagon) added to types/canvas.ts. components/editor/shape-panel.tsx renders a floating pill toolbar at bottom-center with 6 draggable shape buttons; drag payload (application/ghost-shape) carries shape + default size. canvas.tsx adds CanvasNodeComponent (simple bordered rectangle with centered label) registered as "canvasNode", onDragOver + onDrop handlers using screenToFlowPosition to convert drop position, node IDs as shape-timestamp-counter. ReactFlowProvider added in canvas-wrapper.tsx so useReactFlow() has context above ReactFlow. npm run build passes.

## In Progress

- None.

## Recently Completed

- 12-shape-panel: Floating shape toolbar with drag-to-canvas node creation; custom canvasNode renderer.

## Next Up

- Add the next planned feature unit here.

## Open Questions

- None yet.

## Architecture Decisions

- Using shadcn/ui with Tailwind v4 (CSS-variable-based theming, no tailwind.config.js)
- Dark theme enforced via CSS variables on :root in globals.css
- Auth via Clerk — proxy.ts (Next.js 16 renamed middleware.ts → proxy.ts), ClerkProvider in root layout
- Clerk appearance uses @clerk/ui/themes dark + CSS variable overrides, no hardcoded colors
- Prisma v7 multi-file schema (prisma/ dir, prisma.config.ts); client generated to app/generated/prisma/; lib/prisma.ts branches on prisma+postgres:// (accelerateUrl) vs postgres:// (@prisma/adapter-pg)

## Session Notes

- Next.js 16.2.9 / React 19.2.4 / Tailwind v4 — no tailwind.config.js, uses @import "tailwindcss" and @theme blocks
- Next.js 16 renamed middleware.ts to proxy.ts (confirmed in node_modules/next/dist/docs/)
- @clerk/ui/themes: use `theme:` key (not `baseTheme:`) in ClerkProvider appearance
