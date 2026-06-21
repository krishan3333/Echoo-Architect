# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Phase 4: Data Layer

## Current Goal

- Editor home wired to real project API.

## Completed

- 01-design-system: shadcn/ui configured (Tailwind v4), Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea installed, lucide-react installed, lib/utils.ts with cn() created, dark class applied to <html>.
- 02-editor: EditorNavbar (fixed h-12 bar, PanelLeftOpen/PanelLeftClose toggle, z-40) and ProjectSidebar (fixed overlay, slides from left, isOpen/onClose props, My Projects + Shared tabs with empty states, New Project button) created. Dialog pattern confirmed ready via existing components/ui/dialog.tsx.
- 03-auth: @clerk/ui installed, ClerkProvider wraps root layout with dark theme (from @clerk/ui/themes) + CSS variable overrides (no hardcoded colors), proxy.ts at root protects all routes except /, /sign-in/*, /sign-up/*, two-panel sign-in/sign-up pages (left panel hidden on mobile), app/editor/page.tsx is the protected editor route, root page redirects auth→/editor unauth→/sign-in, UserButton in navbar right section. npm run build passes.
- 05-prisma: Project and ProjectCollaborator models in prisma/models/project.prisma (multi-file schema), migration applied (20260621143156_init), Prisma Client generated to app/generated/prisma/, lib/prisma.ts singleton branching on prisma+postgres:// for Accelerate vs @prisma/adapter-pg for direct TCP. tsc --noEmit clean.
- 06-project-apis: REST endpoints — GET /api/projects (list owner's projects), POST /api/projects (create, defaults name to "Untitled Project"), PATCH /api/projects/[projectId] (rename, owner-only), DELETE /api/projects/[projectId] (delete, owner-only). 401 for unauthenticated, 403 for non-owner mutations. npm run build passes.
- 07-wire-editor-home: app/editor/page.tsx is now a server component fetching owned+shared projects via lib/projects.ts (getProjectsForUser). hooks/use-project-actions.ts replaces the mock hook — create calls POST /api/projects with a slug-suffix room ID and navigates to /editor/[id], rename calls PATCH + router.refresh(), delete calls DELETE + redirects to /editor if active project else refresh. POST API accepts optional id to keep project ID and room ID aligned. Create dialog shows room ID preview, rename pre-fills name, delete shows project name. npm run build passes.

## In Progress

- None.

## Recently Completed

- 07-wire-editor-home: sidebar wired to real DB data, full create/rename/delete flows with real API.

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
