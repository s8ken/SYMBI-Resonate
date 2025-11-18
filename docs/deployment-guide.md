# Deployment Guide

## Overview

This guide covers enterprise-ready deployment of SYMBI-Resonate with security headers, JWT authentication, OpenTelemetry tracing, and transparency ledger.

---

## Prerequisites

- Deno runtime (v1.40+)
- Supabase project with PostgreSQL
- HTTPS/TLS termination (reverse proxy or cloud provider)
- (Optional) OpenTelemetry collector for distributed tracing

---

## Environment Configuration

### Required Variables

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT Authentication (REQUIRED for production)
JWT_SECRET=your-secret-key-minimum-32-characters-long-and-secure
```

### Optional Security Variables

```bash
# Security Headers (enabled by default)
ENABLE_SECURITY_HEADERS=true

# Rate Limiting (defaults shown)
RATE_LIMIT_CAPACITY=30
RATE_LIMIT_RPS=10

# Data Retention
RETENTION_DAYS=90
```

### Ed25519 Key Configuration

For receipt verification, configure Ed25519 public keys:

```bash
# Single key (simple deployments)
ED25519_PUBLIC_KEY_BASE64=base64encodedpublickey

# Multiple keys with key IDs (recommended)
ED25519_KEYS_JSON='{"control-plane-v1":"pubkey1","agent-v1":"pubkey2"}'
```

**Key Management Best Practices**:
- Rotate keys periodically (every 90 days recommended)
- Store private keys in secure key management service (AWS KMS, HashiCorp Vault, etc.)
- Never commit keys to version control
- Use different keys for different environments (dev/staging/prod)

### OpenTelemetry Configuration (Optional)

Enable distributed tracing with OpenTelemetry:

```bash
# OTLP Exporter Endpoint
OTLP_ENDPOINT=https://otel-collector.example.com/v1/traces

# Service Name (for trace identification)
OTEL_SERVICE_NAME=symbi-resonate-prod
```

**Supported Backends**:
- Jaeger
- Zipkin
- Honeycomb
- New Relic
- Datadog
- AWS X-Ray (via OTLP)
- Google Cloud Trace

---

## Security Headers

The following security headers are automatically applied when `ENABLE_SECURITY_HEADERS=true`:

### HTTP Strict Transport Security (HSTS)
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```
- Forces HTTPS for 1 year
- Applies to all subdomains
- **Requirement**: Must have valid TLS certificate

### Frame Protection
```
X-Frame-Options: DENY
```
- Prevents clickjacking attacks
- Disallows embedding in iframes

### Content Type Sniffing
```
X-Content-Type-Options: nosniff
```
- Prevents MIME-type sniffing
- Enforces declared content types

### Referrer Policy
```
Referrer-Policy: strict-origin-when-cross-origin
```
- Sends full referrer for same-origin requests
- Sends origin only for cross-origin HTTPS requests
- No referrer for HTTP downgrade

### Permissions Policy
```
Permissions-Policy: geolocation=(), microphone=(), camera=()
```
- Disables geolocation, microphone, and camera access
- Reduces attack surface

### XSS Protection (Legacy Browsers)
```
X-XSS-Protection: 1; mode=block
```
- Enables XSS filter in older browsers
- Blocks page on XSS detection

---

## Content Security Policy (CSP) for Frontend

The API server does not set CSP headers (API-only). Configure CSP on your frontend:

### Recommended CSP for Production

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' https://your-api.example.com https://your-project.supabase.co;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
">
```

### CSP Directive Explanations

- `default-src 'self'`: Only load resources from same origin by default
- `script-src`: Allow scripts from same origin (adjust for your needs)
- `style-src 'unsafe-inline'`: Allow inline styles (required for some UI libraries)
- `img-src data: https:`: Allow images from data URIs and HTTPS sources
- `connect-src`: Whitelist API endpoints and Supabase
- `frame-ancestors 'none'`: Prevent embedding (same as X-Frame-Options: DENY)

### CSP Testing

1. Start with report-only mode:
```html
<meta http-equiv="Content-Security-Policy-Report-Only" content="...">
```

2. Monitor violations in browser console

3. Add legitimate sources to whitelist

4. Switch to enforcement mode once validated

---

## Deployment Architectures

### 1. Serverless Deployment (Recommended)

**Platforms**: Deno Deploy, Cloudflare Workers, AWS Lambda

**Advantages**:
- Automatic scaling
- No server management
- Pay-per-request pricing
- Built-in TLS/SSL

**Example: Deno Deploy**
```bash
# Install Deno Deploy CLI
deno install --allow-all -n deployctl \
  https://deno.land/x/deploy/deployctl.ts

# Deploy
deployctl deploy \
  --project=symbi-resonate \
  --prod \
  --env-file=.env.production \
  src/supabase/functions/server/index.tsx
```

### 2. Container Deployment

**Platforms**: Docker, Kubernetes, AWS ECS, Google Cloud Run

**Dockerfile Example**:
```dockerfile
FROM denoland/deno:1.40.0

WORKDIR /app

# Cache dependencies
COPY src/supabase/functions/server/deps.ts .
RUN deno cache deps.ts

# Copy application
COPY src/supabase/functions/server/ .

# Run
EXPOSE 8000
CMD ["run", "--allow-all", "index.tsx"]
```

**Docker Compose Example**:
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - JWT_SECRET=${JWT_SECRET}
      - ENABLE_SECURITY_HEADERS=true
    restart: unless-stopped
```

### 3. Traditional Server Deployment

**Platforms**: Linux VPS, Bare Metal

**Systemd Service Example** (`/etc/systemd/system/symbi-resonate.service`):
```ini
[Unit]
Description=SYMBI Resonate API
After=network.target

[Service]
Type=simple
User=symbi
WorkingDirectory=/opt/symbi-resonate
EnvironmentFile=/opt/symbi-resonate/.env
ExecStart=/usr/local/bin/deno run \
  --allow-net \
  --allow-env \
  --allow-read \
  src/supabase/functions/server/index.tsx
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

**Nginx Reverse Proxy**:
```nginx
server {
    listen 443 ssl http2;
    server_name api.example.com;

    ssl_certificate /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Forward tracing headers
        proxy_set_header traceparent $http_traceparent;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

---

## Transparency Ledger Setup

The transparency ledger provides tamper-evident, append-only audit logging.

### Ledger Architecture

- **Append-Only**: Entries cannot be modified or deleted
- **Hash-Chained**: Each entry references the previous entry's hash
- **Merkle Root**: Periodic anchoring for verification
- **External Anchoring**: Optional anchoring to blockchain or timestamping service

### Ledger Operations

**Append Entry** (Auditor/Admin only):
```bash
curl -X POST https://api.example.com/ledger/append \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "receipt_verification",
    "hash": "sha256_hash_of_event",
    "meta": {
      "timestamp": "2024-01-15T10:30:00Z",
      "user": "analyst@example.com"
    }
  }'
```

**Create Internal Anchor**:
```bash
curl -X POST https://api.example.com/ledger/anchor \
  -H "Authorization: Bearer <jwt_token>"
```

**Create External Anchor** (for blockchain/timestamping):
```bash
curl -X POST https://api.example.com/ledger/anchor/external \
  -H "Authorization: Bearer <jwt_token>"
```

### Automated Anchoring

Schedule daily anchoring with cron:

```bash
# Daily at 2 AM UTC
0 2 * * * curl -X POST https://api.example.com/jobs/anchor \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN"
```

Or use Kubernetes CronJob:
```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: ledger-anchor
spec:
  schedule: "0 2 * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: anchor
            image: curlimages/curl:latest
            env:
            - name: JWT_TOKEN
              valueFrom:
                secretKeyRef:
                  name: admin-token
                  key: jwt
            command:
            - sh
            - -c
            - |
              curl -X POST https://api.example.com/jobs/anchor \
                -H "Authorization: Bearer $JWT_TOKEN"
          restartPolicy: OnFailure
```

---

## Monitoring and Observability

### Prometheus Metrics

Metrics are exposed at `/metrics` in Prometheus text format:

```bash
curl https://api.example.com/metrics \
  -H "Authorization: Bearer <jwt_token>"
```

**Available Metrics**:
- `assessments_started`: Counter of assessment jobs started
- `assessments_completed`: Counter of completed assessments
- `receipt_verifications`: Counter of receipt verifications
- `receipt_verification_failures`: Counter of failed verifications
- `assessment_latency_ms{quantile}`: Latency percentiles (p50, p90, p99)

**Prometheus Scrape Config**:
```yaml
scrape_configs:
  - job_name: 'symbi-resonate'
    scrape_interval: 30s
    static_configs:
      - targets: ['api.example.com:443']
    scheme: https
    authorization:
      credentials: 'your-metrics-jwt-token'
```

### Health Checks

**Liveness Check** (`/healthz`):
```bash
curl https://api.example.com/healthz
```

**Readiness Check** (`/readyz`):
```bash
curl https://api.example.com/readyz
```

**Kubernetes Health Probes**:
```yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: 8000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /readyz
    port: 8000
  initialDelaySeconds: 5
  periodSeconds: 5
```

### OpenTelemetry Tracing

When `OTLP_ENDPOINT` is configured, traces are exported to your collector:

**Example: Jaeger**
```bash
# Run Jaeger all-in-one
docker run -d \
  -p 16686:16686 \
  -p 4318:4318 \
  jaegertracing/all-in-one:latest

# Configure API
export OTLP_ENDPOINT=http://localhost:4318/v1/traces
export OTEL_SERVICE_NAME=symbi-resonate

# View traces at http://localhost:16686
```

**Example: Honeycomb**
```bash
export OTLP_ENDPOINT=https://api.honeycomb.io/v1/traces
export OTEL_SERVICE_NAME=symbi-resonate
# Add Honeycomb API key to OTLP headers (custom configuration)
```

---

## Security Checklist

Before deploying to production:

- [ ] Generate strong JWT_SECRET (minimum 32 characters, cryptographically random)
- [ ] Enable HTTPS/TLS (with valid certificate)
- [ ] Set ENABLE_SECURITY_HEADERS=true
- [ ] Configure Ed25519 keys (never use dev/test keys in prod)
- [ ] Enable rate limiting with appropriate limits
- [ ] Set up monitoring (Prometheus + alerts)
- [ ] Configure log aggregation (if not using managed service)
- [ ] Set up automated backups (Supabase database)
- [ ] Test disaster recovery procedures
- [ ] Configure RBAC roles appropriately
- [ ] Set up rotation schedule for secrets
- [ ] Enable OpenTelemetry for tracing (recommended)
- [ ] Configure CSP headers on frontend
- [ ] Review and harden Nginx/reverse proxy config
- [ ] Set up automated security scanning (SAST/DAST)
- [ ] Document incident response procedures

---

## Performance Tuning

### Rate Limiting

Adjust based on expected traffic:

```bash
# High-traffic deployment
RATE_LIMIT_CAPACITY=100
RATE_LIMIT_RPS=50

# Low-traffic deployment
RATE_LIMIT_CAPACITY=10
RATE_LIMIT_RPS=5
```

### Connection Pooling

For database-heavy deployments, consider Supabase connection pooling:
- Use transaction mode for short queries
- Use session mode for long-running operations

### Caching

Implement caching at reverse proxy level:

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m;

location /metrics {
    proxy_cache api_cache;
    proxy_cache_valid 200 30s;
    proxy_pass http://localhost:8000;
}
```

---

## Troubleshooting

### Common Issues

**Issue**: JWT authentication not working
- **Solution**: Verify JWT_SECRET is set correctly; check token expiration; validate token payload

**Issue**: Security headers not applied
- **Solution**: Check ENABLE_SECURITY_HEADERS=true; verify headers at proxy level

**Issue**: OTLP traces not appearing
- **Solution**: Check OTLP_ENDPOINT is accessible; verify collector is running; check network connectivity

**Issue**: Rate limiting too aggressive
- **Solution**: Increase RATE_LIMIT_CAPACITY and RATE_LIMIT_RPS; implement caching

**Issue**: High latency on /verify endpoint
- **Solution**: Enable connection pooling; add caching layer; optimize Merkle tree computation

---

## Support and Resources

- [RBAC Guide](rbac-guide.md)
- [OpenAPI Specification](openapi.yaml)
- [Security Policy](../SECURITY.md)
- [Key Management Guide](key-management.md)
- Email: security@symbi.org
