# SYMBI Resonate Demo Playbook

This guide helps you stand up a reliable demo environment with sample data, guarded endpoints, and quick validation steps.

## 1) Configure environment
- Copy `.env.demo` to `.env` (or `.env.local`) and adjust Supabase keys if you have a hosted project. The defaults enable `DEMO_MODE=true`, which bypasses auth for local walkthroughs only.
- Ensure both `SUPABASE_URL` and `SUPABASE_ANON_KEY` (or `SUPABASE_SERVICE_ROLE_KEY`) are present; the edge auth middleware will return a 500 if they’re missing when `DEMO_MODE=false`.
- To exercise real auth, provide a valid Supabase JWT in the `Authorization: Bearer <token>` header and set `DEMO_MODE=false`.

## 2) Start the stack
- Install dependencies once: `npm install`
- Run the frontend + express server together: `npm run dev:full`
- Edge functions use the `.env` values. Enable persistent rate limiting by setting `ENABLE_PERSISTENT_RATE_LIMITS=true` with a reachable Supabase database.

## 3) Use the seeded demo data
- The UI pulls from `src/lib/demo/demo-service.ts` and `demo-data.ts` to render experiments, models, and charts without external providers.
- Default identifiers: `tenant=demo-tenant`, `model=gpt-4o`, `policy_pack=baseline-demo`.

## 4) Health & observability checks
- Verify server probes: `GET /healthz`, `GET /readyz`, `GET /metrics` (unauthenticated by design).
- Auth-only routes (e.g., `/verify`, `/ledger/*`) now enforce bearer tokens unless `DEMO_MODE=true`.
- Rate limits are token-bucket based per tenant; set `ENABLE_PERSISTENT_RATE_LIMITS=true` to store buckets in the Supabase `kv_store_f9ece59c` table.

## 5) Suggested demo flow
1. Load the dashboard and confirm demo experiments/models populate charts.
2. Trigger a SYMBI assessment in the UI; observe rate-limit and tenant headers in the network panel.
3. Call `/make-server-f9ece59c/emergence` to highlight drift metrics on recent assessments.
4. (Optional) Re-run with a real Supabase JWT to show auth enforcement and header-based RBAC.

## 6) Quick validation tests
- Sanity check your env: `npm run demo:smoke`
- Unit: `npm test` (includes security utility coverage)
- Smoke: Hit `/healthz` and `/metrics` after `npm run dev:full` starts.
