# Repository Guidelines

## Project Structure & Module Organization
- `apps/web/` -- Next.js frontend (App Router, Tailwind v4, shadcn/ui)
- `apps/web/src/components/visual-regex/` -- Core visual regex builder components
- `apps/web/src/hooks/` -- React hooks (useVisualRegex)
- `apps/web/src/lib/visual-regex/` -- Token definitions, types, examples

## Build, Test, and Development Commands
- `pnpm install` -- Install dependencies
- `pnpm dev` -- Start web app in dev mode (port 28000)
- `pnpm build` -- Build all workspaces
- `pnpm check` -- Biome formatting and linting
- `pnpm lint` -- Lint only
- `pnpm format` -- Format only
- `pnpm check-types` -- TypeScript type checking

## Coding Style & Naming Conventions
- Language: TypeScript
- Indentation: tabs, via Biome
- Files: kebab-case
- Variables/functions: `camelCase`; components: `PascalCase`
- Linting: `@howells/lint` (Biome + Ultracite presets). Run `pnpm check` before committing.

## Commit Guidelines
- Conventional Commits (e.g., `feat: add URL path parser`, `fix(patterns): handle edge case`)
- Keep PRs small and scoped

## Security & Performance
- Guard against ReDoS: prefer atomic tokens, reluctant quantifiers, and anchors
- Avoid nested catastrophic patterns
