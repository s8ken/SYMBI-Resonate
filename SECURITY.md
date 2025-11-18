# Security Policy

## Supported Versions

We follow semantic versioning. Security fixes are applied to the latest minor release line.

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Features

### Authentication & Authorization

- **JWT-based Authentication**: HMAC-SHA256 signed tokens with configurable expiration
- **Role-Based Access Control (RBAC)**: Four-tier role system (admin, auditor, analyst, read-only)
- **Per-Tenant Isolation**: Multi-tenant architecture with tenant-scoped resources
- **Rate Limiting**: Token bucket algorithm with per-tenant limits

See [RBAC Guide](docs/rbac-guide.md) for detailed permissions.

### Cryptographic Integrity

- **Ed25519 Signatures**: Receipt signing and verification with public key infrastructure
- **SHA-256 Hashing**: Content hashing and Merkle tree construction
- **Merkle Proofs**: Efficient tamper-evident verification
- **Cross-Runtime Compatibility**: Tested on Node.js, Deno, and browser environments

### Security Headers

When enabled (default in production):
- `Strict-Transport-Security`: HSTS with 1-year max-age
- `X-Frame-Options: DENY`: Clickjacking protection
- `X-Content-Type-Options: nosniff`: MIME-sniffing prevention
- `Referrer-Policy`: Strict referrer control
- `Permissions-Policy`: Browser feature restrictions

See [Deployment Guide](docs/deployment-guide.md#security-headers) for configuration.

### Transparency Ledger

- **Append-Only Log**: Immutable audit trail of all operations
- **Hash-Chained Entries**: Cryptographic linking of ledger entries
- **Periodic Anchoring**: Daily Merkle root snapshots
- **External Verification**: Support for blockchain/timestamping service anchoring

See [Ledger Guide](docs/ledger-guide.md) for architecture and usage.

## Reporting a Vulnerability

We take security vulnerabilities seriously. Please follow responsible disclosure:

### Contact

**Primary**: security@symbi.org  
**PGP Key**: Available on request

### What to Include

1. **Description**: Clear explanation of the vulnerability
2. **Impact**: Potential security impact and affected versions
3. **Reproduction**: Step-by-step instructions to reproduce
4. **Environment**: Platform, runtime version, configuration
5. **Proof of Concept**: Code or screenshots (if applicable)
6. **Suggested Fix**: Proposed remediation (optional)

### Process

1. **Acknowledgment**: We will acknowledge your report within **72 hours**
2. **Validation**: We will validate the vulnerability within **7 days**
3. **Timeline**: We will provide a remediation timeline within **14 days**
4. **Fix**: Security patches released according to severity:
   - **Critical**: Within 7 days
   - **High**: Within 14 days
   - **Medium**: Within 30 days
   - **Low**: Next regular release
5. **Disclosure**: Coordinated disclosure after fix is available
6. **Credit**: Public acknowledgment in security advisory (if desired)

### Scope

**In Scope:**
- Authentication and authorization bypasses
- Cryptographic implementation flaws
- Injection vulnerabilities (SQL, command, etc.)
- Cross-site scripting (XSS)
- Cross-site request forgery (CSRF)
- Server-side request forgery (SSRF)
- Information disclosure
- Denial of service (DoS) with realistic impact
- Ledger integrity violations
- Signature verification bypasses

**Out of Scope:**
- Social engineering attacks
- Physical attacks
- Denial of service requiring massive resources
- Issues in third-party dependencies (report to upstream)
- Issues requiring user misconfiguration
- Theoretical attacks without practical impact

### Severity Classification

We use CVSS 3.1 for severity scoring:

- **Critical (9.0-10.0)**: Remote code execution, authentication bypass
- **High (7.0-8.9)**: Privilege escalation, data breach
- **Medium (4.0-6.9)**: Information disclosure, limited DoS
- **Low (0.1-3.9)**: Minor information leaks, theoretical issues

## Security Best Practices

### For Deployment

1. **Enable JWT Authentication**
   ```bash
   export JWT_SECRET=$(openssl rand -base64 32)
   ```

2. **Enable Security Headers**
   ```bash
   export ENABLE_SECURITY_HEADERS=true
   ```

3. **Use HTTPS/TLS**
   - Valid SSL/TLS certificate
   - TLS 1.2 minimum
   - Strong cipher suites

4. **Configure Rate Limiting**
   ```bash
   export RATE_LIMIT_CAPACITY=30
   export RATE_LIMIT_RPS=10
   ```

5. **Rotate Secrets Regularly**
   - JWT secrets: Every 90 days
   - Ed25519 keys: Every 90 days
   - Store in secret management service

6. **Enable Monitoring**
   - Prometheus metrics
   - OpenTelemetry tracing
   - Audit logging

See [Deployment Guide](docs/deployment-guide.md) for comprehensive security checklist.

### For Developers

1. **Never Commit Secrets**
   - Use `.env` files (gitignored)
   - Use environment variables
   - Use secret management tools

2. **Validate Input**
   - Sanitize user input
   - Validate JWT claims
   - Check content hashes

3. **Test Security Features**
   ```bash
   cd src && npm test
   ```
   - Run tests before committing
   - Maintain >80% coverage
   - Add tests for security fixes

4. **Review Dependencies**
   ```bash
   npm audit
   npm audit fix
   ```

5. **Code Reviews**
   - All security-related changes require review
   - Use CodeQL for static analysis
   - Run security scanners in CI

## Security Updates

Subscribe to security advisories:
- **GitHub Security Advisories**: Watch this repository
- **Email**: Subscribe at security@symbi.org
- **RSS**: Available via GitHub releases

## Security Testing

We perform:
- **Static Analysis**: CodeQL, ESLint security rules
- **Dependency Scanning**: npm audit, Dependabot
- **Secret Scanning**: Gitleaks in CI/CD
- **Dynamic Testing**: Manual security testing
- **Penetration Testing**: Annual third-party assessment

## Bug Bounty

We currently do not offer a bug bounty program. However, we deeply appreciate responsible disclosure and will publicly acknowledge security researchers who report valid vulnerabilities.

## Compliance

SYMBI-Resonate follows industry best practices:
- OWASP Top 10 mitigation
- CWE/SANS Top 25 awareness
- NIST Cybersecurity Framework alignment

## Contact

**Security Team**: security@symbi.org  
**General Support**: See [SUPPORT.md](SUPPORT.md)  
**Code of Conduct**: See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

---

Last Updated: 2024-01-15  
Version: 1.0.0

