@AGENTS.md

# CLAUDE.md

Guidance for working in this repository (the **web frontend** of Squish, the video compressor project).

## What this is

Squish compresses videos in the cloud: users upload via S3 presigned URLs, Fargate workers run ffmpeg, and the result is downloaded back via presigned URLs. This package (`web/`) is the Next.js frontend; `../api/` is the NestJS control-plane API (auth, presigned URLs, compression lifecycle in Postgres).

## Tech stack

- **Framework:** Next.js 16.2 (App Router, React 19, React Compiler enabled)
- **Styling:** Tailwind CSS 4 + shadcn components (`components/ui/`), theme already configured in `app/globals.css`
- **Primitives:** @base-ui/react, class-variance-authority, lucide-react icons

## Design source of truth

The UI follows the Claude Design project **"Compressor de vídeo web"** (`https://claude.ai/design/p/e10bda9c-661e-42d8-bb2a-aea102d31b50`), file **`Squish - Final.dc.html`** — read it via the claude_design MCP / DesignSync tool. Key facts:

- **Screens:** Landing (hero + drag-and-drop upload, MP4/WebM/MOV up to **500 MB**), Compressing (two phases: "Enviando" with real upload % bar, then "Comprimindo" with an indeterminate pulsing bar + rotating status lines — no MB/ETA numbers; cancel only during upload; error card with retry), Result (before/after + download + 24h-retention notice + signup invite banner; no output-format selector), History (table with stats, per-row download/copy-link/delete — no recompress; "Expirado" state for expired rows), plus a bottom toast.
- **Look:** purple primary (`#7C3AED`), light/dark themes via CSS variables, playful rotated badges/confetti. Fonts: Bricolage Grotesque (display), Plus Jakarta Sans (body), JetBrains Mono (numbers/meta).
- UI copy is in **Portuguese** (product voice: "squish", "espremer").
- **Retention:** compressed files are deleted after **1 day** (API cron marks rows `EXPIRED` and removes S3 objects — `api/src/modules/cleanup/cleanup.service.ts`). The UI surfaces this ("Disponível por 24h", "Expirado" rows).

## API (backend contract)

Base: NestJS API in `../api` (Swagger at its root). Auth via better-auth session cookies (`/api/auth/*` routes handled by better-auth). Endpoints:

- `POST /compressor` — create compression (`PENDING_UPLOAD`), returns presigned S3 upload URL. Client then PUTs the file to S3.
- `POST /compressor/confirm-upload` — after upload, transitions the row to `QUEUED`.
- `GET /compressor` — list the user's compressions.
- `SSE /compressor/:id/stream` — status stream; emits on each change, closes at `COMPLETED`/`FAILED`.
- `POST /compressor/download` — presigned S3 download URL for a `COMPLETED` compression.

Status lifecycle: `PENDING_UPLOAD → QUEUED → PROCESSING → COMPLETED | FAILED`, plus `EXPIRED` set by the cleanup crons (stale uploads/failures after 5 min; completed files after 1 day). File sizes are BigInt (serialized as strings); compression ratio is derived (`outputSize / sourceSize`), never stored. Note: `POST /compressor/download` returns the presigned URL as plain text, not JSON.

## Commands

```bash
npm run dev     # dev server
npm run build   # production build
npm run lint    # eslint
```

## Language

Code, comments, commits, and CI are written in English. Only docs under `docs/` are in Portuguese. UI copy (user-facing strings) is in Portuguese.

## GitHub

- Issues and pull requests are managed on GitHub via the `gh` CLI.
- Open a PR against `develop`; PRs are reviewed before merge.
- PR titles/descriptions follow Conventional Commits (see below).

## Git workflow

- Development branches (feature, fix, refactor, chore, etc.) always branch off `develop` — never off `main`.
- Branch names, commit messages, and PR titles/descriptions are written in English, following [Conventional Commits](https://www.conventionalcommits.org/) (e.g. `feat:`, `fix:`, `refactor:`, `chore:`).
