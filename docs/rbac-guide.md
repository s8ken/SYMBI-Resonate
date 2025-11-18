# Role-Based Access Control (RBAC) Guide

## Overview

SYMBI-Resonate implements a hierarchical RBAC system with four distinct roles, each with specific permissions designed for enterprise security and operational clarity.

## Roles and Permissions

### 1. Admin Role (`admin`)

**Purpose**: Full system administration and configuration management.

**Permissions**:
- All auditor permissions (inherited)
- Execute retention purge jobs (`/jobs/purge`)
- Revoke receipts (`/revoke`, `/v1/revoke`)
- Manage ledger anchoring (`/jobs/anchor`, `/ledger/anchor`)
- Full access to all API endpoints

**Use Cases**:
- System administrators
- Security operations personnel
- DevOps engineers managing the platform

**Example API Calls**:
```bash
# Purge old data (admin only)
curl -X POST https://api.example.com/jobs/purge \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json"

# Revoke a receipt (admin only)
curl -X POST https://api.example.com/revoke \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"output_id": "abc123", "reason": "security_incident"}'
```

---

### 2. Auditor Role (`auditor`)

**Purpose**: Security auditing, compliance verification, and drift detection.

**Permissions**:
- All analyst permissions (inherited)
- Execute drift detection jobs (`/jobs/drift`)
- Schedule ledger anchors (`/jobs/anchor`)
- Revoke receipts (`/revoke`, `/v1/revoke`)
- Read-only access to ledger (`/ledger`, `/v1/ledger`)
- Append to transparency ledger (`/ledger/append`, `/v1/ledger/append`)

**Use Cases**:
- Security auditors
- Compliance officers
- Internal audit teams
- External security reviewers

**Example API Calls**:
```bash
# Run drift detection (auditor or admin)
curl -X POST https://api.example.com/jobs/drift \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json"

# Append to ledger (auditor or admin)
curl -X POST https://api.example.com/ledger/append \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"type": "audit_log", "hash": "sha256hash", "meta": {"event": "review"}}'
```

---

### 3. Analyst Role (`analyst`)

**Purpose**: Data analysis and receipt verification operations.

**Permissions**:
- All read-only permissions (inherited)
- Verify receipts (`/verify`, `/v1/verify`)
- Read ledger entries (`/ledger`, `/v1/ledger`)

**Use Cases**:
- Data analysts
- Business intelligence teams
- Research teams
- Integration developers

**Example API Calls**:
```bash
# Verify a receipt (analyst, auditor, or admin)
curl -X POST https://api.example.com/verify \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"ticket": {...}}'

# List ledger entries (analyst, auditor, or admin)
curl -X GET https://api.example.com/ledger \
  -H "Authorization: Bearer <jwt_token>"
```

---

### 4. Read-Only Role (`read-only`)

**Purpose**: Monitoring and observability access.

**Permissions**:
- Health checks (`/healthz`, `/readyz`)
- Metrics access (`/metrics`, `/metrics.json`)
- Verify receipts (`/verify`, `/v1/verify`)
- Read ledger entries (`/ledger`, `/v1/ledger`)

**Use Cases**:
- Monitoring systems
- Dashboards and reporting tools
- Third-party integrations
- Read-only API consumers

**Example API Calls**:
```bash
# Health check (all roles including read-only)
curl https://api.example.com/healthz \
  -H "Authorization: Bearer <jwt_token>"

# Get Prometheus metrics (all roles including read-only)
curl https://api.example.com/metrics \
  -H "Authorization: Bearer <jwt_token>"
```

---

## Authentication Methods

### JWT-Based Authentication (Recommended)

When `JWT_SECRET` environment variable is set, the API requires JWT tokens in the Authorization header:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**JWT Payload Structure**:
```json
{
  "sub": "user-id-123",
  "tenant_id": "tenant-456",
  "role": "analyst",
  "iat": 1699999999,
  "exp": 1700003599
}
```

### Header-Based Authentication (Legacy, Backward Compatible)

For backward compatibility, the API also supports header-based authentication:

```bash
X-Tenant-Id: tenant-456
X-Role: analyst
```

**Note**: JWT authentication is strongly recommended for production deployments.

---

## Permission Matrix

| Endpoint | read-only | analyst | auditor | admin |
|----------|-----------|---------|---------|-------|
| `/healthz` | ✅ | ✅ | ✅ | ✅ |
| `/readyz` | ✅ | ✅ | ✅ | ✅ |
| `/metrics` | ✅ | ✅ | ✅ | ✅ |
| `/verify` | ✅ | ✅ | ✅ | ✅ |
| `/ledger` (GET) | ✅ | ✅ | ✅ | ✅ |
| `/ledger/append` | ❌ | ❌ | ✅ | ✅ |
| `/ledger/anchor` | ❌ | ❌ | ✅ | ✅ |
| `/revoke` | ❌ | ❌ | ✅ | ✅ |
| `/jobs/drift` | ❌ | ❌ | ✅ | ✅ |
| `/jobs/anchor` | ❌ | ❌ | ✅ | ✅ |
| `/jobs/purge` | ❌ | ❌ | ❌ | ✅ |

---

## Multi-Tenancy

The RBAC system is tenant-aware. Each user/token is associated with a specific tenant via the `tenant_id` field in the JWT payload or `X-Tenant-Id` header.

**Tenant Isolation**:
- Rate limits are enforced per-tenant
- Revocation records are tenant-scoped
- Ledger entries can be filtered by tenant
- Metrics can be segmented by tenant

---

## Rate Limiting

Rate limiting is applied per-tenant using a token bucket algorithm:

- **Default Capacity**: 30 requests
- **Refill Rate**: 10 requests/second
- **Configuration**: Set via `RATE_LIMIT_CAPACITY` and `RATE_LIMIT_RPS` environment variables

When rate limit is exceeded, the API returns HTTP 429 (Too Many Requests).

---

## Security Best Practices

1. **Use JWT Authentication**: Always enable JWT authentication in production by setting `JWT_SECRET`
2. **Rotate Secrets**: Regularly rotate JWT secrets and Ed25519 keys
3. **Principle of Least Privilege**: Assign users the minimum role required for their tasks
4. **Monitor Access**: Review audit logs and metrics regularly
5. **Secure Token Storage**: Never commit JWT secrets to version control
6. **Token Expiration**: Set appropriate expiration times (exp claim) in JWT tokens
7. **HTTPS Only**: Always use HTTPS in production to protect JWT tokens in transit

---

## Environment Variables

```bash
# JWT Authentication (required for production)
JWT_SECRET=your-secret-key-minimum-32-characters

# Rate Limiting
RATE_LIMIT_CAPACITY=30
RATE_LIMIT_RPS=10

# Ed25519 Key Management
ED25519_PUBLIC_KEY_BASE64=base64encodedpublickey
ED25519_KEYS_JSON='{"kid1":"pubkey1","kid2":"pubkey2"}'

# Security Headers
ENABLE_SECURITY_HEADERS=true

# OpenTelemetry (optional)
OTLP_ENDPOINT=https://otel-collector.example.com/v1/traces
OTEL_SERVICE_NAME=symbi-resonate
```

---

## Integration Examples

### Python Client Example
```python
import requests
import jwt
import time

# Generate JWT token (typically done by auth service)
def create_jwt(user_id, tenant_id, role, secret):
    payload = {
        'sub': user_id,
        'tenant_id': tenant_id,
        'role': role,
        'iat': int(time.time()),
        'exp': int(time.time()) + 3600  # 1 hour
    }
    return jwt.encode(payload, secret, algorithm='HS256')

# Make authenticated API call
token = create_jwt('user123', 'tenant456', 'analyst', 'your-secret-key')
response = requests.post(
    'https://api.example.com/verify',
    headers={'Authorization': f'Bearer {token}'},
    json={'ticket': {...}}
)
```

### JavaScript/Node.js Client Example
```javascript
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

// Generate JWT token
function createJWT(userId, tenantId, role, secret) {
  return jwt.sign(
    {
      sub: userId,
      tenant_id: tenantId,
      role: role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
    },
    secret,
    { algorithm: 'HS256' }
  );
}

// Make authenticated API call
const token = createJWT('user123', 'tenant456', 'analyst', 'your-secret-key');
const response = await fetch('https://api.example.com/verify', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ ticket: {...} })
});
```

---

## Troubleshooting

### Common Issues

**401 Unauthorized**:
- Missing or invalid JWT token
- JWT token expired
- JWT secret mismatch
- Missing required JWT claims (sub, tenant_id, role)

**403 Forbidden**:
- User role doesn't have permission for the endpoint
- Invalid role value (must be: admin, auditor, analyst, or read-only)

**429 Too Many Requests**:
- Per-tenant rate limit exceeded
- Wait for token bucket to refill or increase capacity

**400 Bad Request**:
- Missing X-Tenant-Id header (legacy auth)
- Invalid request payload

---

## Support

For questions or issues related to RBAC:
- Review the [Security Policy](../SECURITY.md)
- Check the [API Documentation](../docs/openapi.yaml)
- Contact: security@symbi.org
