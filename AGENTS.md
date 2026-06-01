# AGENTS.md

## Cursor Cloud specific instructions

### Product overview

Single-package **Inkgram Web Design Demo** — a React + Vite SPA with mock Telegram-style UI and an e-ink device sandbox. No backend, database, Docker, or environment variables. See `README.md` for product context.

### Services

| Service | Required | Notes |
|---------|----------|--------|
| Vite dev server | **MUST** for interactive dev | `npm run dev` (default `http://localhost:5173`) |
| Static preview | Optional | `npm run build` then `npx vite preview` (no `preview` script in `package.json`) |

### Dependencies

- Use **npm** (`package-lock.json` is the lockfile). `pnpm` is configured via `pnpm-workspace.yaml` but README and lockfile target npm.
- `react` / `react-dom` are optional peer dependencies; `npm install` pulls them in via the lockfile.

### Lint / test

This repo has **no** `lint`, `test`, or ESLint scripts in `package.json`. Validation for agents: `npm run build` and manual or browser-based UI checks against `npm run dev`.

### Dev server (non-obvious)

- For Cloud Agent / VM access from outside the process, bind the host: `npm run dev -- --host 0.0.0.0`.
- Prefer a **tmux** session (e.g. `vite-dev-server`) for long-running `npm run dev` so the process survives disconnects.
- Re-running `npm install` does not require restarting Vite if only app source changed; Vite HMR handles `src/` edits. Restart after dependency or `vite.config.ts` changes.

### Hello-world smoke test

1. `npm install` && `npm run dev -- --host 0.0.0.0`
2. Open the app in a browser.
3. Toggle an e-ink control (e.g. portrait ↔ landscape).
4. Open a chat and send a message (mock data only).
