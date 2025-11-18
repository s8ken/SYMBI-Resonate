# Transparency Ledger Documentation

## Overview

The SYMBI-Resonate transparency ledger provides a tamper-evident, append-only audit trail for all critical operations. It uses cryptographic hash-chaining and Merkle tree anchoring to ensure integrity and enable efficient verification.

---

## Architecture

### Core Principles

1. **Append-Only**: Entries cannot be modified or deleted once written
2. **Hash-Chained**: Each entry references previous entries via cryptographic hashes
3. **Merkle-Anchored**: Periodic Merkle root snapshots for efficient verification
4. **Externally Verifiable**: Anchors can be published to external timestamping services or blockchains

### Data Structure

```
Ledger Entry:
{
  "id": "uuid",
  "ts": "ISO-8601 timestamp",
  "type": "receipt|audit_log|verification|anchor",
  "hash": "SHA-256 hash of entry data",
  "meta": { ... additional metadata ... }
}
```

### Storage

- Entries stored in key-value store with prefix `ledger:`
- Key format: `ledger:<timestamp>:<uuid>`
- Sorted by timestamp for chronological ordering

---

## Entry Types

### 1. Receipt Entry
Records receipt verification events.

```json
{
  "type": "receipt",
  "hash": "a3b5c7d9e1f2a4b6c8d0e2f4",
  "meta": {
    "output_id": "output-123",
    "tenant_id": "tenant-456",
    "verified_at": "2024-01-15T10:30:00Z",
    "verification_result": "valid"
  }
}
```

### 2. Audit Log Entry
Records administrative actions.

```json
{
  "type": "audit_log",
  "hash": "b4c6d8e0f2a4b6c8d0e2f4a6",
  "meta": {
    "action": "revoke_receipt",
    "user": "admin@example.com",
    "reason": "security_incident",
    "affected_id": "output-789"
  }
}
```

### 3. Verification Entry
Records system verification checks.

```json
{
  "type": "verification",
  "hash": "c5d7e9f1a3b5c7d9e1f2a4b6",
  "meta": {
    "check_type": "merkle_proof",
    "result": "pass",
    "details": "All proofs verified"
  }
}
```

### 4. Anchor Entry
Records periodic anchor snapshots.

```json
{
  "type": "anchor",
  "hash": "d6e8f0a2b4c6d8e0f2a4b6c8",
  "meta": {
    "merkle_root": "root_hash",
    "entry_count": 1024,
    "anchor_type": "internal"
  }
}
```

---

## API Endpoints

### List Ledger Entries

**Endpoint**: `GET /ledger` or `GET /v1/ledger`

**Required Role**: analyst, auditor, or admin

**Response**:
```json
{
  "entries": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "ts": "2024-01-15T10:30:00Z",
      "type": "receipt",
      "hash": "a3b5c7d9e1f2a4b6c8d0e2f4",
      "meta": { ... }
    },
    ...
  ]
}
```

**Example**:
```bash
curl -X GET https://api.example.com/ledger \
  -H "Authorization: Bearer <jwt_token>"
```

---

### Append Entry to Ledger

**Endpoint**: `POST /ledger/append` or `POST /v1/ledger/append`

**Required Role**: auditor or admin

**Request Body**:
```json
{
  "type": "audit_log",
  "hash": "sha256_hash_of_data",
  "meta": {
    "action": "user_action",
    "timestamp": "2024-01-15T10:30:00Z",
    "details": "Additional information"
  }
}
```

**Response**:
```json
{
  "ok": true,
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Example**:
```bash
curl -X POST https://api.example.com/ledger/append \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "audit_log",
    "hash": "a3b5c7d9e1f2a4b6c8d0e2f4",
    "meta": {
      "action": "config_change",
      "user": "admin@example.com",
      "description": "Updated rate limit settings"
    }
  }'
```

---

### Create Internal Anchor

**Endpoint**: `POST /ledger/anchor` or `POST /v1/ledger/anchor`

**Required Role**: auditor or admin

**Description**: Creates a Merkle root of all ledger entries for tamper detection.

**Response**:
```json
{
  "ok": true,
  "anchor": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "ts": "2024-01-15T12:00:00Z",
    "root": "c5d7e9f1a3b5c7d9e1f2a4b6c8d0e2f4"
  }
}
```

**Example**:
```bash
curl -X POST https://api.example.com/ledger/anchor \
  -H "Authorization: Bearer <jwt_token>"
```

---

### Create External Anchor

**Endpoint**: `POST /ledger/anchor/external` or `POST /v1/ledger/anchor/external`

**Required Role**: auditor or admin

**Description**: Generates payload for external anchoring (blockchain, timestamping service).

**Response**:
```json
{
  "ok": true,
  "external_id": "ot:770e8400-e29b-41d4-a716-446655440000",
  "payload": {
    "root": "c5d7e9f1a3b5c7d9e1f2a4b6c8d0e2f4",
    "ts": "2024-01-15T12:00:00Z"
  }
}
```

**Example**:
```bash
curl -X POST https://api.example.com/ledger/anchor/external \
  -H "Authorization: Bearer <jwt_token>"
```

---

## Anchoring Strategy

### Internal Anchoring (Daily)

**Purpose**: Regular snapshots for tamper detection

**Schedule**: Daily at 2:00 AM UTC (recommended)

**Process**:
1. Collect all ledger entry hashes
2. Compute Merkle root
3. Store anchor with timestamp
4. Log anchor creation

**Cron Example**:
```bash
0 2 * * * curl -X POST https://api.example.com/jobs/anchor \
  -H "Authorization: Bearer $ADMIN_JWT"
```

### External Anchoring (Weekly)

**Purpose**: Independent verification via external authority

**Schedule**: Weekly on Sundays (recommended)

**Supported Services**:
- **OpenTimestamps**: Bitcoin blockchain timestamping
- **Ethereum**: Smart contract anchoring
- **Google Certificate Transparency**: Public append-only log
- **Custom Service**: Any trusted timestamping authority

**Process**:
1. Create external anchor payload
2. Submit to external service
3. Store external anchor ID
4. Record transaction hash/receipt

**Example with OpenTimestamps**:
```bash
# Get anchor payload
PAYLOAD=$(curl -X POST https://api.example.com/ledger/anchor/external \
  -H "Authorization: Bearer $ADMIN_JWT" | jq -r '.payload.root')

# Submit to OpenTimestamps
ots stamp "$PAYLOAD" > anchor.ots

# Store proof
curl -X POST https://api.example.com/ledger/append \
  -H "Authorization: Bearer $ADMIN_JWT" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"anchor\",
    \"hash\": \"$PAYLOAD\",
    \"meta\": {
      \"external_service\": \"opentimestamps\",
      \"proof_file\": \"anchor.ots\"
    }
  }"
```

---

## Verification Procedures

### 1. Verify Entry Integrity

Check that entry hash hasn't been tampered with:

```python
import hashlib
import json

def verify_entry(entry, original_data):
    """Verify entry hash matches data"""
    data_str = json.dumps(original_data, sort_keys=True)
    computed_hash = hashlib.sha256(data_str.encode()).hexdigest()[:24]
    return computed_hash == entry['hash']
```

### 2. Verify Merkle Root

Verify that anchor root matches current ledger state:

```python
import hashlib

def compute_merkle_root(hashes):
    """Compute Merkle root from list of hashes"""
    if not hashes:
        return ""
    
    level = hashes[:]
    while len(level) > 1:
        next_level = []
        for i in range(0, len(level), 2):
            left = level[i]
            right = level[i + 1] if i + 1 < len(level) else left
            combined = left + right
            next_level.append(hashlib.sha256(combined.encode()).hexdigest())
        level = next_level
    
    return level[0]

# Fetch all entries
entries = fetch_ledger_entries()
hashes = [e['hash'] for e in entries]

# Compute root
computed_root = compute_merkle_root(hashes)

# Compare with stored anchor
anchor = fetch_latest_anchor()
assert computed_root == anchor['root'], "Ledger tampered!"
```

### 3. Verify External Anchor

Verify anchor against external timestamping service:

```bash
# For OpenTimestamps
ots verify anchor.ots

# For Ethereum
# Check smart contract storage at anchor timestamp
```

---

## Best Practices

### 1. Regular Anchoring

- **Daily Internal**: Automated via cron/scheduler
- **Weekly External**: Manual or automated with monitoring
- **Store Proofs**: Keep all external anchor proofs in secure storage

### 2. Monitoring

Monitor ledger health:
- Entry count growth rate
- Anchor creation success/failure
- External anchor submission status
- Hash computation time

**Example Prometheus Alert**:
```yaml
- alert: LedgerAnchorMissing
  expr: time() - ledger_last_anchor_timestamp > 86400
  for: 1h
  labels:
    severity: warning
  annotations:
    summary: "Ledger anchor not created in 24 hours"
```

### 3. Backup Strategy

- **Ledger Entries**: Backed up with main database
- **Anchor Proofs**: Separate backup with versioning
- **External Receipts**: Immutable storage (e.g., S3 with versioning)

### 4. Access Control

- **Append**: Auditor and admin only
- **Read**: Analyst, auditor, admin
- **Anchor**: Auditor and admin only
- **Audit All Actions**: Log all ledger operations

---

## Use Cases

### 1. Compliance Audit Trail

```bash
# Append compliance event
curl -X POST https://api.example.com/ledger/append \
  -H "Authorization: Bearer $AUDITOR_JWT" \
  -d '{
    "type": "audit_log",
    "hash": "compliance_hash",
    "meta": {
      "event": "gdpr_data_deletion",
      "user_id": "user-123",
      "completed_at": "2024-01-15T10:30:00Z",
      "auditor": "compliance@example.com"
    }
  }'
```

### 2. Security Incident Response

```bash
# Record security event
curl -X POST https://api.example.com/ledger/append \
  -H "Authorization: Bearer $ADMIN_JWT" \
  -d '{
    "type": "audit_log",
    "hash": "incident_hash",
    "meta": {
      "event": "unauthorized_access_attempt",
      "ip_address": "192.168.1.100",
      "timestamp": "2024-01-15T10:30:00Z",
      "action_taken": "ip_blocked"
    }
  }'
```

### 3. Receipt Lifecycle Tracking

```bash
# Track receipt from creation to revocation
# 1. Creation
curl -X POST https://api.example.com/ledger/append \
  -d '{"type":"receipt","hash":"...","meta":{"event":"created"}}'

# 2. Verification
curl -X POST https://api.example.com/ledger/append \
  -d '{"type":"verification","hash":"...","meta":{"result":"valid"}}'

# 3. Revocation
curl -X POST https://api.example.com/ledger/append \
  -d '{"type":"audit_log","hash":"...","meta":{"event":"revoked"}}'
```

---

## Migration and Recovery

### Exporting Ledger

```bash
# Export full ledger as JSON
curl -X GET https://api.example.com/ledger \
  -H "Authorization: Bearer $ADMIN_JWT" \
  > ledger_backup_$(date +%Y%m%d).json
```

### Importing Ledger

During migration or recovery:

```python
import json
import requests

# Load backup
with open('ledger_backup.json') as f:
    data = json.load(f)

# Re-append entries (in order)
for entry in sorted(data['entries'], key=lambda e: e['ts']):
    requests.post(
        'https://api.example.com/ledger/append',
        headers={'Authorization': f'Bearer {ADMIN_JWT}'},
        json={
            'type': entry['type'],
            'hash': entry['hash'],
            'meta': entry['meta']
        }
    )
```

### Verification After Migration

```python
# 1. Verify entry count matches
# 2. Verify all hashes match
# 3. Recompute and verify Merkle roots
# 4. Verify external anchors still valid
```

---

## Performance Considerations

### Scalability

- **Entries**: Supports millions of entries
- **Query Performance**: Indexed by timestamp
- **Anchor Computation**: O(n) time complexity for n entries
- **Storage**: ~1KB per entry average

### Optimization

```bash
# For large ledgers, use pagination
curl -X GET "https://api.example.com/ledger?limit=1000&offset=5000" \
  -H "Authorization: Bearer $JWT"

# Compute anchors incrementally (future enhancement)
# Store intermediate Merkle tree levels
```

---

## Security Considerations

1. **Hash Collision Resistance**: SHA-256 provides 128-bit security
2. **Timestamp Accuracy**: Use NTP-synchronized clocks
3. **Access Control**: Strictly enforce RBAC
4. **Backup Encryption**: Encrypt ledger backups at rest
5. **Audit Logging**: Log all ledger API calls
6. **External Anchoring**: Use multiple independent services

---

## Support

For ledger-related questions:
- Review [Deployment Guide](deployment-guide.md)
- Check [RBAC Guide](rbac-guide.md)
- Contact: security@symbi.org
