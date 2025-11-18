# Ops Runbooks

## Rate Limiting
- Per-tenant token bucket enforced via `X-Tenant-Id` header.
- Defaults: `RATE_LIMIT_CAPACITY=30`, `RATE_LIMIT_RPS=10`.
- Critical endpoints: `/verify`, `/revoke`, `/jobs/*`, `/ledger*`.

## RBAC
- Required headers: `X-Tenant-Id`, `X-Role` in [`admin`, `auditor`, `analyst`, `read-only`].
- Access:
  - `/verify`: all roles
  - `/revoke`: `admin`, `auditor`
  - `/jobs/purge`: `admin`
  - `/jobs/drift`: `admin`, `auditor`
  - `/ledger*`: `admin`, `auditor`

## Tracing
- `traceparent` header accepted and logged; spans created with `@opentelemetry/api`.
- Parent spans added for handlers: verify, ledger append/anchor, jobs.

## Anchoring
- Internal: `/ledger/anchor`
- External payload: `/ledger/anchor/external`
- Scheduled: `/jobs/anchor` performs both; call via automation or cron.

## Troubleshooting
- 400/403/429 errors indicate header or RBAC/rate-limit issues.
- 500 errors include `error` field; check logs with `reqId`.
