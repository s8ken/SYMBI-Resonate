# Security Module

## Overview

The security module (`src/supabase/functions/server/security.ts`) provides JWT-based authentication and role-based access control (RBAC) for the SYMBI-Resonate API.

## Features

- ✅ JWT token verification with HMAC-SHA256
- ✅ Role-based access control (4 roles: admin, auditor, analyst, read-only)
- ✅ Backward compatibility with header-based authentication
- ✅ Per-tenant isolation
- ✅ Comprehensive test coverage (9 test cases)

## Authentication

### JWT Authentication (Recommended)

Enable JWT authentication by setting the `JWT_SECRET` environment variable:

```bash
export JWT_SECRET="your-secret-key-minimum-32-characters-long"
```

**JWT Payload Requirements:**

```typescript
{
  sub: string        // User ID
  tenant_id: string  // Tenant ID for multi-tenancy
  role: string       // One of: admin, auditor, analyst, read-only
  exp: number        // Expiration timestamp (Unix epoch)
  iat: number        // Issued at timestamp (Unix epoch)
}
```

**Example JWT Creation (Node.js):**

```javascript
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  {
    sub: 'user-123',
    tenant_id: 'tenant-456',
    role: 'analyst',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
  },
  process.env.JWT_SECRET,
  { algorithm: 'HS256' }
);
```

**API Request:**

```bash
curl -X POST https://api.example.com/verify \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"ticket": {...}}'
```

### Header-Based Authentication (Legacy)

For backward compatibility, the API also supports header-based authentication:

```bash
curl -X POST https://api.example.com/verify \
  -H "X-Tenant-Id: tenant-456" \
  -H "X-Role: analyst" \
  -H "Content-Type: application/json" \
  -d '{"ticket": {...}}'
```

**Note:** JWT authentication is strongly recommended for production deployments.

## Roles and Permissions

| Role | Description | Permissions |
|------|-------------|-------------|
| **admin** | Full system access | All operations including purge, revoke, anchor |
| **auditor** | Security and compliance | Verify, revoke, drift detection, ledger access |
| **analyst** | Data analysis | Verify receipts, read ledger |
| **read-only** | Monitoring | Health checks, metrics, verify |

See [RBAC Guide](../../../docs/rbac-guide.md) for detailed permission matrix.

## Usage

### In Server Code

```typescript
import { jwtAuth, requireTenantAndRole, type Role } from './security.ts'

// Enable JWT authentication (if JWT_SECRET is set)
const jwtSecret = Deno.env.get('JWT_SECRET')
if (jwtSecret) {
  app.use('/verify', jwtAuth(jwtSecret))
}

// Require specific roles
app.use('/verify', requireTenantAndRole(['admin', 'auditor', 'analyst']))
app.use('/revoke', requireTenantAndRole(['admin', 'auditor']))
app.use('/jobs/purge', requireTenantAndRole(['admin']))
```

### Accessing User Context

After authentication, user context is available in the request:

```typescript
app.post('/endpoint', async (c) => {
  const userId = c.user?.sub
  const tenantId = c.tenantId
  const role = c.role
  
  console.log(`User ${userId} from tenant ${tenantId} with role ${role}`)
  // ... handle request
})
```

## Security Best Practices

### 1. JWT Secret Management

```bash
# Generate a strong secret (minimum 32 characters)
openssl rand -base64 32

# Set as environment variable
export JWT_SECRET="generated-secret-here"

# Never commit secrets to version control
# Use secret management service (AWS Secrets Manager, HashiCorp Vault, etc.)
```

### 2. Token Expiration

Set appropriate token expiration times:

```javascript
// Short-lived tokens (1 hour)
exp: Math.floor(Date.now() / 1000) + 3600

// Long-lived tokens (24 hours)
exp: Math.floor(Date.now() / 1000) + 86400
```

### 3. Token Rotation

Implement token rotation for long-lived sessions:

```javascript
// Issue new token before expiration
if (tokenExpiresIn < 5 * 60) { // Less than 5 minutes
  const newToken = issueNewToken(user)
  return { token: newToken, data: response }
}
```

### 4. HTTPS Only

Always use HTTPS in production to protect tokens in transit:

```bash
# Nginx configuration
server {
    listen 443 ssl http2;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Enforce HTTPS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
}
```

## Testing

The security module includes comprehensive test coverage:

```bash
cd src
npm test
```

**Test Coverage:**
- ✅ Valid JWT verification
- ✅ Invalid signature detection
- ✅ Expired token rejection
- ✅ Malformed token rejection
- ✅ Missing required fields
- ✅ Invalid role validation
- ✅ All valid roles acceptance
- ✅ Special characters handling
- ✅ Secret mismatch detection

## Error Handling

### 401 Unauthorized

Returned when:
- JWT token is missing
- JWT token is invalid or tampered
- JWT token is expired
- JWT secret mismatch
- Missing required claims

```json
{
  "error": "Missing or invalid Authorization header"
}
```

### 403 Forbidden

Returned when:
- User role doesn't have permission for endpoint
- Invalid role value

```json
{
  "error": "Forbidden - insufficient permissions"
}
```

### 400 Bad Request

Returned when:
- Missing X-Tenant-Id header (legacy auth)

```json
{
  "error": "Missing X-Tenant-Id"
}
```

## Migration from Header-Based Auth

### Step 1: Dual Authentication

Enable both JWT and header-based auth during transition:

```typescript
// JWT is optional if JWT_SECRET is not set
const jwtSecret = Deno.env.get('JWT_SECRET')
if (jwtSecret) {
  app.use('/verify', jwtAuth(jwtSecret))
}

// requireTenantAndRole supports both methods
app.use('/verify', requireTenantAndRole(['admin', 'auditor', 'analyst']))
```

### Step 2: Client Migration

Update clients to use JWT tokens:

```bash
# Old (header-based)
curl -H "X-Tenant-Id: tenant-456" -H "X-Role: analyst" ...

# New (JWT-based)
curl -H "Authorization: Bearer eyJhbGci..." ...
```

### Step 3: Deprecation

After all clients migrated:
1. Make JWT_SECRET required
2. Remove header-based auth fallback
3. Update documentation

## Performance

- **JWT Verification**: ~1ms per request
- **Memory Usage**: Minimal (no session storage)
- **Scalability**: Stateless, horizontally scalable

## Troubleshooting

### Token Verification Fails

```bash
# Check token structure
echo "eyJhbGci..." | cut -d. -f2 | base64 -d | jq

# Verify secret matches
echo $JWT_SECRET

# Check token expiration
jq -r '.exp' <<< $(echo "eyJhbGci..." | cut -d. -f2 | base64 -d)
date +%s
```

### Role Permission Denied

```bash
# Check role in token
jq -r '.role' <<< $(echo "eyJhbGci..." | cut -d. -f2 | base64 -d)

# Verify endpoint requires this role
grep -r "requireTenantAndRole" src/
```

## Resources

- [RBAC Guide](../../../docs/rbac-guide.md) - Detailed role permissions
- [Deployment Guide](../../../docs/deployment-guide.md) - Security best practices
- [OpenAPI Spec](../../../docs/openapi.yaml) - API documentation
- [JWT.io](https://jwt.io) - JWT debugger

## Support

For security-related questions:
- Email: security@symbi.org
- Review [Security Policy](../../../SECURITY.md)
