# MCPiscine — Monorepo MCP Workshop — Design

## Context

Build a monorepo for a TypeScript MCP workshop ("MCPiscine") for 42AI students. Participants
start with a working agent (provided, untouched) and implement MCP tools step by step.

The repo currently has uncommitted `README.md` / `package.json` describing an older, different
design (`client/` + `server/` folders, 4-step exercise). Per user decision, these are fully
replaced by the design below — the old content is discarded, not merged.

## Phasing

The full target is a 3-package monorepo (`agent`, `step-1-calculator`, `step-2-42api`), but per
user request this round only builds and verifies **Phase 1**. Phase 2 is specified here for
reference so a future session can implement it without re-deriving the design.

- **Phase 1 (build now):** root scaffold + `agent/` + `step-1-calculator/`, fully implemented and
  manually verified end-to-end.
- **Phase 2 (build later):** `step-2-42api/`. The instructor provisions one 42 OAuth app for the
  session; students only paste the provided `client_id`/`client_secret` into `step-2-42api/.env` —
  no app-creation step for them.

## Target monorepo structure

```
mcpiscine/
├── package.json              # npm workspaces root
├── README.md
├── .gitignore
├── CLAUDE.md                  # written during implementation, not brainstorming
├── agent/
│   ├── src/index.ts           # MCP client + agentic loop (provided, do not touch)
│   ├── .env.example           # ANTHROPIC_API_KEY
│   ├── package.json
│   └── tsconfig.json
├── step-1-calculator/         # Phase 1
│   ├── src/index.ts           # skeleton with TODOs
│   ├── src/index.solution.ts  # full solution
│   ├── package.json
│   └── tsconfig.json
└── step-2-42api/              # Phase 2 — not built this round
    ├── src/index.ts
    ├── src/index.solution.ts
    ├── .env.example           # FORTY_TWO_CLIENT_ID, FORTY_TWO_CLIENT_SECRET
    ├── package.json
    └── tsconfig.json
```

## Root config

- `package.json`: `"type": "module"`; `"workspaces"` is `["agent", "step-1-calculator"]` for
  Phase 1 (add `"step-2-42api"` when Phase 2 starts — npm errors on workspace entries that don't
  resolve to a real package, so it must not be listed before the folder exists). Keep the
  existing repo metadata (`homepage`, `bugs`, `repository`, `license`) from the current
  `package.json`. Drop the current bogus `"node"` runtime dependency.
- Shared dev tooling (`typescript`, `tsx`, `@types/node`) lives in **root** `devDependencies`,
  hoisted by npm workspaces, instead of being duplicated in every package.
- `.gitignore`: `node_modules`, `.env`, `dist`, `.DS_Store`.

## agent/src/index.ts (Phase 1, fully implemented)

- Takes the MCP server entry path as `process.argv[2]`.
- Spawns it via `StdioClientTransport` running `npx tsx <serverPath>` as a child process.
- Calls `client.listTools()` on startup, prints the discovered tools (the agent is a CLI client,
  not an MCP server, so stdout is not reserved for the protocol here — unlike the servers in
  step-1/step-2, which must only use `console.error` for debug output).
- Converts each MCP tool (`name`, `description`, `inputSchema`) directly into an Anthropic `tool`
  block — 1:1 mapping, since MCP already emits JSON-schema-compatible input schemas.
- Runs a `readline` REPL maintaining full conversation history across turns. Per user message:
  1. Append the user message, call `anthropic.messages.create()` with full history + tools,
     French system prompt, model `claude-sonnet-4-6`, `max_tokens: 4096`.
  2. If `stop_reason === "tool_use"`: run every `tool_use` block through `client.callTool()`,
     collect results into one `tool_result` user message (matching `tool_use_id`, setting
     `is_error` when a call fails), append, and loop back to step 1 without waiting for input.
  3. If `stop_reason === "end_turn"`: print the assistant's text and wait for the next input.
- Error handling: a failed spawn (bad server path) is caught and printed as one actionable
  message before exiting; a thrown tool call is caught and surfaced as `is_error: true` in the
  tool result instead of crashing the REPL.

## step-1-calculator (Phase 1)

- `src/index.solution.ts`: full solution. `add(a: number, b: number)` → `a + b`,
  `multiply(a: number, b: number)` → `a * b`, each returned as
  `{ content: [{ type: "text", text: String(result) }] }`.
- `src/index.ts`: skeleton. Server boilerplate and tool registration (name, description, zod
  param shape) are fully written for both tools, exactly like the solution. Only the handler
  bodies differ: each is replaced with an explicit `// TODO: ...` comment plus
  `throw new Error("TODO: implémente add() dans index.ts")`. This means a participant who runs
  the agent before writing any code immediately sees their own TODO message come back through
  Claude — confirming the whole pipeline (agent ↔ server ↔ tool discovery) works before they've
  implemented anything.
- `package.json`: deps `@modelcontextprotocol/sdk`, `zod`; `"type": "module"`.
- `tsconfig.json`: `target: ES2022`, `module: NodeNext`, `moduleResolution: NodeNext`,
  `strict: true`.

## step-2-42api (Phase 2 — specified for reference, not implemented this round)

- `getAccessToken()`: per user instruction, does
  `fetch("https://api.intra.42.fr/oauth/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "client_credentials", client_id: process.env.FORTY_TWO_CLIENT_ID, client_secret: process.env.FORTY_TWO_CLIENT_SECRET }) })`,
  caches `{ token, expiresAt }` at module scope, refetches once `Date.now() >= expiresAt`.
- `api42<T>(endpoint, params)`: generic authenticated fetch helper, throws a readable error
  (status + body) on a non-2xx response.
- `get_user_profile` (the TODO in the skeleton): `GET /v2/users/:login`, formats
  `displayname`, `login`, level (from `cursus_users.find(cu => cu.cursus.name === "42cursus")`),
  `wallet`, `correction_point`, and campus name into a text summary. A 404 returns an MCP
  `isError: true` result rather than throwing, so the server process stays alive.
- Skeleton TODO follows the same convention as step-1 (throws a clear not-implemented error).
- `.env.example`: `FORTY_TWO_CLIENT_ID=`, `FORTY_TWO_CLIENT_SECRET=`.

## README.md (Phase 1 scope)

Rewritten in French to match the new structure, but only documents what exists after this round
(agent + step-1-calculator: setup, run command, exercise instructions). No step-2 section yet —
avoids dangling references to files that don't exist. Gets extended when Phase 2 lands.

## CLAUDE.md

Written during implementation (not during this brainstorming step) from the user's original
pasted spec, lightly cleaned, covering both phases — durable conventions for future sessions
working in this repo.

## Verification plan (Phase 1, no test framework per user instruction)

1. `npm install` at the repo root.
2. `cd agent && npx tsx src/index.ts ../step-1-calculator/src/index.solution.ts`, then ask
   "combien font 3 + 4 ?" and "et 6 fois 7 ?" — confirm correct tool calls and results.
3. `cd agent && npx tsx src/index.ts ../step-1-calculator/src/index.ts` (skeleton) — confirm the
   TODO error surfaces cleanly through the agent instead of crashing the REPL.

## Decisions confirmed this round

- OAuth request shape confirmed by user: POST to `https://api.intra.42.fr/oauth/token`,
  form-encoded `grant_type` / `client_id` / `client_secret`, credentials from `.env`.
- Scope narrowed: implement and verify `agent` + `step-1-calculator` only; `step-2-42api`
  implementation is deferred to a later session.
