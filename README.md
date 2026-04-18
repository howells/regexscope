# regexscope

A visual regex debugger that lets you build find-and-replace patterns using named tokens instead of raw regex syntax. Type a pattern like `bg-{word}-{number}`, see the parsed segments highlighted in real time, test against sample text, and copy the generated regex.

## What it does

- **Token-based pattern building** -- insert wildcards like `{word}`, `{number}`, `{letter}`, `{whitespace}` etc. into a find pattern. Each token maps to a regex character class.
- **Live replacement preview** -- define a replacement string with capture references (`{1}`, `{2}`) and see the result applied to sample text immediately.
- **Generated regex output** -- the tool compiles your friendly pattern into standard regex + replacement strings, ready to copy into code or editor.
- **Example library** -- sidebar with preloaded patterns demonstrating common use cases.

## Running locally

```bash
pnpm install
pnpm dev
```

Opens at [http://localhost:28000](http://localhost:28000).

## Project structure

```
regexscope/
├── apps/
│   └── web/         # Next.js frontend
│       └── src/
│           ├── app/             # Next.js app router pages
│           ├── components/      # UI and visual-regex components
│           ├── hooks/           # useVisualRegex hook
│           └── lib/             # Token definitions, types, examples
├── biome.json       # Linting (via @howells/lint)
├── turbo.json       # Turborepo config
└── package.json
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start the web app in dev mode |
| `pnpm build` | Build all workspaces |
| `pnpm check` | Run Biome formatting and linting |
| `pnpm lint` | Lint only |
| `pnpm format` | Format only |
| `pnpm check-types` | TypeScript type checking |
