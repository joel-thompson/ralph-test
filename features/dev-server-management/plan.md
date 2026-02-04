# PRD: Dev Server Management (`ral service …`)

## 1. Introduction / Overview

Ralph (`ral`) is an AI-assisted development loop CLI. When working on a real project (e.g. a Vite + React app), tasks often require a running dev server for verification, log inspection, and quick iteration.

However, asking the AI agent to run dev servers directly (e.g. `pnpm dev`) is unreliable because those commands are long-running and commonly cause hangs or blocked loops.

This PRD defines a **service management API inside `ral`** that the AI agent can call to **start**, **stop**, **check status**, and **fetch logs** for a project dev server in a way that is:

- Bounded (commands return quickly)
- Reliable (does not hang the loop)
- Deterministic for the agent (machine-readable status output available)
- Configurable per project via `ral.json`

For v1, the backend is **Docker Compose only** (with an intentionally stable interface that can support non-Docker backends later).

## 2. Goals

- Provide a stable CLI interface for the agent: `ral service start|stop|status|logs <name>`.
- Ensure service start/stop/status/logs commands **do not hang** by default.
- Allow users to configure services in `ral.json` (Compose file, service name, working directory, healthcheck).
- Make `status` verifiable via both:
  - “running” (Compose reports service exists / is up)
  - “healthy” (HTTP check against a configured URL with timeout)
- Make log access safe by default: **tail N lines and exit**.
- Enable machine-readable output (`--json`) for agent decision-making.

## 3. User Stories

### US-001: Configure a dev server service in `ral.json`
**Description:** As a user, I want to describe my project’s dev server in `ral.json` so the agent can control it consistently across runs.

**Acceptance Criteria:**
- [ ] Define a `services` section in `ral.json` that supports at least one service type: `docker-compose`.
- [ ] A service definition can specify: `cwd`, `composeFile`, `service`, `healthcheckUrl`.
- [ ] Validation errors are user-friendly (missing fields, file not found, invalid URL).
- [ ] Typecheck passes
- [ ] Lint passes

### US-001a: Document configuration + commands (README)
**Description:** As a user, I want clear documentation for how to configure `services` in `ral.json` and which `ral service …` commands the agent should run.

**Acceptance Criteria:**
- [ ] Update `README.md` to document the `services` field in `ral.json`, including a Vite + React example (`type`, `cwd`, `composeFile`, `service`, `healthcheckUrl`).
- [ ] Update `README.md` to document `ral service start|stop|status|logs`, including example invocations.
- [ ] Typecheck passes
- [ ] Lint passes

### US-002: Start a service (non-blocking)
**Description:** As the agent, I want to start the dev server via `ral service start web` so that the server runs in the background and the loop can continue.

**Acceptance Criteria:**
- [ ] `ral service start <name>` returns within a bounded time (e.g. a default timeout).
- [ ] If the service is already running, the command is idempotent (returns success with “already running” semantics).
- [ ] If Docker is not available / daemon not running, returns a clear actionable error.
- [ ] Typecheck passes
- [ ] Lint passes

### US-003: Stop a service (non-blocking)
**Description:** As the agent, I want to stop the dev server via `ral service stop web` so I can reset state or free ports during iteration.

**Acceptance Criteria:**
- [ ] `ral service stop <name>` returns within a bounded time.
- [ ] If the service is not running, returns success with “already stopped” semantics (idempotent).
- [ ] Typecheck passes
- [ ] Lint passes

### US-004: Check service status with health verification
**Description:** As the agent, I want `ral service status web` to tell me whether the server is running and whether the HTTP endpoint responds, so I can decide whether to start/restart or proceed with verification.

**Acceptance Criteria:**
- [ ] `ral service status <name>` reports at minimum: `running` and `healthy` (where `healthy` is based on an HTTP check to `healthcheckUrl`).
- [ ] Healthcheck uses a bounded timeout and returns `healthy=false` on timeout/non-2xx.
- [ ] Supports `--json` output with stable fields.
- [ ] Typecheck passes
- [ ] Lint passes

### US-005: Fetch logs safely (tail-and-exit default)
**Description:** As the agent, I want `ral service logs web --tail 200` to fetch recent logs without attaching forever, so I can debug test failures quickly.

**Acceptance Criteria:**
- [ ] Default behavior tails a finite number of lines and exits (e.g. 200).
- [ ] `--tail <n>` overrides the number of lines.
- [ ] Supports `--json` output option (at least for metadata; log lines may remain plain text in v1 if needed).
- [ ] Typecheck passes
- [ ] Lint passes

### US-006: Add “don’t run dev servers directly” guidance to prompt template(s)
**Description:** As a user, I want the scaffolded `prompt.md` (and/or recommended prompt guidance) to instruct agents not to run `pnpm dev` / `vite` directly, and to use `ral service …` instead, so the loop does not hang.

**Acceptance Criteria:**
- [ ] Update the appropriate `prompt.md` template(s) to include guidance: “Do not start dev servers directly; use `ral service start|stop|status|logs`.”
- [ ] Guidance is concise and placed near other operational constraints.
- [ ] Typecheck passes
- [ ] Lint passes

## 4. Functional Requirements

- **FR-1:** Add a new command group `ral service` with subcommands: `start`, `stop`, `status`, `logs`.
- **FR-2:** `ral service <subcommand> <name>` must resolve `<name>` from `ral.json` `services`.
- **FR-3:** v1 supports service type **`docker-compose`** only.
- **FR-4:** `start` must run the equivalent of `docker compose up -d` for the configured service.
- **FR-5:** `stop` must run the equivalent of `docker compose stop` for the configured service.
- **FR-6:** `logs` must run the equivalent of `docker compose logs --tail N` for the configured service.
- **FR-7:** `status` must combine:
  - Compose-level running state (from `docker compose ps` or equivalent, e.g. `docker compose ps --status running --format json`)
  - HTTP healthcheck to `healthcheckUrl` with timeout
- **FR-8:** All service commands must be bounded:
  - default command timeout (configurable)
  - `logs` defaults to tail-and-exit
- **FR-9:** All service commands should support `--json` output for agent consumption.
- **FR-10:** `README.md` must document both:
  - the `services` config shape in `ral.json`
  - the `ral service …` commands and examples

## 5. Non-Goals (Out of Scope)

- No native process backend in v1 (no PID files / tree-kill).
- No Kubernetes, Nomad, or remote deployment support.
- No generic “run arbitrary docker commands” capability (keep scope to configured services only).
- No automatic changes to the target project (no generating Dockerfiles/compose automatically in v1).
- No automatic integration into `ral run-json` (v1 focuses on agent-invoked commands only).

## 6. Design Considerations

- **Agent prompt guidance:** `prompt.md` templates should instruct agents:
  - never start dev servers directly (`pnpm dev`, `vite`, etc.)
  - use `ral service start|stop|status|logs`
- **Idempotency:** start/stop should be safe to call repeatedly.
- **Defaults that prevent hangs:** logs must not “follow” by default.
- **Ergonomics:** keep service naming simple (`web`, `api`, `db`).

## 7. Technical Considerations

- **Compose invocation:**
  - Prefer `docker compose` (v2) but consider compatibility messaging if only `docker-compose` exists.
  - Note: `docker compose ps --format json` may emit newline-delimited JSON objects in some versions; parsing should not assume a single JSON array.
- **Working directory:**
  - Allow a per-service `cwd` so Compose runs in the correct project directory.
- **Healthcheck:**
  - Use Node’s HTTP client (`fetch`) with a short timeout.
  - For a Vite app, typical URL is `http://localhost:5173/`.
- **Output contract (`--json`):**
  - Provide stable keys like:
    - `name`, `type`, `running`, `healthy`, `healthcheckUrl`, `composeFile`, `composeService`
    - For logs, include metadata and emit `lines` as an array if feasible.
- **Recursion guardrails:**
  - Explicitly document (and ideally enforce) that agents should not call `ral run` / `ral run-json`.
  - Optionally, set an env var in run loops to prevent nested loop invocation.

## 8. Success Metrics

- The agent can reliably:
  - start the dev server
  - confirm it is healthy
  - fetch recent logs
  - stop it
  without hanging the loop.
- 0 known cases of `ral service …` commands blocking indefinitely under normal conditions.
- Users can add support for a new project by editing only `ral.json` and existing Compose files.

## 9. Open Questions

- Should `--json` be required for agent usage (vs optional)?
- Should `status` return non-zero exit code when `healthy=false` (useful for scripting)?
- Should we add `ral service restart` in v1 or defer?
- Should `logs` support `--since <duration>` or is `--tail` sufficient for v1?
