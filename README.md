# Todos UI

React + React Router + React Query UI for the Todos app.

## Stack
- React
- React Router
- React Query
- TypeScript
- Vite

## Local setup

Requires Node.js 20 or newer and Yarn Classic (1.x). Start the API separately on
`http://localhost:8080` using its README, then from this repository:

```bash
yarn install --frozen-lockfile
yarn dev
```

UI runs on `http://localhost:3000` (the port must be free). Register an account,
sign out, sign in, and add a todo. Reload to confirm it was saved. The API owns
the SQLite database and cookie sessions. Ctrl+C stops the UI; Vite reloads source edits.

## Configuration
- `VITE_API_URL` controls the API base URL.
- Defaults to `http://localhost:8080` for local API requests with cookies.
- Vite reads `.env`/`.env.local`; copy `.env.example` to `.env.local` if you need overrides, then restart Vite.
- An empty `VITE_API_URL` uses same-origin `/api/v1` requests. Vite proxies `/api` to `API_PROXY_TARGET` (default `http://localhost:8080`).
- Use the same hostname for both services; the API allows `http://localhost:3000` by default.

Example:
```bash
VITE_API_URL=http://localhost:8080
```

## Project Layout
- `src/main.tsx`: app bootstrap, router and query client
- `src/App.tsx`: layout shell
- `src/pages/TodosPage.tsx`: todos screen and UI logic
- `src/pages/LoginPage.tsx`: login screen
- `src/pages/RegisterPage.tsx`: registration screen
- `src/api/todos.ts`: API client
- `src/types.ts`: shared types

## How To Learn This UI
1. Open `src/pages/TodosPage.tsx` and find the `useQuery` call.
2. Follow it to `src/api/todos.ts` and confirm the versioned API path.
3. Find the `useMutation` calls and track what invalidates the cache.
4. Change a label and verify hot reload.
5. Add a small UI tweak and see how state flows.

## Suggested Exercises
1. Add a `TodoDetail` page and link each todo to it.
2. Add optimistic updates for toggling a todo.
3. Show counts for backlog, in‑progress, and completed todos.
4. Add a filter that syncs to the URL query string.

## Scripts
- `yarn dev`: start dev server
- `yarn build`: typecheck and build
- `yarn preview`: preview production build
- `yarn test`: run UI tests once
- `yarn test:watch`: watch mode
